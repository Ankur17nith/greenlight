import { describe, expect, it } from "vitest";
import { decrypt, encrypt } from "./crypto.ts";

describe("crypto", () => {
  it("round-trips", () => expect(decrypt(encrypt("refresh-token", "s"), "s")).toBe("refresh-token"));
  it("does not contain the plaintext", () => expect(Buffer.from(encrypt("refresh-token", "s"), "base64").toString("utf8")).not.toContain("refresh-token"));
  it("uses a fresh IV each time", () => expect(encrypt("x", "s")).not.toBe(encrypt("x", "s")));
  it("rejects a wrong secret", () => expect(() => decrypt(encrypt("x", "a"), "b")).toThrow());
  it("rejects tampering", () => {
    const b = Buffer.from(encrypt("hello", "s"), "base64"); b[b.length - 1]! ^= 1;
    expect(() => decrypt(b.toString("base64"), "s")).toThrow();
  });
});
