# Greenlight design brief

## Subject
Greenlight shows a founder one decision at a time on Even G2 glasses: a team request from Telegram, Gmail or Google Calendar, already checked against the founder's own plain-English rules. One tap approves it (with a 3-second undo), a hold declines it, and the decision writes back to the source and into an audit log.

## Audience
1. **Hackathon judges** (Even Realities, TVM Ventures, partner funds, Daos Hub). They watch a 3-minute video first, then open the repo. They need to see a full read-and-write loop and believe it is safe.
2. **Founders and ops leads** at small companies who unblock their team from a phone. They want fewer interruptions and a record of what they signed off.
3. **G2 builders**, who look for a good use of the display, the ring and the Even Hub SDK.

## The one job
Show a real request becoming a one-tap decision, and prove the decision landed (the Telegram reply, the sent email, the calendar response).

- Primary action on the lens: **Approve** (tap).
- Primary action on the dashboard: **Pair my glasses**, then **Add a rule**.

## The subject's world
Quiet moments between meetings, dinners, commutes. Short messages from teammates and vendors. Small amounts of money and small calendar conflicts. Trust built on rules written once and a log you can read later.

## Constraints
- 576 × 288 monochrome; four containers; no scrolling.
- Google sign-in cannot run in the WebView, so setup lives on a separate dashboard with a pairing code.
- No funds move. Demo data is sandbox only.

## Success looks like
- A judge understands the product from the first card.
- Every demo scene shows a visible write-back.
- The dashboard audit log makes the safety story obvious without explanation.
