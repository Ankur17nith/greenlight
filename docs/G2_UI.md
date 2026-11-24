# G2 interface

Display: monochrome green, 576 × 288 per eye. The Even Hub SDK renders positioned containers (text, list, image) over Bluetooth, not HTML/CSS. Design for four fixed text containers and a two-second glance, with no scrolling.

## Card

```
┌──────────────────────────────────────────────┐
│ [REFUND · TG]                ✓ WITHIN POLICY │  C1
│ $320 AWS Refund · @rohan (Acme Corp)         │  C2
│ AI: Approve — under $500 limit, VIP client   │  C3
│ [TAP: Approve]  [SWIPE: Next]  [HOLD: Deny]  │  C4   (1/3)
└──────────────────────────────────────────────┘
```

| Container | Content | Limit |
|---|---|---|
| C1 | `[CATEGORY · SOURCE]` left, policy badge right | one line |
| C2 | Core ask, the largest text | 42 chars |
| C3 | `AI:` recommendation | 44 chars |
| C4 | Action footer and queue position `n/N` | one line |

Source codes: `TG`, `MAIL`, `CAL`. Badges: `✓ WITHIN POLICY`, `⚠ FLAGGED: <reason>`.

## Gestures (target; confirm below)

| Gesture | Action |
|---|---|
| Tap | Approve, then C4: `CONFIRMING IN 3s… [TAP TO UNDO]` |
| Swipe forward / back | Next / previous card, no action |
| Hold | Decline |
| Double tap | Snooze 1 hour, card goes to the back of the queue |
| R1 ring | Same as the glasses; ring press is the fallback for any gesture the glasses do not expose |

Undo is client-side: nothing is sent until the 3 seconds end, so closing the app during the window cancels the action (fail-safe). The act request is idempotent, so a repeated tap never double-sends.

## Verified gestures

_Fill this in on Day 0 from the SDK logs (task D0-3). Until it is filled, treat the table above as unconfirmed._

| Input | SDK event name | Works on glasses | Works in simulator | Notes |
|---|---|---|---|---|
| Tap | _TBD_ | _TBD_ | _TBD_ | |
| Swipe forward | _TBD_ | _TBD_ | _TBD_ | |
| Swipe back | _TBD_ | _TBD_ | _TBD_ | |
| Hold | _TBD_ | _TBD_ | _TBD_ | |
| Double tap | _TBD_ | _TBD_ | _TBD_ | |
| R1 ring | _TBD_ | _TBD_ | _TBD_ | |

Fallback if hold or double tap are missing: tap = approve, swipe = next, ring press = decline, and a snooze step reached by swiping to `SNOOZE` on the action footer.

## States

| State | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Normal | category · source, badge | headline | recommendation | actions, `1/3` |
| Confirming | same | same | same | `CONFIRMING IN 3s… [TAP TO UNDO]` |
| Done | `✓ APPROVED` or `✕ DECLINED` | headline | `Sent to Telegram` / `Replied in Gmail` / `Calendar updated` | next card in 1s |
| Snoozed | `ZZ SNOOZED 1h` | headline | | next card |
| Empty | `GREENLIGHT` | `ALL CLEAR` | `No decisions waiting` | |
| Offline | `GREENLIGHT` | `OFFLINE` | `Retrying…` | |
| Not paired | `GREENLIGHT` | `ENTER CODE ON PHONE` | `Open the Even app` | |
| Error on act | `⚠ NOT SENT` | headline | `Tap to retry` | |

## Writing rules for the lens
- One thing per container, a few words each. No sentences that wrap.
- Uppercase for labels, sentence case for content.
- Never show a raw error; show what the user can do.
- No animation beyond the countdown; the display is monochrome and small.

## Phone side of the WebView
A plain settings screen inside the Even Realities App: a 6-digit code field, link status, and an unpair button. Google sign-in never happens here.
