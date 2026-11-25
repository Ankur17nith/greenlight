/**
 * The four text containers shown on the G2 (docs/G2_UI.md). Pure: no SDK imports.
 * Plain ASCII only: the simulator font has no check mark, warning sign or cross glyphs.
 */
export interface Screen { c1: string; c2: string; c3: string; c4: string }

export interface CardView {
  category: string;
  source: "TELEGRAM" | "GMAIL" | "CALENDAR";
  headline: string;
  policy_status: "WITHIN_POLICY" | "FLAGGED";
  policy_reason: string;
  ai_recommendation: string;
}

const SRC: Record<CardView["source"], string> = { TELEGRAM: "TG", GMAIL: "GM", CALENDAR: "CAL" };
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function badge(c: CardView): string {
  return c.policy_status === "WITHIN_POLICY" ? "WITHIN POLICY" : `FLAGGED: ${clip(c.policy_reason || "review", 24)}`;
}

export function footer(index: number, total: number): string {
  return `[TAP: Approve] [SWIPE: Next] [HOLD: Deny] ${index + 1}/${total}`;
}

export function cardScreen(c: CardView, index: number, total: number): Screen {
  return {
    c1: `[${clip(c.category, 10)} · ${SRC[c.source]}]  ${badge(c)}`,
    c2: clip(c.headline, 42),
    c3: `AI: ${clip(c.ai_recommendation, 44)}`,
    c4: footer(index, total),
  };
}

export const confirmingScreen = (c: CardView, secondsLeft: number, action: "APPROVE" | "DECLINE", index: number, total: number): Screen => ({
  ...cardScreen(c, index, total),
  c4: `${action === "APPROVE" ? "APPROVING" : "DECLINING"} IN ${secondsLeft}s… [TAP TO UNDO]`,
});

export const doneScreen = (c: CardView, action: "APPROVE" | "DECLINE", writeBack: string): Screen => ({
  c1: action === "APPROVE" ? "APPROVED" : "DECLINED",
  c2: clip(c.headline, 42),
  c3: writeBack === "TELEGRAM_REPLY_SENT" ? "Sent to Telegram" : writeBack === "GMAIL_REPLY_SENT" ? "Replied in Gmail" : writeBack === "CALENDAR_UPDATED" ? "Calendar updated" : "Done",
  c4: "",
});

export const snoozedScreen = (c: CardView): Screen => ({ c1: "ZZ SNOOZED 1h", c2: clip(c.headline, 42), c3: "", c4: "" });
export const emptyScreen = (): Screen => ({ c1: "GREENLIGHT", c2: "ALL CLEAR", c3: "No decisions waiting", c4: "" });
export const offlineScreen = (): Screen => ({ c1: "GREENLIGHT", c2: "OFFLINE", c3: "Retrying…", c4: "" });
export const unpairedScreen = (): Screen => ({ c1: "GREENLIGHT", c2: "ENTER CODE ON PHONE", c3: "Open the Even app", c4: "" });
export const errorScreen = (c: CardView, msg: string): Screen => ({ ...cardScreen(c, 0, 1), c3: clip(msg, 44), c4: "[TAP: Retry]" });
