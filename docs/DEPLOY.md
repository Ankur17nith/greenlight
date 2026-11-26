# Deploy to Render

The API and the website go on Render from [render.yaml](../render.yaml). The glasses app is not hosted: it is packaged as an `.ehpk` file.

No model key is needed. The API starts in **rules-only mode** (`POLICY_MODE=rules`): plain code applies your rules, and cards are tagged `RULES`. See [POLICY_GUARD.md](POLICY_GUARD.md#rules-only-mode).

## What it costs

Nothing. Both services use Render's free plan, and no model key is needed.

The free plan has two limits you should know about:

- **No disk.** The SQLite database lives in `/tmp` and is wiped whenever the service restarts or redeploys. After a restart the queue is empty, the saved rules are replaced by the default rules, and the glasses must be paired again. The dashboard token, the Telegram webhook and every environment variable survive.
- **Sleep.** A free service stops after 15 minutes without traffic and takes about a minute to wake on the next request. A Telegram message wakes it, and Telegram retries, so messages still arrive, but the first card is slow.

To keep it awake while you record or demo, add a free uptime monitor (for example UptimeRobot) that requests `https://<api address>/health` every 5 minutes. One always-on free service fits inside Render's monthly free hours. The database still resets on a redeploy, so after any redeploy re-save your rules and pair again.

For the demo, do this in order: wake the service, save the two demo rules, pair the glasses or simulator, then post the requests. `pnpm seed` replays the scripted cards if you set `DEMO_MODE=1`.

## Steps

1. **Create the Blueprint.** In the Render dashboard choose New, then Blueprint. Connect the GitHub repo `Ankur17nith/greenlight`, branch `main`. Render reads `render.yaml` and lists two services.
2. **Fill the prompts.** Render asks for the values marked `sync: false`.
   - `TELEGRAM_BOT_TOKEN`: the token from BotFather.
   - If Render asks for a payment method, the free plan still costs nothing; check that both services show Free before you confirm.
   - `CORS_ORIGIN`, `DASHBOARD_URL`, `PUBLIC_BASE_URL`, `NEXT_PUBLIC_API_URL`: you do not know these yet. Type `https://example.com` for each and fix them in step 4.
   - Google values: leave empty until you connect Gmail and Calendar.
3. **Create and wait.** The first build takes a few minutes. When both services show Live, note their addresses, like `https://greenlight-api-xxxx.onrender.com` and `https://greenlight-web-xxxx.onrender.com`.
4. **Fix the addresses.** Open each service, Environment, and set:
   - On the API: `PUBLIC_BASE_URL` = the API address, `CORS_ORIGIN` = the web address, `DASHBOARD_URL` = the web address.
   - On the web service: `NEXT_PUBLIC_API_URL` = the API address.
   Save. Both redeploy. The web service must rebuild, because that value is baked in at build time.
5. **Check it.** Open `https://<api address>/health`. It should answer `{"ok":true}`. Open the web address and press Open dashboard.
6. **Sign in to the dashboard.** The dashboard asks for a token. It is the `DASHBOARD_TOKEN` that Render generated: API service, Environment, reveal the value, paste it into the dashboard. Do not paste it anywhere else.
7. **Point Telegram at the API.** On your computer, add these to `.env` (it is git-ignored):
   ```
   PUBLIC_BASE_URL=https://<api address>
   TELEGRAM_BOT_TOKEN=<token from BotFather>
   TELEGRAM_WEBHOOK_SECRET=<copy it from the API service's Environment on Render>
   ```
   Then run:
   ```bash
   pnpm webhook
   ```
   Expected: `Webhook set to https://<api address>/telegram/webhook`. The command never prints the token.
8. **Test.** Open the dashboard Rules page and save two rules, for example `Flag any refund or expense over $500.` and `Never double-book investor calls.` Post `Refund $320 AWS credit for Acme Corp` in your Telegram group. A card appears on the dashboard queue with `WITHIN POLICY` and the tag `RULES`. Post `Expense $900 offsite deposit` and it shows `FLAGGED: Over $500`.

## Approving without glasses

Use the Even Hub simulator on your computer. Build the glasses app against the deployed API:

```bash
VITE_API_URL=https://<api address> pnpm dev:g2
```

Open the Pair page of the dashboard, enter the six-digit code in the simulator, then tap to approve. The reply appears under the message in Telegram. The simulator is the only gesture test available without hardware, so say "simulator only" in the submission.

## Packaging the glasses app

1. Add the API address to the whitelist in `apps/g2/app.json` (next to `http://localhost:3001`).
2. Build with the address baked in:
   ```bash
   VITE_API_URL=https://<api address> pnpm --filter @greenlight/g2 ehpk
   ```
3. The package is `apps/g2/out/greenlight.ehpk`.

## Gmail and Calendar later

Follow [SETUP.md](SETUP.md) for Google Cloud. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `GOOGLE_REDIRECT_URI` (`https://<api address>/auth/google/callback`) on the API, then connect from the dashboard Connect page.

## If something fails

| Symptom | Check |
|---|---|
| Build fails on `pnpm` | The build command installs pnpm 10 itself; check the build log for the first error line |
| `/health` does not answer | The free service may be waking up (about a minute); then check the service logs |
| Dashboard says it cannot reach the API | `NEXT_PUBLIC_API_URL` on the web service, then redeploy; `CORS_ORIGIN` on the API |
| `pnpm webhook` says Telegram refused | The token is wrong or was revoked; check it in BotFather |
| A group message makes no card | Privacy mode must be disabled and the bot re-added; check the webhook with `getWebhookInfo` |
