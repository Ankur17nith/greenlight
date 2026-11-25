# Security model

Greenlight lets a person approve requests from smart glasses, so the rules are strict.

- **The AI only recommends.** It never approves, declines or sends anything. Only a tap, hold or ring press from the signed-in founder triggers a write-back.
- **3-second undo.** Every approve or decline waits 3 seconds on the glasses. A tap cancels it. Only after that does the backend make the external write.
- **No secrets on the glasses.** The G2 bundle holds only a short-lived session token from the 6-digit pairing code. Telegram, Google and Anthropic/OpenRouter keys stay on the backend.
- **No money moves.** Greenlight replies to a message, sends an email reply or changes a calendar response. It never touches funds. Demo data uses sandbox accounts.
- **Minimal Google scopes.** Gmail: read and send-reply only. Calendar: events read and response update only.
- **Audit trail.** Every decision writes requester, action, policy verdict, decision and timestamp to SQLite. The dashboard shows them.
- **Untrusted input.** Telegram, email and invite text are data, never instructions. The policy prompt wraps them in delimiters. The model output is checked against a strict schema. Invalid output falls back to a deterministic FLAGGED verdict.
- **No keys in git.** `.env*` is git-ignored except `.env.example`.

## Checklist (task D2-6)

| Item | State | Evidence |
|---|---|---|
| Request text is wrapped in `<request>` delimiters and labelled as data; the delimiter cannot be closed from inside | Done | `packages/policy` tests, prompt-injection fixture |
| Model output is validated against a strict schema; bad output falls back to `FLAGGED` | Done | `packages/policy` tests (invalid JSON, timeout, headline mismatch) |
| Numbers come from the parser, not the model | Done | Headline amount is re-checked against the parsed amount |
| Google scopes are `gmail.readonly`, `gmail.send`, `calendar.events` only | Done | `apps/api/src/google.test.ts` |
| Google tokens are encrypted at rest (AES-256-GCM) | Done | `crypto.test.ts`, `google.test.ts` |
| OAuth uses a single-use, expiring `state` | Done | `google.test.ts`, `app.test.ts` |
| Telegram webhook secret is required and compared in constant time | Done | `app.test.ts` |
| Pairing codes are single use and expire after 10 minutes | Done | `db.test.ts`, `app.test.ts` |
| Glasses session cannot read the audit log or edit rules; dashboard session cannot act on cards | Done | `app.test.ts` |
| A card leaves `PENDING` once; a double tap sends one write; a failed write leaves it pending | Done | `app.test.ts` |
| Email headers cannot be injected through the subject, sender or message id | Done | `gmail.test.ts` |
| Calendar changes only the founder's own response and sends no guest emails | Done | `calendar.test.ts` |
| Request text is capped at 2000 characters before the model call | Done | `app.test.ts` |
| No provider keys or secret variable names in the glasses bundle | Done | `apps/g2/src/bundle.test.ts` |
| No keys in git or history; `.env*` ignored except `.env.example` | Done (Nov 26 scan) | `git grep` and `git log -p` for key patterns found nothing |
| Snooze is not written to the audit log (it does not leave `PENDING`) | Known gap | Only approve and decline are audited |
| Dashboard auth is a single shared token from the environment | Known limit | Fine for a sandbox demo, not for production |

To report an issue, open a private issue or contact the maintainers.
