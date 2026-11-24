import type { RawRequest } from "@greenlight/shared";

/** The scripted requests from video/SCRIPT.md scenes 4 to 6. Gmail and Calendar ids can be real sandbox ids. */
export function demoRequests(ids: { gmailThreadId?: string; calendarEventId?: string } = {}): RawRequest[] {
  return [
    { source: "TELEGRAM", external_id: "-100200:1", requester: "@rohan", text: "Refund $320 AWS credit for Acme Corp" },
    { source: "GMAIL", external_id: ids.gmailThreadId ?? "demo-thread-vendor", requester: "billing@vendorco.example", text: "Invoice: Vendor Co, $900, due Friday" },
    { source: "CALENDAR", external_id: ids.calendarEventId ?? "demo-event-clash", requester: "maya@partner.example", text: 'Invite "Partner sync" 15:30 UTC-16:30 UTC overlaps "Investor call"' },
  ];
}
