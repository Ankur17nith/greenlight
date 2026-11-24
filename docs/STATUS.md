# Status: Tue 24 Nov 2026 (planning done, build not started)

Deadline: Sun 29 Nov, 23:59 Dubai time (UTC+4). Plan to submit by the evening of Sat 28 Nov.

## Summary

The plan, the docs and the repository skeleton exist. **No application code has been written.** Nothing below the "Planning" row has been run or tested.

## What is verified

| Area | State | Evidence |
|---|---|---|
| Hackathon rules and rubric read | Verified | Pasted page text in the session |
| Competitor list (54 builds) | Verified from a pasted CSV | Names and one-line pitches only; no repos or videos were opened |
| Plan, task list, API, Policy Guard, G2 UI docs | Written | `plan.md`, `docs/` |
| Repo on GitHub, MIT licence, author set | Done | `Ankur17nith/greenlight` |
| Node 22 and npm registry reachable from the sandbox | Verified | npm ping succeeded |
| Reference repos readable | Verified | LifeLine, Beacon, brag, Debrief cloned read-only |

## What is not verified

| Area | State | Blocked by |
|---|---|---|
| Even Hub SDK calls, gesture events (tap, swipe, hold, double tap, ring) | Unknown | Day 0 spike (D0-3) |
| Simulator running a hello screen | Not done | D0-2 |
| ElevenLabs key | Not available to the session | Key must be set as an environment secret, then a new session ([QUESTIONS.md](QUESTIONS.md)) |
| Telegram bot, Google OAuth project | Not created | D0-4, D0-5 |
| Hosting | Not chosen | [QUESTIONS.md](QUESTIONS.md) |
| Policy Guard, API, glasses app, web app | Not started | Day 1 onward |
| Demo video, teaser | Script drafted only | Needs a working app |

## Build state by part

| Part | Folder | State |
|---|---|---|
| Glasses app | `apps/g2` | not started |
| Web app (landing and dashboard) | `apps/web` | not started |
| Backend | `apps/api` | not started |
| Policy Guard | `packages/policy` | not started |
| Shared types and fixtures | `packages/shared` | not started |
| CI | `.github/workflows/ci.yml` | written, never run |

## Risks right now

- The gesture map is a guess until Day 0 confirms it.
- Roughly four working days remain; the cut order in [FEATURES.md](FEATURES.md) is the safety valve.
- The web frontend borrows a visual style from a public repo whose licence is unclear, so it is written fresh ([LEARNINGS.md](LEARNINGS.md)).

## Next

D0-1 to D0-7 in [TASKS.md](TASKS.md), then Telegram end to end on Nov 25.
