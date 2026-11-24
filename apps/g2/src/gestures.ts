import { OsEventTypeList } from "@evenrealities/even_hub_sdk";
import type { Gesture } from "./controller";

/** Minimal shape of the SDK's EvenHubEvent that we read. */
export interface HubEventLike {
  textEvent?: { eventType?: unknown };
  listEvent?: { eventType?: unknown };
  sysEvent?: { eventType?: unknown };
}

/**
 * Event names come from the SDK's OsEventTypeList (even_hub_sdk 0.0.16 typings):
 * CLICK_EVENT=tap, DOUBLE_CLICK_EVENT=double tap, LONG_PRESS_EVENT=hold,
 * SCROLL_BOTTOM_EVENT=swipe forward, SCROLL_TOP_EVENT=swipe back.
 * UNVERIFIED on device or simulator until D0-3: which of scroll top/bottom is forward.
 */
export function toGesture(e: HubEventLike): Gesture | null {
  const src = e.textEvent ?? e.listEvent ?? e.sysEvent;
  if (!src) return null;
  // Protobuf drops zero values, so a CLICK (0) can arrive with eventType undefined.
  const raw = OsEventTypeList.fromJson(src.eventType) ?? OsEventTypeList.CLICK_EVENT;
  switch (raw) {
    case OsEventTypeList.CLICK_EVENT: return "tap";
    case OsEventTypeList.DOUBLE_CLICK_EVENT: return "double";
    case OsEventTypeList.LONG_PRESS_EVENT: return "hold";
    case OsEventTypeList.SCROLL_BOTTOM_EVENT: return "next";
    case OsEventTypeList.SCROLL_TOP_EVENT: return "prev";
    default: return null; // foreground enter/exit, IMU, long-press release, etc.
  }
}
