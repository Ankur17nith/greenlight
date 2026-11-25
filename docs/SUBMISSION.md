# DoraHacks submission draft

**Name:** Greenlight
**Tracks:** 04 · AI Assistants & Work (primary), 01 · Messaging & News. Special prize: Best Telegram integration.

## Problem
Founders, small-business owners and ops leads are the bottleneck for dozens of small decisions a day: refunds, expenses, vendor sign-offs, calendar overrides. When they are away from a laptop, their team waits.

## Who it is for
Founders and ops or support leads at small companies who unblock their team from their phone or on the move.

## How it works
Requests come in from Telegram, Gmail and Google Calendar. A Policy Guard checks each one against plain-English rules the founder wrote once. Each request becomes one card on the Even G2. The card shows what it is, who sent it, the verdict and a one-line recommendation. Tap to approve, with a 3-second undo. Hold to decline, swipe for the next, double tap to snooze. The decision is written back to the source and logged with a timestamp on a companion dashboard.

## Why G2
It is a glance-and-act problem. The card fits 576 × 288 monochrome with no scrolling, and a tap or ring press is faster than unlocking a phone.

## Safety
The AI only recommends. A deliberate gesture triggers every write-back, with a 3-second undo. No funds move, and demos use sandbox accounts. A deterministic fallback works if the AI fails.

## What existed before the hackathon
Nothing. The repository was started on Nov 24, during the hackathon. The documentation structure was inspired by the open-source repo Beacon, and the teaser-video workflow by brag. No code was copied from either. Open-source libraries and the Even Hub SDK are used as dependencies.

## Feature requests for the APIs (optional, up to 5)
These come from friction I hit while building. I only list what I actually ran into.
1. Even Hub SDK: the README examples pass plain objects to `createStartUpPageContainer` and `textContainerUpgrade`, but the TypeScript typings need class instances (`new CreateStartUpPageContainer(...)`). Please make the examples and typings agree.
2. Even Hub SDK / glasses font: please document which glyphs the G2 font supports. The simulator font has no check mark, warning sign or cross, so those characters showed as blanks.
3. Even Hub simulator: the automation API can send touchpad input but cannot type into the WebView, so a pairing form cannot be tested through it. An endpoint to focus and type into the WebView would help.
4. Even Hub simulator: it needs `libwebkit2gtk-4.1` on Linux and fails with a missing-library error otherwise. Please list this in the README.
5. Telegram, Gmail, Google Calendar: _TBD_ (not tested against the real services yet; fill in after those runs, or remove)

## Links
- Repo: https://github.com/Ankur17nith/greenlight
- Demo video: _TBD_ (not recorded yet)
- `.ehpk` build: _TBD_ (builds with `pnpm --filter @greenlight/g2 ehpk`; not uploaded yet)
