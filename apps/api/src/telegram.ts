import type { RawRequest } from "@greenlight/shared";

export interface TgUpdate {
  message?: {
    message_id: number;
    text?: string;
    chat: { id: number; type: string };
    from?: { username?: string; first_name?: string; is_bot?: boolean };
  };
}

/** Turns a Telegram update into a request, or null if it is not one (no text, from a bot, a bare /command). */
export function updateToRequest(u: TgUpdate): RawRequest | null {
  const m = u.message;
  if (!m?.text || m.from?.is_bot) return null;
  let text = m.text.trim();
  const cmd = text.match(/^\/(\w+)(?:@\w+)?\s*(.*)$/s);
  if (cmd) {
    if (cmd[1]!.toLowerCase() !== "request") return null;
    text = cmd[2]!.trim();
  }
  if (!text) return null;
  const requester = m.from?.username ? "@" + m.from.username : (m.from?.first_name ?? "unknown");
  return { source: "TELEGRAM", external_id: `${m.chat.id}:${m.message_id}`, requester, text };
}

export type Fetch = typeof fetch;

/** Posts a reply under the original message. */
export const TELEGRAM_API = "https://api.telegram.org";

/** `base` is configurable so a local stand-in server can be used in sandboxes and tests. */
export async function sendReply(token: string, externalId: string, text: string, f: Fetch = fetch, base = TELEGRAM_API): Promise<void> {
  const [chat, msg] = externalId.split(":");
  const res = await f(`${base}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: Number(chat), text, reply_to_message_id: Number(msg), allow_sending_without_reply: true }),
  });
  if (!res.ok) throw new Error(`telegram ${res.status}`);
}
