import { describe, expect, it } from "vitest";
import { OsEventTypeList as T } from "@evenrealities/even_hub_sdk";
import { toGesture } from "./gestures";

describe("toGesture", () => {
  it("maps each documented event", () => {
    expect(toGesture({ textEvent: { eventType: T.CLICK_EVENT } })).toBe("tap");
    expect(toGesture({ sysEvent: { eventType: T.DOUBLE_CLICK_EVENT } })).toBe("double");
    expect(toGesture({ sysEvent: { eventType: T.LONG_PRESS_EVENT } })).toBe("hold");
    expect(toGesture({ listEvent: { eventType: T.SCROLL_BOTTOM_EVENT } })).toBe("next");
    expect(toGesture({ textEvent: { eventType: T.SCROLL_TOP_EVENT } })).toBe("prev");
  });
  it("treats a missing eventType as a click (protobuf zero value)", () =>
    expect(toGesture({ sysEvent: {} })).toBe("tap"));
  it("accepts string names from the host", () =>
    expect(toGesture({ sysEvent: { eventType: "DOUBLE_CLICK_EVENT" } })).toBe("double"));
  it("ignores lifecycle, IMU and long-press release", () => {
    expect(toGesture({ sysEvent: { eventType: T.FOREGROUND_EXIT_EVENT } })).toBeNull();
    expect(toGesture({ sysEvent: { eventType: T.IMU_DATA_REPORT } })).toBeNull();
    expect(toGesture({ sysEvent: { eventType: T.LONG_PRESS_RELEASE_EVENT } })).toBeNull();
  });
  it("ignores events with no payload", () => expect(toGesture({})).toBeNull());
});
