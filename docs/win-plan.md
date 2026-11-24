# Win plan: Heads Up hackathon

Deadline: **Sun 29 Nov, 23:59 Dubai time (UTC+4)**. We submit on the evening of **Sat 28 Nov**; the 29th is buffer. Demo Day is Thu 3 Dec in Dubai, remote is allowed for finalists.

## The field (from the pasted list, 24 Nov)

54 builds, read from one-line pitches only.

| Track | Builds |
|---|---|
| Messaging & News | 27 |
| Crypto & DeFi | 17 |
| Exchanges & Stocks | 6 |
| AI Assistants & Work | 4 |

About 24 are Telegram inboxes with AI drafts. Polymarket and Hyperliquid paper trading are the other common pick. Closest rivals to us:

- **FUSE Brief** (AI Assistants): pre-meeting brief from Calendar, Gmail and Notion, with a deterministic fallback.
- **Nod** (AI Assistants): Gmail triage that ends in a draft.

Neither covers approvals across several sources against the user's own rules, and neither has an audit trail. Check this again before submitting, because the list was still growing.

## The rubric and how we answer it

| Criterion | Weight | What wins it | Our plan | Where we stand |
|---|---|---|---|---|
| Usefulness on G2 | 30% | A real everyday moment, works at a glance and hands-free | One decision per card; the founder away from a laptop | Designed, not built |
| Read and write | 25% | Acting is fast: a phrase, one tap or the ring, smart defaults or AI drafts | Tap to approve with undo; write-back to Telegram, Gmail, Calendar | Designed, not built |
| Technical execution | 20% | Works end to end, reliable, clean code | Hybrid parser plus AI with a deterministic fallback; tests; idempotent acts | Not started |
| UX for display and voice | 15% | Clear on 576 × 288 monochrome, natural by voice | Four containers, no scrolling, short strings | Designed, not built |
| Business potential and safety | 10% | Real users, careful with data and money | Small-team user, audit log, no funds touched, sandbox data | Written in [business-case.md](business-case.md) and [safety.md](safety.md) |

Judges also decide finalists from the video first, so the film carries a lot of weight.

## What must be true to win

1. **One full loop on camera, three times.** Telegram, Gmail and Calendar each show a real write-back.
2. **The policy and the audit log are visible.** Open the film with the rules and end on the trail. That is what the Telegram inboxes lack.
3. **It works when the AI does not.** Show a card marked as fallback.
4. **A clean repo.** README, setup that works from a fresh clone, tests, no secrets.
5. **Prize fit.** Primary track 04, second track 01, and the Best Telegram integration prize. A project wins one cash prize, the highest one.

## What we will not do

- Move money, or touch a real inbox.
- Claim a feature in the film or README that is not working.
- Copy code from reference repos.

## Checkpoints

| When | Must be true |
|---|---|
| Tue 24 Nov | Simulator hello, gesture table filled in |
| Wed 25 Nov | Telegram request to glasses to reply, end to end |
| Thu 26 Nov | Gmail, Calendar, web app, audit log; features frozen in the evening |
| Fri 27 Nov | Deployed, recorded, edited |
| Sat 28 Nov | Submitted |
