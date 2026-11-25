import { describe, expect, it } from "vitest";
import { devToken } from "./dev";

describe("devToken", () => {
  it("reads a token in dev", () => expect(devToken("?token=abcd1234efgh", true)).toBe("abcd1234efgh"));
  it("is always null in production", () => expect(devToken("?token=abcd1234efgh", false)).toBeNull());
  it("ignores missing, short or odd tokens", () => {
    expect(devToken("", true)).toBeNull();
    expect(devToken("?token=abc", true)).toBeNull();
    expect(devToken("?token=<script>alert(1)</script>", true)).toBeNull();
  });
});
