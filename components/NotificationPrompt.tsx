"use client";

import { useEffect, useState } from "react";
import { urlBase64ToUint8Array } from "@/lib/notifications/vapid";

export function NotificationPrompt() {
  const [status, setStatus] = useState<"default" | "granted" | "denied" | "unsupported">("default");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus(Notification.permission as "default" | "granted" | "denied");
  }, []);

  async function handleToggle() {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return;

    setErrorMsg(null);
    try {
      setLoading(true);
      const perm = await Notification.requestPermission();
      setStatus(perm as "default" | "granted" | "denied");

      if (perm === "granted") {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not defined");
          setErrorMsg("Ошибка настройки VAPID ключа");
          return;
        }

        // Ensure Service Worker is registered & ready
        let reg = await navigator.serviceWorker.getRegistration("/sw.js");
        if (!reg) {
          reg = await navigator.serviceWorker.register("/sw.js");
        }

        await navigator.serviceWorker.ready;

        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource;
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          });
        }

        const json = sub.toJSON();
        const subscriptionData = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: json.keys?.p256dh ?? "",
            auth: json.keys?.auth ?? "",
          },
        };

        const res = await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscriptionData),
        });

        if (!res.ok) {
          throw new Error(`Subscribe failed with status ${res.status}`);
        }
      }
    } catch (err: unknown) {
      console.error("Failed to subscribe to push notifications:", err);
      setErrorMsg("Ошибка подписки");
    } finally {
      setLoading(false);
    }
  }

  if (status === "unsupported") return null;

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleToggle}
        disabled={loading || status === "granted"}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
          status === "granted"
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default"
            : status === "denied"
            ? "bg-cloud-100 text-cloud-500 cursor-not-allowed"
            : "bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 active:scale-95"
        }`}
        title={
          status === "granted"
            ? "Уведомления включены"
            : status === "denied"
            ? "Уведомления заблокированы в браузере"
            : "Включить уведомления о погоде"
        }
      >
        <span>🔔</span>
        <span>
          {loading
            ? "Подключение..."
            : status === "granted"
            ? "Уведомления включены"
            : status === "denied"
            ? "Уведомления заблокированы"
            : "Уведомления о погоде"}
        </span>
      </button>
      {errorMsg && <span className="text-[10px] text-red-500 pl-1">{errorMsg}</span>}
    </div>
  );
}
