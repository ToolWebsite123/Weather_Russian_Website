"use client";

import { useEffect } from "react";

export function AutoScrollTarget({ targetId }: { targetId: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [targetId]);

  return null;
}
