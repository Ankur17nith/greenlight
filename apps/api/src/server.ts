import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { anthropicComplete } from "@greenlight/policy";
import { makeEvaluator } from "./evaluator.ts";
import { buildApp, ingest, parseCors, type Deps } from "./app.ts";
import { createSession, openDb } from "./db.ts";
import { pollGoogle } from "./poll.ts";
import { makeWriteBack } from "./writeback.ts";

const env = process.env;
const dbPath = env.SQLITE_PATH ?? "./data/greenlight.sqlite";
mkdirSync(dirname(dbPath), { recursive: true });
const db = openDb(dbPath);
// Dashboard session token comes from the environment (demo auth; no user accounts).
if (env.DASHBOARD_TOKEN) createSession(db, "DASHBOARD", env.DASHBOARD_TOKEN);

const complete = env.ANTHROPIC_API_KEY ? anthropicComplete(env.ANTHROPIC_API_KEY, env.POLICY_MODEL ?? "claude-haiku-5-5") : null;
const google = env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
  ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, redirectUri: env.GOOGLE_REDIRECT_URI ?? "", tokenSecret: env.SESSION_SECRET ?? "" }
  : undefined;
if (google && !google.tokenSecret) throw new Error("SESSION_SECRET is required to encrypt Google tokens");

const deps: Deps = {
  db,
  google,
  dashboardUrl: env.DASHBOARD_URL,
  demoMode: env.DEMO_MODE === "1",
  telegramSecret: env.TELEGRAM_WEBHOOK_SECRET ?? "",
  corsOrigin: parseCors(env.CORS_ORIGIN),
  evaluate: makeEvaluator(complete, env.POLICY_MODE),
  writeBack: makeWriteBack({ db, google, telegramToken: env.TELEGRAM_BOT_TOKEN, telegramBase: env.TELEGRAM_API_BASE }),
};

const app = await buildApp(deps);
await app.listen({ port: Number(env.PORT ?? 3001), host: "0.0.0.0" });
console.log(`greenlight api on :${env.PORT ?? 3001}`);

if (google) {
  const every = Number(env.GOOGLE_POLL_MS ?? 30_000);
  let running = false;
  setInterval(async () => {
    if (running) return; // never overlap passes
    running = true;
    try { await pollGoogle({ db, google, ingest: (r) => ingest(deps, r), onError: (s, e) => console.error(`poll ${s}: ${e.message}`) }); }
    finally { running = false; }
  }, every);
}
