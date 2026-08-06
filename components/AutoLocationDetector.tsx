"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AutoLocationDetector() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if auto-geolocation was already performed in this session
    if (typeof window === "undefined") return;
    const sessionDone = sessionStorage.getItem("auto_geo_done");
    if (sessionDone === "true") return;

    // Mark session as auto-geolocated to prevent repeating loops
    sessionStorage.setItem("auto_geo_done", "true");

    async function processCoords(lat: number, lon: number) {
      try {
        const res = await fetch(`/api/geo?lat=${lat}&lon=${lon}`);
        if (!res.ok) return;
        const data = (await res.json()) as { slug: string };
        if (data?.slug) {
          // Set cookie for last_city
          document.cookie = `last_city=${data.slug}; path=/; max-age=31536000; SameSite=Lax`;
          
          // If on homepage (/), redirect to user's local weather page
          if (pathname === "/") {
            router.push(`/pogoda/${data.slug}`);
          }
        }
      } catch {
        // Ignore background geo errors
      }
    }

    // 1. Try GPS Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          processCoords(pos.coords.latitude, pos.coords.longitude);
        },
        async () => {
          // 2. Fallback to free IP Geolocation API if GPS is denied or unavailable
          try {
            const ipRes = await fetch("https://ipapi.co/json/").catch(() => null);
            if (ipRes && ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData.latitude && ipData.longitude) {
                processCoords(ipData.latitude, ipData.longitude);
              }
            }
          } catch {
            // Ignore IP fallback errors
          }
        },
        { enableHighAccuracy: false, timeout: 6000 }
      );
    }
  }, [pathname, router]);

  return null;
}
