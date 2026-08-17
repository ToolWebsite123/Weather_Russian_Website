import { PageShell } from "@/components/SiteChrome";

export default function CityLoading() {
  return (
    <PageShell>
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-4 sm:space-y-6 sm:py-6 sm:px-6 animate-pulse">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-sky-100/70 rounded-lg w-48" />
          <div className="h-4 bg-sky-100/40 rounded-md w-72" />
        </div>

        {/* Main weather card skeleton */}
        <div className="h-64 bg-white/80 ring-1 ring-sky-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between backdrop-blur">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="h-12 w-32 bg-sky-100/80 rounded-xl" />
              <div className="h-4 w-40 bg-sky-100/50 rounded-md" />
            </div>
            <div className="h-16 w-16 bg-sky-100/60 rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-sky-100">
            <div className="h-10 bg-sky-50 rounded-xl" />
            <div className="h-10 bg-sky-50 rounded-xl" />
            <div className="h-10 bg-sky-50 rounded-xl" />
            <div className="h-10 bg-sky-50 rounded-xl" />
          </div>
        </div>

        {/* Forecast grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-40 bg-white/70 ring-1 ring-sky-100 rounded-2xl shadow-xs" />
          <div className="h-40 bg-white/70 ring-1 ring-sky-100 rounded-2xl shadow-xs" />
          <div className="h-40 bg-white/70 ring-1 ring-sky-100 rounded-2xl shadow-xs" />
        </div>
      </main>
    </PageShell>
  );
}
