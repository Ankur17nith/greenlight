import { describe, expect, it } from "vitest";
import { fixtures } from "@greenlight/shared";
import { makeEvaluator } from "./evaluator.ts";

const rules = ["Flag any refund or expense over $500."];
const req = fixtures[0]!.request;
const good = JSON.stringify({ category: "REFUND", headline: "$320 AWS refund · @rohan", policy_status: "WITHIN_POLICY", policy_reason: "Under limit", recommendation: "Approve", suggested_reply: "Approved." });

describe("makeEvaluator", () => {
  it("uses the rules, with no model and no key", async () => {
    const r = await makeEvaluator(null)(req, rules);
    expect(r.eval_mode).toBe("RULES");
    expect(r.verdict.policy_status).toBe("WITHIN_POLICY");
  });
  it("uses the model when one is configured", async () => {
    const r = await makeEvaluator(async () => good)(req, rules);
    expect(r.eval_mode).toBe("AI");
  });
  it("falls back to FLAGGED when the model fails", async () => {
    const r = await makeEvaluator(async () => { throw new Error("down"); })(req, rules);
    expect(r.eval_mode).toBe("FALLBACK");
    expect(r.verdict.policy_status).toBe("FLAGGED");
  });
  it("POLICY_MODE=rules overrides a configured model", async () => {
    let called = false;
    const r = await makeEvaluator(async () => { called = true; return good; }, "rules")(req, rules);
    expect(r.eval_mode).toBe("RULES");
    expect(called).toBe(false);
  });
});
