# Submission day: Sat 28 Nov 2026

Deadline: Sun 29 Nov, 23:59 Dubai time (UTC+4). All times below are Dubai time. The goal is to submit tonight, so Sunday is only spare time.

**Rule for the day:** no new features. Fix, record, check, submit. If the video is the weak part, spend the hours on the video.

## Timeline (Dubai time)

| When | Do | Done when |
|---|---|---|
| 09:00–09:30 | Pull `main`, run `pnpm install`, `pnpm typecheck`, `pnpm test` on a fresh clone | All green; any red is fixed or cut |
| 09:30–10:30 | Walk the README from a clean machine or folder: setup to the demo | Someone who did not write it can reach the first card |
| 10:30–11:30 | Run the demo end to end on production, using [DEMO_RUNBOOK.md](DEMO_RUNBOOK.md) | Telegram, Gmail and Calendar each show a visible write-back |
| 11:30–13:00 | Re-record any scene that was weak | All 8 scene clips exist at 1920×1080 |
| 13:00–14:00 | Break | |
| 14:00–15:30 | Voice-over, captions, music; assemble the demo | `greenlight_demo.mp4` is 3:00 or less, captions match the voice |
| 15:30–16:00 | Watch the film once on a phone, muted, then with sound | It makes sense muted; no secrets or real names on screen |
| 16:00–16:30 | Build the `.ehpk`; confirm it installs in the simulator | File installs and shows a card |
| 16:30–17:00 | Secrets scan: `git log -p` for keys, check `.env*` is ignored | No real value in history |
| 17:00–17:30 | Fill [SUBMISSION.md](SUBMISSION.md): description, tracks, feature requests, links | Every `_TBD_` is replaced |
| 17:30–18:30 | Submit on the hackathon page: repo, video, description, tracks, how you heard | The page shows the submission as received |
| 18:30–19:00 | Open the submitted page in a private window; click every link | Repo public, video plays, README renders |
| 19:00 | Tag `hackathon-submission` on the submitted commit and stop changing `main` | Tag exists |

## Required for the submission

- Public repo with a README that explains setup
- Demo video, 3:00 or less
- Short description: problem, who it is for, how it works, track
- Optional: up to five API feature requests, the `.ehpk` build

## Nov 29 buffer

Use it only for emergencies: a broken link, a video that will not play, a missed field. Do not add features. If everything is fine, do nothing.

## If something fails

| Failure | Do |
|---|---|
| Production API is down | Record from the simulator against a local API, and say so in the README |
| The AI call is slow or failing | Leave it; the fallback is a feature and shows as `FALLBACK` |
| Video goes over 3:00 | Cut scene 6 (Calendar) first, then trim scene 1 |
| The submission page rejects a field | Fix and resubmit; do not wait for the last hour |
