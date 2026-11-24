import { describe, expect, it } from "vitest";
import * as q from "./db.ts";

const verdict = { category: "REFUND", headline: "h", policy_status: "WITHIN_POLICY", policy_reason: "r", recommendation: "rec", suggested_reply: "sr" } as const;
const add = (db: q.Db, id: string, at: string) => q.insertCard(db, { source: "TELEGRAM", external_id: id, requester: "@a", verdict, eval_mode: "AI", now: new Date(at) })!;

describe("db", () => {
  it("queue returns oldest first", () => {
    const db = q.openDb();
    add(db, "1:2", "2026-11-25T10:02:00Z"); add(db, "1:1", "2026-11-25T10:01:00Z"); add(db, "1:3", "2026-11-25T10:03:00Z");
    expect(q.queue(db).map((r) => r.external_id)).toEqual(["1:1", "1:2", "1:3"]);
  });
  it("duplicate external id is ignored", () => {
    const db = q.openDb();
    expect(add(db, "1:1", "2026-11-25T10:00:00Z")).not.toBeNull();
    expect(q.insertCard(db, { source: "TELEGRAM", external_id: "1:1", requester: "@a", verdict, eval_mode: "AI" })).toBeNull();
  });
  it("snoozed cards are hidden, then return at the back after an hour", () => {
    const db = q.openDb();
    const a = add(db, "1:1", "2026-11-25T10:00:00Z"); add(db, "1:2", "2026-11-25T10:01:00Z");
    const t = new Date("2026-11-25T11:00:00Z");
    q.snooze(db, a.id, new Date(t.getTime() + 3600_000), t);
    expect(q.queue(db, t).map((r) => r.external_id)).toEqual(["1:2"]);
    expect(q.queue(db, new Date("2026-11-25T12:00:01Z")).map((r) => r.external_id)).toEqual(["1:2", "1:1"]);
  });
  it("decide works once only and hides the card from the queue", () => {
    const db = q.openDb();
    const a = add(db, "1:1", "2026-11-25T10:00:00Z");
    expect(q.decide(db, a.id, "APPROVED")).toBe(true);
    expect(q.decide(db, a.id, "DECLINED")).toBe(false);
    expect(q.getCard(db, a.id)!.status).toBe("APPROVED");
    expect(q.queue(db)).toHaveLength(0);
    expect(q.audit(db)).toHaveLength(1);
  });
  it("pair codes are single use and expire", () => {
    const db = q.openDb();
    const t = new Date("2026-11-25T10:00:00Z");
    const { code } = q.createPairCode(db, t);
    expect(code).toMatch(/^\d{6}$/);
    expect(q.consumePairCode(db, code, new Date(t.getTime() + 1000))).toBe(true);
    expect(q.consumePairCode(db, code, new Date(t.getTime() + 2000))).toBe(false);
    const b = q.createPairCode(db, t);
    expect(q.consumePairCode(db, b.code, new Date(t.getTime() + q.PAIR_TTL_MS + 1))).toBe(false);
  });
  it("policies are replaced as a set", () => {
    const db = q.openDb();
    q.setPolicies(db, ["a", "b"]); q.setPolicies(db, ["c", "d", "e"]);
    expect(q.getPolicies(db)).toEqual(["c", "d", "e"]);
  });
  it("sessions have a kind", () => {
    const db = q.openDb();
    const t = q.createSession(db, "G2");
    expect(q.sessionKind(db, t)).toBe("G2");
    expect(q.sessionKind(db, "nope")).toBeNull();
  });
});
