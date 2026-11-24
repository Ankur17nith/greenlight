import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// SECURITY.md: no Telegram, Google or AI keys in the G2 bundle. Scan the source (and the built bundle when present).
const dirs = [join(__dirname), join(__dirname, "..", "dist")];
const files = (d: string): string[] => {
  try {
    return readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(d, e.name)) : [join(d, e.name)]));
  } catch { return []; }
};
const secretish = [/sk-ant-/i, /sk-or-/i, /ANTHROPIC_API_KEY/, /OPENROUTER_API_KEY/, /TELEGRAM_BOT_TOKEN/, /GOOGLE_CLIENT_SECRET/, /ELEVENLABS_API_KEY/, /AIza[0-9A-Za-z_-]{30,}/, /\b\d{8,10}:[A-Za-z0-9_-]{35}\b/];

describe("g2 bundle", () => {
  it("contains no provider keys or secret variable names", () => {
    const hits: string[] = [];
    for (const f of dirs.flatMap(files).filter((f) => /\.(ts|js|html)$/.test(f) && !f.endsWith("bundle.test.ts"))) {
      const text = readFileSync(f, "utf8");
      for (const re of secretish) if (re.test(text)) hits.push(`${f}: ${re}`);
    }
    expect(hits).toEqual([]);
  });
});
