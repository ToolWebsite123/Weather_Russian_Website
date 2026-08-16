"use client";

import { useEffect, useState } from "react";

function formatGismeteoDate(timezone?: string) {
  const date = new Date();
  try {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      ...(timezone ? { timeZone: timezone } : {}),
    };
    const formatter = new Intl.DateTimeFormat("ru-RU", options);
    const parts = formatter.formatToParts(date);

    let weekday = "";
    let day = "";
    let month = "";
    let hour = "";
    let minute = "";

    for (const part of parts) {
      if (part.type === "weekday") weekday = part.value;
      if (part.type === "day") day = part.value;
      if (part.type === "month") month = part.value;
      if (part.type === "hour") hour = part.value;
      if (part.type === "minute") minute = part.value;
    }

    if (weekday) {
      weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1).replace(".", "");
    }

    return `${weekday}, ${day} ${month}, ${hour}:${minute}`;
  } catch {
    const weekdays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    const months = [
      "января", "февраля", "марта", "апреля", "мая", "июня",
      "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];
    const wd = weekdays[date.getDay()];
    const d = date.getDate();
    const m = months[date.getMonth()];
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${wd}, ${d} ${m}, ${hh}:${mm}`;
  }
}

export function LiveCityDate({ timezone }: { timezone?: string }) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    setFormattedDate(formatGismeteoDate(timezone));
    const interval = setInterval(() => {
      setFormattedDate(formatGismeteoDate(timezone));
    }, 10000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <p className="text-xs sm:text-sm text-slate-600 mt-0.5 min-h-[1.25rem]" suppressHydrationWarning>
      {formattedDate}
    </p>
  );
}
