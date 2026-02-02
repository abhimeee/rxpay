import Link from "next/link";
import { complianceRules } from "@/lib/data";
import { ComplianceStatusBadge } from "../components/StatusBadge";
import { PageHeader } from "../components/PageHeader";

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Compliance"
        subtitle="IRDAI-aligned checks. Copilot ensures pre-auth and claims workflows stay compliant with Indian government regulations."
        titleVariant="navy"
      />

      <div className="p-8">
        <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50/50 p-4">
          <p className="text-sm text-teal-900">
            RxPay Copilot references IRDAI circulars (e.g. 12/2016 for cashless, 21/2019 for settlement timelines) so your team can verify that pre-auth has all needed data and responses are within regulatory timelines.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-sm font-medium text-slate-600">
                <th className="px-5 py-4">Rule</th>
                <th className="px-5 py-4">IRDAI reference</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Last checked</th>
              </tr>
            </thead>
            <tbody>
              {complianceRules.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                  <td className="px-5 py-4 font-medium text-slate-900">{r.name}</td>
                  <td className="px-5 py-4 font-mono text-sm text-slate-600">{r.irdaiRef}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{r.description}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 capitalize">
                      {r.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <ComplianceStatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{r.lastChecked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">How compliance fits in</h2>
          <p className="mt-2 text-sm text-slate-600">
            Each pre-auth and claim is checked against these rules. The Pre-Auth checklist (see Pre-Auth Queue) shows which IRDAI requirements are met or missing. No separate compliance tool — it is built into the same workflow.
          </p>
          <Link
            href="/pre-auth"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            Go to Pre-Auth Queue
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
