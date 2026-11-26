# Deploy to Render

The API and the website go on Render from [render.yaml](../render.yaml). The glasses app is not hosted: it is packaged as an `.ehpk` file.

No model key is needed. The API starts in **rules-only mode** (`POLICY_MODE=rules`): plain code applies your rules, and cards are tagged `RULES`. See [POLICY_GUARD.md](POLICY_GUARD.md#rules-only-mode).

## What it costs

| Part | Plan | Cost |
|---|---|---|
| `greenlight-api` | Starter, with a 1 GB disk (SQLite needs one) | about 7 USD a month plus the disk, billed by the day |
| `greenlight-web` | Free | 0 |

Delete both services after the hackathon to stop billing. If you want 0 cost, see [the free option](#free-option) at the end.

## Steps

1. **Create the Blueprint.** In the Render dashboard choose New, then Blueprint. Connect the GitHub repo `Ankur17nith/greenlight`, branch `main`. Render reads `render.yaml` and lists two services.
2. **Fill the prompts.** Render asks for the values marked `sync: false`.
   - `TELEGRAM_BOT_TOKEN`: the token from BotFather.
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

## Free option

Render's free instances have no disk and sleep after 15 minutes without traffic. That means the database resets on every sleep or redeploy, so you must pair the glasses again and cards disappear. It is fine for a quick look, not for recording the demo. To use it, delete the `disk` block and change `plan: starter` to `plan: free` in `render.yaml`, and leave `SQLITE_PATH` unset.

## If something fails

| Symptom | Check |
|---|---|
| Build fails on `pnpm` | The build command installs pnpm 10 itself; check the build log for the first error line |
| `/health` does not answer | Service logs; the API needs `SQLITE_PATH` on the disk path `/var/data` |
| Dashboard says it cannot reach the API | `NEXT_PUBLIC_API_URL` on the web service, then redeploy; `CORS_ORIGIN` on the API |
| `pnpm webhook` says Telegram refused | The token is wrong or was revoked; check it in BotFather |
| A group message makes no card | Privacy mode must be disabled and the bot re-added; check the webhook with `getWebhookInfo` |
