# Status: Wed 25 Nov 2026

Deadline: Sun 29 Nov, 23:59 Dubai time (UTC+4). Plan to submit on the evening of Sat 28 Nov.

## Summary

All the code for Days 0 to 2 is written and unit-tested (`pnpm test`, `pnpm typecheck`). Nothing has run against real Telegram, Google or the real AI model, and the glasses app has not run in the simulator. Those steps need accounts, secrets or a desktop, so they are listed below as open.

## Checked with real output

| Area | Evidence |
|---|---|
| Unit tests for every package | `pnpm test` |
| API started locally; Telegram-style message becomes a card; pairing code links a session; failed write leaves the card pending | curl against a running server |
| Dashboard in a real browser against the live local API: queue, saving rules, pairing code | Playwright run |
| ElevenLabs key | `onboard check` passed |
| Narration audio | `pnpm narrate` made 8 files, 90.9 s in total |
| No keys in git or history | `git grep` and `git log -p` scan |

## Not checked yet

| Area | Why |
|---|---|
| Telegram bot, webhook and reply | No bot token or public URL yet (D0-4, D0-6) |
| Google sign-in, Gmail, Calendar | No Google project or secrets yet (D0-5). Tested with mocked Google only |
| Policy Guard with the real model | `ANTHROPIC_API_KEY` is not set here. All cards currently show `FALLBACK` |
| Glasses app in the simulator or on glasses, and the real gesture events | The simulator is a desktop app (D0-2, D0-3) |
| Hosting, `.ehpk` package, CI run | Not started |
| Demo video and teaser | Narration exists; screen capture and edit need the working app |

## Build state by part

| Part | Folder | State |
|---|---|---|
| Glasses app | `apps/g2` | written, unit-tested, not run on a device |
| Web app (landing and dashboard) | `apps/web` | built, dashboard wired to the API |
| Backend | `apps/api` | written, unit-tested, run locally |
| Policy Guard | `packages/policy` | written, unit-tested with a stubbed model |
| Shared types and fixtures | `packages/shared` | done |
| Scripts | `scripts` | `pnpm seed` and `pnpm narrate` |
| CI | `.github/workflows/ci.yml` | written, result not checked |

## Risks right now

- The gesture map comes from the SDK typings only. It is unconfirmed until D0-3 is run.
- Telegram, Google and the AI model are the main unknowns. Each is only mocked so far.
- The narration voice is a placeholder premade voice. No Indian-English voice has been chosen.
- The cut order in [FEATURES.md](FEATURES.md) is the safety valve.

## Next

Add the Telegram token, a public URL, the Anthropic key and the Google OAuth client, then run the real loop. See [TASKS.md](TASKS.md).
