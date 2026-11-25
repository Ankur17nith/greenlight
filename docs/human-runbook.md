# Human runbook

Everything the human (Ankur) does, in order, with the output to expect. The coding agent cannot click through consoles or sign in for you. Paste any error into the chat as it appears. **Never paste a key or token into the chat.**

Commands that are not written yet are marked **(later)**. They appear as the build lands.

## §0 · Account prep (about 60 minutes of clicking)

1. **ElevenLabs key (environment secret).**
   - Create a key at https://elevenlabs.io/app/api/api-keys?quickstart=true.
   - Open the cloud environment menu in the session's title bar, choose Edit, and add `ELEVENLABS_API_KEY` under Network secrets (or as an environment variable if that section is not offered).
   - Start a **new session** on the repo. A session that was already running will not see it.
   - Check, in the new session: `npx -y @elevenlabs/cli@latest onboard check --env-path .env.local`
   - Expected: the check passes. If it says the key is empty, the secret did not reach the session.

2. **Telegram bot.**
   - In Telegram, open @BotFather, send `/newbot`, follow the prompts.
   - Copy the token into your local `.env` as `TELEGRAM_BOT_TOKEN`.
   - Send `/setprivacy`, choose the bot, choose **Disable**.
   - Create a test group and add the bot.
   - Expected: BotFather replies "Privacy mode is disabled".

3. **Google Cloud (Testing mode).**
   - Create a project, enable the Gmail API and the Google Calendar API.
   - OAuth consent screen: User type External, publishing status **Testing**, add your sandbox Google account as a test user.
   - Create an OAuth client (Web application) with the redirect URI from `.env.example`.
   - Copy the client ID and secret into `.env`.
   - Expected: the consent screen shows "Testing" and lists your test user.

4. **Even Hub tools.**
   ```bash
   npm install -g @evenrealities/evenhub-cli
   npm install -g @evenrealities/evenhub-simulator
   ```
   Expected: both install without errors. Start the official minimal template, change one line of text, and see it in the simulator. If you have glasses, pair them in the Even Realities App and enable developer access on the portal.

5. **Sandbox data.** In the sandbox Google account: create the label `Invoice`, and an event called "Investor call" tomorrow 15:00–16:00. Keep the test Telegram group for requests.

## §1 · Run it locally **(later)**

```bash
pnpm install
cp .env.example .env     # fill in real values
pnpm dev:api
pnpm dev:web
pnpm dev:g2
```

Expected: the API answers `GET /health`, the web app opens at `/`, the simulator shows "ALL CLEAR".

## §2 · Deploy **(later)**

Pick a host that gives a stable public HTTPS URL (open question 3 in [QUESTIONS.md](QUESTIONS.md)).

1. Deploy the API and the web app; set the environment variables from `.env` on the host.
2. Point the Telegram webhook at `https://<your-domain>/telegram/webhook` with the secret from `.env`.
3. Add the production domain to the G2 `app.json` whitelist and to the API's CORS setting.
4. Update the Google OAuth redirect URI.
5. Expected: `curl https://<your-domain>/health` returns an OK body, and a message in the test group creates a card.

## §3 · Pair and test **(later)**

1. Open the web app at `/app/connect`; connect Telegram, Gmail and Calendar.
2. Add the demo rules at `/app/rules`.
3. Open `/app/pair`, enter the six-digit code in the Even app.
4. Post a test request in the group. Expected: a card on the simulator, tap, `Approved by Founder via Greenlight` under the message.

## §4 · Video **(later)**

Follow [`../video/PRODUCTION.md`](../video/PRODUCTION.md). Expected: `greenlight_demo.mp4` of 3:00 or less.

## §5 · Submit

Follow [SUBMISSION-DAY.md](SUBMISSION-DAY.md). On the hackathon page: repo link, video link, description, tracks (04 primary, 01 second), the Telegram prize, and the "how did you hear" field. Expected: the page shows the project as submitted.
