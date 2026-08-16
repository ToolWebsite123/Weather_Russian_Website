import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { isValidPushEndpoint } from "@/lib/notifications/validator";

function ensureSession(): { sessionId: string; setCookie: boolean } {
  const store = cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) return { sessionId: existing, setCookie: false };
  return { sessionId: crypto.randomUUID(), setCookie: true };
}

export async function POST(req: NextRequest) {
  const rateLimit = await checkRateLimit(req, { maxRequests: 10, windowMs: 60 * 1000 });
  if (!rateLimit.success) return rateLimitResponse();

  try {
    const body = await req.json();
    const { endpoint, keys } = body ?? {};

    if (!isValidPushEndpoint(endpoint)) {
      return NextResponse.json(
        { error: "Invalid subscription request" },
        { status: 400 }
      );
    }

    const p256dh = typeof keys?.p256dh === "string" ? keys.p256dh : "";
    const auth = typeof keys?.auth === "string" ? keys.auth : "";

    if (!p256dh || !auth) {
      return NextResponse.json(
        { error: "Invalid subscription request" },
        { status: 400 }
      );
    }

    const { sessionId, setCookie } = ensureSession();

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        sessionId,
        p256dh,
        auth,
      },
      create: {
        sessionId,
        endpoint,
        p256dh,
        auth,
      },
    });

    const res = NextResponse.json({ ok: true, subscribed: true });
    if (setCookie) res.cookies.set(sessionCookieOptions(sessionId));
    return res;
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json(
      { error: "Push subscription failed" },
      { status: 500 }
    );
  }
}

