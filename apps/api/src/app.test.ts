import { beforeEach, describe, expect, it } from "vitest";
import { buildApp, parseCors, type Deps } from "./app.ts";
import * as q from "./db.ts";
import * as g from "./google.ts";

const verdict = { category: "REFUND", headline: "$320 AWS Refund · @rohan", policy_status: "WITHIN_POLICY", policy_reason: "Under $500", recommendation: "Approve", suggested_reply: "SECRET REPLY" } as const;
const SECRET = "whsec";
let db: q.Db, g2: string, dash: string, writes: string[], failWrite: boolean, evalRules: string[][], clock: Date;
let app: Awaited<ReturnType<typeof buildApp>>;

beforeEach(async () => {
  db = q.openDb(); g2 = q.createSession(db, "G2"); dash = q.createSession(db, "DASHBOARD");
  writes = []; failWrite = false; evalRules = []; clock = new Date("2026-11-25T10:00:00Z");
  const deps: Deps = {
    db, telegramSecret: SECRET, now: () => clock,
    evaluate: async (_r, rules) => { evalRules.push(rules); return { verdict, eval_mode: "AI" }; },
    writeBack: async (card, action) => {
      await new Promise((r) => setTimeout(r, 10));
      if (failWrite) throw new Error("down");
      writes.push(`${card.id}:${action}`); return "TELEGRAM_REPLY_SENT";
    },
  };
  app = await buildApp(deps);
});

const hook = (text: string, id = 1, secret = SECRET) => app.inject({
  method: "POST", url: "/telegram/webhook", headers: { "x-telegram-bot-api-secret-token": secret },
  payload: { message: { message_id: id, text, chat: { id: -1, type: "group" }, from: { username: "rohan" } } },
});
const auth = (t: string) => ({ authorization: `Bearer ${t}` });
const act = (id: string, action: string, t = g2) => app.inject({ method: "POST", url: `/api/decisions/${id}/act`, headers: auth(t), payload: { action } });
const firstId = async () => (await app.inject({ url: "/api/queue", headers: auth(g2) })).json().cards[0].id as string;

describe("webhook", () => {
  it("rejects a wrong or missing secret", async () => {
    expect((await hook("x $1", 1, "bad")).statusCode).toBe(401);
    expect((await app.inject({ method: "POST", url: "/telegram/webhook", payload: {} })).statusCode).toBe(401);
  });
  it("turns a message into a pending card using default rules when none are set", async () => {
    expect((await hook("Refund $320")).statusCode).toBe(200);
    expect(evalRules[0]!.length).toBe(3);
    const cards = (await app.inject({ url: "/api/queue", headers: auth(g2) })).json().cards;
    expect(cards).toHaveLength(1);
    expect(cards[0].status).toBe("PENDING");
  });
  it("a redelivered update does not create a second card", async () => {
    await hook("Refund $320", 5); const r = await hook("Refund $320", 5);
    expect(r.json().duplicate).toBe(true);
    expect((await app.inject({ url: "/api/queue", headers: auth(g2) })).json().cards).toHaveLength(1);
  });
  it("ignores non-request messages", async () => {
    expect((await hook("/start")).json().ignored).toBe(true);
  });
});

describe("queue", () => {
  it("needs a G2 session and never leaks suggested_reply", async () => {
    expect((await app.inject({ url: "/api/queue" })).statusCode).toBe(401);
    expect((await app.inject({ url: "/api/queue", headers: auth(dash) })).statusCode).toBe(401);
    await hook("Refund $320");
    const body = (await app.inject({ url: "/api/queue", headers: auth(g2) })).body;
    expect(body).not.toContain("SECRET REPLY");
    expect(body).not.toContain("suggested_reply");
  });
});

describe("dashboard pending list", () => {
  it("is read-only, dashboard-only and hides suggested_reply", async () => {
    await hook("Refund $320");
    expect((await app.inject({ url: "/api/pending", headers: auth(g2) })).statusCode).toBe(401);
    const r = await app.inject({ url: "/api/pending", headers: auth(dash) });
    expect(r.json().cards).toHaveLength(1);
    expect(r.body).not.toContain("SECRET REPLY");
    // a dashboard session cannot act on cards
    expect((await act(r.json().cards[0].id, "APPROVE", dash)).statusCode).toBe(401);
  });
});

describe("act", () => {
  it("approve writes back once and logs an audit row", async () => {
    await hook("Refund $320"); const id = await firstId();
    const r = await act(id, "APPROVE");
    expect(r.statusCode).toBe(200);
    expect(r.json()).toMatchObject({ status: "APPROVED", write_back: "TELEGRAM_REPLY_SENT" });
    expect(writes).toEqual([`${id}:APPROVE`]);
    const audit = (await app.inject({ url: "/api/audit", headers: auth(dash) })).json().rows;
    expect(audit[0]).toMatchObject({ id, decision: "APPROVED", eval_mode: "AI" });
  });
  it("a second identical call is a no-op", async () => {
    await hook("Refund $320"); const id = await firstId();
    await act(id, "APPROVE"); const again = await act(id, "APPROVE");
    expect(again.statusCode).toBe(200);
    expect(writes).toHaveLength(1);
  });
  it("two simultaneous taps send only one write", async () => {
    await hook("Refund $320"); const id = await firstId();
    const [a, b] = await Promise.all([act(id, "APPROVE"), act(id, "APPROVE")]);
    expect([a.statusCode, b.statusCode].sort()).toEqual([200, 409]);
    expect(writes).toHaveLength(1);
  });
  it("a different action after deciding is 409 with the current status", async () => {
    await hook("Refund $320"); const id = await firstId();
    await act(id, "APPROVE"); const r = await act(id, "DECLINE");
    expect(r.statusCode).toBe(409);
    expect(r.json().status).toBe("APPROVED");
  });
  it("write failure returns 502 and leaves the card pending for retry", async () => {
    await hook("Refund $320"); const id = await firstId();
    failWrite = true;
    expect((await act(id, "APPROVE")).statusCode).toBe(502);
    expect(q.getCard(db, id)!.status).toBe("PENDING");
    failWrite = false;
    expect((await act(id, "APPROVE")).statusCode).toBe(200);
  });
  it("decline works", async () => {
    await hook("Refund $320"); const id = await firstId();
    expect((await act(id, "DECLINE")).json().status).toBe("DECLINED");
    expect(writes).toEqual([`${id}:DECLINE`]);
  });
  it("snooze hides the card for an hour without a write-back", async () => {
    await hook("Refund $320"); const id = await firstId();
    expect((await act(id, "SNOOZE")).statusCode).toBe(200);
    expect(writes).toHaveLength(0);
    expect((await app.inject({ url: "/api/queue", headers: auth(g2) })).json().cards).toHaveLength(0);
    clock = new Date(clock.getTime() + 3600_001);
    expect((await app.inject({ url: "/api/queue", headers: auth(g2) })).json().cards).toHaveLength(1);
  });
  it("404 for unknown id, 400 for bad action, 401 without session", async () => {
    expect((await act("nope", "APPROVE")).statusCode).toBe(404);
    await hook("Refund $320"); const id = await firstId();
    expect((await act(id, "DELETE")).statusCode).toBe(400);
    expect((await act(id, "APPROVE", "bad")).statusCode).toBe(401);
  });
});

describe("policies and pairing", () => {
  it("rules need 2 to 4 entries and are used by the next request", async () => {
    const put = (rules: string[]) => app.inject({ method: "PUT", url: "/api/policies", headers: auth(dash), payload: { rules } });
    expect((await put(["only one"])).statusCode).toBe(400);
    expect((await put(["a", "b", "c", "d", "e"])).statusCode).toBe(400);
    expect((await put(["x".repeat(201), "b"])).statusCode).toBe(400);
    expect((await put(["No refunds", "Flag unknown people"])).statusCode).toBe(200);
    await hook("Refund $320");
    expect(evalRules[0]).toEqual(["No refunds", "Flag unknown people"]);
  });
  it("a G2 session cannot edit rules or read the audit log", async () => {
    expect((await app.inject({ url: "/api/audit", headers: auth(g2) })).statusCode).toBe(401);
    expect((await app.inject({ method: "PUT", url: "/api/policies", headers: auth(g2), payload: { rules: ["a", "b"] } })).statusCode).toBe(401);
  });
  it("pair then exchange yields a working G2 token; code is single use", async () => {
    const { code } = (await app.inject({ method: "POST", url: "/api/pair", headers: auth(dash) })).json();
    const ex = await app.inject({ method: "POST", url: "/api/pair/exchange", payload: { code } });
    expect(ex.statusCode).toBe(200);
    const token = ex.json().token;
    expect((await app.inject({ url: "/api/queue", headers: auth(token) })).statusCode).toBe(200);
    expect((await app.inject({ method: "POST", url: "/api/pair/exchange", payload: { code } })).statusCode).toBe(400);
  });
  it("expired and malformed codes are refused", async () => {
    const { code } = (await app.inject({ method: "POST", url: "/api/pair", headers: auth(dash) })).json();
    clock = new Date(clock.getTime() + q.PAIR_TTL_MS + 1);
    expect((await app.inject({ method: "POST", url: "/api/pair/exchange", payload: { code } })).statusCode).toBe(400);
    expect((await app.inject({ method: "POST", url: "/api/pair/exchange", payload: { code: "abc" } })).statusCode).toBe(400);
  });
  it("/health is open", async () => expect((await app.inject({ url: "/health" })).json()).toEqual({ ok: true }));
});

describe("google connect routes", () => {
  const gcfg = { clientId: "cid", clientSecret: "cs", redirectUri: "http://x/cb", tokenSecret: "ts" };
  const withGoogle = async (fetchImpl?: typeof fetch) => buildApp({
    db, telegramSecret: SECRET, now: () => clock, google: gcfg, dashboardUrl: "http://dash", fetch: fetchImpl,
    evaluate: async () => ({ verdict, eval_mode: "AI" }), writeBack: async () => "x",
  });
  it("needs a dashboard session and Google config", async () => {
    expect((await app.inject({ url: "/auth/google", headers: auth(g2) })).statusCode).toBe(401);
    expect((await app.inject({ url: "/auth/google", headers: auth(dash) })).statusCode).toBe(501);
  });
  it("returns a Google URL with a state, and the callback connects and redirects", async () => {
    const a = await withGoogle((async () => new Response(JSON.stringify({ access_token: "A", refresh_token: "R", expires_in: 3600 }), { status: 200 })) as typeof fetch);
    const url = new URL((await a.inject({ url: "/auth/google", headers: auth(dash) })).json().url);
    expect(url.host).toBe("accounts.google.com");
    const state = url.searchParams.get("state")!;
    const cb = await a.inject({ url: `/auth/google/callback?code=abc&state=${state}` });
    expect(cb.statusCode).toBe(302);
    expect(cb.headers.location).toContain("http://dash/app/connect");
    expect((await a.inject({ url: "/api/connections", headers: auth(dash) })).json().google).toBe(true);
    // state cannot be replayed
    expect((await a.inject({ url: `/auth/google/callback?code=abc&state=${state}` })).statusCode).toBe(400);
  });
  it("rejects a callback with a bad or missing state", async () => {
    const a = await withGoogle();
    expect((await a.inject({ url: "/auth/google/callback?code=abc&state=forged" })).statusCode).toBe(400);
    expect((await a.inject({ url: "/auth/google/callback" })).statusCode).toBe(400);
  });
  it("a failed token exchange returns 502 and stays disconnected", async () => {
    const a = await withGoogle((async () => new Response("{}", { status: 400 })) as typeof fetch);
    const state = new URL((await a.inject({ url: "/auth/google", headers: auth(dash) })).json().url).searchParams.get("state")!;
    expect((await a.inject({ url: `/auth/google/callback?code=abc&state=${state}` })).statusCode).toBe(502);
    expect(g.isConnected(db)).toBe(false);
  });
});

describe("parseCors", () => {
  it("allows any origin when unset, * or true", () => {
    expect(parseCors(undefined)).toBe(true); expect(parseCors("*")).toBe(true); expect(parseCors("true")).toBe(true); expect(parseCors("")).toBe(true);
  });
  it("parses a comma-separated allow-list", () =>
    expect(parseCors("https://a.test, https://b.test")).toEqual(["https://a.test", "https://b.test"]));
  it("sends the allowed origin back, not the string 'true'", async () => {
    const a = await buildApp({ db: q.openDb(), telegramSecret: "s", corsOrigin: parseCors("true"), evaluate: async () => ({ verdict, eval_mode: "AI" }), writeBack: async () => "x" });
    const r = await a.inject({ method: "OPTIONS", url: "/api/queue", headers: { origin: "http://localhost:3922", "access-control-request-method": "GET" } });
    expect(r.headers["access-control-allow-origin"]).not.toBe("true");
  });
});
