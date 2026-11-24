# Security model

Greenlight lets a person approve requests from a pair of smart glasses, so the rules are strict.

- **The AI only recommends.** It never approves, declines or sends anything. Only a deliberate tap, hold or ring press from the signed-in founder triggers a write-back.
- **3-second undo.** Every approve or decline waits 3 seconds on the glasses, with a tap to cancel, before the backend performs the external write.
- **No secrets on the glasses.** The G2 bundle holds only a short-lived session token from the 6-digit pairing code. Telegram, Google and Anthropic/OpenRouter keys live on the backend.
- **No money moves.** Greenlight only replies to a message, sends an email reply or changes a calendar response. It never touches funds. Demo data uses sandbox accounts.
- **Least-privilege Google scopes.** Gmail: read plus send-reply only. Calendar: events read and response update only.
- **Audit trail.** Every decision writes requester, action, policy verdict, decision and timestamp to SQLite and is shown on the dashboard.
- **Untrusted input.** Telegram, email and invite text are data, never instructions. The policy prompt wraps them in delimiters and the model output is validated against a strict schema; invalid output falls back to a deterministic FLAGGED verdict.
- **No keys in git.** `.env*` is git-ignored except `.env.example`.

Report issues by opening a private issue or contacting the maintainers.
