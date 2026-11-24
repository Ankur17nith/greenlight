# Features

State key: **planned** (nothing written), **in progress**, **done** (works end to end and was seen working). As of 24 Nov 2026 every row is planned.

## Hackathon scope

| # | Feature | What it does | Why it matters | State |
|---|---|---|---|---|
| 1 | Telegram requests | A bot in the team group turns a message into a card and replies under it on approve or decline | The Telegram prize and the most common request channel | planned |
| 2 | Policy Guard | Plain-English rules plus a deterministic amount parser and an AI verdict, with a fallback when the AI fails | Every card is checked before the founder sees it | planned |
| 3 | G2 card | Four text containers: category and badge, headline, AI line, actions | A two-second glance, no scrolling | planned |
| 4 | Approve, decline, swipe, snooze | One gesture per action, 3-second client-side undo | The read-and-write score | planned |
| 5 | Pairing code | Six digits from the web app link a glasses session; no Google sign-in in the WebView | Required by the WebView limits | planned |
| 6 | Audit log | Every decision with requester, verdict, decision, time and `AI` or `FALLBACK` | Makes the safety story visible | planned |
| 7 | Gmail requests | A label-based poll creates cards; approve replies in the same thread | Second source, shows the loop is not Telegram-only | planned |
| 8 | Calendar conflicts | A conflicting invite becomes a card; approve or decline sets the attendee response | Covers the "never double-book" rule | planned |
| 9 | Web app | Landing page plus `/app`, `/app/connect`, `/app/rules`, `/app/pair`, `/app/audit` | Setup and proof, in the Debrief visual style written fresh | planned |
| 10 | `.ehpk` package | A packaged build for the Even Hub | Optional submission item | planned |
| 11 | Launch teaser | A ~20 second clip made with `brag-slim` | Social post | planned |

## After the hackathon

Listed in [`../ROADMAP.md`](../ROADMAP.md): second approver, roles, signed audit export, Slack and Discord sources, structured rules.

## Cut order

If time runs short, cut from the top:

1. Voice reason for a decline
2. Snooze persistence (snooze lasts only for the session)
3. WebSocket push (the glasses poll every 3 seconds)
4. Calendar write-back (show the card, skip the response update)
5. `.ehpk` package and teaser

**Never cut:** Telegram, Gmail, the audit log, the 3-second undo, the deterministic fallback.
