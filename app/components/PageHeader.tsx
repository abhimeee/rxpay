import Image from "next/image";
import Link from "next/link";
import { currentTpa } from "@/lib/tpa";

export function PageHeader({
  title,
  subtitle,
  titleVariant = "default",
}: {
  title?: string;
  subtitle?: string;
  titleVariant?: "default" | "navy";
}) {
  const isNavyTitle = titleVariant === "navy";
  return (
    <header className="border-b border-slate-200 bg-white px-8 py-5">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm hover:border-teal-500/30 hover:shadow-md transition-all group">
            <Image src="/logo/rxpay.png" alt="RxPay" width={96} height={40} className="h-9 w-auto" />
            <span className="h-7 w-px bg-slate-200 group-hover:bg-teal-200 transition-colors" aria-hidden="true" />
            <Image src="/logo/akna.png" alt={`${currentTpa.name} logo`} width={96} height={40} className="h-9 w-auto" />
          </Link>
          <div>
            <p className="mt-1 text-base font-semibold tracking-wide text-slate-600 md:text-lg">
              {currentTpa.tagline}
            </p>
          </div>
        </div>
        <div className="relative">
          <details className="group">
            <summary className="list-none cursor-pointer rounded-full border border-slate-200 bg-white p-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <span className="sr-only">Pages</span>
                <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                  <path d="M4 20a8 8 0 0116 0v1H4v-1z" />
                </svg>
                <svg className="h-4 w-4 text-slate-500 transition group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.85a.75.75 0 111.08 1.04l-4.25 4.41a.75.75 0 01-1.08 0l-4.25-4.41a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </span>
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1 shadow-lg opacity-0 invisible translate-y-2 transition group-open:opacity-100 group-open:visible group-open:translate-y-0">
              <Link
                href="/"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                href="/pre-auth"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Pre-Auth Hub
              </Link>
              <Link
                href="/compliance"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Compliance
              </Link>
            </div>
          </details>
        </div>
      </div>
      {title && (
        <div
          className={
            isNavyTitle
              ? "mt-6 rounded-2xl bg-slate-900 px-6 py-4 shadow-sm"
              : "mt-6 border-t border-slate-100 pt-4"
          }
        >
          <h2
            className={
              isNavyTitle
                ? "text-2xl font-semibold text-slate-50 md:text-3xl"
                : "text-xl font-semibold text-slate-900"
            }
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              className={
                isNavyTitle ? "mt-2 text-base text-slate-200 md:text-lg" : "mt-1 text-sm text-slate-500"
              }
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      )}
    </header>
  );
}
