import { describe, expect, it } from "vitest";
import { Verdict, RequestCard, RawRequest, Decision, fixtures } from "./index";

const verdict = {
  category: "REFUND", headline: "$320 AWS Refund · @rohan (Acme Corp)", policy_status: "WITHIN_POLICY",
  policy_reason: "Under $500 limit", recommendation: "Approve — under $500 limit", suggested_reply: "Approved.",
};

describe("schemas", () => {
  it("accepts a valid verdict", () => expect(Verdict.safeParse(verdict).success).toBe(true));
  it("rejects a headline over 42 chars", () =>
    expect(Verdict.safeParse({ ...verdict, headline: "x".repeat(43) }).success).toBe(false));
  it("rejects an unknown category", () =>
    expect(Verdict.safeParse({ ...verdict, category: "LOAN" }).success).toBe(false));
  it("accepts a full card", () =>
    expect(RequestCard.safeParse({ ...verdict, id: "a", source: "TELEGRAM", external_id: "1:1", requester: "@r",
      eval_mode: "AI", status: "PENDING", snoozed_until: null, created_at: "2026-11-25T00:00:00Z", decided_at: null }).success).toBe(true));
  it("only allows the three actions", () => {
    expect(Decision.safeParse({ action: "APPROVE" }).success).toBe(true);
    expect(Decision.safeParse({ action: "DELETE" }).success).toBe(false);
  });
  it("parses every fixture", () => {
    for (const f of fixtures) expect(RawRequest.safeParse(f.request).success, f.name).toBe(true);
  });
});
