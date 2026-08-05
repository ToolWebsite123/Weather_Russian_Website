// Service Worker for Push Notifications (WeatherHub)

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  let notificationData = {
    title: "Штормовое предупреждение",
    body: "Получено новое погодное предупреждение.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    url: "/",
  };

  if (event.data) {
    try {
      const json = event.data.json();
      notificationData = {
        ...notificationData,
        ...json,
      };
      if (json.data && json.data.url) {
        notificationData.url = json.data.url;
      }
    } catch {
      const text = event.data.text();
      if (text) {
        notificationData.body = text;
      }
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    data: {
      url: notificationData.url,
    },
    vibrate: [100, 50, 100],
    tag: notificationData.tag || "weather-alert",
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/",
    self.location.origin
  ).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
