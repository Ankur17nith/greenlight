# Roadmap

What comes after the hackathon, in order. Each step either makes Greenlight usable by real teams or closes a limitation listed in the [README](README.md#limitations).

## 0. Hackathon scope (Nov 24–28)
- Telegram, Gmail and Google Calendar as request sources, with write-backs.
- Policy Guard with plain-English rules, deterministic fallback, audit log.
- G2 app with the four-container card, tap, swipe, hold and snooze.
- Dashboard with account connections, rule editor, pairing code and audit log.

## 1. Trust
- Per-category approval limits and a second approver for large amounts.
- Role-based access, so an ops lead can approve some categories and not others.
- Signed, exportable audit trail.
- Encryption of stored tokens with a managed key.

## 2. More sources
- Slack and Discord requests.
- Notion and Google Drive links attached to a request.
- Expense and invoice tools through their APIs.

## 3. Smarter rules
- Rules with structured fields (amount, requester group, time of day) alongside plain English.
- Learn which flagged requests the founder usually approves, and suggest rule changes for review. The founder always confirms a change.
- Voice reason for a decline, with speech-to-text.

## 4. Reach
- A hosted version for small teams with sign-up and billing.
- An MCP server so other AI agents can submit requests and read the queue, but never approve.
- A public SDK for sending approval requests from any internal tool.

## Not planned
- Moving money, or any action the founder has not explicitly approved.
- Reading notifications from other apps. Greenlight talks to each service through its own API.
