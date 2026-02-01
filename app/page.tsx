import Link from "next/link";
import {
  preAuthRequests,
  fraudAlerts,
  complianceRules,
  formatCurrency,
  getHospital,
  getPolicyHolder,
} from "@/lib/data";
import { currentTpa } from "@/lib/tpa";
import { PreAuthStatusBadge, FraudSeverityBadge } from "./components/StatusBadge";
import { RxPayLogo } from "./components/RxPayLogo";

export default function DashboardPage() {
  const awaitingDocs = preAuthRequests.filter((p) => p.status === "awaiting_docs" || p.status === "submitted").length;
  const underReview = preAuthRequests.filter((p) => p.status === "under_review").length;
  const openFraud = fraudAlerts.filter((f) => f.status === "open" || f.status === "under_investigation").length;
  const compliantRules = complianceRules.filter((r) => r.status === "compliant").length;
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-8 py-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{currentTpa.name} Copilot</h1>
              <p className="mt-0.5 text-sm text-slate-500">{currentTpa.tagline}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white px-6 py-5 shadow-sm">
          <p className="text-lg leading-relaxed text-slate-700 md:text-xl">
            {awaitingDocs} pre-auth{awaitingDocs !== 1 ? "s" : ""} awaiting docs, {underReview} under review, {openFraud} open fraud alert{openFraud !== 1 ? "s" : ""}, and {compliantRules}/{complianceRules.length} compliance rules up to date. Use the cards below to drill into each area.
          </p>
        </div>
      </header>

      <div className="p-8">
        {/* KPI cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/pre-auth"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Pre-Auth Awaiting Docs</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{awaitingDocs}</p>
                <p className="mt-1 text-xs text-slate-400">AI can flag missing items</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Link>
          <Link
            href="/pre-auth"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Under Review</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{underReview}</p>
                <p className="mt-1 text-xs text-slate-400">Ready for decision</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </Link>
          <Link
            href="/fraud"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Open Fraud Alerts</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{openFraud}</p>
                <p className="mt-1 text-xs text-slate-400">AI-detected duplicates & anomalies</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </Link>
          <Link
            href="/compliance"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Compliance Rules</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{compliantRules}/{complianceRules.length}</p>
                <p className="mt-1 text-xs text-slate-400">IRDAI aligned</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Pre-Auth queue snapshot */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Pre-Auth Queue</h2>
              <Link href="/pre-auth" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                View all
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {preAuthRequests.slice(0, 3).map((pa) => {
                const hospital = getHospital(pa.hospitalId);
                const holder = getPolicyHolder(pa.policyHolderId);
                return (
                  <Link
                    key={pa.id}
                    href={`/pre-auth/${pa.id}`}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{pa.procedure}</p>
                      <p className="text-sm text-slate-500">
                        {holder?.name} · {hospital?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-700">{formatCurrency(pa.estimatedAmount)}</span>
                      <PreAuthStatusBadge status={pa.status} />
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {pa.aiReadinessScore}%
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Fraud alerts snapshot */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Fraud Alerts</h2>
              <Link href="/fraud" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                View all
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {fraudAlerts.slice(0, 3).map((f) => (
                <Link
                  key={f.id}
                  href="/fraud"
                  className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900 capitalize">{f.type.replace(/_/g, " ")}</p>
                    <p className="text-sm text-slate-500 line-clamp-1">{f.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FraudSeverityBadge severity={f.severity} />
                    <span className="text-xs text-slate-400">{f.aiConfidence}% conf.</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
