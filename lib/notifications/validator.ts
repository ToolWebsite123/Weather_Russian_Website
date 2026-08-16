const ALLOWED_PUSH_DOMAINS = [
  "fcm.googleapis.com",
  "updates.push.services.mozilla.com",
  "push.apple.com",
  "notify.windows.com",
  "wns.windows.com",
];

/**
 * Validates push notification service endpoints against a strict allowlist
 * of legitimate Web Push provider domains to prevent SSRF vulnerabilities.
 */
export function isValidPushEndpoint(endpointStr: string): boolean {
  if (!endpointStr || typeof endpointStr !== "string") return false;
  try {
    const url = new URL(endpointStr);
    if (url.protocol !== "https:") return false;
    const hostname = url.hostname.toLowerCase();
    return ALLOWED_PUSH_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}
