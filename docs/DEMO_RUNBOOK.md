# Demo runbook

How to reset the system and run the demo the same way every time, for recording and for judges.

## Before you start
- [ ] API deployed and `GET /health` answers.
- [ ] Sandbox Telegram group with the bot, sandbox Google account connected.
- [ ] Rules loaded (the demo set in [POLICY_GUARD.md](POLICY_GUARD.md#example-rules-the-demo-set)).
- [ ] Simulator running and paired with the 6-digit code.
- [ ] `pnpm seed` run, so the queue holds the scripted cards.
- [ ] Notifications off; screen 1920×1080.

## The scenes (match [video/SCRIPT.md](../video/SCRIPT.md))

| # | What you do | What must be visible |
|---|---|---|
| 3 | Open the dashboard, connect sources, type two rules, show the pairing code | Code accepted in the Even app |
| 4 | In the Telegram group, post "Refund $320 AWS credit for Acme Corp" as @rohan | Card with `✓ WITHIN POLICY`; tap; `CONFIRMING IN 3s…`; `✅ Approved by Founder via Greenlight` under the message |
| 5 | Send the $900 vendor invoice email to the sandbox inbox (label `Invoice`) | Card with `⚠ FLAGGED: Over $500`; hold to decline; reply sent in the Gmail thread |
| 6 | Create a calendar invite overlapping "Investor call" | Card with `⚠ FLAGGED: Double-book`; decline; event shows declined |
| 7 | Open the audit log | Rows for the three decisions with verdict, decision, time, `AI` tag |

## If something fails on camera
- Telegram reply not appearing: check the webhook secret and that the bot is in the group.
- Gmail reply missing: re-run the Google connect flow; check the token refresh.
- Card shows `FALLBACK`: the AI call timed out. Re-record; do not hide it, it is a feature.
- Simulator offline: confirm `app.json` whitelists the API domain and CORS is set.

## After recording
Reset the data with `pnpm seed`, check `git status` is clean, and make sure no keys appear in any screenshot or log.
