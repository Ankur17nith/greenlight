// Pure timeline helpers for the film: scene slots from narration lengths, and sentence captions.
export const LEAD = 0.5, GAP = 0.8, END_GAP = 1.6, MAX_SECONDS = 180;

/** scenes: [{id,text}], seconds: voice length per scene. Returns scene slots and the film length. */
export function buildTimeline(scenes, seconds) {
  if (scenes.length !== seconds.length) throw new Error("One duration per scene is required");
  let cursor = 0;
  const out = scenes.map((s, i) => {
    const len = LEAD + seconds[i] + (i === scenes.length - 1 ? END_GAP : GAP);
    const slot = { id: String(Number(s.id)), start: cursor, len, voiceAt: cursor + LEAD, voiceLen: seconds[i], text: s.text };
    cursor += len;
    return slot;
  });
  if (cursor > MAX_SECONDS) throw new Error(`Film is ${cursor.toFixed(1)}s; the limit is ${MAX_SECONDS}s`);
  return { scenes: out, total: cursor };
}

/** One caption per sentence, timed by each sentence's share of the scene's characters. */
export function buildCaptions(scenes) {
  const captions = [];
  for (const s of scenes) {
    const parts = s.text.match(/[^.!?]+[.!?]+/g) ?? [s.text];
    const chars = parts.reduce((n, p) => n + p.length, 0);
    let t = s.voiceAt;
    for (const p of parts) {
      const d = (p.length / chars) * s.voiceLen;
      captions.push({ t0: t, t1: t + d, text: p.trim() });
      t += d;
    }
  }
  return captions;
}

export function srtTime(x) {
  const h = Math.floor(x / 3600), m = Math.floor(x / 60) % 60, s = x % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${s.toFixed(3).padStart(6, "0").replace(".", ",")}`;
}

export const toSrt = (captions) => captions.map((c, i) => `${i + 1}\n${srtTime(c.t0)} --> ${srtTime(c.t1)}\n${c.text}\n`).join("\n");
