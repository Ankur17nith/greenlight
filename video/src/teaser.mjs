// ~20 s teaser cut from the same scene page, without captions or voice, over a music bed.
// Run after render.mjs (needs work/timeline.json). Usage: node video/src/teaser.mjs [--music path]
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const work = join(root, "work"), out = join(root, "out");
const i = process.argv.indexOf("--music");
const music = i > 0 ? process.argv[i + 1] : join(work, "music-teaser.mp3");
const tl = JSON.parse(readFileSync(join(work, "timeline.json"), "utf8"));
const at = (id, local) => tl.scenes.find((s) => s.id === String(id)).start + local;
// [start, seconds] in film time.
const cuts = [[at(1, 6.4), 3], [at(3, 14.0), 4], [at(5, 9.0), 6], [at(6, 6.8), 4], [at(11, 0.3), 3]];
const FPS = 30;
mkdirSync(join(work, "teaser"), { recursive: true });
const { chromium } = require("playwright");
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(pathToFileURL(join(here, "scene.html")).href);
await p.evaluate(() => document.fonts.ready);
await p.evaluate((t) => window.setTimeline(t), { scenes: tl.scenes, captions: [] });
let f = 0;
for (const [s, d] of cuts) for (let k = 0; k < d * FPS; k++, f++) {
  await p.evaluate((t) => window.render(t), s + k / FPS);
  await p.screenshot({ path: join(work, "teaser", `t${String(f).padStart(5, "0")}.jpg`), type: "jpeg", quality: 92 });
}
await b.close();
const total = f / FPS;
const args = ["-y", "-framerate", String(FPS), "-i", join(work, "teaser", "t%05d.jpg")];
if (existsSync(music)) args.push("-i", music, "-af", `volume=0.35,afade=t=in:d=0.5,afade=t=out:st=${total - 1.5}:d=1.5,loudnorm=I=-16:TP=-1.5`, "-c:a", "aac", "-b:a", "192k");
args.push("-t", String(total), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-movflags", "+faststart", join(out, "greenlight_teaser.mp4"));
execFileSync("ffmpeg", args, { stdio: "inherit" });
console.log("Wrote greenlight_teaser.mp4,", total, "s");
