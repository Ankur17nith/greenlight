// Resets the cards and replays the demo scenes from video/SCRIPT.md.
// Needs the API running with DEMO_MODE=1. Usage: pnpm seed   (reads API_URL and DASHBOARD_TOKEN)
// Optional real sandbox ids: GMAIL_THREAD_ID, CALENDAR_EVENT_ID.

export async function seed(
  env: Record<string, string | undefined>,
  f: typeof fetch = fetch,
): Promise<string> {
  const base = env.API_URL ?? "http://localhost:3001";
  const token = env.DASHBOARD_TOKEN;
  if (!token) throw new Error("DASHBOARD_TOKEN is not set");
  const body: Record<string, string> = {};
  if (env.GMAIL_THREAD_ID) body.gmailThreadId = env.GMAIL_THREAD_ID;
  if (env.CALENDAR_EVENT_ID) body.calendarEventId = env.CALENDAR_EVENT_ID;
  let res: Response;
  try {
    res = await f(`${base}/api/dev/seed`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(`Cannot reach the API at ${base}`);
  }
  if (res.status === 404) throw new Error("Seeding is off. Start the API with DEMO_MODE=1");
  if (res.status === 401) throw new Error("The dashboard token was not accepted");
  if (!res.ok) throw new Error(`Seed failed (${res.status})`);
  const { created } = (await res.json()) as { created: number };
  return `Seeded ${created} demo cards (Telegram refund, Gmail invoice, Calendar clash).`;
}

import { pathToFileURL } from "node:url";
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seed(process.env).then(
    (m) => console.log(m),
    (e: Error) => { console.error(e.message); process.exit(1); },
  );
}
