import { describe, expect, it } from "vitest";
import { sendReply, updateToRequest } from "./telegram.ts";

const upd = (text: string, extra: object = {}) => ({ message: { message_id: 7, text, chat: { id: -100, type: "group" }, from: { username: "rohan" }, ...extra } });

describe("updateToRequest", () => {
  it("turns a group message into a request", () =>
    expect(updateToRequest(upd("Refund $320"))).toEqual({ source: "TELEGRAM", external_id: "-100:7", requester: "@rohan", text: "Refund $320" }));
  it("supports /request and /request@bot", () => {
    expect(updateToRequest(upd("/request Refund $5"))?.text).toBe("Refund $5");
    expect(updateToRequest(upd("/request@gl_bot Refund $5"))?.text).toBe("Refund $5");
  });
  it("ignores other commands, bare /request, bots and non-text", () => {
    expect(updateToRequest(upd("/start"))).toBeNull();
    expect(updateToRequest(upd("/request"))).toBeNull();
    expect(updateToRequest(upd("hi", { from: { is_bot: true } }))).toBeNull();
    expect(updateToRequest({ message: { message_id: 1, chat: { id: 1, type: "group" } } })).toBeNull();
    expect(updateToRequest({})).toBeNull();
  });
  it("falls back to first name when there is no username", () =>
    expect(updateToRequest(upd("x $1", { from: { first_name: "Maya" } }))?.requester).toBe("Maya"));
});

describe("sendReply", () => {
  it("replies under the original message", async () => {
    let url = "", body: any;
    const f = (async (u: string, init: RequestInit) => { url = u; body = JSON.parse(init.body as string); return new Response("{}", { status: 200 }); }) as typeof fetch;
    await sendReply("TOK", "-100:7", "ok", f);
    expect(url).toBe("https://api.telegram.org/botTOK/sendMessage");
    expect(body).toMatchObject({ chat_id: -100, reply_to_message_id: 7, text: "ok" });
  });
  it("throws on a non-200", async () => {
    await expect(sendReply("T", "1:2", "x", (async () => new Response("", { status: 400 })) as typeof fetch)).rejects.toThrow("400");
  });
});
