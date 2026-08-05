import { describe, it, expect } from "vitest";
import { urlBase64ToUint8Array } from "../vapid";

describe("Notifications & VAPID Utilities", () => {
  it("converts a base64url string to Uint8Array correctly", () => {
    // Standard test base64url string
    const sampleBase64Url = "BOqTZFlE-GyYIZdUqdoYXBHFTpfjY_CdKhLcKHxEX8qizurZDylqfiK5QxqBLQC_eXNfkQv3uR0J8XPG3bho6F0";
    const uint8Array = urlBase64ToUint8Array(sampleBase64Url);

    expect(uint8Array).toBeInstanceOf(Uint8Array);
    expect(uint8Array.length).toBeGreaterThan(0);
    // Should be 65 bytes for a 65-byte uncompressed EC public key
    expect(uint8Array.length).toBe(65);
  });

  it("handles padding and special base64url characters (- and _)", () => {
    const input = "abc-_def";
    const result = urlBase64ToUint8Array(input);
    expect(result).toBeInstanceOf(Uint8Array);
  });
});
