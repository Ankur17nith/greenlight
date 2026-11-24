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
6. **Teaser** (~20s): `brag-slim`, see below.

## ElevenLabs voice

Goal: warm, clear English with a mix of Indian and American accent, about 150 words per minute.

- Key: `ELEVENLABS_API_KEY` from the environment or `.env.local`. Verify with `npx -y @elevenlabs/cli@latest onboard check --env-path .env.local`. Never paste the key in chat or commit it.
- Choose the voice: use Voice Design (or browse the Voice Library for Indian-English voices) with a prompt such as *"30s, neutral American cadence with a light Indian English accent, warm, confident, clear consonants"*. Generate three candidates, read scene 1 with each, pick one.
- Save the chosen `voice_id` in `narration.json`.
- Render per scene so one line can be redone without redoing the film. Tune speed and stability per scene.
- The app itself never calls ElevenLabs; it is only used for this film.

## Teaser with `brag`

`brag` is a Claude skill that turns a project into a short launch video with music and share copy. It suits a ~20s teaser, not the 3-minute demo.

```sh
npx skills add https://github.com/latent-spaces/brag --skill brag-slim
```

Then, in the project: "let's /brag about this". Needs Node 22+ and FFmpeg. Use the ElevenLabs voice for any narration so both films sound the same. Its bundled music is CC BY 4.0 (Sascha Ende); keep the credit in the description.

## Recording checklist
- [ ] Seed data loaded and reset between takes
- [ ] Screen at 1920×1080, notifications off
- [ ] Each scene shows its write-back on screen
- [ ] No secrets, real names or real emails visible
- [ ] Captions on; voice clear over music
- [ ] Export under 3:00; opens on the problem, not the logo
