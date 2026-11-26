import { describe, expect, it } from "vitest";
import { setWebhook, webhookUrl } from "./set-webhook";

const env = { PUBLIC_BASE_URL: "https://greenlight-api.onrender.com/", TELEGRAM_BOT_TOKEN: "111:secret-token", TELEGRAM_WEBHOOK_SECRET: "whsec" };

describe("webhookUrl", () => {
  it("builds the webhook path from the base address", () => expect(webhookUrl("https://a.onrender.com/")).toBe("https://a.onrender.com/telegram/webhook"));
  it("refuses plain http", () => expect(() => webhookUrl("http://a.example")).toThrow("https"));
});

describe("setWebhook", () => {
  it("posts the url and secret to Telegram and never returns the token", async () => {
    let url = "", body: Record<string, unknown> = {};
    const f = (async (u: string, i?: RequestInit) => { url = u; body = JSON.parse(String(i?.body)); return new Response(JSON.stringify({ ok: true })); }) as typeof fetch;
    const msg = await setWebhook(env, f);
    expect(url).toBe("https://api.telegram.org/bot111:secret-token/setWebhook");
    expect(body).toMatchObject({ url: "https://greenlight-api.onrender.com/telegram/webhook", secret_token: "whsec" });
    expect(msg).not.toContain("secret-token");
    expect(msg).not.toContain("whsec");
  });
  it("names the missing value, not its contents", async () => {
    await expect(setWebhook({ ...env, TELEGRAM_BOT_TOKEN: undefined })).rejects.toThrow("TELEGRAM_BOT_TOKEN is not set");
    await expect(setWebhook({ ...env, PUBLIC_BASE_URL: undefined })).rejects.toThrow("PUBLIC_BASE_URL is not set");
  });
  it("rejects a secret Telegram would refuse, without printing it", async () => {
    for (const bad of ["ab+cd/ef==", "has space", '"quoted"', "line\n"]) {
      const err = await setWebhook({ ...env, TELEGRAM_WEBHOOK_SECRET: bad }).catch((e: Error) => e.message);
      expect(err).toContain("letters, digits, _ and -");
      expect(err).not.toContain(bad);
    }
  });
  it("reports Telegram's refusal without the token", async () => {
    const f = (async () => new Response(JSON.stringify({ ok: false, description: "Unauthorized" }), { status: 401 })) as typeof fetch;
    const err = await setWebhook(env, f).catch((e: Error) => e.message);
    expect(err).toBe("Telegram refused the webhook: Unauthorized");
  });
});
