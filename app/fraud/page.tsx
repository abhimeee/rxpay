import Link from "next/link";
import { fraudAlerts, formatCurrency, formatDateTime } from "@/lib/data";
import { FraudSeverityBadge } from "../components/StatusBadge";
import { PageHeader } from "../components/PageHeader";

export default function FraudPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Fraud Alerts"
        subtitle="AI-detected duplicate billing and anomalies. Review and mark as resolved or false positive — fits your existing investigation workflow."
      />

      <div className="p-8">
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <p className="text-sm text-amber-900">
            <strong>Duplicate billing</strong> is currently spotted manually. Copilot surfaces likely duplicates (same patient, procedure, or item overlap) for your team to verify. You decide; AI assists.
          </p>
        </div>

        <div className="space-y-6">
          {fraudAlerts.map((f) => (
            <div
              key={f.id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium text-slate-700">{f.id}</span>
                  <FraudSeverityBadge severity={f.severity} />
                  <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
                    {f.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-slate-500">
                    AI confidence: {f.aiConfidence}%
                  </span>
                </div>
                <span className="text-xs text-slate-500">{formatDateTime(f.detectedAt)}</span>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-slate-700">{f.description}</p>
                {f.duplicateDetails && (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Duplicate details</h3>
                    <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-slate-500">Original claim</dt>
                        <dd className="font-mono text-slate-900">{f.duplicateDetails.originalClaimId}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Duplicate claim</dt>
                        <dd className="font-mono text-slate-900">{f.duplicateDetails.duplicateClaimId}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Amount overlap</dt>
                        <dd className="font-medium text-slate-900">{formatCurrency(f.duplicateDetails.amountOverlap)}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-slate-500">Matching items</dt>
                        <dd className="mt-1">
                          <ul className="list-inside list-disc text-slate-700">
                            {f.duplicateDetails.matchingItems.map((m) => (
                              <li key={m}>{m}</li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                <span className="text-xs font-medium text-slate-500 capitalize">Status: {f.status.replace(/_/g, " ")}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Under investigation
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
                  >
                    Resolved
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    False positive
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-teal-200 bg-teal-50/50 p-6">
          <h2 className="font-semibold text-slate-900">Fits your current workflow</h2>
          <p className="mt-2 text-sm text-slate-600">
            Alerts are surfaced in the copilot; you investigate using your existing process and systems. Mark as resolved or false positive so the model learns. No change to how you coordinate with hospitals or insurers.
          </p>
        </div>
      </div>
    </div>
  );
}
