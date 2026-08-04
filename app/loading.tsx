export default function RootLoading() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 font-medium animate-pulse text-sm">
        Загрузка погоды...
      </p>
    </div>
  );
}
