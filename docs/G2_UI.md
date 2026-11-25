# G2 interface

Display: monochrome green, 576 × 288 per eye. The Even Hub SDK draws positioned containers (text, list, image) over Bluetooth. It does not use HTML or CSS. The design uses four fixed text containers that can be read in two seconds, with no scrolling.

## Card

```
┌──────────────────────────────────────────────┐
│ [REFUND · TG]                WITHIN POLICY │  C1
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

Source codes: `TG`, `MAIL`, `CAL`. Badges: `WITHIN POLICY`, `FLAGGED: <reason>`.

## Gestures (target; confirm below)

| Gesture | Action |
|---|---|
| Tap | Approve, then C4: `CONFIRMING IN 3s… [TAP TO UNDO]` |
| Swipe forward / back | Next / previous card, no action |
| Hold | Decline |
| Double tap | Snooze 1 hour, card goes to the back of the queue |
| R1 ring | Same as the glasses; ring press is the fallback for any gesture the glasses do not expose |

Undo is client-side. Nothing is sent until the 3 seconds end, so closing the app during that time cancels the action. The act request is idempotent, so a repeated tap does not send twice.

## Verified gestures

Checked on 25 Nov 2026 in the Even Hub simulator 0.9.5 (Linux, under Xvfb), driving it through its automation API. Event names come from the `@evenrealities/even_hub_sdk` 0.0.16 typings (`OsEventTypeList`). **Nothing here has been tried on real glasses or the R1 ring yet.**

| Input | Simulator action | SDK event name | Works in simulator | Works on glasses | Notes |
|---|---|---|---|---|---|
| Tap | `click` | `CLICK_EVENT` (0) | Yes: starts the 3 s countdown; a second tap undoes it | _untested_ | May arrive with `eventType` undefined (protobuf zero); handled as a click |
| Swipe forward | `down` | `SCROLL_BOTTOM_EVENT` (2) | Yes: 1/3 to 2/3 | _untested_ | Forward is `down` in the simulator |
| Swipe back | `up` | `SCROLL_TOP_EVENT` (1) | Yes: 2/3 to 1/3 | _untested_ | |
| Hold | `long_press` | `LONG_PRESS_EVENT` (9) | Yes: starts the decline countdown | _untested_ | Release (10) is a separate event and is ignored |
| Double tap | `double_click` | `DOUBLE_CLICK_EVENT` (3) | Yes: card is snoozed and hidden | _untested_ | |
| R1 ring | not simulated | same events; `sysEvent.eventSource` is `TOUCH_EVENT_FROM_RING` (2) | _untested_ | _untested_ | |

Screens captured in the simulator: normal card, confirming (approve and decline), error with retry, done (`APPROVED`, `Sent to Telegram`), offline, empty (`ALL CLEAR`) and not paired. The one-second `ZZ SNOOZED 1h` screen was not captured; the snooze itself was confirmed because the card left the queue. The done screen was reached using a local stand-in for Telegram, so it shows the glasses flow, not a real Telegram reply.

Screenshots: [normal card](images/g2-card.png), [declining with undo](images/g2-declining-undo.png), [offline](images/g2-offline.png), [all clear](images/g2-all-clear.png), [not paired](images/g2-not-paired.png).

The simulator font has no check mark, warning sign or cross, so the glasses text is plain ASCII.

Fallback if hold or double tap are missing: tap = approve, swipe = next, ring press = decline, and a snooze step reached by swiping to `SNOOZE` on the action footer.

Status text on the glasses is plain ASCII. The simulator font has no check mark, warning sign or cross, so those glyphs would show as blanks.

## States

| State | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Normal | category · source, badge | headline | recommendation | actions, `1/3` |
| Confirming | same | same | same | `CONFIRMING IN 3s… [TAP TO UNDO]` |
| Done | `APPROVED` or `DECLINED` | headline | `Sent to Telegram` / `Replied in Gmail` / `Calendar updated` | next card in 1s |
| Snoozed | `ZZ SNOOZED 1h` | headline | | next card |
| Empty | `GREENLIGHT` | `ALL CLEAR` | `No decisions waiting` | |
| Offline | `GREENLIGHT` | `OFFLINE` | `Retrying…` | |
| Not paired | `GREENLIGHT` | `ENTER CODE ON PHONE` | `Open the Even app` | |
| Error on act | normal card header | headline | `Send failed. Tap to retry` or `Offline. Tap to retry` | `[TAP: Retry]` |

## Writing rules for the lens
- One item per container, a few words each. No sentences that wrap.
- Uppercase for labels, sentence case for content.
- Do not show a raw error. Show what the user can do.
- No animation except the countdown. The display is monochrome and small.

## Phone side of the WebView

A plain settings screen inside the Even Realities App. It has a 6-digit code field, the link status and an unpair button. Google sign-in does not happen here.
