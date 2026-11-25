import { describe, expect, it } from "vitest";
import { mp3Seconds, narrate, parseEnvFile, report, speak, validate, type NarrationConfig } from "./narrate";

const cfg: NarrationConfig = { voice_id: "v1", scenes: [{ id: "01", target_seconds: 2, text: "Hello." }, { id: "02", target_seconds: 2, text: "World." }] };
const audio = (bytes: number) => (async () => new Response(new Uint8Array(bytes), { status: 200 })) as typeof fetch;

describe("narrate helpers", () => {
  it("mp3Seconds uses 128 kbit/s", () => expect(mp3Seconds(32000)).toBe(2));
  it("parseEnvFile reads quoted and plain values and ignores junk", () =>
    expect(parseEnvFile('# c\nA=1\nB="two"\nnot a line\n')).toEqual({ A: "1", B: "two" }));
  it("validate rejects a placeholder voice, empty, duplicate and bad ids", () => {
    expect(() => validate({ ...cfg, voice_id: "TODO_pick" })).toThrow("voice_id");
    expect(() => validate({ ...cfg, scenes: [] })).toThrow("no scenes");
    expect(() => validate({ ...cfg, scenes: [cfg.scenes[0]!, cfg.scenes[0]!] })).toThrow("Duplicate");
    expect(() => validate({ ...cfg, scenes: [{ id: "1", target_seconds: 1, text: "x" }] })).toThrow("two digits");
    expect(() => validate({ ...cfg, scenes: [{ id: "01", target_seconds: 1, text: " " }] })).toThrow("no text");
    expect(() => validate(cfg)).not.toThrow();
  });
});

describe("speak", () => {
  it("posts text and model with the key header, asking for 128 kbit/s mp3", async () => {
    let url = "", init: RequestInit | undefined;
    const f = (async (u: string, i?: RequestInit) => { url = u; init = i; return new Response(new Uint8Array(3)); }) as typeof fetch;
    const out = await speak("KEY", "v 1", "Hi", undefined, f);
    expect(out.byteLength).toBe(3);
    expect(url).toContain("/text-to-speech/v%201");
    expect(url).toContain("output_format=mp3_44100_128");
    expect((init!.headers as Record<string, string>)["xi-api-key"]).toBe("KEY");
    expect(JSON.parse(init!.body as string)).toEqual({ text: "Hi", model_id: "eleven_multilingual_v2" });
  });
  it("errors never contain the key", async () => {
    const e1 = await speak("SECRETKEY", "v", "x", undefined, (async () => new Response("bad", { status: 401 })) as typeof fetch).catch((e: Error) => e);
    const e2 = await speak("SECRETKEY", "v", "x", undefined, (async () => new Response("bad", { status: 500 })) as typeof fetch).catch((e: Error) => e);
    expect((e1 as Error).message).toContain("rejected");
    expect((e2 as Error).message).toContain("500");
    expect((e1 as Error).message + (e2 as Error).message).not.toContain("SECRETKEY");
  });
});

describe("narrate", () => {
  it("writes one file per scene and totals the length", async () => {
    const files: string[] = [];
    const r = await narrate(cfg, "k", "/out", { f: audio(32000), write: (p) => files.push(p) });
    expect(files).toEqual(["/out/01.mp3", "/out/02.mp3"]);
    expect(r.total).toBe(4);
  });
  it("report flags a total over the limit and long scenes", () => {
    expect(report({ scenes: [{ id: "01", seconds: 10, target: 2 }], total: 10 })).toContain("LONG");
    expect(report({ scenes: [], total: 200 })).toContain("OVER");
    expect(report({ scenes: [], total: 100 })).toContain("within");
  });
  it("stops on the first API failure without writing partial files", async () => {
    const files: string[] = [];
    await expect(narrate(cfg, "k", "/o", { f: (async () => new Response("x", { status: 500 })) as typeof fetch, write: (p) => files.push(p) })).rejects.toThrow("500");
    expect(files).toEqual([]);
  });
});
