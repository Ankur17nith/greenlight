# DRAFT: Greenlight, a one-tap approval terminal on smart glasses

> **DRAFT.** This is a build-log outline written on 24 Nov 2026, before any code exists. Everything marked TBD must be replaced with something true before posting. Delete this note then.

## 1. The 9 p.m. problem

You are at dinner and your phone buzzes. A refund needs approval, a vendor is waiting, or two meetings clash. These are small decisions, but your team is stuck until you open a laptop. I am building **Greenlight** for the Even Realities G2 so that each of these becomes one card I can read and answer in a few seconds.

## 2. What it does (target)

Requests from Telegram, Gmail and Google Calendar are checked against rules I write once in plain English. Each request becomes a single card on the glasses. The card shows what it is, who sent it, a policy badge and a one-line recommendation. Tap to approve, hold to decline, swipe for the next. The decision is written back to the source and logged. _Working today: TBD._

## 3. Why not another Telegram inbox

I read the field before choosing. In a pasted list of 54 builds, about 24 were Telegram inboxes with AI-drafted replies. I kept Telegram because it is useful. But I made the product about the decision and the record, not the chat. _The count is from one-line pitches only._

## 4. The AI recommends, the person decides

The model never approves anything. Numbers come from a deterministic parser. Request text is treated as untrusted data. If the AI fails or times out, the card still appears, marked as flagged. Only a gesture triggers a write-back, and it is followed by a 3-second undo. _Measured fallback rate: TBD._

## 5. Designing for 576 × 288

The display is monochrome and small, so each card has four fixed text lines and no scrolling. I designed the layout in text first. _What changed after testing on the simulator: TBD. What changed on real glasses: TBD._

## 6. A small web app for setup

Google sign-in cannot run inside the glasses' WebView, so setup lives on a web app. There you connect accounts, write rules, get a six-digit pairing code, and read the audit log. I took visual ideas from public projects and wrote the code myself. _Screenshot: TBD._

## 7. What went wrong

_TBD. Add real problems from [LEARNINGS.md](LEARNINGS.md) after they happen._

## 8. What I would do next

A second approver for large amounts, roles, a signed audit export, and Slack and Discord as sources. See [`../ROADMAP.md`](../ROADMAP.md).

## Try it

- Repo: https://github.com/Ankur17nith/greenlight
- Demo video: TBD
- Live app: TBD

_Built for the Heads Up hackathon by Even Realities, TVM Ventures and Daos Hub._
