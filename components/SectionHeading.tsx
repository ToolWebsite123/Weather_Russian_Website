import React from "react";

export function SectionHeading({
  children,
  className = "",
  action,
}: {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="h-5 w-1 shrink-0 rounded-full bg-gradient-to-b from-sky-400 to-sky-600"
          aria-hidden="true"
        />
        <h2 className={`font-serif text-h2 font-semibold text-sky-950 truncate ${className}`}>
          {children}
        </h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
