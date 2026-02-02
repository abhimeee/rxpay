import Link from "next/link";
import {
  preAuthRequests,
  fraudAlerts,
  formatCurrency,
  getHospital,
  getPolicyHolder,
  calculateSLACompliance,
  calculateTotalExposure,
  calculateApprovalRate,
  calculateAverageProcessingTime,
  getOverdueRequests,
  getHighValueRequests,
  calculateAverageAIReadiness,
  calculateDocumentCompleteness,
  getHospitalStats,
  getDailyThroughput,
  getOpenFraudAlerts,
  formatFraudType,
} from "@/lib/data";
import { PageHeader } from "./components/PageHeader";

export default function DashboardPage() {
  // Calculate all metrics
  const slaCompliance = calculateSLACompliance();
  const exposure = calculateTotalExposure();
  const approvalRate = calculateApprovalRate();
  const avgProcessingTime = calculateAverageProcessingTime();
  const overdueRequests = getOverdueRequests();
  const highValueRequests = getHighValueRequests();
  const avgAIReadiness = calculateAverageAIReadiness();
  const docCompleteness = calculateDocumentCompleteness();
  const hospitalStats = getHospitalStats();
  const throughput = getDailyThroughput();
  const fraudData = getOpenFraudAlerts();

  // Active requests (not approved/rejected/draft)
  const activeRequests = preAuthRequests.filter(
    (p) => p.status !== "approved" && p.status !== "rejected" && p.status !== "draft"
  );
  const awaitingDocs = activeRequests.filter((p) => p.status === "awaiting_docs" || p.status === "submitted").length;
  const underReview = activeRequests.filter((p) => p.status === "under_review").length;
  const readyForDecision = activeRequests.filter((p) => p.aiReadinessScore >= 85).length;


  // Get recent pre-auth requests (top 5)
  const recentPreAuth = [...preAuthRequests]
    .filter((p) => p.status !== "approved" && p.status !== "rejected" && p.status !== "draft")
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  // Get recent fraud alerts (top 5)
  const recentFraudAlerts = [...fraudAlerts]
    .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
    .slice(0, 5);

  // Determine system health summary
  const healthLabel = overdueRequests.length > 0 || slaCompliance.percentage < 75
    ? "Critical Action Required"
    : slaCompliance.percentage < 90 || fraudData.highSeverity > 0
      ? "Attention Needed"
      : "All Systems Healthy";

  const summaryText = `${activeRequests.length} active pre-auth requests, ${overdueRequests.length} overdue, ${readyForDecision} ready for decision, ${fraudData.highSeverity} high-severity fraud alerts, and ${slaCompliance.percentage}% SLA compliance.`;

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Manager Dashboard"
        subtitle={summaryText}
      />

      <div className="p-8 space-y-8">
        {/* Simple Health Status Banner */}
        <div className={`rounded-xl border px-4 py-3 flex items-center justify-between ${healthLabel === "All Systems Healthy"
          ? "border-emerald-200 bg-emerald-50/50 text-emerald-800"
          : healthLabel === "Attention Needed"
            ? "border-amber-200 bg-amber-50/50 text-amber-800"
            : "border-red-200 bg-red-50/50 text-red-800"
          }`}>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
            <span className={`h-2.5 w-2.5 rounded-full ${healthLabel === "All Systems Healthy" ? "bg-emerald-500" : healthLabel === "Attention Needed" ? "bg-amber-500" : "bg-red-500"
              }`} />
            {healthLabel}
          </div>
          <p className="text-xs font-medium opacity-80">
            Last updated: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Primary KPI Grid - Minimal Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Active Pre-Auth Queue */}
          <Link href="/pre-auth" className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Active Queue</p>
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{activeRequests.length}</p>
            <div className="mt-4 flex gap-3 text-xs font-medium">
              <span className="text-amber-600 px-2 py-0.5 rounded-md bg-amber-50">{awaitingDocs} awaiting docs</span>
              <span className="text-blue-600 px-2 py-0.5 rounded-md bg-blue-50">{underReview} under review</span>
            </div>
          </Link>

          {/* Card 2: SLA Compliance */}
          <Link href="/pre-auth" className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">SLA Compliance</p>
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`mt-4 text-3xl font-bold ${slaCompliance.percentage >= 90 ? "text-slate-900" : slaCompliance.percentage >= 75 ? "text-amber-600" : "text-red-600"}`}>
              {slaCompliance.percentage}%
            </p>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full transition-all duration-500 ${slaCompliance.percentage >= 90 ? "bg-teal-600" : slaCompliance.percentage >= 75 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${slaCompliance.percentage}%` }}
              />
            </div>
          </Link>

          {/* Card 3: Financial Exposure */}
          <Link href="/pre-auth" className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Financial Exposure</p>
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{formatCurrency(exposure.total)}</p>
            <p className="mt-4 text-xs font-medium text-slate-400 tracking-wide uppercase">Avg: {formatCurrency(exposure.average)}</p>
          </Link>

          {/* Card 4: Fraud Alerts */}
          <Link href="/fraud" className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Fraud Alerts</p>
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{fraudData.total}</p>
            <div className="mt-4 flex gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${fraudData.highSeverity > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"}`}>
                {fraudData.highSeverity} high severity
              </span>
            </div>
          </Link>


          {/* Card 6: Throughput */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Today&apos;s Throughput</p>
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{throughput.count}</p>
            <p className="mt-4 text-xs font-medium text-emerald-600 uppercase tracking-wide">+{throughput.trend}% vs last week</p>
          </div>
        </div>

        {/* Secondary Metrics Row - Minimal Horizontal Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-l-2 border-slate-200 pl-4 py-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Process Time</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{avgProcessingTime} hrs</p>
          </div>
          <div className="border-l-2 border-slate-200 pl-4 py-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval Rate</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{approvalRate.rate}%</p>
          </div>
          <div className="border-l-2 border-slate-200 pl-4 py-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Readiness</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{avgAIReadiness}%</p>
          </div>
          <div className="border-l-2 border-slate-200 pl-4 py-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doc Completeness</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{docCompleteness}%</p>
          </div>
        </div>

        {/* Critical Items - Restricted Style */}
        {(overdueRequests.length > 0 || highValueRequests.length > 0 || fraudData.highSeverity > 0) && (
          <div className="rounded-xl border border-red-100 bg-red-50/30 p-6">
            <h2 className="text-sm font-bold text-red-900 uppercase tracking-widest mb-4">Critical Review Items</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {overdueRequests.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold text-red-700 uppercase">Overdue Pre-Auth</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{overdueRequests.length}</p>
                  <Link href="/pre-auth" className="mt-3 text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
                    REVIEW NOW &rarr;
                  </Link>
                </div>
              )}
              {highValueRequests.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold text-amber-700 uppercase">High-Value (&ge;5L)</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{highValueRequests.length}</p>
                  <Link href="/pre-auth" className="mt-3 text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                    REVIEW NOW &rarr;
                  </Link>
                </div>
              )}
              {fraudData.highSeverity > 0 && (
                <div className="rounded-lg border border-red-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold text-red-700 uppercase">High Fraud Risk</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{fraudData.highSeverity}</p>
                  <Link href="/fraud" className="mt-3 text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1">
                    INVESTIGATE &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Quick Access Pre-Auth */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Recent Activity</h3>
              <Link href="/pre-auth" className="text-xs font-bold text-teal-600 hover:text-teal-700 tracking-wide">VIEW ALL &rarr;</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentPreAuth.map((req) => {
                const hospital = getHospital(req.hospitalId);
                const patient = getPolicyHolder(req.policyHolderId);
                return (
                  <Link key={req.id} href={`/pre-auth/${req.id}`} className="block px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{req.procedure}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{patient?.name} &bull; {hospital?.name.split(",")[0]}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(req.estimatedAmount)}</p>
                        <p className={`text-[10px] font-bold uppercase mt-1 tracking-wider ${req.status === "under_review" ? "text-blue-600" : "text-amber-600"
                          }`}>{req.status.replace("_", " ")}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Hospital Volume Analytics */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Hospital Volume</h3>
            </div>
            <div className="p-6 space-y-5">
              {hospitalStats.slice(0, 5).map((stat) => {
                const maxRequests = hospitalStats[0]?.requestCount || 1;
                const percentage = Math.round((stat.requestCount / maxRequests) * 100);
                return (
                  <div key={stat.hospital.id}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate pr-4">{stat.hospital.name}</p>
                      <p className="text-xs font-bold text-slate-900">{stat.requestCount}</p>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-slate-400" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Minimal AI capabilities row */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-wrap gap-x-8 gap-y-3 justify-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] w-full text-center mb-1">AI-Augmented Core</p>
          {["Completeness Checks", "Fraud Detection", "SLA Monitoring", "Prioritization"].map(cap => (
            <div key={cap} className="flex items-center gap-1.5 grayscale opacity-60">
              <svg className="h-3 w-3 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{cap}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
