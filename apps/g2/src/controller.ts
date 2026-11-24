import type { Api, QueueCard } from "./api";
import { ApiError } from "./api";
import * as r from "./render";

export type Gesture = "tap" | "next" | "prev" | "hold" | "double";
export const UNDO_SECONDS = 3;
export const DONE_MS = 1000;

type Mode = "normal" | "error" | "confirming" | "busy" | "info" | "empty" | "offline" | "unpaired";

export interface Timers {
  setTimeout: (fn: () => void, ms: number) => unknown;
  clearTimeout: (h: unknown) => void;
}

/**
 * The glasses state machine. Nothing is sent to the API until the undo window ends,
 * so closing the app during the 3 seconds cancels the action (fail-safe).
 */
export class Controller {
  cards: QueueCard[] = [];
  index = 0;
  mode: Mode = "empty";
  private pending: { id: string; action: "APPROVE" | "DECLINE"; left: number; timer: unknown } | null = null;
  private infoTimer: unknown = null;
  private retry: "APPROVE" | "DECLINE" | "SNOOZE" = "APPROVE";

  constructor(
    private api: Api,
    private show: (s: r.Screen) => void,
    private timers: Timers = { setTimeout: (f, ms) => setTimeout(f, ms), clearTimeout: (h) => clearTimeout(h as never) },
    private hasToken: () => boolean = () => true,
  ) {}

  /** True while an approve/decline is counting down or being sent. A getter so TS does not narrow across awaits. */
  private get inFlight(): boolean { return this.mode === "confirming" || this.mode === "busy"; }

  get current(): QueueCard | undefined { return this.cards[this.index]; }

  async refresh(): Promise<void> {
    if (this.inFlight) return; // never disturb an action in flight
    if (!this.hasToken()) { this.mode = "unpaired"; this.show(r.unpairedScreen()); return; }
    try {
      const cards = await this.api.queue();
      if (this.inFlight) return;
      const keep = this.current?.id;
      this.cards = cards;
      const i = keep ? cards.findIndex((c) => c.id === keep) : -1;
      this.index = i >= 0 ? i : Math.min(this.index, Math.max(0, cards.length - 1));
      this.render();
    } catch (e) {
      if (this.inFlight) return;
      if (e instanceof ApiError && e.status === 401) { this.mode = "unpaired"; this.show(r.unpairedScreen()); }
      else { this.mode = "offline"; this.show(r.offlineScreen()); }
    }
  }

  private render(): void {
    const c = this.current;
    if (!c) { this.mode = "empty"; this.show(r.emptyScreen()); return; }
    this.mode = "normal";
    this.show(r.cardScreen(c, this.index, this.cards.length));
  }

  async gesture(g: Gesture): Promise<void> {
    if (this.mode === "confirming") {
      if (g === "tap") this.undo(); // only a tap undoes; everything else is ignored during the window
      return;
    }
    if (this.mode === "unpaired") return;
    if (this.mode === "error") {
      // Tap retries the SAME action that failed (a failed decline must never turn into an approve).
      const c = this.current;
      if (g === "tap" && c) { if (this.retry === "SNOOZE") await this.snooze(c); else this.startConfirm(c, this.retry); }
      else this.render();
      return;
    }
    if (this.mode === "offline" || this.mode === "empty") { if (g === "tap") await this.refresh(); return; }
    if (this.mode !== "normal") return;
    const c = this.current;
    if (!c) return;
    if (g === "next") { this.index = Math.min(this.index + 1, this.cards.length - 1); this.render(); }
    else if (g === "prev") { this.index = Math.max(this.index - 1, 0); this.render(); }
    else if (g === "tap") this.startConfirm(c, "APPROVE");
    else if (g === "hold") this.startConfirm(c, "DECLINE");
    else if (g === "double") await this.snooze(c);
  }

  private startConfirm(c: QueueCard, action: "APPROVE" | "DECLINE"): void {
    this.mode = "confirming";
    this.pending = { id: c.id, action, left: UNDO_SECONDS, timer: null };
    this.tick(c);
  }

  private tick(c: QueueCard): void {
    const p = this.pending;
    if (!p) return;
    this.show(r.confirmingScreen(c, p.left, p.action, this.index, this.cards.length));
    p.timer = this.timers.setTimeout(() => {
      p.left -= 1;
      if (p.left > 0) this.tick(c);
      else void this.commit(c, p.action);
    }, 1000);
  }

  private undo(): void {
    if (this.pending) this.timers.clearTimeout(this.pending.timer);
    this.pending = null;
    this.render();
  }

  private async commit(c: QueueCard, action: "APPROVE" | "DECLINE"): Promise<void> {
    this.pending = null;
    this.mode = "busy";
    try {
      const res = await this.api.act(c.id, action);
      this.mode = "info";
      this.show(r.doneScreen(c, action, res.write_back));
      this.afterInfo();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) { this.mode = "normal"; await this.refresh(); return; } // decided elsewhere
      // 502 or network: the card stays PENDING on the server, so a tap retries.
      this.mode = "error"; this.retry = action;
      this.show(r.errorScreen(c, e instanceof ApiError && e.status === 502 ? "Send failed. Tap to retry" : "Offline. Tap to retry"));
    }
  }

  private async snooze(c: QueueCard): Promise<void> {
    this.mode = "busy";
    try {
      await this.api.act(c.id, "SNOOZE");
      this.mode = "info";
      this.show(r.snoozedScreen(c));
      this.afterInfo();
    } catch {
      this.mode = "error"; this.retry = "SNOOZE";
      this.show(r.errorScreen(c, "Snooze failed. Tap to retry"));
    }
  }

  private afterInfo(): void {
    this.infoTimer = this.timers.setTimeout(() => { this.mode = "normal"; void this.refresh(); }, DONE_MS);
  }

  dispose(): void {
    if (this.pending) this.timers.clearTimeout(this.pending.timer);
    if (this.infoTimer) this.timers.clearTimeout(this.infoTimer);
    this.pending = null; // closing during the window cancels the action
  }
}
