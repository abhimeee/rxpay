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
import { PreAuthWorkflow } from "./PreAuthWorkflow";

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
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <header className="border-b border-slate-200 bg-white px-8 py-5 shadow-sm">
        <div className="flex items-center justify-between gap-4 min-w-0">
          <div className="flex items-center gap-4 min-w-0 flex-1">
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

      <div className="p-8 min-w-0 overflow-x-hidden">
        <div className="grid gap-8 lg:grid-cols-3 min-w-0">
          {/* Left: 7-stage pre-auth workflow (Request → Docs → Eligibility → Coding → Necessity → Fraud → Queries & Decision) */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            <PreAuthWorkflow
              preAuthId={pa.id}
              claimId={pa.claimId}
              procedure={pa.procedure}
              diagnosis={pa.diagnosis}
              estimatedAmount={pa.estimatedAmount}
              checklist={pa.checklist}
              analysisResult={simulatedResult}
              missingCritical={pa.missingCritical}
            />
          </div>

          {/* Right: Summary sidebar */}
          <div className="space-y-6 min-w-0">
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

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">7-Stage Workflow</h3>
              <ol className="mt-3 list-decimal list-inside space-y-1.5 text-xs text-slate-600">
                <li>Request initiation</li>
                <li>Documentation completeness</li>
                <li>Eligibility & coverage</li>
                <li>Medical coding (ICD-10 / CPT)</li>
                <li>Medical necessity</li>
                <li>Fraud & anomaly</li>
                <li>Queries & decision</li>
              </ol>
              <p className="mt-2 text-xs text-slate-500">TAT: 1 hr from complete docs (IRDAI).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
