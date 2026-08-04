"use client";

import { useEffect, useState } from "react";

export function NotificationPrompt() {
  const [status, setStatus] = useState<"default" | "granted" | "denied" | "unsupported">("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    setStatus(Notification.permission as "default" | "granted" | "denied");
  }, []);

  async function handleToggle() {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    try {
      setLoading(true);
      const perm = await Notification.requestPermission();
      setStatus(perm as "default" | "granted" | "denied");

      if (perm === "granted") {
        // Register or obtain existing service worker subscription if available
        let subscriptionData = {
          endpoint: `https://push.browser.placeholder/${Date.now()}`,
          keys: { p256dh: "", auth: "" },
        };

        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready.catch(() => null);
          if (reg && "pushManager" in reg) {
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
              const json = sub.toJSON();
              subscriptionData = {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: json.keys?.p256dh ?? "",
                  auth: json.keys?.auth ?? "",
                },
              };
            }
          }
        }

        await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscriptionData),
        }).catch(() => null);
      }
    } finally {
      setLoading(false);
    }
  }

  if (status === "unsupported") return null;

  return (
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
      <span>{status === "granted" ? "🔔" : "🔔"}</span>
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
  );
}
