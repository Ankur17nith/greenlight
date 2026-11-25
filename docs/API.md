# API

Base URL: `PUBLIC_BASE_URL`. JSON in and out. The G2 and dashboard clients send `Authorization: Bearer <session token>` except where noted.

## Cards

```ts
type Source = "TELEGRAM" | "GMAIL" | "CALENDAR";
type Category = "EXPENSE" | "REFUND" | "SIGN_OFF" | "CALENDAR";
type Status = "PENDING" | "APPROVED" | "DECLINED" | "SNOOZED";

interface Card {
  id: string;
  source: Source;
  requester: string;
  category: Category;
  headline: string;          // max 42 chars
  policy_status: "WITHIN_POLICY" | "FLAGGED";
  policy_reason: string | null;
  ai_recommendation: string; // one line
  eval_mode: "AI" | "FALLBACK";
  status: Status;
  created_at: string;        // ISO 8601
}
```

`suggested_reply` is stored server side and never sent to the glasses.

## Routes

| Route | Auth | Purpose |
|---|---|---|
| `GET /health` | none | Liveness |
| `POST /telegram/webhook` | secret header | Telegram updates; header `X-Telegram-Bot-Api-Secret-Token` must equal `TELEGRAM_WEBHOOK_SECRET` |
| `GET /auth/google` | dashboard session | Returns `{ url }`. The dashboard fetches it with its token, then navigates the browser to the Google sign-in page |
| `GET /auth/google/callback` | none (single-use `state`) | Google redirects here; stores encrypted tokens, then redirects to `DASHBOARD_URL/app/connect` |
| `GET /api/connections` | dashboard session | `{ google, telegram }` connection state |
| `GET /api/pending` | dashboard session | Read-only copy of the queue; acting on cards is glasses-only |
| `GET /api/policies` · `PUT /api/policies` | dashboard session | Read and replace the rules (2–4, max 200 characters each) |
| `POST /api/pair` | dashboard session | Create a 6-digit code, valid 10 minutes, single use |
| `POST /api/pair/exchange` | none | `{ code }` → `{ token }` for the G2 session |
| `GET /api/queue` | G2 session | Pending, non-snoozed cards, oldest first |
| `POST /api/decisions/:id/act` | G2 session | `{ action: "APPROVE" \| "DECLINE" \| "SNOOZE" }` |
| `GET /api/audit` | dashboard session | Decisions, newest first |
| `POST /api/dev/seed` | dashboard session, `DEMO_MODE=1` only | Reset cards and load the scripted requests. Optional body `{ gmailThreadId, calendarEventId }` for real sandbox ids. Run with `pnpm seed` |

## `POST /api/decisions/:id/act`

Request: `{ "action": "APPROVE" }`

Response `200`:
```json
{ "id": "dec_123", "status": "APPROVED", "write_back": "TELEGRAM_REPLY_SENT", "decided_at": "2026-11-25T14:03:11Z" }
```

| Status | Meaning |
|---|---|
| `200` | Done, or already done (idempotent; same body as the first call) |
| `404` | Unknown card |
| `409` | Another action already decided the card; returns its current status |
| `502` | The external write failed. The card stays `PENDING` so the glasses can retry |

Write-backs:

| Source | APPROVE | DECLINE | SNOOZE |
|---|---|---|---|
| Telegram | `sendMessage` reply under the original message: `✅ Approved by Founder via Greenlight` | `❌ Declined by Founder via Greenlight` | none |
| Gmail | Reply in the thread with `suggested_reply` | Polite decline reply in the thread | none |
| Calendar | Attendee response `accepted` | `declined` | none |

Every action writes one audit row before the response is returned.

## Audit row

```json
{
  "id": "dec_123",
  "requester": "@rohan",
  "category": "REFUND",
  "headline": "$320 AWS Refund · @rohan (Acme Corp)",
  "policy_status": "WITHIN_POLICY",
  "decision": "APPROVED",
  "eval_mode": "AI",
  "decided_at": "2026-11-25T14:03:11Z"
}
```

## Errors

`{ "error": { "code": "STRING", "message": "human readable" } }`. Messages do not include tokens, rule text or request bodies.
