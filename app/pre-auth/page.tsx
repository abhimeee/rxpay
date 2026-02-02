"use client";

import { useRouter } from "next/navigation";
import { preAuthRequests, formatCurrency, formatPreAuthKey, getHospital, getPolicyHolder, getAssignee } from "@/lib/data";
import { getWorkflowData } from "@/lib/workflow-data";
import { PreAuthStatusBadge, ComplianceStatusBadge } from "../components/StatusBadge";
import { PageHeader } from "../components/PageHeader";

export default function PreAuthQueuePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Pre-Auth Queue"
        subtitle="AI checks each request for completeness and IRDAI compliance"
        titleVariant="navy"
      />

      <div className="p-8">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-sm font-medium text-slate-600">
                <th className="px-5 py-4">Claim / Pre-Auth</th>
                <th className="px-5 py-4">Patient</th>
                <th className="px-5 py-4">Hospital</th>
                <th className="px-5 py-4">Procedure</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Assignee</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Compliance</th>
              </tr>
            </thead>
            <tbody>
              {preAuthRequests.map((pa) => {
                const hospital = getHospital(pa.hospitalId);
                const holder = getPolicyHolder(pa.policyHolderId);
                const assignee = pa.assigneeId ? getAssignee(pa.assigneeId) : null;
                const workflowData = getWorkflowData(pa.id);
                const hasSuspectedFraud = workflowData?.fraudFlags.some(
                  (flag) => flag.severity === "high" || flag.severity === "medium"
                );
                return (
                  <tr
                    key={pa.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/pre-auth/${pa.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/pre-auth/${pa.id}`);
                      }
                    }}
                    className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      hasSuspectedFraud ? "bg-red-50/60" : ""
                    }`}
                  >
                    <td className="px-5 py-4 w-[220px]">
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
                        <div>
                          <p className="text-sm font-medium text-slate-900">{assignee.name}</p>
                          <p className="text-xs text-slate-500">{assignee.role}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <PreAuthStatusBadge status={pa.status} />
                    </td>
                    <td className="px-5 py-4">
                      <ComplianceStatusBadge status={pa.complianceStatus} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
