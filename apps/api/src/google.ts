import { randomBytes } from "node:crypto";
import type { Db } from "./db.ts";
import { decrypt, encrypt } from "./crypto.ts";

export const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/calendar.events",
];

export interface GoogleConfig { clientId: string; clientSecret: string; redirectUri: string; tokenSecret: string }
type Fetch = typeof fetch;
interface Stored { refresh_token: string; access_token: string; expires_at: number }

export function initGoogleTables(db: Db): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS google_tokens (id INTEGER PRIMARY KEY CHECK (id = 1), enc TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS oauth_states (state TEXT PRIMARY KEY, expires_at TEXT NOT NULL);
  `);
}

/** Single-use CSRF state for the OAuth round trip, valid 10 minutes. */
export function newState(db: Db, now = new Date()): string {
  const state = randomBytes(16).toString("hex");
  db.prepare("INSERT INTO oauth_states (state, expires_at) VALUES (?,?)").run(state, new Date(now.getTime() + 600_000).toISOString());
  return state;
}
export function consumeState(db: Db, state: string, now = new Date()): boolean {
  const r = db.prepare("DELETE FROM oauth_states WHERE state = ? AND expires_at > ?").run(state, now.toISOString());
  return r.changes === 1;
}

export function authUrl(c: GoogleConfig, state: string): string {
  const p = new URLSearchParams({
    client_id: c.clientId, redirect_uri: c.redirectUri, response_type: "code", scope: SCOPES.join(" "),
    access_type: "offline", prompt: "consent", state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

async function tokenCall(body: Record<string, string>, f: Fetch) {
  const res = await f("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body),
  });
  if (!res.ok) throw new Error(`google token ${res.status}`);
  return (await res.json()) as { access_token: string; expires_in: number; refresh_token?: string };
}

function save(db: Db, s: Stored, secret: string): void {
  db.prepare("INSERT OR REPLACE INTO google_tokens (id, enc) VALUES (1, ?)").run(encrypt(JSON.stringify(s), secret));
}
function load(db: Db, secret: string): Stored | null {
  const r = db.prepare("SELECT enc FROM google_tokens WHERE id = 1").get() as unknown as { enc: string } | undefined;
  return r ? (JSON.parse(decrypt(r.enc, secret)) as Stored) : null;
}
export const isConnected = (db: Db) => !!db.prepare("SELECT 1 FROM google_tokens WHERE id = 1").get();

export async function connect(db: Db, c: GoogleConfig, code: string, f: Fetch = fetch, now = new Date()): Promise<void> {
  const t = await tokenCall({ code, client_id: c.clientId, client_secret: c.clientSecret, redirect_uri: c.redirectUri, grant_type: "authorization_code" }, f);
  if (!t.refresh_token) throw new Error("no refresh token returned");
  save(db, { refresh_token: t.refresh_token, access_token: t.access_token, expires_at: now.getTime() + t.expires_in * 1000 }, c.tokenSecret);
}

/** Returns a valid access token, refreshing (and re-saving) when it expires within 60s. */
export async function accessToken(db: Db, c: GoogleConfig, f: Fetch = fetch, now = new Date()): Promise<string> {
  const s = load(db, c.tokenSecret);
  if (!s) throw new Error("google not connected");
  if (s.expires_at - now.getTime() > 60_000) return s.access_token;
  const t = await tokenCall({ refresh_token: s.refresh_token, client_id: c.clientId, client_secret: c.clientSecret, grant_type: "refresh_token" }, f);
  save(db, { refresh_token: s.refresh_token, access_token: t.access_token, expires_at: now.getTime() + t.expires_in * 1000 }, c.tokenSecret);
  return t.access_token;
}
