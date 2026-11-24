# Greenlight

Approval terminal for Even Realities G2. Read `plan.md` first; it is the source of truth for scope, schedule and cut order.

Submit by **Nov 28 evening**. Hard deadline: Nov 29, 23:59 Dubai time (UTC+4).

## Rules
1. Look up every Even Hub SDK call in the official docs or simulator. Never guess API or event names.
2. Never commit secrets. Keys live in `.env` and `.env.local`. Keep `.env.example` current with fake values.
3. Never open, print or cat `.env.local`. Verify the ElevenLabs key with `npx -y @elevenlabs/cli@latest onboard check --env-path .env.local`. Do not write ElevenLabs code until that check passes.
4. The AI only recommends. Only a user gesture triggers a write-back. Keep the 3-second undo and idempotent acts.
5. Demo and test data are sandbox accounts only.
6. Every new function gets a test. Run `pnpm test` before saying a task is done.
7. Reference repos (`LifeLine`, `brag`) are for structure and workflow; copy no code.
8. Follow the cut order in `plan.md` when time runs short; never cut Telegram, Gmail, the audit log or the undo.
9. Keep the README run commands correct whenever a command changes.

## Where to look
- Tasks and Done-when lines: `docs/TASKS.md`. Setup: `docs/SETUP.md`. API: `docs/API.md`.
- Policy Guard: `docs/POLICY_GUARD.md`. Glasses UI: `docs/G2_UI.md`. Design: `.design/`.
- Demo and video: `docs/DEMO_RUNBOOK.md`, `video/`.
- Frontends: `apps/g2` (glasses) and `apps/web` (browser: landing page and dashboard).

## How to work
- One micro-task at a time, run the tests or the live script, show real output, then commit.
- Branches: `feat/<task>`; merge when CI passes.
