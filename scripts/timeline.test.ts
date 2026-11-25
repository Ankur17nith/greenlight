import { describe, expect, it } from "vitest";
// @ts-expect-error plain .mjs module shared with the render script
import { buildCaptions, buildTimeline, srtTime, toSrt } from "../video/src/timeline.mjs";

const scenes = [{ id: "01", text: "One. Two." }, { id: "02", text: "Three." }];

describe("film timeline", () => {
  it("places each scene after the previous one with lead and gap air", () => {
    const { scenes: s, total } = buildTimeline(scenes, [4, 2]);
    expect(s[0]).toMatchObject({ id: "1", start: 0, voiceAt: 0.5, len: 5.3 });
    expect(s[1].start).toBeCloseTo(5.3);
    expect(total).toBeCloseTo(5.3 + 0.5 + 2 + 1.6);
  });
  it("rejects a film over 3 minutes and mismatched inputs", () => {
    expect(() => buildTimeline(scenes, [100, 100])).toThrow("limit");
    expect(() => buildTimeline(scenes, [1])).toThrow("One duration");
  });
  it("splits captions by sentence and covers the voice exactly", () => {
    const { scenes: s } = buildTimeline(scenes, [4, 2]);
    const c = buildCaptions(s);
    expect(c.map((x: { text: string }) => x.text)).toEqual(["One.", "Two.", "Three."]);
    expect(c[0].t0).toBeCloseTo(0.5);
    expect(c[1].t1).toBeCloseTo(4.5);
  });
  it("formats SRT times and blocks", () => {
    expect(srtTime(3661.5)).toBe("01:01:01,500");
    expect(toSrt([{ t0: 0, t1: 1, text: "Hi." }])).toBe("1\n00:00:00,000 --> 00:00:01,000\nHi.\n");
  });
});
