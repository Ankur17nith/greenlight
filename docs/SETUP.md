# Setup

Everything you need accounts or keys for, in the order to do it. All values go in `.env` (see [.env.example](../.env.example)); never in git and never in the G2 bundle.

## Tools

- Node 22 and pnpm (see `.nvmrc`).
- Even Hub tools:
  ```sh
  npm install -g @evenrealities/evenhub-cli
  npm install -g @evenrealities/evenhub-simulator
  ```
  Start from the official minimal template and point the simulator at the local dev server. Read the Even Hub docs before writing SDK code; do not guess API names.
- FFmpeg on `PATH` (video work only).

## Even Realities
- No glasses are needed: the free Even Hub simulator is enough.
- With glasses: install the Even Realities App, pair and update the G2, enable developer access on the developer portal.

## Telegram
1. Open @BotFather, `/newbot`, copy the token into `TELEGRAM_BOT_TOKEN`.
2. `/setprivacy` → Disable, so the bot sees group messages.
3. Add the bot to a test group.
4. Set the webhook to `PUBLIC_BASE_URL/telegram/webhook` with `secret_token` = `TELEGRAM_WEBHOOK_SECRET`.
5. The app also accepts `/request <text>` in the group for requests that should always reach the queue.

## Google
1. Create a Cloud project and enable the Gmail API and the Google Calendar API.
2. OAuth consent screen in **Testing** mode; add your sandbox Google account as a test user. No verification is needed for the hackathon.
3. Create an OAuth client (Web). Redirect URI: `GOOGLE_REDIRECT_URI`.
4. Scopes, nothing more: `gmail.readonly`, `gmail.send`, `calendar.events` (see [SECURITY.md](../SECURITY.md)).
5. Use a **sandbox** account with seeded mail and events, not a real inbox.

## AI (Policy Guard)
- Set `ANTHROPIC_API_KEY` and `POLICY_MODEL` (default `claude-haiku-5-5`), or an OpenRouter key.
- Check the current model ID before the demo; it is a setting, not a constant in code.

## ElevenLabs (video only)
1. Create a key at https://elevenlabs.io/app/api/api-keys?quickstart=true.
2. Add `ELEVENLABS_API_KEY` as an environment secret, or put it in `.env.local`. Never paste it in chat.
3. `npx -y @elevenlabs/cli@latest onboard check --env-path .env.local`
4. The app itself never calls ElevenLabs.

## Run (filled in as each part lands)
```sh
pnpm install
pnpm test
pnpm typecheck
pnpm dev:api        # backend on :3000
pnpm dev:g2         # glasses app in the simulator
pnpm dev:web        # landing page and dashboard
pnpm seed           # reset and load the demo data
```

## Hosting
Any host with a stable public HTTPS URL works, because Telegram's webhook, Google's OAuth redirect and the G2 `app.json` whitelist all need one. During development a tunnel is fine. The web app (`apps/web`) is deployed on its own and calls the API, so the API must allow its origin in CORS; only the API domain goes in the G2 `app.json` whitelist.
