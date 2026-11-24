import { DatabaseSync } from "node:sqlite";
import { randomBytes, randomInt, randomUUID } from "node:crypto";
import type { RequestCard, Verdict } from "@greenlight/shared";

export type Db = DatabaseSync;

export function openDb(path = ":memory:"): Db {
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS policies (id INTEGER PRIMARY KEY, rule_text TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      external_id TEXT NOT NULL,
      requester TEXT NOT NULL,
      category TEXT NOT NULL,
      headline TEXT NOT NULL,
      policy_status TEXT NOT NULL,
      policy_reason TEXT,
      ai_recommendation TEXT NOT NULL,
      suggested_reply TEXT NOT NULL,
      eval_mode TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      snoozed_until TEXT,
      created_at TEXT NOT NULL,
      decided_at TEXT,
      UNIQUE (source, external_id)
    );
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, kind TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS pair_codes (code TEXT PRIMARY KEY, expires_at TEXT NOT NULL, used INTEGER NOT NULL DEFAULT 0);
  `);
  return db;
}

export interface Row {
  id: string; source: string; external_id: string; requester: string; category: string; headline: string;
  policy_status: string; policy_reason: string | null; ai_recommendation: string; suggested_reply: string;
  eval_mode: string; status: string; snoozed_until: string | null; created_at: string; decided_at: string | null;
}

/** Inserts a card; returns null if (source, external_id) already exists (duplicate webhook delivery). */
export function insertCard(
  db: Db,
  p: { source: string; external_id: string; requester: string; verdict: Verdict; eval_mode: string; now?: Date },
): Row | null {
  const id = "dec_" + randomUUID().slice(0, 12);
  const created = (p.now ?? new Date()).toISOString();
  const r = db.prepare(
    `INSERT OR IGNORE INTO decisions (id, source, external_id, requester, category, headline, policy_status, policy_reason,
      ai_recommendation, suggested_reply, eval_mode, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(id, p.source, p.external_id, p.requester, p.verdict.category, p.verdict.headline, p.verdict.policy_status,
    p.verdict.policy_reason, p.verdict.recommendation, p.verdict.suggested_reply, p.eval_mode, created);
  return r.changes === 0 ? null : getCard(db, id)!;
}

export function cardExists(db: Db, source: string, externalId: string): boolean {
  return !!db.prepare("SELECT 1 FROM decisions WHERE source = ? AND external_id = ?").get(source, externalId);
}

export function getCard(db: Db, id: string): Row | undefined {
  return db.prepare("SELECT * FROM decisions WHERE id = ?").get(id) as unknown as Row | undefined;
}

/** Pending and not currently snoozed, oldest first. */
export function queue(db: Db, now = new Date()): Row[] {
  return db.prepare(
    `SELECT * FROM decisions WHERE status = 'PENDING' AND (snoozed_until IS NULL OR snoozed_until <= ?) ORDER BY created_at ASC, rowid ASC`,
  ).all(now.toISOString()) as unknown as Row[];
}

/** Moves a card out of PENDING exactly once. Returns false if it was no longer pending. */
export function decide(db: Db, id: string, status: "APPROVED" | "DECLINED", now = new Date()): boolean {
  return db.prepare("UPDATE decisions SET status = ?, decided_at = ? WHERE id = ? AND status = 'PENDING'")
    .run(status, now.toISOString(), id).changes === 1;
}

/** Snooze keeps the card PENDING but hides it until `until`; goes to the back of the queue. */
export function snooze(db: Db, id: string, until: Date, now = new Date()): boolean {
  return db.prepare(
    "UPDATE decisions SET snoozed_until = ?, created_at = ? WHERE id = ? AND status = 'PENDING'",
  ).run(until.toISOString(), now.toISOString(), id).changes === 1;
}

export function audit(db: Db, limit = 100): Row[] {
  return db.prepare("SELECT * FROM decisions WHERE decided_at IS NOT NULL ORDER BY decided_at DESC LIMIT ?")
    .all(limit) as unknown as Row[];
}

export function getPolicies(db: Db): string[] {
  return (db.prepare("SELECT rule_text FROM policies ORDER BY id").all() as unknown as { rule_text: string }[]).map((r) => r.rule_text);
}
export function setPolicies(db: Db, rules: string[]): void {
  db.exec("BEGIN");
  try {
    db.exec("DELETE FROM policies");
    const st = db.prepare("INSERT INTO policies (rule_text) VALUES (?)");
    for (const r of rules) st.run(r);
    db.exec("COMMIT");
  } catch (e) { db.exec("ROLLBACK"); throw e; }
}

export function createSession(db: Db, kind: "G2" | "DASHBOARD", token = randomBytes(24).toString("hex")): string {
  db.prepare("INSERT OR REPLACE INTO sessions (token, kind, created_at) VALUES (?,?,?)").run(token, kind, new Date().toISOString());
  return token;
}
export function sessionKind(db: Db, token: string): "G2" | "DASHBOARD" | null {
  const r = db.prepare("SELECT kind FROM sessions WHERE token = ?").get(token) as unknown as { kind: "G2" | "DASHBOARD" } | undefined;
  return r?.kind ?? null;
}

export const PAIR_TTL_MS = 10 * 60 * 1000;
export function createPairCode(db: Db, now = new Date()): { code: string; expires_at: string } {
  for (;;) {
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const expires_at = new Date(now.getTime() + PAIR_TTL_MS).toISOString();
    const r = db.prepare("INSERT OR IGNORE INTO pair_codes (code, expires_at) VALUES (?,?)").run(code, expires_at);
    if (r.changes === 1) return { code, expires_at };
  }
}
/** Single use: marks the code used and returns true only if it was valid and unexpired. */
export function consumePairCode(db: Db, code: string, now = new Date()): boolean {
  return db.prepare("UPDATE pair_codes SET used = 1 WHERE code = ? AND used = 0 AND expires_at > ?")
    .run(code, now.toISOString()).changes === 1;
}

export function toCard(r: Row) {
  return {
    id: r.id, source: r.source as RequestCard["source"], external_id: r.external_id, requester: r.requester,
    category: r.category as RequestCard["category"], headline: r.headline,
    policy_status: r.policy_status as RequestCard["policy_status"], policy_reason: r.policy_reason ?? "",
    ai_recommendation: r.ai_recommendation, eval_mode: r.eval_mode as RequestCard["eval_mode"],
    status: r.status as RequestCard["status"], snoozed_until: r.snoozed_until, created_at: r.created_at, decided_at: r.decided_at,
  };
}
