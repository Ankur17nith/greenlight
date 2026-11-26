// Points the Telegram bot at the deployed API. Usage: pnpm webhook   (reads .env, or the environment)
// Needs PUBLIC_BASE_URL, TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET. Never prints the token or the secret.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseEnvFile } from "./narrate";

export function webhookUrl(base: string): string {
  const u = new URL(base);
  if (u.protocol !== "https:") throw new Error("PUBLIC_BASE_URL must be an https:// address; Telegram refuses plain http");
  return `${u.origin}/telegram/webhook`;
}

export async function setWebhook(env: Record<string, string | undefined>, f: typeof fetch = fetch): Promise<string> {
  const { PUBLIC_BASE_URL: base, TELEGRAM_BOT_TOKEN: token, TELEGRAM_WEBHOOK_SECRET: secret } = env;
  if (!base) throw new Error("PUBLIC_BASE_URL is not set");
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  if (!secret) throw new Error("TELEGRAM_WEBHOOK_SECRET is not set");
  if (!/^[A-Za-z0-9_-]{1,256}$/.test(secret)) {
    throw new Error("TELEGRAM_WEBHOOK_SECRET may only contain letters, digits, _ and -, and be 1 to 256 characters (check for spaces, quotes or + / = characters). Make one with: openssl rand -hex 24");
  }
  const url = webhookUrl(base);
  const res = await f(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url, secret_token: secret, allowed_updates: ["message"] }),
  });
  const body = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string };
  if (!res.ok || !body.ok) throw new Error(`Telegram refused the webhook: ${body.description ?? res.status}`);
  return `Webhook set to ${url}`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const file = join(root, ".env");
  const fromFile = existsSync(file) ? parseEnvFile(readFileSync(file, "utf8")) : {};
  setWebhook({ ...fromFile, ...process.env }).then(
    (m) => console.log(m),
    (e: Error) => { console.error(e.message); process.exit(1); },
  );
}
