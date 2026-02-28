type StatusDef = { label: string; bg: string; color: string };

const preAuthStatus: Record<string, StatusDef> = {
  draft:         { label: "Draft",         bg: "var(--color-bg)",         color: "var(--color-text-secondary)" },
  submitted:     { label: "Submitted",     bg: "var(--color-blue-bg)",    color: "var(--color-blue)" },
  awaiting_docs: { label: "Awaiting docs", bg: "var(--color-yellow-bg)",  color: "var(--color-yellow)" },
  under_review:  { label: "Under review",  bg: "var(--color-blue-bg)",    color: "var(--color-blue)" },
  approved:      { label: "Approved",      bg: "var(--color-green-bg)",   color: "var(--color-green)" },
  rejected:      { label: "Rejected",      bg: "var(--color-red-bg)",     color: "var(--color-red)" },
};

const fraudSeverity: Record<string, StatusDef> = {
  high:   { label: "High",   bg: "var(--color-red-bg)",    color: "var(--color-red)" },
  medium: { label: "Medium", bg: "var(--color-yellow-bg)", color: "var(--color-yellow)" },
  low:    { label: "Low",    bg: "var(--color-bg)",        color: "var(--color-text-secondary)" },
};

const badgeStyle = (def: StatusDef): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "2px 8px",
  borderRadius: "var(--radius-xs)",
  fontSize: "var(--font-size-xs)",
  fontWeight: 500,
  background: def.bg,
  color: def.color,
  border: def.bg === "var(--color-bg)" ? "1px solid var(--color-border)" : undefined,
});

export function PreAuthStatusBadge({ status }: { status: string }) {
  const s = preAuthStatus[status] ?? { label: status, bg: "var(--color-bg)", color: "var(--color-text-secondary)" };
  return <span style={badgeStyle(s)}>{s.label}</span>;
}

export function FraudSeverityBadge({ severity }: { severity: string }) {
  const s = fraudSeverity[severity] ?? { label: severity, bg: "var(--color-bg)", color: "var(--color-text-secondary)" };
  return <span style={badgeStyle(s)}>{s.label}</span>;
}
