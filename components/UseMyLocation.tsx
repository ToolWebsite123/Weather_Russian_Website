"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ru } from "@/lib/i18n/ru";

export function UseMyLocation({
  buttonText,
  className,
}: {
  buttonText?: string;
  className?: string;
} = {}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function locate() {
    setError(null);
    if (!navigator.geolocation) {
      setError("Геолокация недоступна");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        startTransition(async () => {
          const res = await fetch(
            `/api/geo?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`,
          );
          if (!res.ok) {
            setError(ru.errorGeneric);
            return;
          }
          const data = (await res.json()) as { slug: string };
          router.push(`/pogoda/${data.slug}`);
        });
      },
      () => setError("Не удалось определить местоположение"),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={locate}
        disabled={pending}
        className={
          className ||
          "rounded-xl border border-sky-300 bg-white/80 px-4 py-2.5 text-sm font-medium text-sky-800 transition hover:bg-sky-50 disabled:opacity-60"
        }
      >
        {pending ? ru.locating : buttonText || ru.useMyLocation}
      </button>
      {error && <p className="mt-2 text-sm text-sun-700">{error}</p>}
    </div>
  );
}
