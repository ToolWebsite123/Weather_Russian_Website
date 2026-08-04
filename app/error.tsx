"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error("Unhandled Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-slate-800/80 border border-slate-700/60 rounded-2xl p-8 shadow-2xl backdrop-blur">
        <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          ⚠️
        </div>
        <h2 className="text-xl font-bold mb-2">Произошла ошибка</h2>
        <p className="text-slate-400 text-sm mb-6">
          Не удалось загрузить данные погоды. Пожалуйста, попробуйте обновить страницу.
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-3 px-6 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/20 active:scale-95"
        >
          Повторить попытку
        </button>
      </div>
    </div>
  );
}
