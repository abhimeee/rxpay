type StatusMap = Record<string, { label: string; className: string }>;

const preAuthStatus: StatusMap = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-700" },
  submitted: { label: "Submitted", className: "bg-blue-100 text-blue-800" },
  awaiting_docs: { label: "Awaiting docs", className: "bg-amber-100 text-amber-800" },
  under_review: { label: "Under review", className: "bg-indigo-100 text-indigo-800" },
  approved: { label: "Approved", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
};

const fraudSeverity: StatusMap = {
  high: { label: "High", className: "badge-high" },
  medium: { label: "Medium", className: "badge-medium" },
  low: { label: "Low", className: "badge-low" },
};

export function PreAuthStatusBadge({ status }: { status: string }) {
  const s = preAuthStatus[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.className}`}>
      {s.label}
    </span>
  );
}

export function FraudSeverityBadge({ severity }: { severity: string }) {
  const s = fraudSeverity[severity] ?? { label: severity, className: "badge-low" };
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.className}`}>
      {s.label}
    </span>
  );
}
