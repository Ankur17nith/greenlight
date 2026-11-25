# Greenlight design brief

## Subject
Greenlight shows a founder one decision at a time on Even G2 glasses. Each is a team request from Telegram, Gmail or Google Calendar, already checked against the founder's own plain-English rules. A tap approves it (with a 3-second undo) and a hold declines it. The decision is written back to the source and added to an audit log.

## Audience
1. **Hackathon judges** (Even Realities, TVM Ventures, partner funds, Daos Hub). They watch a 3-minute video first, then open the repo. They need to see a full read-and-write loop and believe it is safe.
2. **Founders and ops leads** at small companies who unblock their team from a phone. They want fewer interruptions and a record of what they signed off.
3. **G2 builders**, who look for good uses of the display, the ring and the Even Hub SDK.

## The one job
Show a real request becoming a one-tap decision, and show that the decision landed (the Telegram reply, the sent email, the calendar response).

- Primary action on the lens: **Approve** (tap).
- Primary action on the dashboard: **Pair my glasses**, then **Add a rule**.

## The subject's world
Quiet moments between meetings, dinners and commutes. Short messages from teammates and vendors. Small amounts of money and small calendar conflicts. Trust comes from rules written once and a log that can be read later.

## Constraints
- 576 × 288 monochrome; four containers; no scrolling.
- Google sign-in cannot run in the WebView, so setup is on a separate dashboard with a pairing code.
- No funds move. Demo data is sandbox only.

## Success looks like
- A judge understands the product from the first card.
- Every demo scene shows a visible write-back.
- The dashboard audit log shows the safety story without needing an explanation.
