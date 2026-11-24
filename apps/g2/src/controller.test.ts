import { beforeEach, describe, expect, it } from "vitest";
import { Controller, DONE_MS, UNDO_SECONDS, type Timers } from "./controller";
import { ApiError, type Api, type QueueCard } from "./api";
import type { Screen } from "./render";

const mk = (id: string, status: "WITHIN_POLICY" | "FLAGGED" = "WITHIN_POLICY"): QueueCard => ({
  id, category: "REFUND", source: "TELEGRAM", headline: `h-${id}`, policy_status: status, policy_reason: "why", ai_recommendation: "Approve",
});

/** Manual clock so the 3s undo window is tested without real waiting. */
function clock() {
  let now = 0; const q: { at: number; fn: () => void; h: number }[] = []; let n = 0;
  const timers: Timers = {
    setTimeout: (fn, ms) => { const h = ++n; q.push({ at: now + ms, fn, h }); return h; },
    clearTimeout: (h) => { const i = q.findIndex((t) => t.h === h); if (i >= 0) q.splice(i, 1); },
  };
  const advance = async (ms: number) => {
    const end = now + ms;
    for (;;) {
      q.sort((a, b) => a.at - b.at);
      const t = q[0];
      if (!t || t.at > end) break;
      q.shift(); now = t.at; t.fn();
      await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    }
    now = end;
  };
  return { timers, advance };
}

let cards: QueueCard[], acts: string[], screens: Screen[], failNext: ApiError | null, queueErr: ApiError | null, token: boolean;
let c: Controller, clk: ReturnType<typeof clock>;
const api: Api = {
  queue: async () => { if (queueErr) throw queueErr; return cards; },
  act: async (id, action) => {
    if (failNext) { const e = failNext; failNext = null; throw e; }
    acts.push(`${id}:${action}`);
    if (action !== "SNOOZE") cards = cards.filter((x) => x.id !== id); else cards = cards.filter((x) => x.id !== id);
    return { status: "OK", write_back: "TELEGRAM_REPLY_SENT" };
  },
};
const last = () => screens[screens.length - 1]!;

beforeEach(async () => {
  cards = [mk("a"), mk("b", "FLAGGED"), mk("c")]; acts = []; screens = []; failNext = null; queueErr = null; token = true;
  clk = clock();
  c = new Controller(api, (s) => screens.push(s), clk.timers, () => token);
  await c.refresh();
});

describe("controller", () => {
  it("shows the first card with a counter", () => {
    expect(last().c2).toBe("h-a");
    expect(last().c4).toContain("1/3");
  });
  it("swipe moves through the queue and clamps at the ends", async () => {
    await c.gesture("next"); expect(last().c2).toBe("h-b"); expect(last().c1).toContain("FLAGGED");
    await c.gesture("next"); await c.gesture("next"); expect(last().c2).toBe("h-c");
    await c.gesture("prev"); await c.gesture("prev"); await c.gesture("prev"); expect(last().c2).toBe("h-a");
  });
  it("tap starts a 3s countdown and sends nothing yet", async () => {
    await c.gesture("tap");
    expect(last().c4).toBe(`APPROVING IN ${UNDO_SECONDS}s… [TAP TO UNDO]`);
    await clk.advance(2000);
    expect(last().c4).toBe("APPROVING IN 1s… [TAP TO UNDO]");
    expect(acts).toEqual([]);
  });
  it("after 3s the approve is sent once, then the next card loads", async () => {
    await c.gesture("tap");
    await clk.advance(3000);
    expect(acts).toEqual(["a:APPROVE"]);
    expect(screens.some((s) => s.c1 === "✓ APPROVED" && s.c3 === "Sent to Telegram")).toBe(true);
    await clk.advance(DONE_MS + 10);
    expect(last().c2).toBe("h-b");
  });
  it("tap during the countdown undoes it and nothing is ever sent", async () => {
    await c.gesture("tap"); await clk.advance(1500);
    await c.gesture("tap");
    expect(last().c4).toContain("[TAP: Approve]");
    await clk.advance(10_000);
    expect(acts).toEqual([]);
  });
  it("other gestures are ignored during the countdown", async () => {
    await c.gesture("tap");
    await c.gesture("next"); await c.gesture("hold"); await c.gesture("double");
    await clk.advance(3000);
    expect(acts).toEqual(["a:APPROVE"]);
  });
  it("hold declines with the same undo window", async () => {
    await c.gesture("hold");
    expect(last().c4).toBe("DECLINING IN 3s… [TAP TO UNDO]");
    await clk.advance(3000);
    expect(acts).toEqual(["a:DECLINE"]);
    expect(screens.some((s) => s.c1 === "✕ DECLINED")).toBe(true);
  });
  it("double tap snoozes immediately", async () => {
    await c.gesture("double");
    expect(acts).toEqual(["a:SNOOZE"]);
    expect(screens.some((s) => s.c1 === "ZZ SNOOZED 1h")).toBe(true);
  });
  it("dispose during the window cancels the action (fail-safe)", async () => {
    await c.gesture("tap"); c.dispose(); await clk.advance(10_000);
    expect(acts).toEqual([]);
  });
  it("empty queue shows ALL CLEAR; a tap re-checks", async () => {
    cards = []; await c.refresh();
    expect(last().c2).toBe("ALL CLEAR");
    cards = [mk("z")]; await c.gesture("tap");
    expect(last().c2).toBe("h-z");
  });
  it("network failure shows OFFLINE and recovers on the next poll", async () => {
    queueErr = new ApiError(0); await c.refresh();
    expect(last().c2).toBe("OFFLINE");
    queueErr = null; await c.refresh();
    expect(last().c2).toBe("h-a");
  });
  it("401 or no token shows the pairing prompt", async () => {
    queueErr = new ApiError(401); await c.refresh();
    expect(last().c2).toBe("ENTER CODE ON PHONE");
    token = false; queueErr = null; await c.refresh();
    expect(last().c2).toBe("ENTER CODE ON PHONE");
  });
  it("a poll during the countdown does not disturb it", async () => {
    await c.gesture("tap"); cards = []; await c.refresh();
    expect(last().c4).toContain("APPROVING");
  });
  it("502 keeps the card and shows a retry; tap retries the same approve", async () => {
    failNext = new ApiError(502);
    await c.gesture("tap"); await clk.advance(3000);
    expect(last().c4).toBe("[TAP: Retry]");
    await c.gesture("tap"); await clk.advance(3000);
    expect(acts).toEqual(["a:APPROVE"]);
  });
  it("a failed DECLINE retries as DECLINE, never as approve", async () => {
    failNext = new ApiError(502);
    await c.gesture("hold"); await clk.advance(3000);
    await c.gesture("tap"); await clk.advance(3000);
    expect(acts).toEqual(["a:DECLINE"]);
  });
  it("409 means decided elsewhere: refresh instead of erroring", async () => {
    failNext = new ApiError(409); cards = [mk("b")];
    await c.gesture("tap"); await clk.advance(3000);
    expect(last().c2).toBe("h-b");
  });
  it("swiping away from an error screen returns to the card", async () => {
    failNext = new ApiError(502);
    await c.gesture("tap"); await clk.advance(3000);
    await c.gesture("next");
    expect(last().c4).toContain("[TAP: Approve]");
  });
});
