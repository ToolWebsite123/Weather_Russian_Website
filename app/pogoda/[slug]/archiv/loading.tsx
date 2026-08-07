export default function ArchiveLoading() {
  return (
    <div className="min-h-screen max-w-5xl mx-auto space-y-6 p-4 sm:p-6 sm:py-8 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 bg-sky-100/80 rounded-xl w-64" />
      <div className="h-4 bg-sky-100/50 rounded-lg w-96" />

      {/* Main card skeleton */}
      <div className="h-48 bg-white border border-sky-100 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-sky-100/70 rounded-xl" />
          <div className="h-4 w-72 bg-sky-100/40 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-sky-100">
          <div className="h-16 bg-sky-50 rounded-xl" />
          <div className="h-16 bg-sky-50 rounded-xl" />
          <div className="h-16 bg-sky-50 rounded-xl" />
          <div className="h-16 bg-sky-50 rounded-xl" />
          <div className="h-16 bg-sky-50 rounded-xl" />
        </div>
      </div>

      {/* Normals table skeleton */}
      <div className="h-64 bg-white border border-sky-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="h-6 w-56 bg-sky-100/70 rounded-lg" />
        <div className="h-40 bg-sky-50/60 rounded-xl" />
      </div>
    </div>
  );
}
