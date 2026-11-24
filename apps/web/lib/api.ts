// Browser client for apps/api. The dashboard token is typed in once and kept in localStorage
// (demo auth, see docs/API.md). Provider keys never reach the browser.

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const TOKEN_KEY = 'greenlight.dashboard';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type Fetch = typeof fetch;

export interface Client {
  get<T>(path: string): Promise<T>;
  send<T>(method: 'POST' | 'PUT', path: string, body?: unknown): Promise<T>;
}

/** status 0 = the server could not be reached; 401 = token missing or wrong. */
export function makeClient(base: string, token: string | null, f: Fetch = fetch): Client {
  const call = async <T,>(method: string, path: string, body?: unknown): Promise<T> => {
    let res: Response;
    try {
      res = await f(base + path, {
        method,
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token ?? ''}` },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(0, 'Cannot reach the server');
    }
    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      try {
        message = (await res.json()).error?.message ?? message;
      } catch {}
      throw new ApiError(res.status, message);
    }
    return res.json() as Promise<T>;
  };
  return { get: (p) => call('GET', p), send: (m, p, b) => call(m, p, b) };
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function setToken(t: string | null): void {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}
export const client = () => makeClient(API_URL, getToken());

export interface AuditRow {
  id: string;
  requester: string;
  category: string;
  headline: string;
  policy_status: 'WITHIN_POLICY' | 'FLAGGED';
  decision: 'APPROVED' | 'DECLINED';
  eval_mode: 'AI' | 'FALLBACK';
  decided_at: string;
}

/** "2026-11-26T14:03:11.000Z" -> "26 Nov 14:03:11" (UTC, so the log reads the same everywhere). */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const mon = d.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' });
  return `${d.getUTCDate()} ${mon} ${d.toISOString().slice(11, 19)}`;
}

/** Formats a 6-digit code as "123-456" for reading aloud. */
export const groupCode = (c: string) => (c.length === 6 ? `${c.slice(0, 3)}-${c.slice(3)}` : c);

/** Seconds left until an ISO expiry, never negative. */
export const secondsLeft = (expiresAt: string, now = Date.now()) => Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000));
