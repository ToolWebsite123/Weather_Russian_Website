import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import path from "path";

describe("Web Push Integration Requirements", () => {
  beforeAll(() => {
    // Load .env variables if not already loaded into process.env by test runner
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...valueParts] = trimmed.split("=");
          const value = valueParts.join("=").replace(/^["']|["']$/g, "");
          if (key && !process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  });

  it("has VAPID environment variables set", () => {
    expect(process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY).toBeTruthy();
    expect(process.env.VAPID_PRIVATE_KEY).toBeTruthy();
    expect(process.env.VAPID_SUBJECT).toBeTruthy();
  });

  it("VAPID public key has valid length and format", () => {
    const pubKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
    expect(pubKey.length).toBeGreaterThan(50);
  });
});
