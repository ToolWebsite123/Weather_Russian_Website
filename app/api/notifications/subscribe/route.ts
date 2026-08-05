import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

function ensureSession(): { sessionId: string; setCookie: boolean } {
  const store = cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) return { sessionId: existing, setCookie: false };
  return { sessionId: crypto.randomUUID(), setCookie: true };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint, keys } = body ?? {};

    if (!endpoint || typeof endpoint !== "string" || !endpoint.startsWith("http")) {
      return NextResponse.json(
        { error: "Valid HTTP(S) subscription endpoint required" },
        { status: 400 }
      );
    }

    const p256dh = typeof keys?.p256dh === "string" ? keys.p256dh : "";
    const auth = typeof keys?.auth === "string" ? keys.auth : "";

    if (!p256dh || !auth) {
      return NextResponse.json(
        { error: "Subscription keys (p256dh and auth) are required" },
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
