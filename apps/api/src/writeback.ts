import type { Db, Row } from "./db.ts";
import * as cal from "./calendar.ts";
import * as gmail from "./gmail.ts";
import { accessToken, type GoogleConfig } from "./google.ts";
import { sendReply as tgReply } from "./telegram.ts";

export const TG_TEXT = { APPROVE: "Approved by Founder via Greenlight", DECLINE: "Declined by Founder via Greenlight" } as const;
export const DECLINE_EMAIL = "Thank you for sending this over. After review, we are unable to approve it at this time. Please get in touch if anything changes.";

export interface WriteBackDeps { db: Db; google?: GoogleConfig; telegramToken?: string; telegramBase?: string; f?: typeof fetch }

/** Performs the external write for a card the founder just approved or declined. Throws on failure. */
export function makeWriteBack(d: WriteBackDeps) {
  return async (card: Row, action: "APPROVE" | "DECLINE"): Promise<string> => {
    if (card.source === "TELEGRAM") {
      if (!d.telegramToken) throw new Error("telegram not configured");
      await tgReply(d.telegramToken, card.external_id, TG_TEXT[action], d.f, d.telegramBase);
      return "TELEGRAM_REPLY_SENT";
    }
    if (!d.google) throw new Error("google not configured");
    const token = await accessToken(d.db, d.google, d.f);
    if (card.source === "GMAIL") {
      const ctx = await gmail.replyContext(token, card.external_id, d.f);
      const body = action === "APPROVE" ? card.suggested_reply : DECLINE_EMAIL;
      await gmail.sendReply(token, card.external_id, gmail.buildReply({ ...ctx, body }), d.f);
      return "GMAIL_REPLY_SENT";
    }
    if (card.source === "CALENDAR") {
      await cal.respond(token, card.external_id, action === "APPROVE" ? "accepted" : "declined", d.f);
      return "CALENDAR_UPDATED";
    }
    throw new Error(`unknown source ${card.source}`);
  };
}
