"use client";

import { useEffect } from "react";

const COOKIE = "wh_last_city";

export function RememberLastCity({ slug }: { slug: string }) {
  useEffect(() => {
    document.cookie = `${COOKIE}=${encodeURIComponent(slug)};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
  }, [slug]);
  return null;
}

export { COOKIE as LAST_CITY_COOKIE };
