import { describe, expect, it } from "vitest";
import * as r from "./render";

const card: r.CardView = { category: "REFUND", source: "TELEGRAM", headline: "$320 AWS Refund · @rohan (Acme Corp)", policy_status: "WITHIN_POLICY", policy_reason: "Under $500", ai_recommendation: "Approve — under $500 limit" };

describe("render", () => {
  it("within-policy card", () => {
    const s = r.cardScreen(card, 0, 3);
    expect(s.c1).toBe("[REFUND · TG]  WITHIN POLICY");
    expect(s.c3).toBe("AI: Approve — under $500 limit");
    expect(s.c4).toContain("1/3");
  });
  it("flagged badge carries a short reason", () =>
    expect(r.badge({ ...card, policy_status: "FLAGGED", policy_reason: "Over $500 limit" })).toBe("FLAGGED: Over $500 limit"));
  it("clips long text so no container overflows", () => {
    const s = r.cardScreen({ ...card, headline: "x".repeat(80), ai_recommendation: "y".repeat(80), policy_status: "FLAGGED", policy_reason: "z".repeat(60) }, 1, 3);
    expect(s.c2.length).toBeLessThanOrEqual(42);
    expect(s.c3.length).toBeLessThanOrEqual(48);
    expect(s.c1).toContain("…");
  });
  it("confirming shows the countdown and undo hint", () =>
    expect(r.confirmingScreen(card, 2, "APPROVE", 0, 1).c4).toBe("APPROVING IN 2s… [TAP TO UNDO]"));
  it("done screens name the write-back", () => {
    expect(r.doneScreen(card, "APPROVE", "TELEGRAM_REPLY_SENT")).toMatchObject({ c1: "APPROVED", c3: "Sent to Telegram" });
    expect(r.doneScreen(card, "DECLINE", "GMAIL_REPLY_SENT")).toMatchObject({ c1: "DECLINED", c3: "Replied in Gmail" });
    expect(r.doneScreen(card, "APPROVE", "CALENDAR_UPDATED").c3).toBe("Calendar updated");
  });
  it("fixed-state screens", () => {
    expect(r.emptyScreen().c2).toBe("ALL CLEAR");
    expect(r.offlineScreen().c2).toBe("OFFLINE");
    expect(r.unpairedScreen().c2).toBe("ENTER CODE ON PHONE");
    expect(r.snoozedScreen(card).c1).toBe("ZZ SNOOZED 1h");
  });
  it("uses plain ASCII for status text (no glyphs the G2 font may lack)", () => {
    const all = [r.cardScreen(card, 0, 1), r.cardScreen({ ...card, policy_status: "FLAGGED" }, 0, 1), r.doneScreen(card, "APPROVE", "x"), r.doneScreen(card, "DECLINE", "x")];
    for (const s of all) for (const v of [s.c1, s.c2.replace(/·/g, ""), s.c3, s.c4]) expect(v.replace(/[·…—]/g, "")).toMatch(/^[\x20-\x7e]*$/);
  });
  it("error screen offers retry", () => expect(r.errorScreen(card, "Send failed").c4).toBe("[TAP: Retry]"));
});
