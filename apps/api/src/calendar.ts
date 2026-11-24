import type { RawRequest } from "@greenlight/shared";

type Fetch = typeof fetch;
const API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const auth = (t: string) => ({ authorization: `Bearer ${t}` });

export interface CalEvent {
  id: string; summary?: string; status?: string;
  start?: { dateTime?: string }; end?: { dateTime?: string };
  organizer?: { email?: string; self?: boolean };
  attendees?: { email?: string; self?: boolean; responseStatus?: string }[];
}

const span = (e: CalEvent): [number, number] | null => {
  const s = e.start?.dateTime && Date.parse(e.start.dateTime), t = e.end?.dateTime && Date.parse(e.end.dateTime);
  return s && t && !Number.isNaN(s) && !Number.isNaN(t) ? [s, t] : null;
};
const overlaps = (a: [number, number], b: [number, number]) => a[0] < b[1] && b[0] < a[1];
const myStatus = (e: CalEvent) => e.attendees?.find((a) => a.self)?.responseStatus;

/** Pure: pending invites (needsAction) that overlap an event I have accepted or own. */
export function findConflicts(events: CalEvent[]): { invite: CalEvent; with: CalEvent }[] {
  const busy = events.filter((e) => e.status !== "cancelled" && (myStatus(e) === "accepted" || (!myStatus(e) && e.organizer?.self)));
  const out: { invite: CalEvent; with: CalEvent }[] = [];
  for (const inv of events) {
    if (inv.status === "cancelled" || myStatus(inv) !== "needsAction") continue;
    const s = span(inv);
    if (!s) continue;
    const clash = busy.find((b) => b.id !== inv.id && span(b) && overlaps(s, span(b)!));
    if (clash) out.push({ invite: inv, with: clash });
  }
  return out;
}

const hhmm = (iso: string) => new Date(iso).toISOString().slice(11, 16) + " UTC";

export function toRequest(c: { invite: CalEvent; with: CalEvent }): RawRequest {
  const i = c.invite;
  return {
    source: "CALENDAR", external_id: i.id, requester: i.organizer?.email ?? "unknown",
    text: `Invite "${i.summary ?? "(no title)"}" ${hhmm(i.start!.dateTime!)}-${hhmm(i.end!.dateTime!)} overlaps "${c.with.summary ?? "(no title)"}"`,
  };
}

export async function fetchRequests(token: string, now = new Date(), f: Fetch = fetch): Promise<RawRequest[]> {
  const qs = new URLSearchParams({
    timeMin: now.toISOString(), timeMax: new Date(now.getTime() + 14 * 86400_000).toISOString(),
    singleEvents: "true", orderBy: "startTime", maxResults: "50",
  });
  const res = await f(`${API}?${qs}`, { headers: auth(token) });
  if (!res.ok) throw new Error(`calendar list ${res.status}`);
  const items = ((await res.json()) as { items?: CalEvent[] }).items ?? [];
  return findConflicts(items).map(toRequest);
}

/** Sets MY attendee response only; other attendees are sent back unchanged. No emails to guests. */
export async function respond(token: string, eventId: string, status: "accepted" | "declined", f: Fetch = fetch): Promise<void> {
  const get = await f(`${API}/${encodeURIComponent(eventId)}`, { headers: auth(token) });
  if (!get.ok) throw new Error(`calendar get ${get.status}`);
  const ev = (await get.json()) as CalEvent;
  if (!ev.attendees?.some((a) => a.self)) throw new Error("not an attendee");
  const attendees = ev.attendees.map((a) => (a.self ? { ...a, responseStatus: status } : a));
  const res = await f(`${API}/${encodeURIComponent(eventId)}?sendUpdates=none`, {
    method: "PATCH", headers: { ...auth(token), "content-type": "application/json" }, body: JSON.stringify({ attendees }),
  });
  if (!res.ok) throw new Error(`calendar patch ${res.status}`);
}
