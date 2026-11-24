# Task tracker

One micro-task per line, in build order. Each has a **Do** and a **Done when**. Tick a box only when its Done-when is met and you have seen the real output. Dates are 2026; deadline is Nov 29, 23:59 Dubai time (UTC+4), so submit by Nov 28 evening.

Cut order if time runs short ([plan.md](../plan.md#2-decisions-and-corrections-to-the-original-spec)): voice decline note, snooze persistence, WebSocket, Calendar write-back. Never cut Telegram, Gmail, the audit log or the undo.

## Day 0 · Nov 24: unblock

- [ ] **D0-1 ElevenLabs key.** Do: put `ELEVENLABS_API_KEY` in the environment secrets (or `.env.local`). Done when: `npx -y @elevenlabs/cli@latest onboard check --env-path .env.local` passes.
- [ ] **D0-2 Simulator hello.** Do: install `@evenrealities/evenhub-cli` and `@evenrealities/evenhub-simulator`, start from the official minimal template, change one line. Done when: the simulator shows the new text.
- [ ] **D0-3 Gesture spike.** Do: log every input event (tap, swipe, hold, double tap, ring). Done when: the "Verified gestures" table in [G2_UI.md](G2_UI.md#verified-gestures) is filled in from real output, and the gesture map in plan.md matches.
- [ ] **D0-4 Telegram bot.** Do: create the bot with @BotFather, add it to a test group, disable privacy mode, set the webhook secret. Done when: a message in the group reaches a local echo handler.
- [ ] **D0-5 Google Cloud.** Do: project, enable Gmail and Calendar APIs, OAuth consent screen in Testing mode, add the sandbox account as a test user. Done when: a token is obtained with the scopes in [SETUP.md](SETUP.md#google).
- [ ] **D0-6 Hosting.** Do: pick a host with a stable public HTTPS URL. Done when: `GET /health` answers from that URL.
- [x] **D0-7 Scaffold.** Do: pnpm workspace, TypeScript, vitest, CI. Done when: `pnpm install && pnpm typecheck && pnpm test` passes on an empty test.

## Day 1 · Nov 25: Telegram end to end and Policy Guard

- [x] **D1-1 Shared types.** Do: `packages/shared` with `RequestCard`, `Verdict`, `Decision`, zod schemas, and the fixtures in [POLICY_GUARD.md](POLICY_GUARD.md#test-cases). Done when: fixtures parse against the schemas.
- [x] **D1-2 Amount parser.** Do: deterministic extraction of amount, currency and requester. Done when: 10+ tests pass, including `$1,250`, `Rs 4,000`, `USD 320`, no amount, two amounts.
- [x] **D1-3 Verdict and fallback.** Do: LLM call with strict JSON schema, 3s timeout, fallback to `FLAGGED`. Done when: tests cover valid, invalid JSON, timeout and a prompt-injection fixture; fallback path shows `eval_mode = FALLBACK`.
- [x] **D1-4 DB and queue.** Do: SQLite schema from plan.md, `GET /api/queue`. Done when: seeded cards come back oldest first, snoozed cards hidden.
- [ ] **D1-5 Telegram ingest and reply.** Do: webhook with secret check; reply under the original message. Done when: a group message becomes a card, and approving it posts the reply.
- [x] **D1-6 Act endpoint.** Do: `POST /api/decisions/:id/act`, idempotent. Done when: a second call on the same id is a no-op (test).
- [ ] **D1-7 G2 card.** Do: render the four containers from a queue item. Done when: simulator shows the card from the API with the correct badge.
- [ ] **D1-8 G2 gestures.** Do: approve with 3s undo, decline, swipe, snooze, empty and offline states. Done when: every state in [G2_UI.md](G2_UI.md#states) renders.
- [ ] **D1-9 Pairing.** Do: `POST /api/pair`, `POST /api/pair/exchange`, phone-side form in the G2 app. Done when: a 6-digit code links the simulator session; a used or expired code is refused.

**Day 1 done when:** a Telegram request shows on the simulator with a policy badge, a tap approves it, and the reply appears in the group.

## Day 2 · Nov 26: Gmail, Calendar, dashboard

- [ ] **D2-1 Google OAuth.** Do: connect flow on the dashboard; tokens stored encrypted at rest. Done when: both scopes granted, tokens refresh.
- [ ] **D2-2 Gmail.** Do: poll the `Approval`/`Invoice` label, create cards, send the reply in the same thread. Done when: approving a card sends a reply visible in the thread.
- [ ] **D2-3 Calendar.** Do: poll for conflicting invites, accept or decline the attendee response. Done when: declining a card changes the event response.
- [ ] **D2-4 Rules UI.** Do: dashboard editor for 2–4 plain-English rules. Done when: editing a rule changes the verdict of the next request.
- [ ] **D2-5 Audit log.** Do: dashboard table with requester, action, verdict, decision, time, `AI`/`FALLBACK`. Done when: a tap on the glasses appears within 5 seconds.
- [ ] **D2-6 Safety pass.** Do: delimiter-wrapped prompts, schema validation, scope check, secrets scan. Done when: the checklist in [SECURITY.md](../SECURITY.md) is satisfied.
- [x] **D2-7 Seed script.** Do: `scripts/seed-demo` creates exactly the scenes in [video/SCRIPT.md](../video/SCRIPT.md). Done when: one command resets and replays the demo data.
- [ ] **D2-8 Narration audio.** Do: generate `video/narration/NN.mp3` from `narration.json` with the chosen voice. Done when: 8 files exist and total under 2:55.
- [ ] **D2-9 Feature freeze.** Done when: no new features; only fixes and polish from here.

## Day 3 · Nov 27: harden, package, record

- [ ] **D3-1 Deploy.** Do: deploy the API, set the `app.json` whitelist, set CORS. Done when: the simulator talks to production.
- [ ] **D3-2 Package.** Do: build the `.ehpk`. Done when: the file installs in the simulator.
- [ ] **D3-3 README.** Do: setup, architecture, what existed before Nov 23, feature requests. Done when: a fresh clone follows it to the demo.
- [ ] **D3-4 Capture.** Do: record each scene in [video/PRODUCTION.md](../video/PRODUCTION.md). Done when: all 8 raw clips exist at 1920×1080.
- [ ] **D3-5 Voice-over and edit.** Do: align narration, add captions, mix music. Done when: `out/greenlight_demo.mp4` is 3:00 or less.
- [ ] **D3-6 Teaser.** Do: run `brag-slim` for a ~20s clip. Done when: `out/greenlight_teaser.mp4` exists.
- [ ] **D3-7 Submission draft.** Do: finish [SUBMISSION.md](SUBMISSION.md). Done when: every `_TBD_` is filled.
- [ ] **D3-8 Hygiene.** Do: scan history for keys, check `.env*` is ignored. Done when: `git log -p | grep -iE 'sk-ant|api[_-]?key=|token='` shows only fake values.

## Nov 28 · submit
- [ ] **S-1** Re-record anything weak. **S-2** Submit on DoraHacks. **S-3** Tag the commit `hackathon-submission`.
