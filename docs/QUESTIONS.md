# Open questions

Questions that block or change a decision. Answer in place, then move the line to the "Answered" section.

## Need an answer soon

1. **Which SDK events exist?** Do tap, swipe forward and back, hold, double tap and the R1 ring press each arrive as events in the simulator and on the glasses? Needed for the gesture table in [G2_UI.md](G2_UI.md#verified-gestures). Answered by the Day 0 spike (D0-3). If hold or double tap are missing, the fallback mapping is in [`../plan.md`](../plan.md).
2. **What origin does the Even Realities WebView send?** Needed for the CORS setting on the API and the `app.json` whitelist. Check on first request from the simulator and from a real device.
3. **Hosting.** Which host gives a stable public HTTPS URL for the API and the Next.js web app (Telegram webhook, Google redirect and the G2 whitelist all depend on it)? One domain is preferred. Not chosen yet.
4. **Google OAuth test users.** Which sandbox Google account is added as a test user on the consent screen in Testing mode? Needed before D0-5 is done.
5. **Voice for the film.** Which ElevenLabs voice (a mix of Indian and American English)? Pick from three Voice Design candidates once the key is available, then save the `voice_id` in `video/narration.json`.

## Need an answer, not urgent

6. **Does the Debrief author permit code reuse?** The web app is written fresh in a similar style for now. If the author grants permission in writing, some components could be reused with attribution. Until then, no Debrief source is copied.
7. **Does the Even Hub catalogue already have an approvals app?** Check before the demo so the "clearly new or clearly better" claim is true.
8. **Should the web app be a static export or a Node-hosted Next.js app?** Depends on the host chosen in question 3 and on whether the dashboard needs server routes beyond the API.
9. **Do we submit a second track?** The plan says Messaging as the second track. Confirm once the Telegram path works well enough to claim it.

## Assumptions we are proceeding on

- A sandbox Telegram group, Gmail and Calendar are enough for the demo.
- The undo window is client-side: nothing is sent until the 3 seconds end.
- No funds move and no real inbox is used.

## Answered

_None yet._
