import type { RawRequest } from "@greenlight/shared";

type Fetch = typeof fetch;
const API = "https://gmail.googleapis.com/gmail/v1/users/me";
const auth = (t: string) => ({ authorization: `Bearer ${t}` });

interface Msg { id: string; threadId: string; snippet?: string; payload?: { headers?: { name: string; value: string }[] } }
const header = (m: Msg, n: string) => m.payload?.headers?.find((h) => h.name.toLowerCase() === n.toLowerCase())?.value ?? "";

export const GMAIL_QUERY = "(label:Approval OR label:Invoice) newer_than:7d";

/** Removes CR/LF so a crafted header value cannot inject extra headers. */
export const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

/** Latest message of each labelled thread, as requests. Email text is data, not instructions. */
export async function fetchRequests(token: string, f: Fetch = fetch): Promise<(RawRequest & { replyTo: string; messageId: string; subject: string })[]> {
  const list = await f(`${API}/messages?${new URLSearchParams({ q: GMAIL_QUERY, maxResults: "10" })}`, { headers: auth(token) });
  if (!list.ok) throw new Error(`gmail list ${list.status}`);
  const ids = ((await list.json()) as { messages?: { id: string }[] }).messages ?? [];
  const seen = new Set<string>();
  const out: Awaited<ReturnType<typeof fetchRequests>> = [];
  for (const { id } of ids) {
    const qs = new URLSearchParams({ format: "metadata" });
    for (const h of ["From", "Reply-To", "Subject", "Message-ID"]) qs.append("metadataHeaders", h);
    const r = await f(`${API}/messages/${id}?${qs}`, { headers: auth(token) });
    if (!r.ok) continue;
    const m = (await r.json()) as Msg;
    if (seen.has(m.threadId)) continue; // one card per thread
    seen.add(m.threadId);
    const from = oneLine(header(m, "From"));
    const subject = oneLine(header(m, "Subject"));
    out.push({
      source: "GMAIL", external_id: m.threadId, requester: from.replace(/^.*<(.+)>$/, "$1") || "unknown",
      text: `${subject}. ${oneLine(m.snippet ?? "")}`.trim(),
      replyTo: oneLine(header(m, "Reply-To") || from).replace(/^.*<(.+)>$/, "$1"),
      messageId: oneLine(header(m, "Message-ID")), subject,
    });
  }
  return out;
}

const b64url = (s: string) => Buffer.from(s, "utf8").toString("base64url");
const encSubject = (s: string) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${Buffer.from(s).toString("base64")}?=`);

export function buildReply(p: { to: string; subject: string; messageId: string; body: string }): string {
  const subject = /^re:/i.test(p.subject) ? p.subject : `Re: ${p.subject}`;
  const lines = [
    `To: ${oneLine(p.to)}`,
    `Subject: ${encSubject(oneLine(subject))}`,
    ...(p.messageId ? [`In-Reply-To: ${oneLine(p.messageId)}`, `References: ${oneLine(p.messageId)}`] : []),
    "Content-Type: text/plain; charset=UTF-8",
    "",
    p.body,
  ];
  return b64url(lines.join("\r\n"));
}

/** Sends a reply inside the original thread. */
export async function sendReply(token: string, threadId: string, raw: string, f: Fetch = fetch): Promise<void> {
  const res = await f(`${API}/messages/send`, {
    method: "POST", headers: { ...auth(token), "content-type": "application/json" }, body: JSON.stringify({ raw, threadId }),
  });
  if (!res.ok) throw new Error(`gmail send ${res.status}`);
}

/** Looks up the thread's first message to learn who to reply to. */
export async function replyContext(token: string, threadId: string, f: Fetch = fetch): Promise<{ to: string; subject: string; messageId: string }> {
  const qs = new URLSearchParams({ format: "metadata" });
  for (const h of ["From", "Reply-To", "Subject", "Message-ID"]) qs.append("metadataHeaders", h);
  const res = await f(`${API}/threads/${threadId}?${qs}`, { headers: auth(token) });
  if (!res.ok) throw new Error(`gmail thread ${res.status}`);
  const msgs = ((await res.json()) as { messages?: Msg[] }).messages ?? [];
  const first = msgs[0];
  if (!first) throw new Error("empty thread");
  const from = oneLine(header(first, "From"));
  return { to: oneLine(header(first, "Reply-To") || from).replace(/^.*<(.+)>$/, "$1"), subject: oneLine(header(first, "Subject")), messageId: oneLine(header(first, "Message-ID")) };
}
