import { describe, it, expect } from "vitest";
import { isValidPushEndpoint } from "@/lib/notifications/validator";

describe("Push Endpoint SSRF Validation", () => {
  it("allows valid Google FCM endpoint", () => {
    const url = "https://fcm.googleapis.com/fcm/send/eXampleToken123";
    expect(isValidPushEndpoint(url)).toBe(true);
  });

  it("allows valid Mozilla Push endpoint", () => {
    const url = "https://updates.push.services.mozilla.com/wpush/v2/gAAAAAB1234";
    expect(isValidPushEndpoint(url)).toBe(true);
  });

  it("allows valid Apple APNs / WNS / Windows Push endpoints", () => {
    expect(isValidPushEndpoint("https://push.apple.com/v1/device/token")).toBe(true);
    expect(isValidPushEndpoint("https://notify.windows.com/?token=abc")).toBe(true);
    expect(isValidPushEndpoint("https://sub.wns.windows.com/send")).toBe(true);
  });

  it("rejects non-whitelisted domain", () => {
    expect(isValidPushEndpoint("https://evil-attacker.com/steal-data")).toBe(false);
    expect(isValidPushEndpoint("https://169.254.169.254/latest/meta-data")).toBe(false);
    expect(isValidPushEndpoint("https://fcm.googleapis.com.attacker.com/send")).toBe(false);
  });

  it("rejects non-https protocol", () => {
    expect(isValidPushEndpoint("http://fcm.googleapis.com/fcm/send/123")).toBe(false);
  });

  it("rejects malformed URL", () => {
    expect(isValidPushEndpoint("not-a-url")).toBe(false);
    expect(isValidPushEndpoint("")).toBe(false);
    // @ts-expect-error testing invalid input types
    expect(isValidPushEndpoint(null)).toBe(false);
  });
});
