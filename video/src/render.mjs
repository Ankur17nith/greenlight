// Renders the demo film from scene.html: every frame is a pure function of time (render(t)).
// Usage: node video/src/render.mjs [--music path/to/track.mp3] [--fps 24] [--frames-only]
// Needs ffmpeg and Playwright. Narration comes from video/narration/NN.mp3 (pnpm narrate).
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildCaptions, buildTimeline, toSrt } from "./timeline.mjs";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const FPS = Number(arg("--fps", 24));
const music = arg("--music", join(root, "work", "music.mp3"));
const work = join(root, "work");
const out = join(root, "out");
mkdirSync(join(work, "frames"), { recursive: true });
mkdirSync(out, { recursive: true });

const dur = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
const narration = JSON.parse(readFileSync(join(root, "narration.json"), "utf8")).scenes;

const files = narration.map((s) => join(root, "narration", `${s.id}.mp3`));
for (const f of files) if (!existsSync(f)) throw new Error(`Missing ${f}. Run pnpm narrate first.`);
const { scenes: slots, total } = buildTimeline(narration, files.map(dur));
const scenes = slots.map((s, i) => ({ ...s, file: files[i] }));
const captions = buildCaptions(scenes);
writeFileSync(join(out, "captions.srt"), toSrt(captions));
writeFileSync(join(work, "timeline.json"), JSON.stringify({ scenes, captions, total }, null, 2));

const n = Math.round(total * FPS);
console.log(`Film ${total.toFixed(1)}s, ${n} frames at ${FPS} fps`);

if (!process.argv.includes("--skip-frames")) {
  const { chromium } = require("playwright");
  const browser = await chromium.launch();
  const WORKERS = 4;
  await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto(pathToFileURL(join(here, "scene.html")).href);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate((tl) => window.setTimeline(tl), { scenes, captions });
    for (let f = w; f < n; f += WORKERS) {
      await page.evaluate((t) => window.render(t), f / FPS);
      await page.screenshot({ path: join(work, "frames", `f${String(f).padStart(5, "0")}.jpg`), type: "jpeg", quality: 92 });
    }
    await page.close();
  }));
  await browser.close();
}
if (process.argv.includes("--frames-only")) process.exit(0);

// Audio: narration at its slot, music underneath (about -20 dB), faded in and out.
const inputs = ["-framerate", String(FPS), "-i", join(work, "frames", "f%05d.jpg")];
scenes.forEach((s) => inputs.push("-i", s.file));
const hasMusic = existsSync(music);
if (hasMusic) inputs.push("-stream_loop", "-1", "-i", music);
const voiceLabels = scenes.map((s, i) => `[${i + 1}:a]adelay=${Math.round(s.voiceAt * 1000)}|${Math.round(s.voiceAt * 1000)}[v${i}]`);
let filter = voiceLabels.join(";") + ";" + scenes.map((_, i) => `[v${i}]`).join("") + `amix=inputs=${scenes.length}:normalize=0:dropout_transition=0[voice]`;
if (hasMusic) {
  const mi = scenes.length + 1;
  filter += `;[${mi}:a]volume=0.045,afade=t=in:d=3,afade=t=out:st=${(total - 3).toFixed(2)}:d=3,atrim=0:${total.toFixed(2)}[mus];[voice][mus]amix=inputs=2:normalize=0:duration=first[mix]`;
} else filter += ";[voice]anull[mix]";
filter += ";[mix]loudnorm=I=-16:TP=-1.5:LRA=11[aud]";

execFileSync("ffmpeg", ["-y", ...inputs, "-filter_complex", filter, "-map", "0:v", "-map", "[aud]", "-t", total.toFixed(2),
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-r", String(FPS), "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
  join(out, "greenlight_demo.mp4")], { stdio: "inherit" });
console.log("Wrote", join(out, "greenlight_demo.mp4"));
