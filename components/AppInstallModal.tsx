"use client";

export function AppInstallModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Закрыть"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-white font-bold text-xl shadow-md">
            ☀️
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Мобильное приложение</h3>
            <p className="text-xs text-slate-5-00">Прогноз погоды всегда под рукой</p>
          </div>
        </div>

        <div className="space-y-3 my-6">
          <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3.5 flex items-start gap-3">
            <span className="text-xl">📱</span>
            <div>
              <h4 className="text-sm font-semibold text-sky-950">Быстрая установка PWA</h4>
              <p className="text-xs text-sky-800 mt-0.5">
                Нажмите «Поделиться» или «На экран «Домой» в вашем браузере, чтобы установить веб-приложение.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Уведомления о погоде</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              Поддерживается
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition-colors shadow-sm"
        >
          Понятно
        </button>
      </div>
    </div>
  );
}
