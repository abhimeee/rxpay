import Link from "next/link";
import { preAuthRequests, complianceRules } from "@/lib/data";
import { getWorkflowData } from "@/lib/workflow-data";
import { PageHeader } from "./components/PageHeader";

export default function DashboardPage() {
  const awaitingDocs = preAuthRequests.filter((p) => p.status === "awaiting_docs" || p.status === "submitted").length;
  const underReview = preAuthRequests.filter((p) => p.status === "under_review").length;
  const suspectedFraud = preAuthRequests.filter((p) => {
    const workflowData = getWorkflowData(p.id);
    return workflowData?.fraudFlags.some((flag) => flag.severity === "high" || flag.severity === "medium");
  }).length;
  const compliantRules = complianceRules.filter((r) => r.status === "compliant").length;
  const totalRequests = preAuthRequests.length;
  const autoTriage = preAuthRequests.filter((p) => p.aiReadinessScore >= 85).length;
  const avgReadiness = Math.round(
    preAuthRequests.reduce((sum, p) => sum + p.aiReadinessScore, 0) / Math.max(totalRequests, 1),
  );
  const complianceRate = Math.round((compliantRules / Math.max(complianceRules.length, 1)) * 100);
  const fraudSignals = preAuthRequests.reduce((sum, p) => {
    const workflowData = getWorkflowData(p.id);
    return sum + (workflowData?.fraudFlags.length ?? 0);
  }, 0);
  const missingDocs = preAuthRequests.reduce((sum, p) => sum + p.missingCritical.length, 0);
  const insightsCaptured = fraudSignals + missingDocs;
  const timeSavedMinutes = Math.round(preAuthRequests.reduce((sum, p) => sum + (p.aiReadinessScore / 100) * 25, 0));
  const avgTimeSavedMinutes = Math.round(timeSavedMinutes / Math.max(totalRequests, 1));
  const autoTriageRate = Math.round((autoTriage / Math.max(totalRequests, 1)) * 100);
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader />

      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-6 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-300">Executive Overview</p>
              <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
                RxPay keeps pre-auth moving with measurable efficiency.
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-200 md:text-base">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-white shadow-sm">
                  {totalRequests} active requests
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200">
                  {awaitingDocs} waiting on docs
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200">
                  {underReview} under review
                </span>
                <span className="rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-1 text-sm text-amber-100">
                  {suspectedFraud} risk flags requiring attention
                </span>
                <span className="rounded-full border border-emerald-200/30 bg-emerald-300/10 px-3 py-1 text-sm text-emerald-100">
                  Compliance coverage {complianceRate}% today
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-300">Avg Time Saved Per Claim</p>
              <p className="metric-rise mt-2 text-3xl font-semibold text-white">47 mins</p>
              <p className="mt-1 text-xs text-slate-300">Based on Copilot readiness scores</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Cases in Motion</p>
            <p className="metric-rise mt-2 text-2xl font-semibold text-slate-900">{totalRequests}</p>
            <p className="mt-2 text-xs text-slate-400">{awaitingDocs} awaiting docs · {underReview} under review</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Auto-Triaged by Copilot</p>
            <p className="metric-rise mt-2 text-2xl font-semibold text-slate-900">{autoTriageRate}%</p>
            <p className="mt-2 text-xs text-slate-400">{autoTriage} of {totalRequests} cases pre-scored</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Insights Captured</p>
            <p className="metric-rise mt-2 text-2xl font-semibold text-slate-900">{insightsCaptured}</p>
            <p className="mt-2 text-xs text-slate-400">{fraudSignals} risk flags · {missingDocs} missing-doc insights</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Compliance Health</p>
            <p className="metric-rise mt-2 text-2xl font-semibold text-slate-900">{complianceRate}%</p>
            <p className="mt-2 text-xs text-slate-400">{compliantRules}/{complianceRules.length} rules aligned</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Operational Efficiency</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Live metrics</span>
            </div>
            <div className="mt-6 space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Auto-triage coverage</span>
                  <span className="font-semibold text-slate-900">{autoTriageRate}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="metric-fill h-2 rounded-full bg-teal-500" style={{ width: `${autoTriageRate}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Average readiness score</span>
                  <span className="font-semibold text-slate-900">{avgReadiness}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="metric-fill h-2 rounded-full bg-indigo-500" style={{ width: `${avgReadiness}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Compliance coverage</span>
                  <span className="font-semibold text-slate-900">{complianceRate}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="metric-fill h-2 rounded-full bg-emerald-500" style={{ width: `${complianceRate}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Signal Intelligence</h3>
            <p className="mt-2 text-sm text-slate-500">Copilot flags and workflow signals, summarized for quick decisions.</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Risk flags</p>
                <p className="metric-rise mt-1 text-xl font-semibold text-slate-900">{suspectedFraud}</p>
                <p className="text-xs text-slate-500">Medium or high severity signals</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Documentation gaps</p>
                <p className="metric-rise mt-1 text-xl font-semibold text-slate-900">{awaitingDocs}</p>
                <p className="text-xs text-slate-500">Cases waiting on missing uploads</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Ready for decision</p>
                <p className="metric-rise mt-1 text-xl font-semibold text-slate-900">{underReview}</p>
                <p className="text-xs text-slate-500">Analyst reviews queued</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
