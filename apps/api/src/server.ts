import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { anthropicComplete, evaluate, fallbackVerdict, parseRequest } from "@greenlight/policy";
import { buildApp } from "./app.ts";
import { createSession, openDb } from "./db.ts";
import { sendReply } from "./telegram.ts";

const env = process.env;
const dbPath = env.SQLITE_PATH ?? "./data/greenlight.sqlite";
mkdirSync(dirname(dbPath), { recursive: true });
const db = openDb(dbPath);
// Dashboard session token comes from the environment (demo auth; no user accounts).
if (env.DASHBOARD_TOKEN) createSession(db, "DASHBOARD", env.DASHBOARD_TOKEN);

const complete = env.ANTHROPIC_API_KEY ? anthropicComplete(env.ANTHROPIC_API_KEY, env.POLICY_MODEL ?? "claude-haiku-5-5") : null;

const app = await buildApp({
  db,
  telegramSecret: env.TELEGRAM_WEBHOOK_SECRET ?? "",
  corsOrigin: env.CORS_ORIGIN ?? true,
  evaluate: async (req, rules) => {
    if (!complete) return { verdict: fallbackVerdict(req, parseRequest(req.text), "No AI key"), eval_mode: "FALLBACK" };
    const r = await evaluate(req, rules, { complete });
    return { verdict: r.verdict, eval_mode: r.eval_mode };
  },
  writeBack: async (card, action) => {
    if (card.source === "TELEGRAM") {
      const text = action === "APPROVE" ? "✅ Approved by Founder via Greenlight" : "❌ Declined by Founder via Greenlight";
      await sendReply(env.TELEGRAM_BOT_TOKEN ?? "", card.external_id, text);
      return "TELEGRAM_REPLY_SENT";
    }
    throw new Error(`write-back for ${card.source} not implemented`);
  },
});
await app.listen({ port: Number(env.PORT ?? 3000), host: "0.0.0.0" });
console.log(`greenlight api on :${env.PORT ?? 3000}`);
