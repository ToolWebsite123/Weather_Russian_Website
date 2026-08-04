export default function CityLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 bg-slate-800/60 rounded-xl w-48" />
      <div className="h-4 bg-slate-800/40 rounded-lg w-72" />

      {/* Main weather card skeleton */}
      <div className="h-64 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="h-16 w-32 bg-slate-800 rounded-2xl" />
            <div className="h-5 w-40 bg-slate-800 rounded-lg" />
          </div>
          <div className="h-20 w-20 bg-slate-800 rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
          <div className="h-10 bg-slate-800/60 rounded-xl" />
          <div className="h-10 bg-slate-800/60 rounded-xl" />
          <div className="h-10 bg-slate-800/60 rounded-xl" />
          <div className="h-10 bg-slate-800/60 rounded-xl" />
        </div>
      </div>

      {/* Forecast grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-44 bg-slate-900/60 border border-slate-800 rounded-2xl" />
        <div className="h-44 bg-slate-900/60 border border-slate-800 rounded-2xl" />
        <div className="h-44 bg-slate-900/60 border border-slate-800 rounded-2xl" />
      </div>
    </div>
  );
}
