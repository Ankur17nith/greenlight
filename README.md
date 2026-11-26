<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/images/logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/images/logo.svg">
    <img src="docs/images/logo.svg" alt="Greenlight" height="56">
  </picture>
</p>

# Greenlight

**An approval terminal for Even Realities G2. Requests from Telegram, Gmail and Google Calendar are checked against your own company rules, and you approve or decline them from the glasses.**

[![CI](https://github.com/Ankur17nith/greenlight/actions/workflows/ci.yml/badge.svg)](https://github.com/Ankur17nith/greenlight/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Node](https://img.shields.io/badge/node-22-339933)](.nvmrc)
[![Next.js](https://img.shields.io/badge/web-Next.js%2016-000000)](apps/web)
[![Built for](https://img.shields.io/badge/built%20for-Heads%20Up%20hackathon-2ee57a)](docs/win-plan.md)

Built for the **Heads Up** hackathon (Even Realities × TVM Ventures × Daos Hub) on DoraHacks.
**Primary track:** 04 · AI Assistants & Work. **Second track:** 01 · Messaging & News. **Special prize:** Best Telegram integration.

![Greenlight home page](docs/images/home-light.png)

> **Status:** the website, the backend, Policy Guard and the glasses app are all written and unit-tested. None of it has run against real Telegram, Google or the real AI model yet, and the glasses app has run only in the simulator, not on real glasses. The Status table below says exactly what was checked. See [Status](#status).

**Contents:** [See it in 60 seconds](#see-it-in-60-seconds) · [The problem](#the-problem) · [How it works](#how-it-works) · [On the glasses](#on-the-glasses) · [Policy Guard](#policy-guard) · [Safety model](#safety-model) · [Status](#status) · [Architecture](#architecture) · [Run it](#run-it) · [Docs](#docs) · [What existed before Nov 23](#what-existed-before-nov-23) · [AI tools used](#ai-tools-used) · [Limitations](#limitations) · [Licence](#licence)

## See it in 60 seconds

```sh
git clone https://github.com/Ankur17nith/greenlight && cd greenlight
pnpm install
pnpm dev:web          # http://localhost:3000
```

1. Open the home page and scroll. The G2 display stays pinned and changes as each step passes: a request arrives, Policy Guard checks it, you tap (with a 3-second undo), and the reply lands back in Telegram.
2. Press **Open dashboard**. It has Queue, Connect, Rules, Pair glasses and Audit log. You can edit the rules, generate a pairing code and switch between the night and paper themes.
3. All data on screen is sample data and is labelled as such. The live loop (a real Telegram message to a real tap on the glasses) is the Nov 25–27 build. The demo video comes after it.

## The problem

Founders, small-business owners and ops or support leads make dozens of small decisions a day: a refund, an expense, a vendor invoice, a calendar clash. When they are away from a laptop, their team waits. The decision then happens late, or with no record.

## How it works

1. A request arrives from a **Telegram** group, **Gmail** or **Google Calendar**.
2. **Policy Guard** checks it against plain-English rules you wrote once on the dashboard.
3. One card appears on your **G2**. It shows what the request is, who sent it, the verdict and a one-line recommendation.
4. **Tap** to approve (with a 3-second undo), **hold** to decline, **swipe** for the next card, **double tap** to snooze.
5. The decision is written back to where the request came from (a Telegram reply, a Gmail reply or a calendar response) and added to the audit log.

```
Telegram ─┐
Gmail    ─┼─> apps/api ─> Policy Guard ─> queue ─> apps/g2 (glasses) ─> tap
Calendar ─┘        ^                                         │
                   └──────── write-back + audit log <────────┘
```

## On the glasses

The G2 display is 576 × 288, monochrome green. Greenlight uses four fixed text rows that can be read in two seconds. Nothing scrolls.

```
┌──────────────────────────────────────────────┐
│ [REFUND · TG]                ✓ WITHIN POLICY │
│ $320 AWS refund · @rohan (Acme Corp)         │
│ AI: Approve. Under $500 limit                │
│ [TAP: Approve]  [SWIPE: Next]  [HOLD: Deny]  │
└──────────────────────────────────────────────┘
```

| Gesture | Action |
|---|---|
| Tap | Approve, then a 3-second countdown with tap to undo |
| Swipe | Next or previous card |
| Hold | Decline |
| Double tap | Snooze for one hour |

This gesture map is the target. It will be checked against the Even Hub SDK on Day 0. If the glasses do not expose hold or double tap, there is a ring-based fallback ([docs/G2_UI.md](docs/G2_UI.md#verified-gestures)).

## Policy Guard

You write two to four rules in plain English, for example:

1. Flag any refund or expense over $500.
2. Never double-book investor calls.
3. Flag requests from people not in our contact list.

Each request is first parsed for amount and requester without a model. An AI model then judges it against your rules. If the AI times out, errors or returns invalid output, the card still appears and is marked **flagged**, so nothing is shown as "safe" by default. The AI only recommends. It never decides. Details: [docs/POLICY_GUARD.md](docs/POLICY_GUARD.md).

## Safety model

| Risk | What Greenlight does |
|---|---|
| A mis-tap approves the wrong thing | Nothing is sent for 3 seconds; a second tap cancels |
| The AI is wrong or is tricked by text in a request | It only recommends; request text is treated as data; invalid output falls back to flagged |
| A double tap sends twice | Every action is idempotent; a card can leave pending only once |
| Keys on the glasses | The glasses hold only a short-lived session token from a 6-digit pairing code |
| Over-broad access | Minimal Google scopes; no funds are ever moved; demos use sandbox accounts |
| "Who approved that?" | Every decision is logged with requester, verdict, decision and time |

More in [SECURITY.md](SECURITY.md) and [docs/safety.md](docs/safety.md).

## Status

| Part | State | How it is checked |
|---|---|---|
| Website: landing page, scroll animation, themes | **Built** | `pnpm typecheck`, `pnpm --filter @greenlight/web build`, browser run (scroll, no-JS and reduced-motion checked) |
| Website: dashboard (queue, connect, rules, pair, audit log) | **Built, wired to the API** | Checked in a real browser against a live local API: queue, saving rules, pairing code. Not yet used with real Google or Telegram |
| Logo | **Built** | Generated by `apps/web/scripts/build-logo.mjs` |
| `apps/api` backend: Telegram ingest and reply, queue, idempotent act, pairing, rules, audit | **Built, unit-tested with mocks** | `pnpm test`; local run checked with curl. Not yet tried against real Telegram |
| `apps/api` Gmail, Calendar and Google sign-in: read, reply, respond, encrypted tokens, polling | **Built, unit-tested with mocked Google** | `pnpm test`. Never run against a real Google account |
| `packages/policy` Policy Guard: amount parser, verdict, timeout and FLAGGED fallback | **Built, unit-tested with a stubbed model** | `pnpm test`; not yet run against the real model |
| `apps/g2` glasses app: renderer, gesture controller, 3s undo, pairing form | **Built, unit-tested, run in the simulator** | `pnpm test`; every screen and gesture checked in the Even Hub simulator through its automation API ([docs/G2_UI.md](docs/G2_UI.md#verified-gestures)). Not yet run on real glasses |
| Demo video | Script and narration drafted | [video/SCRIPT.md](video/SCRIPT.md) |

Task-by-task progress: [docs/TASKS.md](docs/TASKS.md) and [docs/STATUS.md](docs/STATUS.md).

## Architecture

| Folder | What it is | Stack |
|---|---|---|
| `apps/web` | Landing page and dashboard (frontend) | Next.js 16, React, Tailwind 4, Geist fonts, night and paper themes |
| `apps/g2` | The glasses app (frontend) | TypeScript, Vite, Even Hub SDK |
| `apps/api` | Backend: ingest, queue, write-backs, audit, pairing | Node, TypeScript, SQLite |
| `packages/policy` | Policy Guard | TypeScript, pure function |
| `packages/shared` | Types, schemas, fixtures | TypeScript, zod |
| `docs/`, `video/`, `.design/` | Docs, demo script and production, design system | Markdown |

Google sign-in cannot run inside the glasses' WebView. Accounts are connected on the website, and the glasses link to them with a 6-digit code. Full design: [docs/architecture.md](docs/architecture.md) and [plan.md](plan.md).

## Run it

Needs Node 22 and pnpm.

```sh
pnpm install
pnpm dev:web                          # website on http://localhost:3000
pnpm dev:api                          # backend on http://localhost:3001 (see .env.example)
pnpm dev:g2                           # glasses app on http://localhost:5173
pnpm --filter @greenlight/g2 ehpk     # build apps/g2/out/greenlight.ehpk (set VITE_API_URL and the app.json whitelist first)
pnpm webhook                          # point the Telegram bot at the deployed API (reads .env; see docs/DEPLOY.md)
pnpm narrate                          # generate video/narration/NN.mp3 with ElevenLabs (needs ELEVENLABS_API_KEY)
pnpm video                            # render video/out/greenlight_demo.mp4 (needs ffmpeg, Playwright, the narration files)
pnpm teaser                           # render the 20 s teaser after pnpm video
pnpm seed                             # reset and replay the demo cards (API needs DEMO_MODE=1, DASHBOARD_TOKEN set)
pnpm test                             # unit tests for every package
pnpm typecheck                        # type checks every package
pnpm --filter @greenlight/web build   # production build of the website
```

The API and glasses app commands are added here as each part lands. Account setup (Telegram, Google, Even Hub, ElevenLabs) is in [docs/SETUP.md](docs/SETUP.md). Copy `.env.example` to `.env`. Never commit real values.

## Docs

| Doc | What it covers |
|---|---|
| [plan.md](plan.md) | Scope, architecture, three-day schedule, risks |
| [docs/README.md](docs/README.md) | Index of every doc |
| [docs/TASKS.md](docs/TASKS.md) | Task tracker with Do and Done-when lines |
| [docs/win-plan.md](docs/win-plan.md) | Judging criteria and how we score on each |
| [docs/API.md](docs/API.md) · [docs/POLICY_GUARD.md](docs/POLICY_GUARD.md) · [docs/G2_UI.md](docs/G2_UI.md) | Routes, rules engine, glasses interface |
| [docs/DEMO_RUNBOOK.md](docs/DEMO_RUNBOOK.md) · [video/](video/PRODUCTION.md) | Running the demo, making the video |
| [.design/](.design/DESIGN.md) | Brief, taste, design system |
| [ROADMAP.md](ROADMAP.md) · [CHANGELOG.md](CHANGELOG.md) · [CONTRIBUTING.md](CONTRIBUTING.md) | Project history and process |

## Demo video

The finished films are in [`video/final/`](video/final): `greenlight_demo.mp4` (2:12, voice-over and captions, a very quiet music bed) and `greenlight_teaser.mp4` (20 s). The setup and audit-log scenes are real screen recordings of the dashboard running locally. The glasses cards and the Telegram, Gmail and Calendar panels are drawn from the script with sample data, because no Google account or model key was connected. The film labels each of these on screen. The scene-by-scene table is in [video/SCRIPT.md](video/SCRIPT.md).

## What existed before Nov 23

Nothing. Greenlight was started on Nov 24, during the hackathon. Every line of code and documentation is original work. The project depends on open-source libraries (Next.js, React, Tailwind, Radix Slot, lucide, next-themes, and Geist fonts under the SIL Open Font License) and on the Even Hub SDK.

## AI tools used

- **Claude Code** helped write the code, docs and design. It is credited as co-author on commits.
- **Claude** (a small model) is planned for Policy Guard's rule checks, behind a deterministic fallback.
- **ElevenLabs** is used for the demo video's voice-over only (`pnpm narrate`). The app itself never calls it.

## Limitations

- Telegram, Gmail, Calendar and the AI model have only been tested with mocks. The glasses app has run in the simulator but not on real glasses.
- The gesture map is unconfirmed until the Day 0 spike fills in the table in [docs/G2_UI.md](docs/G2_UI.md#verified-gestures).
- Google OAuth runs in Testing mode with named test users. That is enough for a demo, not for general release.
- Greenlight never moves funds. Demos use sandbox accounts and test data only.

## Licence

MIT. See [LICENSE](LICENSE).
