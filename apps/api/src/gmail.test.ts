import { describe, expect, it } from "vitest";
import { buildReply, fetchRequests, oneLine, replyContext, sendReply } from "./gmail.ts";

const msg = (id: string, thread: string, from: string, subject: string, snippet = "") => ({
  id, threadId: thread, snippet,
  payload: { headers: [{ name: "From", value: from }, { name: "Subject", value: subject }, { name: "Message-ID", value: `<${id}@x>` }] },
});
const router = (routes: Record<string, unknown>, log: { url: string; init?: RequestInit }[] = []) => (async (u: string, init?: RequestInit) => {
  log.push({ url: u, init });
  const key = Object.keys(routes).find((k) => u.includes(k));
  return key ? new Response(JSON.stringify(routes[key]), { status: 200 }) : new Response("{}", { status: 404 });
}) as typeof fetch;
const decode = (raw: string) => Buffer.from(raw, "base64url").toString("utf8");

describe("gmail", () => {
  it("turns labelled mail into requests, one per thread", async () => {
    const f = router({
      "/messages?": { messages: [{ id: "m1" }, { id: "m2" }, { id: "m3" }] },
      "/messages/m1": msg("m1", "t1", "Vendor Co <ap@vendor.test>", "Invoice: Vendor Co", "$900 due Friday"),
      "/messages/m2": msg("m2", "t1", "Vendor Co <ap@vendor.test>", "Re: Invoice: Vendor Co"),
      "/messages/m3": msg("m3", "t2", "x@y.test", "NDA"),
    });
    const r = await fetchRequests("tok", f);
    expect(r).toHaveLength(2);
    expect(r[0]).toMatchObject({ source: "GMAIL", external_id: "t1", requester: "ap@vendor.test", text: "Invoice: Vendor Co. $900 due Friday" });
  });
  it("sends the bearer token and queries the Approval and Invoice labels", async () => {
    const log: { url: string; init?: RequestInit }[] = [];
    await fetchRequests("tok", router({ "/messages?": {} }, log));
    expect(decodeURIComponent(log[0]!.url.replace(/\+/g, " "))).toContain("label:Approval OR label:Invoice");
    expect((log[0]!.init!.headers as Record<string, string>).authorization).toBe("Bearer tok");
  });
  it("throws if the list call fails", async () => {
    await expect(fetchRequests("t", router({}))).rejects.toThrow("404");
  });
  it("builds a threaded reply with In-Reply-To and a Re: subject", () => {
    const t = decode(buildReply({ to: "a@b.test", subject: "Invoice", messageId: "<m1@x>", body: "Declined." }));
    expect(t).toContain("To: a@b.test");
    expect(t).toContain("Subject: Re: Invoice");
    expect(t).toContain("In-Reply-To: <m1@x>");
    expect(t.endsWith("Declined.")).toBe(true);
  });
  it("does not double the Re: prefix", () =>
    expect(decode(buildReply({ to: "a@b", subject: "RE: x", messageId: "", body: "b" }))).toContain("Subject: RE: x"));
  it("header values cannot inject extra headers", () => {
    const t = decode(buildReply({ to: "a@b.test\r\nBcc: evil@x.test", subject: "Hi\r\nBcc: evil@x.test", messageId: "<m>\r\nX: y", body: "b" }));
    expect(t.split("\r\n").some((l) => l.startsWith("Bcc:"))).toBe(false);
    expect(oneLine("a\r\nb")).toBe("a b");
  });
  it("encodes non-ASCII subjects", () =>
    expect(decode(buildReply({ to: "a@b", subject: "Rechnung für Mai", messageId: "", body: "b" }))).toMatch(/Subject: =\?UTF-8\?B\?/));
  it("send posts raw and threadId", async () => {
    const log: { url: string; init?: RequestInit }[] = [];
    await sendReply("tok", "t1", "RAW", router({ "/messages/send": {} }, log));
    expect(JSON.parse(log[0]!.init!.body as string)).toEqual({ raw: "RAW", threadId: "t1" });
  });
  it("send throws on failure", async () => {
    await expect(sendReply("t", "t1", "R", router({}))).rejects.toThrow("gmail send");
  });
  it("replyContext prefers Reply-To", async () => {
    const m = msg("m1", "t1", "A <a@x.test>", "Invoice");
    (m.payload.headers as { name: string; value: string }[]).push({ name: "Reply-To", value: "billing@x.test" });
    expect(await replyContext("t", "t1", router({ "/threads/t1": { messages: [m] } }))).toEqual({ to: "billing@x.test", subject: "Invoice", messageId: "<m1@x>" });
  });
});
