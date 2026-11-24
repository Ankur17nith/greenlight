import { beforeEach, describe, expect, it } from "vitest";
import * as q from "./db.ts";
import * as g from "./google.ts";
import { pollGoogle } from "./poll.ts";

const cfg: g.GoogleConfig = { clientId: "c", clientSecret: "s", redirectUri: "r", tokenSecret: "k" };
let db: q.Db; let ingested: string[]; let errors: string[]; let gmailFails: boolean;

const f = (async (u: string) => {
  if (u.includes("oauth2")) return new Response(JSON.stringify({ access_token: "A", refresh_token: "R", expires_in: 3600 }), { status: 200 });
  if (u.includes("gmail")) {
    if (gmailFails) return new Response("{}", { status: 500 });
    if (u.includes("/messages?")) return new Response(JSON.stringify({ messages: [{ id: "m1" }] }), { status: 200 });
    return new Response(JSON.stringify({ id: "m1", threadId: "t1", snippet: "$900", payload: { headers: [{ name: "From", value: "a@b.test" }, { name: "Subject", value: "Invoice" }] } }), { status: 200 });
  }
  return new Response(JSON.stringify({ items: [
    { id: "a", summary: "Investor call", status: "confirmed", start: { dateTime: "2026-11-26T15:00:00Z" }, end: { dateTime: "2026-11-26T16:00:00Z" }, attendees: [{ self: true, responseStatus: "accepted" }] },
    { id: "b", summary: "Sync", start: { dateTime: "2026-11-26T15:30:00Z" }, end: { dateTime: "2026-11-26T16:30:00Z" }, organizer: { email: "o@x.test" }, attendees: [{ self: true, responseStatus: "needsAction" }] },
  ] }), { status: 200 });
}) as typeof fetch;

const deps = () => ({ db, google: cfg, f, ingest: async (r: { source: string; external_id: string }) => { ingested.push(`${r.source}:${r.external_id}`); }, onError: (s: string) => { errors.push(s); } });

beforeEach(() => { db = q.openDb(); g.initGoogleTables(db); ingested = []; errors = []; gmailFails = false; });

describe("pollGoogle", () => {
  it("does nothing when Google is not connected", async () => {
    expect(await pollGoogle(deps())).toEqual({ gmail: 0, calendar: 0 });
    expect(ingested).toEqual([]);
  });
  it("ingests Gmail threads and Calendar clashes", async () => {
    await g.connect(db, cfg, "c", f);
    expect(await pollGoogle(deps())).toEqual({ gmail: 1, calendar: 1 });
    expect(ingested).toEqual(["GMAIL:t1", "CALENDAR:b"]);
  });
  it("a Gmail failure does not block Calendar", async () => {
    await g.connect(db, cfg, "c", f); gmailFails = true;
    expect(await pollGoogle(deps())).toEqual({ gmail: 0, calendar: 1 });
    expect(errors).toEqual(["gmail"]);
  });
  it("an auth failure is reported and stops the pass", async () => {
    await g.connect(db, cfg, "c", f);
    const bad = { ...deps(), google: { ...cfg, tokenSecret: "wrong" } };
    expect(await pollGoogle(bad)).toEqual({ gmail: 0, calendar: 0 });
    expect(errors).toEqual(["auth"]);
  });
});
