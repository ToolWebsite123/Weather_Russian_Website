"use client";

import { useState } from "react";

export function PressureTooltip() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1 text-cloud-400 hover:text-sky-700 transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-cloud-300 text-[10px] font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-400"
        aria-label="Информация о давлении"
        title="Давление приведено к уровню моря"
      >
        i
      </button>

      {isOpen && (
        <span className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 w-48 rounded-lg bg-sky-950 p-2 text-[11px] font-normal text-white shadow-xl z-50 pointer-events-none text-center leading-tight">
          Давление приведено к уровню моря (MSL).
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-sky-950" />
        </span>
      )}
    </span>
  );
}
