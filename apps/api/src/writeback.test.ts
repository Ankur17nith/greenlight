import { beforeEach, describe, expect, it } from "vitest";
import * as q from "./db.ts";
import * as g from "./google.ts";
import { DECLINE_EMAIL, makeWriteBack, TG_TEXT } from "./writeback.ts";

const cfg: g.GoogleConfig = { clientId: "c", clientSecret: "s", redirectUri: "r", tokenSecret: "k" };
const verdict = { category: "REFUND", headline: "h", policy_status: "WITHIN_POLICY", policy_reason: "r", recommendation: "rec", suggested_reply: "Approved, please proceed." } as const;
let db: q.Db; let log: { url: string; method: string; body?: string }[];

const f = (async (u: string, init?: RequestInit) => {
  log.push({ url: u, method: init?.method ?? "GET", body: init?.body as string | undefined });
  if (u.includes("oauth2.googleapis.com")) return new Response(JSON.stringify({ access_token: "A", refresh_token: "R", expires_in: 3600 }), { status: 200 });
  if (u.includes("/threads/")) return new Response(JSON.stringify({ messages: [{ id: "m", threadId: "t", payload: { headers: [{ name: "From", value: "V <v@x.test>" }, { name: "Subject", value: "Invoice" }, { name: "Message-ID", value: "<m@x>" }] } }] }), { status: 200 });
  if (u.includes("calendar") && !(init?.method === "PATCH")) return new Response(JSON.stringify({ id: "ev", attendees: [{ self: true, responseStatus: "needsAction" }] }), { status: 200 });
  return new Response("{}", { status: 200 });
}) as typeof fetch;

const card = (source: string, ext: string) => { const r = q.insertCard(db, { source, external_id: ext, requester: "x", verdict, eval_mode: "AI" })!; return r; };

beforeEach(async () => { db = q.openDb(); g.initGoogleTables(db); log = []; await g.connect(db, cfg, "code", f); log = []; });

describe("writeback", () => {
  it("telegram approve and decline reply under the message", async () => {
    const wb = makeWriteBack({ db, telegramToken: "TOK", f });
    expect(await wb(card("TELEGRAM", "-1:5"), "APPROVE")).toBe("TELEGRAM_REPLY_SENT");
    expect(JSON.parse(log[0]!.body!)).toMatchObject({ chat_id: -1, reply_to_message_id: 5, text: TG_TEXT.APPROVE });
    await wb(card("TELEGRAM", "-1:6"), "DECLINE");
    expect(JSON.parse(log[1]!.body!).text).toBe(TG_TEXT.DECLINE);
  });
  it("telegram without a token fails (so the card stays pending)", async () => {
    await expect(makeWriteBack({ db, f })(card("TELEGRAM", "1:1"), "APPROVE")).rejects.toThrow();
  });
  it("gmail approve sends suggested_reply in the same thread", async () => {
    expect(await makeWriteBack({ db, google: cfg, f })(card("GMAIL", "t1"), "APPROVE")).toBe("GMAIL_REPLY_SENT");
    const send = log.find((l) => l.url.endsWith("/messages/send"))!;
    const body = JSON.parse(send.body!);
    expect(body.threadId).toBe("t1");
    const mime = Buffer.from(body.raw, "base64url").toString();
    expect(mime).toContain("To: v@x.test");
    expect(mime).toContain("Approved, please proceed.");
  });
  it("gmail decline sends the polite decline text, not the AI's reply", async () => {
    await makeWriteBack({ db, google: cfg, f })(card("GMAIL", "t2"), "DECLINE");
    const mime = Buffer.from(JSON.parse(log.find((l) => l.url.endsWith("/messages/send"))!.body!).raw, "base64url").toString();
    expect(mime).toContain(DECLINE_EMAIL);
    expect(mime).not.toContain("Approved, please proceed.");
  });
  it("calendar maps approve/decline to accepted/declined", async () => {
    const wb = makeWriteBack({ db, google: cfg, f });
    expect(await wb(card("CALENDAR", "ev"), "DECLINE")).toBe("CALENDAR_UPDATED");
    expect(JSON.parse(log.find((l) => l.method === "PATCH")!.body!).attendees[0].responseStatus).toBe("declined");
  });
  it("google not configured fails", async () => {
    await expect(makeWriteBack({ db, f })(card("GMAIL", "t3"), "APPROVE")).rejects.toThrow("google");
  });
});
