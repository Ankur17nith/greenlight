// Generates video/narration/NN.mp3 from video/narration.json with ElevenLabs text-to-speech.
// Usage: pnpm narrate        (reads ELEVENLABS_API_KEY from the environment or .env.local)
// Only the film uses ElevenLabs; the app never calls it.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export interface Scene { id: string; target_seconds: number; text: string }
export interface NarrationConfig { voice_id: string; model_id?: string; scenes: Scene[] }

/** mp3_44100_128 is constant 128 kbit/s, so 16000 bytes is one second. */
export const BYTES_PER_SECOND = 16000;
export const MAX_TOTAL_SECONDS = 175; // 2:55, leaves room under the 3:00 limit

export const mp3Seconds = (bytes: number) => bytes / BYTES_PER_SECOND;

export function parseEnvFile(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]!] = m[2]!.replace(/^["']|["']$/g, "");
  }
  return out;
}

export function validate(cfg: NarrationConfig): void {
  if (!cfg.voice_id || cfg.voice_id.startsWith("TODO")) throw new Error("Set voice_id in video/narration.json");
  if (!cfg.scenes?.length) throw new Error("narration.json has no scenes");
  const ids = new Set<string>();
  for (const s of cfg.scenes) {
    if (!/^\d{2}$/.test(s.id)) throw new Error(`Scene id must be two digits: ${s.id}`);
    if (ids.has(s.id)) throw new Error(`Duplicate scene id ${s.id}`);
    if (!s.text.trim()) throw new Error(`Scene ${s.id} has no text`);
    ids.add(s.id);
  }
}

export async function speak(
  apiKey: string, voiceId: string, text: string, modelId = "eleven_multilingual_v2", f: typeof fetch = fetch,
): Promise<Uint8Array> {
  const res = await f(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: modelId }),
  });
  // Never include the key or the response body in errors.
  if (res.status === 401) throw new Error("ElevenLabs rejected the API key");
  if (!res.ok) throw new Error(`ElevenLabs request failed (${res.status})`);
  return new Uint8Array(await res.arrayBuffer());
}

export interface Result { id: string; seconds: number; target: number }

export async function narrate(
  cfg: NarrationConfig, apiKey: string, outDir: string,
  deps: { f?: typeof fetch; write?: (path: string, data: Uint8Array) => void } = {},
): Promise<{ scenes: Result[]; total: number }> {
  validate(cfg);
  const write = deps.write ?? ((p: string, d: Uint8Array) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, d); });
  const scenes: Result[] = [];
  for (const s of cfg.scenes) {
    const audio = await speak(apiKey, cfg.voice_id, s.text, cfg.model_id, deps.f);
    write(join(outDir, `${s.id}.mp3`), audio);
    scenes.push({ id: s.id, seconds: mp3Seconds(audio.byteLength), target: s.target_seconds });
  }
  const total = scenes.reduce((a, s) => a + s.seconds, 0);
  return { scenes, total };
}

export function report(r: { scenes: Result[]; total: number }): string {
  const rows = r.scenes.map((s) => `${s.id}  ${s.seconds.toFixed(1)}s  (target ${s.target}s)${s.seconds > s.target + 2 ? "  LONG" : ""}`);
  const verdict = r.total <= MAX_TOTAL_SECONDS ? "within the 2:55 limit" : "OVER the 2:55 limit";
  return [...rows, `total ${r.total.toFixed(1)}s, ${verdict}`].join("\n");
}

const here = dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = resolve(here, "..");
  const envFile = join(root, ".env.local");
  const fromFile = existsSync(envFile) ? parseEnvFile(readFileSync(envFile, "utf8")) : {};
  const key = process.env.ELEVENLABS_API_KEY ?? fromFile.ELEVENLABS_API_KEY;
  if (!key) { console.error("ELEVENLABS_API_KEY is not set"); process.exit(1); }
  const cfg = JSON.parse(readFileSync(join(root, "video", "narration.json"), "utf8")) as NarrationConfig;
  narrate(cfg, key, join(root, "video", "narration")).then(
    (r) => { console.log(report(r)); if (r.total > MAX_TOTAL_SECONDS) process.exit(2); },
    (e: Error) => { console.error(e.message); process.exit(1); },
  );
}
