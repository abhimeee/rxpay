import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPreAuth,
  getHospital,
  getInsurer,
  getPolicyHolder,
  getAssignee,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPreAuthKey,
  getSimulatedAnalysisResult,
} from "@/lib/data";
import { PreAuthStatusBadge, ComplianceStatusBadge } from "../../components/StatusBadge";
import { RxPayLogo } from "../../components/RxPayLogo";
import { AnalysisFlow } from "./AnalysisFlow";

export default async function PreAuthDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pa = getPreAuth(id);
  if (!pa) notFound();

  const hospital = getHospital(pa.hospitalId);
  const insurer = getInsurer(pa.insurerId);
  const holder = getPolicyHolder(pa.policyHolderId);
  const assignee = pa.assigneeId ? getAssignee(pa.assigneeId) : null;
  const simulatedResult = getSimulatedAnalysisResult(pa.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-8 py-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <RxPayLogo className="h-10 w-auto flex-shrink-0" />
            <Link
              href="/pre-auth"
              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              aria-label="Back to Pre-Auth Queue"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                {formatPreAuthKey(pa.id)}
                <span className="ml-2 font-normal text-slate-500">· {pa.claimId}</span>
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {pa.procedure} · {holder?.name} · {hospital?.name}
              </p>
            </div>
          </div>
          {assignee && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
                {assignee.avatar}
              </span>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500">Assigned to</p>
                <p className="text-sm font-semibold text-slate-900">{assignee.name}</p>
                <p className="text-xs text-slate-500">{assignee.role}</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Analysis flow (Start Analysis → checklist step-by-step → summary + actions) */}
          <div className="lg:col-span-2 space-y-6">
            <AnalysisFlow
              checklist={pa.checklist}
              analysisResult={simulatedResult}
              estimatedAmount={pa.estimatedAmount}
              procedure={pa.procedure}
              claimId={pa.claimId}
              missingCritical={pa.missingCritical}
            />
          </div>

          {/* Right: Summary sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">Summary</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Pre-Auth</dt>
                  <dd className="font-mono font-medium text-slate-900">{formatPreAuthKey(pa.id)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Claim ID</dt>
                  <dd className="font-mono text-slate-900">{pa.claimId}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Patient</dt>
                  <dd className="font-medium text-slate-900">{holder?.name}</dd>
                  <dd className="text-slate-500">{holder?.policyNumber}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Hospital</dt>
                  <dd className="text-slate-900">{hospital?.name}</dd>
                  <dd className="text-slate-500">{hospital?.city}, {hospital?.state}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Insurer</dt>
                  <dd className="text-slate-900">{insurer?.name}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Procedure</dt>
                  <dd className="text-slate-900">{pa.procedure}</dd>
                  <dd className="text-slate-500">ICD: {pa.icdCode}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Estimated amount</dt>
                  <dd className="font-semibold text-slate-900">{formatCurrency(pa.estimatedAmount)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Submitted</dt>
                  <dd className="text-slate-700">{formatDateTime(pa.submittedAt)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">SLA deadline</dt>
                  <dd className="text-slate-700">{formatDate(pa.slaDeadline)}</dd>
                </div>
                {assignee && (
                  <div>
                    <dt className="text-slate-500">Assignee</dt>
                    <dd className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                        {assignee.avatar}
                      </span>
                      <span className="font-medium text-slate-900">{assignee.name}</span>
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <dt className="text-slate-500">Status</dt>
                  <dd><PreAuthStatusBadge status={pa.status} /></dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Compliance</dt>
                  <dd><ComplianceStatusBadge status={pa.complianceStatus} /></dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-5">
              <h3 className="font-semibold text-slate-900">AI Readiness</h3>
              <div className="mt-3 flex items-center gap-4">
                <div className="h-4 w-24 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pa.aiReadinessScore >= 80 ? "bg-emerald-500" : pa.aiReadinessScore >= 50 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${pa.aiReadinessScore}%` }}
                  />
                </div>
                <span className="text-2xl font-semibold text-slate-900">{pa.aiReadinessScore}%</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {pa.aiReadinessScore >= 80
                  ? "All mandatory items present. Ready for TPA review."
                  : pa.aiReadinessScore >= 50
                    ? "Some items missing. Request from hospital to avoid back-and-forth."
                    : "Run analysis to check completeness against IRDAI guidelines."}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Workflow</h3>
              <ol className="mt-3 list-decimal list-inside space-y-2 text-sm text-slate-600">
                <li>Run AI checklist (Start analysis above).</li>
                <li>Review summary; Approve, Deny, or Query hospital.</li>
                <li>Within 48 hrs of complete docs per IRDAI.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
