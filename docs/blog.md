# DRAFT: Greenlight, a one-tap approval terminal on smart glasses

> **DRAFT.** This is a build-log outline written on 24 Nov 2026, before any code exists. Everything marked TBD must be replaced with something true before posting. Delete this note then.

## 1. The 9 p.m. problem

You are at dinner and your phone buzzes: a refund to approve, a vendor waiting, a calendar clash. They are small decisions, but your team is stuck until you open a laptop. We built **Greenlight** for the Even Realities G2 so that each of those becomes one card you can read and answer in a few seconds.

## 2. What it does (target)

Requests from Telegram, Gmail and Google Calendar are checked against rules you wrote once in plain English. Each becomes a single card on the glasses: what, who, a policy badge and a one-line recommendation. Tap to approve, hold to decline, swipe for the next. The decision writes back to the source and is logged. _Working today: TBD._

## 3. Why not another Telegram inbox

We read the field before choosing. From a pasted list of 54 builds, about 24 were Telegram inboxes with AI-drafted replies. We kept Telegram because it is useful, but made the product about the decision and the record, not the chat. _The count is from one-line pitches only._

## 4. The AI recommends, the person decides

The model never approves anything. Numbers come from a deterministic parser, request text is treated as untrusted data, and if the AI fails or times out the card still appears as flagged. The only trigger for a write-back is a gesture, followed by a 3-second undo. _Measured fallback rate: TBD._

## 5. Designing for 576 × 288

The display is monochrome and small, so each card has four fixed text lines and no scrolling. We designed the layout in text first. _What changed after testing on the simulator: TBD. What changed on real glasses: TBD._

## 6. A small web app for setup

Google sign-in cannot run inside the glasses' WebView, so setup lives on a web app: connect accounts, write rules, get a six-digit pairing code, and read the audit log. We took visual inspiration from public projects and wrote the code ourselves. _Screenshot: TBD._

## 7. What went wrong

_TBD. Add real problems from [LEARNINGS.md](LEARNINGS.md) after they happen._

## 8. What we would do next

A second approver for large amounts, roles, a signed audit export, and Slack and Discord as sources. See [`../ROADMAP.md`](../ROADMAP.md).

## Try it

- Repo: https://github.com/Ankur17nith/greenlight
- Demo video: TBD
- Live app: TBD

_Built for the Heads Up hackathon by Even Realities, TVM Ventures and Daos Hub._
