"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ru } from "@/lib/i18n/ru";

export function FavoriteButton({
  cityId,
  initialFavorited,
}: {
  cityId: number;
  initialFavorited: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const method = favorited ? "DELETE" : "POST";
      const res = await fetch("/api/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId }),
      });
      if (!res.ok) return;
      setFavorited(!favorited);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className="rounded-xl border border-cloud-200 bg-white/80 px-3 py-2 text-sm font-medium text-sky-900 transition hover:border-sun-400 hover:bg-sun-50 disabled:opacity-60"
    >
      {favorited ? ru.removeFavorite : ru.addFavorite}
    </button>
  );
}
