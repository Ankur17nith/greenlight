# Architecture

Everything here is the design. As of 24 Nov 2026 none of it is built ([STATUS.md](STATUS.md)).

## Components

| Part | Folder | Stack | Job |
|---|---|---|---|
| Glasses app | `apps/g2` | TypeScript, Vite, Even Hub SDK | Draws the four-container card, handles gestures, holds a short-lived session token |
| Web app | `apps/web` | Next.js 16, React, Tailwind 4, shadcn-style components, lucide icons | Landing page plus the dashboard. **Replaces `apps/dashboard`.** |
| Backend | `apps/api` | Node, Fastify, SQLite (better-sqlite3) | Ingest, Policy Guard calls, queue, write-backs, audit log, pairing |
| Policy Guard | `packages/policy` | TypeScript | Parse, AI verdict, validate, fall back |
| Shared | `packages/shared` | TypeScript, zod | Types, schemas, fixtures |

### Web routes (`apps/web`)

| Route | Purpose |
|---|---|
| `/` | Landing page: what Greenlight is, a card preview, how it works |
| `/app` | Overview: pending count, last decisions |
| `/app/connect` | Connect Telegram, Gmail and Calendar |
| `/app/rules` | Edit 2–4 plain-English rules |
| `/app/pair` | Show the six-digit pairing code |
| `/app/audit` | Live audit log |

The visual style follows [`../.design/DESIGN.md`](../.design/DESIGN.md) and is written fresh, not copied from another project ([LEARNINGS.md](LEARNINGS.md)). The web app talks to the API over HTTPS with a dashboard session; it never holds Telegram, Google or AI keys.

## Data flow

```
Telegram group ──┐
Gmail (poll)   ──┼─> apps/api ──> packages/policy ──> SQLite (card PENDING)
Calendar (poll)──┘       ^                                   │
                         │                                   │ GET /api/queue (3s poll)
                         │ POST /api/decisions/:id/act       v
         write-back  <───┴──────────────────────────  apps/g2 (glasses)
   (Telegram reply / Gmail reply / Calendar response)
                         │
                         └─> audit row ──> apps/web  /app/audit
```

## Approve, end to end

```
Founder          G2 app            API                Policy Guard      Source
   │               │                │                      │              │
   │               │                │<── request ──────────┼──────────────│  (1) ingest
   │               │                │── parse + rules ────>│              │
   │               │                │<── verdict (or fallback)            │  (2) evaluate
   │               │                │ save card PENDING                   │
   │               │── GET /queue ─>│                                     │  (3) poll
   │<── card ──────│<── cards ──────│                                     │
   │── tap ───────>│ start 3s undo (client side, nothing sent)           │  (4) gesture
   │               │ 3s pass                                             │
   │               │── POST act ───>│ check status PENDING, write audit   │  (5) act
   │               │                │── reply / email / response ────────>│  (6) write-back
   │               │<── APPROVED ───│                                     │
   │<── next card ─│                                                      │
```

Steps 5 and 6 run once per card: a second call on the same card returns the first result.

## Failure modes

| Failure | Behaviour |
|---|---|
| AI call times out, errors or returns invalid JSON | Card appears as `FLAGGED` with a plain headline; audit shows `FALLBACK` |
| API is unreachable from the glasses | Card shows `OFFLINE`, the client retries; nothing is sent |
| External write fails (502) | Card stays `PENDING`; the glasses show `NOT SENT, tap to retry` |
| Double tap or repeated act | Idempotent; no second send |
| App closed during the undo window | Nothing was sent, so the action is cancelled |
| Pairing code used or expired | Refused; the web app can create a new one |
| Google token expired | Refresh once; if that fails, the web app shows a reconnect banner |
| Telegram webhook secret wrong | Request rejected before any processing |

## Limits that shape the design

- One app on screen at a time; the glasses show nothing when the app is not open.
- No access to other apps' notifications, so each source is read through its own API.
- The WebView cannot do Google sign-in, which is why setup lives in `apps/web`.
- Keys stay on the backend; whitelisted hosts and CORS are set for the API.
