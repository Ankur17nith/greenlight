# Video production

Two films, built from code and recordings in this folder. Script: [SCRIPT.md](SCRIPT.md). Narration text: [narration.json](narration.json). Exports: [DELIVERABLES.md](DELIVERABLES.md).

Hard limit **3:00** for the DoraHacks demo. Target 2:50.

## Pipeline

1. **Seed** the demo data: `pnpm seed` (task D2-7), so every scene shows the same requests.
2. **Capture** each scene at 1920×1080, 30 fps, into `video/shots/NN.mp4`:
   - Simulator window scaled up so the 576×288 display is readable.
   - Telegram, Gmail, Calendar and dashboard windows for the write-backs.
   - Hide real names, emails and tokens.
3. **Narrate** with ElevenLabs: one MP3 per scene from `narration.json` into `video/narration/NN.mp3` (git-ignored).
4. **Assemble** with FFmpeg: align each clip to its narration, burn in captions, add music at about -18 dB under the voice, normalize loudness.
5. **Check** the length (3:00 or less), that every scene shows its write-back, and that captions match the voice.
6. **Teaser** (~20s): `pnpm teaser`, see below.

## ElevenLabs voice

Goal: warm, clear English with a mix of Indian and American accent, about 150 words per minute.

- Key: `ELEVENLABS_API_KEY` from the environment or `.env.local`. Verify with `npx -y @elevenlabs/cli@latest onboard check --env-path .env.local`. Never paste the key in chat or commit it.
- Choose the voice: use Voice Design (or browse the Voice Library for Indian-English voices) with a prompt such as *"30s, neutral American cadence with a light Indian English accent, warm, confident, clear consonants"*. Generate three candidates, read scene 1 with each, pick one.
- Save the chosen `voice_id` in `narration.json`.
- Render per scene so one line can be redone without redoing the film. Tune speed and stability per scene.
- The app itself never calls ElevenLabs. It is used only for this film.

## How the films are made (built)

Every frame is a pure function of time: `video/src/scene.html` exposes `render(t)`, and `video/src/render.mjs` screenshots each frame with Playwright, then FFmpeg joins the frames, the ElevenLabs narration (placed from the real clip lengths in `video/src/timeline.mjs`), sentence captions and a quiet music bed, normalised to -16 LUFS.

```sh
pnpm narrate   # voice-over, once
pnpm video     # video/out/greenlight_demo.mp4 + captions.srt (about 2 minutes)
pnpm teaser    # video/out/greenlight_teaser.mp4, 20 s, music only
```

Music: put an MP3 at `video/work/music.mp3` (demo) and `video/work/music-teaser.mp3` (teaser). Without them the films render with voice only. The tracks used are CC BY 4.0, see [LICENSES.md](LICENSES.md). Finished copies are kept in `video/final/`.

What is real and what is drawn: the dashboard screens in `video/shots/` are real captures. The glasses cards and the Telegram, Gmail and Calendar panels are drawn from [SCRIPT.md](SCRIPT.md) with sample data and are labelled so on screen. To replace them with live footage, record those scenes after D0-4 to D0-6 and swap the shots.

## Recording checklist
- [ ] Seed data loaded and reset between takes
- [ ] Screen at 1920×1080, notifications off
- [ ] Each scene shows its write-back on screen
- [ ] No secrets, real names or real emails visible
- [ ] Captions on; voice clear over music
- [ ] Export under 3:00; opens on the problem, not the logo
