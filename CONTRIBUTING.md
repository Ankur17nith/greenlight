# Contributing

## Set up

Node 22 and pnpm. Full account setup (Telegram, Google, Even Hub, ElevenLabs) is in [docs/SETUP.md](docs/SETUP.md).

```sh
pnpm install
pnpm test
pnpm typecheck
```

## Where things live

| Folder | What it is |
| --- | --- |
| `apps/g2` | The glasses app (frontend, TypeScript + Vite, Even Hub SDK) |
| `apps/dashboard` | The browser dashboard (frontend, React + Tailwind) |
| `apps/api` | Backend: Telegram, Gmail, Calendar, queue, write-backs, audit log |
| `packages/policy` | Policy Guard, a pure function |
| `packages/shared` | Types, schemas, fixtures |
| `scripts/` | Seed and test helpers |
| `docs/` | Setup, API, Policy Guard, G2 UI, runbook, tasks |
| `video/` | Demo script, narration, production notes |
| `.design/` | Brief, taste and design system |

## Making a change

- Work on a branch (`feat/<task>`) and open a pull request. CI runs typecheck and tests; merge when it passes.
- Pick a task from [docs/TASKS.md](docs/TASKS.md) and meet its Done-when line.
- Every new function gets a test. Policy Guard changes also update the fixtures in `packages/shared`.
- Never commit keys. They live in `.env` or `.env.local`; keep `.env.example` current.
- The AI only recommends; only a user gesture may trigger a write-back. Do not weaken the undo or the idempotency.
- A number in the README, the script or the video comes from a test, a fixture or a log. Change the source, not the copy.
- Look up every Even Hub SDK call in the official docs. Never guess names.
- Report a vulnerability privately, as [SECURITY.md](SECURITY.md) explains.
