# Greenlight

An executive approval terminal for Even Realities G2. Review team requests from Telegram, Gmail and Google Calendar against your own company rules, and sign off in one tap.

Built for the **Heads Up** hackathon (Even Realities × TVM Ventures × Daos Hub).
Tracks: 04 · AI Assistants & Work (primary), 01 · Messaging & News. Special prize: Best Telegram integration.

**Contents:** [Status](#status) · [The problem](#the-problem) · [How it works](#how-it-works) · [Frontends](#frontends) · [Safety model](#safety-model) · [Docs](#docs) · [Run it](#run-it) · [What existed before Nov 23](#what-existed-before-nov-23) · [Limitations](#limitations) · [Licence](#licence)

## Status

Planning and documentation are done; the build starts on Nov 25. See [plan.md](plan.md) for the schedule and [docs/TASKS.md](docs/TASKS.md) for the task list.

| Part | State |
|---|---|
| `apps/g2` glasses app (frontend) | not started |
| `apps/dashboard` (frontend) | not started |
| `apps/api` backend | not started |
| `packages/policy` | not started |
| Demo video | script and narration drafted in [video/](video/) |

## The problem

Founders, small-business owners and ops leads are the bottleneck for dozens of small decisions: refunds, expenses, vendor sign-offs, calendar overrides. Away from a laptop, their team waits.

## How it works

1. A request arrives from a Telegram group, Gmail or Google Calendar.
2. **Policy Guard** checks it against the plain-English rules written once on the dashboard.
3. One card appears on the G2: what, who, verdict, recommendation.
4. Tap to approve (3-second undo), hold to decline, swipe for the next, double tap to snooze.
5. The decision writes back to the source and lands in the audit log.

## Frontends

| App | Stack | Where it runs |
|---|---|---|
| `apps/g2` | TypeScript + Vite + Even Hub SDK | WebView inside the Even Realities App; four text containers on the 576×288 display |
| `apps/dashboard` | React + Tailwind | Browser; connect accounts, rules, pairing code, audit log |

Google sign-in cannot run in the WebView, so account setup lives on the dashboard and the glasses link with a 6-digit code. Design: [.design/](.design/DESIGN.md) and [docs/G2_UI.md](docs/G2_UI.md).

## Safety model

The AI only recommends. A deliberate gesture triggers every write-back, with a 3-second undo, idempotent actions and an audit trail. Greenlight never moves funds, and demos use sandbox accounts. Details: [SECURITY.md](SECURITY.md).

## Docs

| Doc | What it covers |
|---|---|
| [plan.md](plan.md) | Scope, architecture, 3-day schedule, risks |
| [docs/TASKS.md](docs/TASKS.md) | Task tracker with Do and Done-when lines |
| [docs/SETUP.md](docs/SETUP.md) | Accounts, keys and run commands |
| [docs/API.md](docs/API.md) | Routes, shapes, write-backs |
| [docs/POLICY_GUARD.md](docs/POLICY_GUARD.md) | Rules, prompt, schema, fallback, test cases |
| [docs/G2_UI.md](docs/G2_UI.md) | Card layout, gestures, states |
| [docs/DEMO_RUNBOOK.md](docs/DEMO_RUNBOOK.md) | Resetting and running the demo |
| [docs/SUBMISSION.md](docs/SUBMISSION.md) | DoraHacks description draft |
| [video/](video/PRODUCTION.md) | Script, narration, production pipeline |
| [.design/](.design/DESIGN.md) | Brief, taste, design system |
| [ROADMAP.md](ROADMAP.md) · [CHANGELOG.md](CHANGELOG.md) · [CONTRIBUTING.md](CONTRIBUTING.md) | Project history and process |

## Run it

Commands are added here as each part lands. Setup is in [docs/SETUP.md](docs/SETUP.md). Copy `.env.example` to `.env`; never commit real values.

## What existed before Nov 23

Nothing. Greenlight was started on Nov 24. Its documentation structure was inspired by the open-source MIT repo [LifeLine](https://github.com/Prashant-thakur77/LifeLine), and the launch teaser workflow by [brag](https://github.com/latent-spaces/brag); no code was copied. Open-source libraries and the Even Hub SDK are used as dependencies.

## Limitations

- Not built yet; this README describes the plan until the status table says otherwise.
- The glasses gesture map is unconfirmed until the Day 0 spike fills in [G2_UI.md](docs/G2_UI.md#verified-gestures).
- Google OAuth runs in Testing mode with named test users.

## Licence

MIT, see [LICENSE](LICENSE).
