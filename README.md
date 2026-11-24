# Greenlight

An executive approval terminal for Even Realities G2. Review team requests from Telegram, Gmail and Google Calendar against your own company rules, and sign off in one tap.

Built for the **Heads Up** hackathon (Even Realities × TVM Ventures × Daos Hub).
Tracks: 04 · AI Assistants & Work (primary), 01 · Messaging & News. Special prize: Best Telegram integration.

## Status

Planning done, build starting. See [plan.md](plan.md) for the schedule, architecture and cut order.

| Part | State |
|---|---|
| `apps/g2` glasses app | not started |
| `apps/api` backend | not started |
| `apps/dashboard` | not started |
| `packages/policy` | not started |
| Demo video | script drafted in [video/SCRIPT.md](video/SCRIPT.md) |

## How it works
1. A request arrives from a Telegram group, Gmail or Google Calendar.
2. Policy Guard checks it against the plain-English rules you wrote on the dashboard.
3. One card appears on the G2: what, who, verdict, recommendation.
4. Tap to approve (3-second undo), hold to decline, swipe for the next card.
5. The decision writes back to the source and lands in the audit log.

## What existed before Nov 23
Nothing. Greenlight was started on Nov 24. The structure was inspired by the open-source repos `LifeLine` and `brag`; no code was copied. Open-source libraries and the Even Hub SDK are used as dependencies.

## Run it
Setup commands are added here as each part lands. Copy `.env.example` to `.env` and fill in real values; never commit them.

## Safety
See [SECURITY.md](SECURITY.md). The AI only recommends, every action has a 3-second undo, and Greenlight never touches funds.
