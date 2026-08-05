import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { listPopularCities, getCachedWeatherForCity } from "@/lib/weather/cache";
import { getActiveAlerts } from "@/lib/weather/alerts";

function initWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@weatherhub.ru";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are not configured in environment variables");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function GET(req: NextRequest) {
  return handleSendAlerts(req);
}

export async function POST(req: NextRequest) {
  return handleSendAlerts(req);
}

async function handleSendAlerts(req: NextRequest) {
  // 1. Authorize Vercel Cron / Bearer token request
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    initWebPush();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "VAPID key error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const isTestParam = searchParams.get("test") === "true";

    let bodyData: { test?: boolean } = {};
    if (req.method === "POST") {
      try {
        bodyData = await req.json();
      } catch {
        // Empty body fallback
      }
    }

    const isTest = isTestParam || Boolean(bodyData.test);

    // 2. Fetch active push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany();
    if (subscriptions.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "No active push subscriptions found",
        sentCount: 0,
      });
    }

    // Prepare notifications payload list
    const payloads: { title: string; body: string; url: string; tag: string }[] = [];

    if (isTest) {
      // Defense-in-depth: Fixed hardcoded test payload to prevent arbitrary injection
      payloads.push({
        title: "🚨 Тестовое погодное уведомление",
        body: "Проверка работы Web Push уведомлений прошла успешно!",
        url: "/",
        tag: "test-alert",
      });
    } else {
      // 3. Fetch severe weather alerts for popular cities
      const cities = await listPopularCities(10);
      for (const city of cities) {
        try {
          const weather = await getCachedWeatherForCity(city);
          const activeAlerts = getActiveAlerts(weather);
          const severeAlerts = activeAlerts.filter((a) => a.severity === "severe");

          for (const alert of severeAlerts) {
            payloads.push({
              title: `🚨 ${alert.title} — ${city.name}`,
              body: alert.description,
              url: `/city/${city.slug}`,
              tag: `alert-${city.slug}-${Date.now()}`,
            });
          }
        } catch (cityErr) {
          console.error(`Error checking weather for city ${city.name}:`, cityErr);
        }
      }

      if (payloads.length === 0) {
        return NextResponse.json({
          ok: true,
          message: "No severe weather alerts active for monitored cities",
          subscriptionsProcessed: subscriptions.length,
          sentCount: 0,
        });
      }
    }

    let sentCount = 0;
    let failedCount = 0;
    let cleanedCount = 0;

    // 4. Dispatch push notifications
    for (const sub of subscriptions) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      for (const payload of payloads) {
        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
          );
          sentCount++;
        } catch (err: unknown) {
          failedCount++;
          const statusCode = (err as { statusCode?: number }).statusCode;
          // If subscription is expired or unsubscribed (404 Not Found, 410 Gone)
          if (statusCode === 404 || statusCode === 410) {
            try {
              await prisma.pushSubscription.delete({ where: { id: sub.id } });
              cleanedCount++;
            } catch (delErr) {
              console.error("Error deleting stale subscription:", delErr);
            }
          } else {
            console.error(`Failed to send push notification to ${sub.id}:`, err);
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      subscriptionsProcessed: subscriptions.length,
      payloadsCount: payloads.length,
      sentCount,
      failedCount,
      cleanedCount,
    });
  } catch (error: unknown) {
    console.error("Cron send-weather-alerts error:", error);
    return NextResponse.json(
      { error: "Failed to process push notifications cron job" },
      { status: 500 }
    );
  }
}
