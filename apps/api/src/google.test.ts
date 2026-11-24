import { beforeEach, describe, expect, it } from "vitest";
import * as g from "./google.ts";
import * as q from "./db.ts";

const cfg: g.GoogleConfig = { clientId: "cid", clientSecret: "csec", redirectUri: "http://x/cb", tokenSecret: "ts" };
let db: q.Db; let calls: URLSearchParams[];
const fakeFetch = (resp: object, status = 200) => (async (_u: string, init: RequestInit) => { calls.push(init.body as URLSearchParams); return new Response(JSON.stringify(resp), { status }); }) as typeof fetch;
const t0 = new Date("2026-11-26T10:00:00Z");

beforeEach(() => { db = q.openDb(); g.initGoogleTables(db); calls = []; });

describe("google oauth", () => {
  it("auth URL asks for exactly the three least-privilege scopes, offline, with state", () => {
    const u = new URL(g.authUrl(cfg, "st"));
    expect(u.searchParams.get("scope")!.split(" ")).toEqual(g.SCOPES);
    expect(g.SCOPES.join(" ")).not.toMatch(/gmail\.modify|mail\.google\.com|auth\/calendar$/);
    expect(u.searchParams.get("access_type")).toBe("offline");
    expect(u.searchParams.get("state")).toBe("st");
  });
  it("state is single use and expires", () => {
    const s = g.newState(db, t0);
    expect(g.consumeState(db, s, new Date(t0.getTime() + 1000))).toBe(true);
    expect(g.consumeState(db, s, t0)).toBe(false);
    const s2 = g.newState(db, t0);
    expect(g.consumeState(db, s2, new Date(t0.getTime() + 601_000))).toBe(false);
    expect(g.consumeState(db, "unknown", t0)).toBe(false);
  });
  it("connect stores tokens encrypted at rest", async () => {
    await g.connect(db, cfg, "code", fakeFetch({ access_token: "ACCESS", refresh_token: "REFRESH", expires_in: 3600 }), t0);
    expect(g.isConnected(db)).toBe(true);
    const raw = (db.prepare("SELECT enc FROM google_tokens").get() as { enc: string }).enc;
    expect(raw).not.toContain("REFRESH");
    expect(Buffer.from(raw, "base64").toString("utf8")).not.toContain("REFRESH");
    expect(calls[0]!.get("grant_type")).toBe("authorization_code");
  });
  it("connect fails without a refresh token", async () => {
    await expect(g.connect(db, cfg, "c", fakeFetch({ access_token: "a", expires_in: 1 }), t0)).rejects.toThrow("refresh");
    expect(g.isConnected(db)).toBe(false);
  });
  it("returns the cached token while fresh, refreshes when near expiry", async () => {
    await g.connect(db, cfg, "c", fakeFetch({ access_token: "A1", refresh_token: "R", expires_in: 3600 }), t0);
    calls = [];
    expect(await g.accessToken(db, cfg, fakeFetch({}), new Date(t0.getTime() + 60_000))).toBe("A1");
    expect(calls).toHaveLength(0);
    const later = new Date(t0.getTime() + 3590_000);
    expect(await g.accessToken(db, cfg, fakeFetch({ access_token: "A2", expires_in: 3600 }), later)).toBe("A2");
    expect(calls[0]!.get("grant_type")).toBe("refresh_token");
    expect(calls[0]!.get("refresh_token")).toBe("R");
    // the refreshed token is persisted and keeps the same refresh token
    expect(await g.accessToken(db, cfg, fakeFetch({}), later)).toBe("A2");
  });
  it("throws when not connected or when the secret changed", async () => {
    await expect(g.accessToken(db, cfg, fakeFetch({}), t0)).rejects.toThrow("not connected");
    await g.connect(db, cfg, "c", fakeFetch({ access_token: "A", refresh_token: "R", expires_in: 3600 }), t0);
    await expect(g.accessToken(db, { ...cfg, tokenSecret: "other" }, fakeFetch({}), t0)).rejects.toThrow();
  });
});
