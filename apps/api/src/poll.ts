import type { RawRequest } from "@greenlight/shared";
import * as cal from "./calendar.ts";
import * as gmail from "./gmail.ts";
import { accessToken, isConnected, type GoogleConfig } from "./google.ts";
import type { Db } from "./db.ts";

export interface PollDeps {
  db: Db; google: GoogleConfig; f?: typeof fetch; now?: () => Date;
  /** Evaluates and stores one request; must skip duplicates. */
  ingest: (r: RawRequest) => Promise<unknown>;
  onError?: (source: string, e: Error) => void;
}

/** One polling pass. Gmail and Calendar are independent: one failing never blocks the other. */
export async function pollGoogle(d: PollDeps): Promise<{ gmail: number; calendar: number }> {
  const n = { gmail: 0, calendar: 0 };
  if (!isConnected(d.db)) return n;
  let token: string;
  try { token = await accessToken(d.db, d.google, d.f, d.now?.()); } catch (e) { d.onError?.("auth", e as Error); return n; }
  try {
    for (const r of await gmail.fetchRequests(token, d.f)) { await d.ingest(r); n.gmail++; }
  } catch (e) { d.onError?.("gmail", e as Error); }
  try {
    for (const r of await cal.fetchRequests(token, d.now?.() ?? new Date(), d.f)) { await d.ingest(r); n.calendar++; }
  } catch (e) { d.onError?.("calendar", e as Error); }
  return n;
}
