import Link from "next/link";
import { preAuthRequests, formatCurrency, getHospital, getInsurer, getPolicyHolder } from "@/lib/data";
import { PreAuthStatusBadge, ComplianceStatusBadge } from "../components/StatusBadge";
import { PageHeader } from "../components/PageHeader";

export default function PreAuthQueuePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Pre-Auth Queue"
        subtitle="AI checks each request for completeness and IRDAI compliance. Click a row to see checklist and suggestions."
      />

      <div className="p-8">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-sm font-medium text-slate-600">
                <th className="px-5 py-4">Claim / Pre-Auth</th>
                <th className="px-5 py-4">Patient</th>
                <th className="px-5 py-4">Hospital</th>
                <th className="px-5 py-4">Procedure</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">AI Readiness</th>
                <th className="px-5 py-4">Compliance</th>
                <th className="px-5 py-4 w-10" />
              </tr>
            </thead>
            <tbody>
              {preAuthRequests.map((pa) => {
                const hospital = getHospital(pa.hospitalId);
                const insurer = getInsurer(pa.insurerId);
                const holder = getPolicyHolder(pa.policyHolderId);
                return (
                  <tr key={pa.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm text-slate-700">{pa.claimId}</span>
                      <span className="ml-1 text-slate-400">/ {pa.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{holder?.name}</p>
                      <p className="text-xs text-slate-500">{holder?.policyNumber}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{hospital?.name}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-900">{pa.procedure}</p>
                      <p className="text-xs text-slate-500">{pa.icdCode}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">{formatCurrency(pa.estimatedAmount)}</td>
                    <td className="px-5 py-4">
                      <PreAuthStatusBadge status={pa.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${
                              pa.aiReadinessScore >= 80 ? "bg-emerald-500" : pa.aiReadinessScore >= 50 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${pa.aiReadinessScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{pa.aiReadinessScore}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <ComplianceStatusBadge status={pa.complianceStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/pre-auth/${pa.id}`}
                        className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
