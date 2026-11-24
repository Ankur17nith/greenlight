import { describe, expect, it } from "vitest";
import { fetchRequests, findConflicts, respond, toRequest, type CalEvent } from "./calendar.ts";

const ev = (id: string, summary: string, s: string, e: string, status: string | null, extra: Partial<CalEvent> = {}): CalEvent => ({
  id, summary, start: { dateTime: s }, end: { dateTime: e }, organizer: { email: "org@x.test" },
  attendees: status ? [{ email: "me@x.test", self: true, responseStatus: status }, { email: "o@x.test" }] : undefined, ...extra,
});
const call = ev("call", "Investor call", "2026-11-26T15:00:00Z", "2026-11-26T16:00:00Z", "accepted");

describe("findConflicts", () => {
  it("flags an invite overlapping an accepted event", () => {
    const inv = ev("inv", "Vendor sync", "2026-11-26T15:30:00Z", "2026-11-26T16:30:00Z", "needsAction");
    const c = findConflicts([call, inv]);
    expect(c).toHaveLength(1);
    expect(c[0]!.with.id).toBe("call");
  });
  it("ignores back-to-back events (end equals start)", () =>
    expect(findConflicts([call, ev("inv", "x", "2026-11-26T16:00:00Z", "2026-11-26T17:00:00Z", "needsAction")])).toEqual([]));
  it("ignores invites already answered, cancelled, or with no clash", () => {
    expect(findConflicts([call, ev("a", "x", "2026-11-26T15:30:00Z", "2026-11-26T16:30:00Z", "accepted")])).toEqual([]);
    expect(findConflicts([call, ev("b", "x", "2026-11-26T15:30:00Z", "2026-11-26T16:30:00Z", "needsAction", { status: "cancelled" })])).toEqual([]);
    expect(findConflicts([call, ev("c", "x", "2026-11-27T15:30:00Z", "2026-11-27T16:30:00Z", "needsAction")])).toEqual([]);
  });
  it("does not treat a declined event as busy", () =>
    expect(findConflicts([ev("d", "old", "2026-11-26T15:00:00Z", "2026-11-26T16:00:00Z", "declined"), ev("i", "x", "2026-11-26T15:10:00Z", "2026-11-26T15:40:00Z", "needsAction")])).toEqual([]));
  it("my own events (organizer self, no attendee row) count as busy", () => {
    const mine = ev("m", "Board prep", "2026-11-26T15:00:00Z", "2026-11-26T16:00:00Z", null, { organizer: { email: "me@x.test", self: true } });
    expect(findConflicts([mine, ev("i", "x", "2026-11-26T15:10:00Z", "2026-11-26T15:40:00Z", "needsAction")])).toHaveLength(1);
  });
  it("skips all-day events (no dateTime)", () =>
    expect(findConflicts([call, { id: "ad", summary: "Holiday", start: {}, end: {}, attendees: [{ self: true, responseStatus: "needsAction" }] }])).toEqual([]));
});

describe("toRequest", () => {
  it("describes the clash and uses the organizer as requester", () => {
    const r = toRequest({ invite: ev("inv", "Vendor sync", "2026-11-26T15:30:00Z", "2026-11-26T16:30:00Z", "needsAction"), with: call });
    expect(r).toEqual({ source: "CALENDAR", external_id: "inv", requester: "org@x.test", text: 'Invite "Vendor sync" 15:30 UTC-16:30 UTC overlaps "Investor call"' });
  });
});

const j = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status });
describe("calendar api", () => {
  it("fetchRequests queries a 14 day window and returns conflicts", async () => {
    let url = "";
    const f = (async (u: string) => { url = u; return j({ items: [call, ev("inv", "S", "2026-11-26T15:30:00Z", "2026-11-26T16:00:00Z", "needsAction")] }); }) as typeof fetch;
    const r = await fetchRequests("t", new Date("2026-11-25T00:00:00Z"), f);
    expect(r).toHaveLength(1);
    expect(url).toContain("singleEvents=true");
    expect(url).toContain("timeMax=2026-12-09");
  });
  it("respond changes only my response and sends no guest emails", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const f = (async (u: string, init?: RequestInit) => { calls.push({ url: u, init }); return init?.method === "PATCH" ? j({}) : j(ev("inv", "S", "2026-11-26T15:30:00Z", "2026-11-26T16:00:00Z", "needsAction")); }) as typeof fetch;
    await respond("t", "inv", "declined", f);
    expect(calls[1]!.url).toContain("sendUpdates=none");
    const body = JSON.parse(calls[1]!.init!.body as string);
    expect(body.attendees).toEqual([{ email: "me@x.test", self: true, responseStatus: "declined" }, { email: "o@x.test" }]);
  });
  it("respond fails if I am not an attendee or Google errors", async () => {
    await expect(respond("t", "e", "declined", (async () => j({ id: "e" })) as typeof fetch)).rejects.toThrow("attendee");
    await expect(respond("t", "e", "declined", (async () => j({}, 403)) as typeof fetch)).rejects.toThrow("403");
  });
  it("fetchRequests throws on API failure", async () => {
    await expect(fetchRequests("t", new Date(), (async () => j({}, 401)) as typeof fetch)).rejects.toThrow("401");
  });
});
