# Greenlight: build plan

**One-liner:** An approval terminal for Even Realities G2. It shows team requests from Telegram, Gmail and Google Calendar, checks them against your own company rules, and lets you approve with one tap.

**Hackathon:** Heads Up (Even Realities × TVM Ventures × Daos Hub) on DoraHacks
**Primary track:** 04 · AI Assistants & Work · **Second track:** 01 · Messaging & News · **Special prize:** Best Telegram integration
**Deadline:** Nov 29, 23:59 Dubai time (UTC+4) = Nov 29, 19:59 UTC. Aim to submit by **Nov 28 evening**; Nov 29 is buffer only.
**Today:** Nov 24 (Day 0). Build days are Nov 25, 26, 27.

---

## 1. What we are building

| Part | What it is | Where it runs |
|---|---|---|
| `apps/g2` | The glasses app: 4 text containers, gestures, ring support | WebView inside the Even Realities App |
| `apps/api` | Fastify backend: Telegram webhook, Gmail and Calendar clients, Policy Guard calls, queue, write-backs, audit log, pairing | Public HTTPS server |
| `apps/web` | Next.js 16 app: landing page, connect accounts, write 2–4 plain-English rules, pairing code, live audit log | Its own deploy; calls `apps/api` (CORS allowed) |
| `packages/shared` | Types, zod schemas, test fixtures shared by all three | n/a |
| `packages/policy` | Policy Guard: deterministic extraction, LLM verdict, safe fallback | Imported by the API |
| `video/` | Demo script, narration JSON, shot list, ElevenLabs and render tooling | Local |

### Why it can win (map to the judging rubric)

| Criterion | Weight | Our answer |
|---|---|---|
| Usefulness on G2 | 30% | Each card is one real decision a founder makes away from a laptop |
| Read and write | 25% | Approve, decline and snooze write back to Telegram, Gmail and Calendar |
| Technical execution | 20% | End to end loop, deterministic fallback when the AI fails, tests, clean repo |
| UX for display and voice | 15% | 4 fixed containers, 2-second glance, no scrolling |
| Business and safety | 10% | Policy Guard, 3s undo, audit trail, sandbox data, no funds touched |

---

## 2. Decisions and corrections to the original spec

Read these before coding. They change the spec slightly.

1. **Model:** do not use Claude 3.5 Haiku. Default to `claude-haiku-5-5` (set via `POLICY_MODEL`, easy to swap, OpenRouter supported). Latency target is under 2s per card.
2. **Hybrid policy engine, not LLM only.** A deterministic parser extracts amount, currency and requester first. Then the LLM gives category, headline, verdict and suggested reply. If the LLM errors, times out or returns invalid JSON, the card still appears with `FLAGGED` and a plain headline. This is also our reliability story for the "technical execution" score.
3. **The AI never decides.** It recommends. The founder's gesture is the only trigger for a write-back.
4. **Verify the SDK before designing around it.** Confirm the gesture map (tap, swipe, hold, double-tap) and the container API against the Even Hub docs and simulator on Day 0. If hold or double-tap are not exposed, fall back to: tap = approve, swipe = next, R1 ring press = decline, and a cycle-to-"Snooze" action. Do not guess API names.
5. **Pairing happens in the phone side of the WebView.** The 6-digit code is typed into Greenlight's own settings screen inside the Even Realities App, which exchanges it for a session token. Google sign-in never runs in the WebView.
6. **Telegram scope:** the bot only sees messages in groups it is added to. Disable bot privacy mode in BotFather, and also support a `/request` command. Reply with `reply_to_message_id` so the approval lands under the original message.
7. **Google OAuth:** keep the consent screen in Testing mode and add test users. No verification is needed for the hackathon. Use a sandbox Gmail and Calendar, not a real inbox.
8. **Polling, not WebSockets.** The G2 client polls `/api/queue` every 3s. Upgrade only if time remains.
9. **Reference repos are for structure, not code.** `LifeLine` (monorepo layout, `packages/policy`, fixtures, tests, `video/` pipeline) and `brag` (launch-video skill). Greenlight is original work started Nov 24. List both as inspirations in the README and copy no code (hackathon rule: say what existed before Nov 23).
10. **Cut order if time runs short:** voice decline note, then snooze persistence, then WebSocket, then Calendar write-back. Never cut Telegram, Gmail, the audit log, or the undo.

---

## 3. G2 interface

Four fixed text containers, 576 × 288 monochrome green, no scrolling.

```
┌──────────────────────────────────────────────┐
│ [EXPENSE · TG]               ✓ WITHIN POLICY │  C1: category · source + policy badge
│ $320 AWS Refund · @rohan (Acme Corp)         │  C2: core ask (max 42 chars)
│ AI: Approve — under $500 limit, VIP client   │  C3: one-line verdict
│ [TAP: Approve]  [SWIPE: Next]  [HOLD: Deny]  │  C4: action footer + 1/3 counter
└──────────────────────────────────────────────┘
```

| Gesture | Action |
|---|---|
| Tap | Approve. C4 becomes `CONFIRMING IN 3s... [TAP TO UNDO]`, then the API write happens and the next card loads |
| Swipe forward / back | Move through the queue (1/3, 2/3, 3/3) |
| Hold | Decline (optional 3s voice reason if time allows) |
| Double tap | Snooze 1 hour, card goes to the back |

Badges: `✓ WITHIN POLICY` and `⚠ FLAGGED: <short reason>`. An empty queue shows `ALL CLEAR`. If the backend is offline, the screen shows `OFFLINE · retrying`.

---

## 4. Architecture

```
Telegram group ─┐
Gmail (poll)  ──┼─> apps/api ──> packages/policy ──> SQLite (PENDING card)
Calendar poll ──┘        ^                                   │
                         │ POST /api/decisions/:id/act        │ GET /api/queue (3s poll)
                         │                                   v
              write-back (TG reply / Gmail reply / Calendar response)    apps/g2 (glasses)
                         │
                         └──> audit row ──> apps/web (live log)
```

### API surface

| Route | Purpose |
|---|---|
| `POST /telegram/webhook` | Telegram ingest (secret header checked) |
| `GET /auth/google` · `GET /auth/google/callback` | Connect Gmail and Calendar from the dashboard |
| `GET/PUT /api/policies` | Plain-English rules, 2–4 max |
| `POST /api/pair` · `POST /api/pair/exchange` | Create a 6-digit code (10 min TTL) and swap it for a session token |
| `GET /api/queue` | Pending cards for the paired user, already evaluated |
| `POST /api/decisions/:id/act` | `{ action: APPROVE \| DECLINE \| SNOOZE }`, performs the write-back |
| `GET /api/audit` | Decision log for the dashboard |
| `POST /api/dev/seed` | Demo mode only: inject the scripted requests for the video |

### SQLite schema

```sql
CREATE TABLE policies (
  id INTEGER PRIMARY KEY,
  rule_text TEXT NOT NULL
);

CREATE TABLE decisions (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,           -- TELEGRAM | GMAIL | CALENDAR
  external_id TEXT NOT NULL,      -- tg_chat_id:msg_id | thread_id | event_id
  requester TEXT NOT NULL,
  category TEXT NOT NULL,         -- EXPENSE | REFUND | SIGN_OFF | CALENDAR
  headline TEXT NOT NULL,         -- max 42 chars
  policy_status TEXT NOT NULL,    -- WITHIN_POLICY | FLAGGED
  policy_reason TEXT,             -- short reason shown in the badge
  ai_recommendation TEXT NOT NULL,
  suggested_reply TEXT NOT NULL,
  eval_mode TEXT NOT NULL,        -- AI | FALLBACK (shown in the audit log)
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | APPROVED | DECLINED | SNOOZED
  snoozed_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  decided_at DATETIME
);

CREATE TABLE sessions (token TEXT PRIMARY KEY, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE pair_codes (code TEXT PRIMARY KEY, expires_at DATETIME NOT NULL, used INTEGER DEFAULT 0);
```

### `app.json` and security checklist
- Whitelist the backend HTTPS domain (and `http://localhost:3000` for the simulator).
- Allow the Even Hub WebView origin in the API's CORS settings.
- No Telegram, Google or AI keys in the G2 bundle. Only the session token.
- Idempotent write-backs: a decision can only leave `PENDING` once, so a double tap never sends twice.

---

## 5. Repository layout

```
greenlight/
├── plan.md                 this file
├── README.md               setup, status, what existed before Nov 23
├── CLAUDE.md               working rules for the coding agent
├── SECURITY.md             safety model
├── .env.example            fake values only
├── apps/
│   ├── g2/                 Vite + TS + Even Hub SDK, app.json
│   ├── api/                Fastify + better-sqlite3, bot, Google clients
│   └── web/                Next.js + Tailwind landing page and dashboard
├── packages/
│   ├── shared/             types, zod schemas, fixtures (requests + verdicts)
│   └── policy/             parse + LLM verdict + fallback, with tests
├── scripts/                seed demo data, send a test Telegram request
├── docs/
│   └── SUBMISSION.md       DoraHacks description, feature requests
├── video/
│   ├── SCRIPT.md           timed demo script
│   ├── DELIVERABLES.md     what to export and where to post
│   ├── narration.json      scene → text (input to ElevenLabs)
│   ├── narration/          generated audio (git-ignored)
│   └── shots/              capture list and raw recordings
└── .github/workflows/      CI: typecheck + tests
```

Tooling: pnpm workspace, TypeScript, vitest. Every new function gets a test (the `policy` package first).

---

## 6. Three-day plan

### Day 0 · Nov 24 (today): unblock everything
- [ ] **ElevenLabs key:** create a key at https://elevenlabs.io/app/api/api-keys?quickstart=true, paste it after `ELEVENLABS_API_KEY=` in `.env.local`. Never paste it in chat. Then run `npx -y @elevenlabs/cli@latest onboard check --env-path .env.local`.
- [ ] Install `@evenrealities/evenhub-cli` and `@evenrealities/evenhub-simulator`, run the minimal template, change one line of text, confirm one input event works.
- [ ] **Spike the gestures:** log every event the SDK sends (tap, swipe, hold, double tap, ring) and fix the gesture table in section 3 to match what actually happens.
- [ ] Telegram: create the bot, add it to a test group, disable privacy mode.
- [ ] Google Cloud: project, Gmail and Calendar APIs enabled, OAuth consent in Testing mode, sandbox account added as test user.
- [ ] Choose a public HTTPS host for the API (any host that gives a stable URL; a tunnel is fine for dev).
- [ ] Scaffold the pnpm workspace and CI.

**Done when:** simulator shows custom text, the bot echoes a message from the group, and a Google token can be obtained.

### Day 1 · Nov 25: Telegram end to end + Policy Guard
- [ ] `packages/shared`: types, schemas, fixtures for 6 requests (3 within policy, 3 flagged).
- [ ] `packages/policy`: amount parser, LLM verdict with strict JSON schema, fallback path, 15+ tests.
- [ ] `apps/api`: SQLite, Telegram webhook ingest, `/api/queue`, `/api/decisions/:id/act` with the Telegram reply, audit rows.
- [ ] `apps/g2`: render the 4-container card from the queue, tap with 3s undo, swipe, decline, snooze, empty and offline states.
- [ ] Pairing code flow (API plus the phone-side form).

**Done when:** a request typed in the Telegram group shows on the simulator with a policy badge, a tap approves it, and `✅ Approved by Founder via Greenlight` appears under the original message. Commit.

### Day 2 · Nov 26: Gmail, Calendar, dashboard, polish
- [ ] Google OAuth on the dashboard; Gmail poll for the `Approval` / `Invoice` label with reply-in-thread write-back.
- [ ] Calendar poll for conflicting invites; accept / decline the attendee response; the "never double-book" rule path.
- [ ] Dashboard: connect buttons, rule editor (2–4 rules), pairing code, live audit log with `AI` vs `FALLBACK` tag.
- [ ] Safety pass: idempotent acts, delimiter-wrapped prompts, schema validation, scope check.
- [ ] Demo seed script that produces exactly the scenes in `video/SCRIPT.md`.
- [ ] **Evening:** lock the video script, generate narration audio (see section 7), freeze features.

**Done when:** all three sources produce cards, every tap writes back, and the audit log shows it.

### Day 3 · Nov 27: harden, package, record
- [ ] Deploy the API; point `app.json` at the production domain; build the `.ehpk`.
- [ ] README with setup, architecture, what existed before Nov 23, and the feature-request section (up to 5 API gaps, such as Telegram message reactions or Calendar webhooks).
- [ ] Test on a real G2 if available; otherwise a clean simulator run.
- [ ] **Morning:** record simulator capture for every scene in `video/shots/` (see section 7).
- [ ] **Afternoon:** voice-over, edit, captions, export the main demo (≤ 3:00) and the teaser.
- [ ] Draft the DoraHacks submission from `docs/SUBMISSION.md`.

**Done when:** a stranger can follow the README and see the same demo, and the video is exported.

### Nov 28 · buffer and submit
Re-record anything weak, do a final README check, and submit on DoraHacks by evening. Nov 29 is for emergencies only.

---

## 7. Demo video

Hard limit **3:00**. Target **2:50**. Two exports:

| Output | Length | How |
|---|---|---|
| Main demo | ≤ 3:00 | Screen capture of simulator + dashboard + Telegram/Gmail/Calendar windows, ElevenLabs voice-over, captions burned in (judges may watch muted) |
| Launch teaser | ~20s | `brag-slim` skill, for social posts |

Script: `video/SCRIPT.md` (8 timed scenes). Narration text lives in `video/narration.json`, so edits regenerate the audio without retyping.

### ElevenLabs voice
Goal: a mix of Indian and American English, warm and clear, about 150 words per minute.
1. Add the key (Day 0), run `onboard check`.
2. Open the Voice Library and Voice Design. Generate 3 candidates with a prompt like *"Male or female, 30s, neutral-American cadence with a light Indian English accent, warm, confident, clear consonants"*, and read the first scene aloud with each.
3. Pick one, record its `voice_id` in `video/narration.json`.
4. A small script in `video/` calls the text-to-speech API per scene and writes `video/narration/NN.mp3`. Tune stability and speed per scene, not globally.
5. The key is read from `ELEVENLABS_API_KEY` only. The app itself never uses ElevenLabs.

### Using `brag`
`brag` is a Claude skill that makes a short launch video with music and share copy. It is built for ~20s clips, so use it for the teaser, not the 3-minute demo.
1. Install: `npx skills add https://github.com/latent-spaces/brag --skill brag-slim`
2. In this project say "let's /brag about this" once the dashboard is deployed.
3. It needs Node 22+ and FFmpeg on `PATH`.
4. Its default narration is optional. For consistency, replace any voice with the ElevenLabs track.
5. Music is CC BY 4.0 (Sascha Ende). Keep the credit in the description.

### Recording checklist
- Same resolution for every shot (1920×1080), simulator window scaled up so the 576×288 display is readable.
- Seed data only; no real emails, names or tokens on screen.
- Show a real write-back every time: the Telegram reply, the sent email in the Gmail thread, the calendar response.
- Captions on, background music low (-18 dB under voice), final loudness consistent.

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| SDK gestures differ from the spec | Day 0 spike, fallback mapping in decision 4 |
| Google OAuth scope trouble | Testing mode with named test users, minimal scopes, do Gmail before Calendar |
| LLM latency or invalid JSON | Deterministic fallback, 3s timeout, `eval_mode` visible in the audit log |
| Demo breaks live | Pre-recorded capture from seeded data, not a live run |
| Looks like the 24 other Telegram inboxes | Open the video with the policy rules and the audit trail, not the inbox |
| Scope creep | Cut order in decision 10; freeze features at the end of Day 2 |

## 9. Submission checklist
- [ ] Public GitHub repo with README (setup, architecture, pre-Nov 23 note)
- [ ] Demo video ≤ 3:00 uploaded and linked
- [ ] Description: problem, who it is for, how it works, tracks
- [ ] Primary track 04, second track 01, Best Telegram integration noted
- [ ] Optional `.ehpk` build attached
- [ ] Optional feature requests (up to 5)
- [ ] "How did you hear about this hackathon?" filled
- [ ] No secrets in the repo (`git log -p | grep -i key` sanity check)
