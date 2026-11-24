# Greenlight design system

Two surfaces, one idea: **a signal light**. Red means stop and check, green means go. On the glasses that is one monochrome line of text; on the dashboard it is a calm, paper-white ledger of decisions.

## Taste (from [taste.md](taste.md); it decides every call)
- IS: **calm** (the founder is at dinner), **exact** (real numbers, real rules), **fast** (one decision per screen), **trustworthy** (every action is logged and undoable).
- NEVER: noisy, gamified, a chat UI, a dashboard of widgets, vague "AI magic".
- Motion: none on the glasses except the 3-second countdown. On the dashboard, 150–200 ms ease-out, and nothing that moves on its own.

## Surface 1: G2 lens (`apps/g2`)
- 576 × 288, monochrome green. There is no color choice; hierarchy comes from position, case and length.
- Four text containers: header and badge, headline, AI verdict, action footer. See [docs/G2_UI.md](../docs/G2_UI.md).
- Uppercase for labels, sentence case for content. Max 42 characters in the headline.
- The badge is the only status signal: `✓ WITHIN POLICY` or `⚠ FLAGGED: <reason>`.
- Phone-side form (WebView): one field, one button, large touch targets (min 44 px), light theme, system font.

## Surface 2: dashboard (`apps/dashboard`, React + Tailwind)

### Tokens (Tailwind `@theme`)
| Token | Light | Dark | Use |
|---|---|---|---|
| `paper` | #fafaf7 | #0f1210 | Page background |
| `card` | #ffffff | #171c19 | Cards and inputs |
| `ink` | #111713 | #eef2ee | Primary text |
| `muted` | #5b655f | #9aa59e | Secondary text |
| `line` | #e4e7e1 | #262d29 | Borders |
| `go` | #138a4a | #3ddc84 | Within policy, approved, primary action |
| `stop` | #c0392b | #ff6b5e | Flagged, declined |
| `hold` | #b7791f | #f0b44c | Snoozed, pending |

Contrast: all text pairs meet WCAG AA. Never use color alone; every status has a word and an icon.

### Type
- UI: Inter (or system UI). Numbers and IDs: IBM Plex Mono, tabular figures.
- Scale: 12 / 14 / 16 / 20 / 28. Headings 600 weight, body 400.

### Layout
- Single column up to 720 px for setup; the audit log is a full-width table.
- Spacing scale 4 / 8 / 12 / 16 / 24 / 32. Radius 8. One shadow level for popovers only.
- Mobile first: the founder will often open this on a phone.

### Components
| Component | Notes |
|---|---|
| `ConnectCard` | One per source (Telegram, Gmail, Calendar): status dot, connect/disconnect, last sync |
| `RuleEditor` | 2–4 plain-English rules, character counter (200), save, example chips |
| `PairingCode` | Six large digits, 10-minute countdown, copy button, regenerate |
| `AuditTable` | requester, request, verdict, decision, time, `AI`/`FALLBACK` tag; newest first; live updates |
| `StatusPill` | `Within policy`, `Flagged`, `Approved`, `Declined`, `Snoozed` |
| `EmptyState` | Explains what to do next (connect an account, write a rule) |

### States to design for
Loading (skeleton rows), empty, error with retry, offline banner, expired pairing code, Google token expired, Telegram webhook not reachable.

### Accessibility
- Keyboard reachable, visible focus ring, labels on every input, `aria-live` on the audit log updates.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.

### Copy
Short, plain, active. "Connect Telegram", "Add a rule", "Code expires in 9:41". No exclamation marks, no "AI-powered".
