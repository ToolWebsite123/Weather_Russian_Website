import { PageShell } from "@/components/SiteChrome";

export default function RootLoading() {
  return (
    <PageShell>
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:space-y-8 sm:py-8 sm:px-6">
        <div className="h-64 w-full rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-sky-100 backdrop-blur animate-pulse flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-sky-100 rounded" />
            <div className="h-8 w-64 bg-sky-100 rounded" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-sky-100 rounded-full" />
            <div className="h-12 w-32 bg-sky-100 rounded" />
          </div>
          <div className="h-12 w-full bg-sky-50 rounded-xl" />
        </div>
      </main>
    </PageShell>
  );
}
