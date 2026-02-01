import Link from "next/link";
import { notFound } from "next/navigation";
import { getPreAuth, getHospital, getInsurer, getPolicyHolder, formatCurrency, formatDate, formatDateTime } from "@/lib/data";
import { PreAuthStatusBadge, ComplianceStatusBadge } from "../../components/StatusBadge";
import { RxPayLogo } from "../../components/RxPayLogo";

export default async function PreAuthDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pa = getPreAuth(id);
  if (!pa) notFound();

  const hospital = getHospital(pa.hospitalId);
  const insurer = getInsurer(pa.insurerId);
  const holder = getPolicyHolder(pa.policyHolderId);

  const completeCount = pa.checklist.filter((c) => c.status === "complete").length;
  const missingCount = pa.checklist.filter((c) => c.status === "missing" || c.status === "invalid").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="flex items-center gap-4">
          <RxPayLogo className="h-10 w-auto flex-shrink-0" />
          <Link
            href="/pre-auth"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Pre-Auth: {pa.id}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {pa.procedure} · {holder?.name} · {hospital?.name}
            </p>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Checklist */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                <h2 className="font-semibold text-slate-900">AI Completeness Checklist</h2>
                <span className="text-sm text-slate-500">
                  {completeCount} complete · {missingCount} missing
                </span>
              </div>
              <p className="px-5 py-3 text-sm text-slate-600 border-b border-slate-100">
                Each item is checked against IRDAI circulars. Missing or invalid items block approval and delay pre-auth.
              </p>
              <ul className="divide-y divide-slate-100">
                {pa.checklist.map((item) => (
                  <li key={item.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                              item.status === "complete"
                                ? "bg-emerald-100 text-emerald-700"
                                : item.status === "missing" || item.status === "invalid"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.status === "complete" ? "✓" : item.status === "missing" || item.status === "invalid" ? "!" : "—"}
                          </span>
                          <span className="font-medium text-slate-900">{item.label}</span>
                          {item.irdaiRef && (
                            <span className="text-xs text-slate-400">({item.irdaiRef})</span>
                          )}
                        </div>
                        {item.value && item.status === "complete" && (
                          <p className="mt-1 ml-8 text-sm text-slate-600">{item.value}</p>
                        )}
                        {item.aiSuggestion && (item.status === "missing" || item.status === "invalid") && (
                          <div className="mt-2 ml-8 rounded-lg border border-teal-200 bg-teal-50/50 p-3">
                            <p className="text-xs font-medium text-teal-800">AI suggestion</p>
                            <p className="mt-0.5 text-sm text-teal-700">{item.aiSuggestion}</p>
                          </div>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.status === "complete"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "missing" || item.status === "invalid"
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.status === "complete" ? "Complete" : item.status === "missing" ? "Missing" : item.status === "invalid" ? "Invalid" : "Pending"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {pa.missingCritical.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
                <h3 className="font-semibold text-amber-900">Critical missing items</h3>
                <p className="mt-1 text-sm text-amber-800">
                  Pre-auth cannot be approved until these are received. AI has suggested what to request from the hospital.
                </p>
                <ul className="mt-3 list-inside list-disc text-sm text-amber-800">
                  {pa.missingCritical.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Summary + workflow */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">Summary</h2>
              <dl className="mt-4 space-y-3 text-sm">
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
                <div className="flex items-center justify-between pt-2">
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
                    className={`h-full rounded-full ${
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
                    : "Critical items missing. Do not approve until checklist is complete."}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">Next steps in your workflow</h3>
              <ol className="mt-3 list-decimal list-inside space-y-2 text-sm text-slate-600">
                <li>Send missing-item request to hospital (use AI suggestions above).</li>
                <li>Once docs received, re-run checklist; AI will re-score.</li>
                <li>Approve or reject within 48 hrs of complete docs (IRDAI).</li>
                <li>Log decision in your existing system; copilot stays in sync.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
