import Link from "next/link";
import { preAuthRequests, formatCurrency, formatPreAuthKey, getHospital, getPolicyHolder, getAssignee } from "@/lib/data";
import { PreAuthStatusBadge, ComplianceStatusBadge } from "../components/StatusBadge";
import { PageHeader } from "../components/PageHeader";

export default function PreAuthQueuePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Pre-Auth Queue"
        subtitle="AI checks each request for completeness and IRDAI compliance. Assigned to TPA analysts for review."
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
                <th className="px-5 py-4">Assignee</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">AI Readiness</th>
                <th className="px-5 py-4">Compliance</th>
                <th className="px-5 py-4 w-10" />
              </tr>
            </thead>
            <tbody>
              {preAuthRequests.map((pa) => {
                const hospital = getHospital(pa.hospitalId);
                const holder = getPolicyHolder(pa.policyHolderId);
                const assignee = pa.assigneeId ? getAssignee(pa.assigneeId) : null;
                return (
                  <tr key={pa.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-medium text-slate-800">{pa.claimId}</span>
                      <span className="ml-2 text-slate-400 text-xs">/{formatPreAuthKey(pa.id)}</span>
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
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                            {assignee.avatar}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{assignee.name}</p>
                            <p className="text-xs text-slate-500">{assignee.role}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <PreAuthStatusBadge status={pa.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full transition-all ${
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
                        className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-800 transition-colors"
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
