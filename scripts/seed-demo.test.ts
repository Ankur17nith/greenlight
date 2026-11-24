import { describe, expect, it } from "vitest";
import { seed } from "./seed-demo";

const resp = (status: number, body: unknown = {}) => (async () => new Response(JSON.stringify(body), { status })) as typeof fetch;

describe("seed", () => {
  it("requires a token", async () => { await expect(seed({}, resp(200))).rejects.toThrow("DASHBOARD_TOKEN"); });
  it("posts to the API with the token and optional sandbox ids", async () => {
    let url = "", init: RequestInit | undefined;
    const f = (async (u: string, i?: RequestInit) => { url = u; init = i; return new Response(JSON.stringify({ created: 3 }), { status: 200 }); }) as typeof fetch;
    const msg = await seed({ DASHBOARD_TOKEN: "t", API_URL: "http://x", GMAIL_THREAD_ID: "T1" }, f);
    expect(url).toBe("http://x/api/dev/seed");
    expect((init!.headers as Record<string, string>).authorization).toBe("Bearer t");
    expect(JSON.parse(init!.body as string)).toEqual({ gmailThreadId: "T1" });
    expect(msg).toContain("Seeded 3");
  });
  it("explains a 404 as demo mode being off", async () => { await expect(seed({ DASHBOARD_TOKEN: "t" }, resp(404))).rejects.toThrow("DEMO_MODE=1"); });
  it("explains a 401", async () => { await expect(seed({ DASHBOARD_TOKEN: "t" }, resp(401))).rejects.toThrow("not accepted"); });
  it("explains an unreachable API", async () => {
    await expect(seed({ DASHBOARD_TOKEN: "t", API_URL: "http://nope" }, (async () => { throw new Error("x"); }) as typeof fetch)).rejects.toThrow("Cannot reach");
  });
});
