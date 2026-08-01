import Link from "next/link";
import { PageShell } from "@/components/SiteChrome";
import { ru } from "@/lib/i18n/ru";

export default function NotFound() {
  return (
    <PageShell>
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-serif text-3xl text-sky-950">Город не найден</h1>
        <p className="mt-3 text-cloud-600">
          Попробуйте другой запрос или вернитесь на главную.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-sky-700 px-5 py-3 text-white hover:bg-sky-800"
        >
          {ru.brand}
        </Link>
      </main>
    </PageShell>
  );
}
