"use client";

import { useState, useMemo } from "react";
import type { PreAuthCheckItem, EligibilityItem } from "@/lib/types";
import { QueryModal } from "../../components/QueryModal";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DocState {
  collapsed: boolean;
  queryOpen: boolean;      // true when the raise-query textarea is open
  queryText: string;       // text in the textarea (may be AI-pre-filled)
  queryRaised: boolean;    // true once the query has been submitted to the bucket
  raisedQueryText: string; // the final submitted query text
}

interface AnalysisFlowProps {
  checklist: PreAuthCheckItem[];
  analysisResult: PreAuthCheckItem[] | null;
  estimatedAmount: number;
  procedure: string;
  claimId: string;
  missingCritical?: string[];
  preAuthKey?: string;
  patientName?: string;
  policyNumber?: string;
  insurerName?: string;
  hospitalName?: string;
  diagnosis?: string;
  icdCode?: string;
  sumInsured?: number;
  submittedAt?: string;
  onViewDoc?: (item: PreAuthCheckItem) => void;
  eligibilityItems: EligibilityItem[];
  onEligibilityStatusChange: (id: string, status: string) => void;
  // "policy_id" = Policy & ID Docs tab, "medical" = Medical Docs tab
  docFilter: "policy_id" | "medical";
  // Callback to add a raised query to the global cross-tab query bucket
  onRaiseDocQuery?: (label: string, queryText: string) => void;
  // Whether to show the Send to Hospital action in the query bucket
  allowSend?: boolean;
}

// ─── Mock AI comment generator ─────────────────────────────────────────────────

function getMockAIComment(item: PreAuthCheckItem): string {
  if (item.aiSuggestion) return item.aiSuggestion;
  const lower = item.label.toLowerCase();
  if (item.status === "approved") {
    if (/aadhaar|passport|id proof|kyc|photo/.test(lower))
      return "Identity document verified. Name, DOB and photo match policyholder records. No tampering detected in metadata.";
    if (/policy|e-card|form a|pre-?auth/.test(lower))
      return "Policy document validated. Coverage active on date of admission, sum insured within limit, no lapse detected.";
    if (/ecg|echocardiogram|echo/.test(lower))
      return "ECG report reviewed. ST-elevation pattern consistent with stated diagnosis. Timestamps align with admission date.";
    if (/consultation|discharge|summary/.test(lower))
      return "Consultation note reviewed. Clinical details consistent with treatment plan and procedure requested.";
    if (/investigation|lab|report|blood/.test(lower))
      return "Investigation report verified. Values within expected range for the diagnosis. No anomalies detected.";
    return "Document appears complete and consistent. All key fields verified against policy and clinical records.";
  }
  if (item.status === "missing")
    return "Document was not found in the submitted package. This is a required document — hospital must provide it before processing can continue.";
  if (item.status === "incomplete")
    return "Document was submitted but key fields are missing or illegible. A complete, clearly signed version is required.";
  return "Document submitted and reviewed. Verify details against original physical documents before final adjudication.";
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function categorizeDocument(label: string): "policy" | "identity" | "medical" {
  const lower = label.toLowerCase();
  if (/aadhaar|passport|id proof|kyc|photo/.test(lower)) return "identity";
  if (/form a|pre-?auth form|policy|e-card|cost breakdown|consent|rate card/.test(lower)) return "policy";
  return "medical";
}

function initDocStates(
  checklist: PreAuthCheckItem[],
  analysisResult: PreAuthCheckItem[] | null
): Map<string, DocState> {
  const items = analysisResult ?? checklist;
  const map = new Map<string, DocState>();
  items.forEach((item) => {
    const isIssue = item.status === "missing" || item.status === "inconsistent" || item.status === "incomplete";
    map.set(item.id, {
      collapsed: !isIssue,
      queryOpen: false,
      queryText: "",
      queryRaised: false,
      raisedQueryText: "",
    });
  });
  return map;
}

// ─── Query Bucket Panel ────────────────────────────────────────────────────────

function QueryBucket({
  items,
  preAuthKey,
  patientName,
  hospitalName,
  onClearItem,
  allowSend = true,
}: {
  items: { label: string; queryText: string }[];
  preAuthKey: string;
  patientName: string;
  hospitalName: string;
  onClearItem: (label: string) => void;
  allowSend?: boolean;
}) {
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  if (items.length === 0) return null;

  // On individual doc tabs, per-card "Query Raised" badges are sufficient — no summary bar needed.
  // The full send UI only lives on the Q-Bucket & Decision tab.
  if (!allowSend) return null;

  const letter = () => {
    const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const lines = items.map((item, i) => `${i + 1}. ${item.label}\n   Query: ${item.queryText}`).join("\n\n");
    return `Subject: RE: Pre-Auth Request ${preAuthKey} – Clarification Required\n\nDate: ${date}\nTo: Admissions / Medical Records Department\nHospital: ${hospitalName}\nRe: Pre-Authorization Request for ${patientName}\n\nDear Sir/Madam,\n\nThank you for submitting the pre-authorization request for the above-mentioned patient. We require clarification on the following items before we can proceed:\n\n${lines}\n\nPlease respond within 48 hours quoting reference ${preAuthKey}.\n\nWarm regards,\nPre-Authorization Team\nRxPay TPA Services`;
  };

  if (sent) {
    return (
      <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "var(--radius-md)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#15803D" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        <span style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "#15803D" }}>Query sent to hospital — {items.length} item{items.length !== 1 ? "s" : ""}</span>
        <button onClick={() => setSent(false)} style={{ marginLeft: "auto", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xs)", padding: "3px 10px", cursor: "pointer" }}>Undo</button>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-white)", border: "2px solid #FDE68A", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #FDE68A", background: "#FFFBEB", display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#92400E" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#92400E", flex: 1, margin: 0 }}>
          Query Bucket
        </p>
        <span style={{ fontSize: 10, fontWeight: 700, background: "#FCD34D", color: "#78350F", padding: "1px 8px", borderRadius: 20 }}>
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Query list */}
      <div style={{ maxHeight: 260, overflowY: "auto" }}>
        {items.map((item, i) => (
          <div key={i} style={{ padding: "10px 16px", borderBottom: i < items.length - 1 ? "1px solid var(--color-border)" : "none", display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{item.label}</p>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-primary)", margin: 0 }} title={item.queryText}>{item.queryText.length > 40 ? item.queryText.substring(0, 40) + "..." : item.queryText}</p>
            </div>
            <button onClick={() => onClearItem(item.label)} title="Remove" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: 14, padding: 0, flexShrink: 0, lineHeight: 1 }}>✕</button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--color-border)", display: "flex", gap: 8 }}>
        <button
          onClick={() => { navigator.clipboard.writeText(letter()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-secondary)", background: "var(--color-white)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xs)", padding: "5px 12px", cursor: "pointer" }}
        >
          {copied ? "✓ Copied!" : "Copy Letter"}
        </button>
        <button
          onClick={() => setSent(true)}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: "var(--font-size-xs)", fontWeight: 700, color: "#fff", background: "#92400E", border: "none", borderRadius: "var(--radius-xs)", padding: "5px 12px", cursor: "pointer" }}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          Send to Hospital
        </button>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

export function AnalysisFlow({
  checklist,
  analysisResult,
  estimatedAmount,
  procedure,
  claimId,
  missingCritical = [],
  preAuthKey = "",
  patientName = "Patient",
  policyNumber,
  insurerName,
  hospitalName = "the Hospital",
  diagnosis,
  icdCode,
  sumInsured,
  submittedAt,
  onViewDoc,
  eligibilityItems,
  onEligibilityStatusChange,
  docFilter,
  onRaiseDocQuery,
  allowSend = false,
}: AnalysisFlowProps) {
  const allItems = analysisResult ?? checklist;

  // Filter items based on which tab we're in
  const items = useMemo(() => {
    return allItems.filter((item) => {
      const cat = categorizeDocument(item.label);
      if (docFilter === "policy_id") return cat === "policy" || cat === "identity";
      return cat === "medical";
    });
  }, [allItems, docFilter]);

  const [docStates, setDocStates] = useState<Map<string, DocState>>(() => initDocStates(checklist, analysisResult));

  // ─── State helpers ──────────────────────────────────────────────────────────

  const updateDocState = (id: string, patch: Partial<DocState>) => {
    setDocStates((prev) => {
      const next = new Map(prev);
      const existing = next.get(id) ?? { collapsed: true, queryOpen: false, queryText: "", queryRaised: false, raisedQueryText: "" };
      next.set(id, { ...existing, ...patch });
      return next;
    });
  };

  const toggleCollapse = (id: string) => {
    setDocStates((prev) => {
      const next = new Map(prev);
      const existing = next.get(id) ?? { collapsed: false, queryOpen: false, queryText: "", queryRaised: false, raisedQueryText: "" };
      next.set(id, { ...existing, collapsed: !existing.collapsed });
      return next;
    });
  };

  // Open raise-query box: pre-fill if AI flagged
  const openQuery = (item: PreAuthCheckItem) => {
    const isIssue = item.status === "inconsistent" || item.status === "incomplete" || item.status === "missing";
    const prefill = isIssue && item.aiSuggestion ? item.aiSuggestion : "";
    updateDocState(item.id, { queryOpen: true, queryText: prefill, collapsed: false });
  };

  const submitQuery = (item: PreAuthCheckItem, state: DocState) => {
    if (!state.queryText.trim()) return;
    updateDocState(item.id, { queryRaised: true, raisedQueryText: state.queryText.trim(), queryOpen: false });
    onRaiseDocQuery?.(item.label, state.queryText.trim());
  };

  const undoQuery = (item: PreAuthCheckItem) => {
    updateDocState(item.id, { queryRaised: false, raisedQueryText: "", queryOpen: false, queryText: "" });
  };

  // Query bucket items (docs with queryRaised=true from all items in this tab)
  const bucketItems = useMemo(() => {
    return items
      .map((item) => {
        const state = docStates.get(item.id);
        return state?.queryRaised ? { label: item.label, queryText: state.raisedQueryText } : null;
      })
      .filter((x): x is { label: string; queryText: string } => x !== null);
  }, [items, docStates]);

  const removeBucketItem = (label: string) => {
    const item = items.find((i) => i.label === label);
    if (item) undoQuery(item);
  };




  const grouped = useMemo(() => {
    const policy: typeof items = [];
    const identity: typeof items = [];
    const medical: typeof items = [];
    items.forEach((item) => {
      const cat = categorizeDocument(item.label);
      if (cat === "policy") policy.push(item);
      else if (cat === "identity") identity.push(item);
      else medical.push(item);
    });
    return { policy, identity, medical };
  }, [items]);

  // ─── AI badge ──────────────────────────────────────────────────────────────

  const getAiBadge = (item: PreAuthCheckItem) => {
    if (item.status === "approved") return { label: "AI Approved", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", icon: "✓" };
    if (item.status === "inconsistent") return { label: "AI Flagged", color: "#b91c1c", bg: "#fef2f2", border: "#fecaca", icon: "⚠" };
    if (item.status === "incomplete") return { label: "Incomplete", color: "#92400e", bg: "#fffbeb", border: "#fde68a", icon: "!" };
    if (item.status === "missing") return { label: "Missing", color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", icon: "—" };
    return { label: "Submitted", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", icon: "○" };
  };

  // ─── Document card ──────────────────────────────────────────────────────────

  const renderDocumentCard = (item: PreAuthCheckItem) => {
    const state = docStates.get(item.id) ?? { collapsed: true, queryOpen: false, queryText: "", queryRaised: false, raisedQueryText: "" };
    const aiBadge = getAiBadge(item);
    const isMissing = item.status === "missing";
    const isAIIssue = item.status === "inconsistent" || item.status === "incomplete" || item.status === "missing";

    const cardBorderColor = state.queryRaised ? "#FECACA"
      : item.status === "inconsistent" ? "#FDE68A"
        : item.status === "incomplete" ? "#FDE68A"
          : item.status === "approved" ? "#BBF7D0"
            : "var(--color-border)";

    const cardBg = state.queryRaised ? "#FEF9F9" : "var(--color-white)";

    return (
      <div
        key={item.id}
        style={{
          background: cardBg,
          border: `1px solid ${cardBorderColor}`,
          borderRadius: "var(--radius-md)",
          marginBottom: 8,
          overflow: "hidden",
          transition: "border-color 0.15s",
        }}
      >
        {/* ── Card header — always visible ─────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px" }}>
          {/* Expand/collapse chevron */}
          <button
            onClick={() => toggleCollapse(item.id)}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", color: "var(--color-text-muted)" }}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              style={{ transform: state.collapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Doc name */}
          <p
            onClick={() => toggleCollapse(item.id)}
            style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text-primary)", margin: 0, flex: 1, cursor: "pointer", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {item.label}
          </p>

          {/* Badges row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {/* Query Raised status pill */}
            {state.queryRaised && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}>
                Query Raised
              </span>
            )}

            {/* AI status badge */}
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: aiBadge.bg, color: aiBadge.color, border: `1px solid ${aiBadge.border}` }}>
              {aiBadge.icon} {aiBadge.label}
            </span>

            {/* ── Prominent View Doc button — always visible ──────────────── */}
            {!isMissing && (
              <button
                onClick={(e) => { e.stopPropagation(); onViewDoc?.(item); }}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: "var(--font-size-xs)", fontWeight: 700,
                  color: "var(--color-text-primary)",
                  background: "var(--color-white)",
                  border: "1.5px solid var(--color-border-dark, #cbd5e1)",
                  borderRadius: "var(--radius-xs)",
                  padding: "4px 10px",
                  cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                  whiteSpace: "nowrap",
                }}
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Doc
              </button>
            )}
          </div>
        </div>

        {/* ── Card body — expanded ────────────────────────────────────────── */}
        {!state.collapsed && (
          <div style={{ padding: "0 14px 12px", borderTop: "1px solid var(--color-border)" }}>
            {/* Doc value */}
            {item.value && (
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", marginTop: 8, marginBottom: 0 }}>
                {item.value}
              </p>
            )}

            {/* ── AI Analysis — always shown ──────────────────────────────── */}
            <div style={{
              background: isAIIssue ? (item.status === "inconsistent" ? "#FFFBEB" : "#FFF1F2") : "#F0FDF4",
              border: `1px solid ${isAIIssue ? (item.status === "inconsistent" ? "#FDE68A" : "#FECACA") : "#BBF7D0"}`,
              borderRadius: "var(--radius-xs)",
              padding: "9px 12px",
              marginTop: 8,
              display: "flex", gap: 7, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 13, flexShrink: 0, lineHeight: 1.2 }}>
                {isAIIssue ? "⚠" : "✓"}
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: isAIIssue ? (item.status === "inconsistent" ? "#92400E" : "#9F1239") : "#15803D", marginBottom: 3 }}>AI Analysis</p>
                <p style={{ fontSize: "var(--font-size-xs)", color: isAIIssue ? (item.status === "inconsistent" ? "#78350F" : "#7F1D1D") : "#166534", margin: 0, lineHeight: 1.55 }}>
                  {getMockAIComment(item)}
                </p>
              </div>
            </div>

            {/* Already-raised query display */}
            {state.queryRaised && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius-xs)", padding: "8px 10px", marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#B91C1C", marginBottom: 4 }}>Query text</p>
                    <p style={{ fontSize: "var(--font-size-xs)", color: "#7F1D1D", margin: 0 }} title={state.raisedQueryText}>
                      {state.raisedQueryText.length > 40 ? state.raisedQueryText.substring(0, 40) + "..." : state.raisedQueryText}
                    </p>
                  </div>
                  <button
                    onClick={() => undoQuery(item)}
                    style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "#B91C1C", background: "none", border: "1px solid #FECACA", borderRadius: "var(--radius-xs)", padding: "2px 8px", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Open raise-query textarea */}
            <QueryModal
              isOpen={state.queryOpen && !state.queryRaised}
              title={`Query: ${item.label}`}
              initialText={state.queryText}
              onSave={(newText: string) => {
                submitQuery(item, { ...state, queryText: newText });
              }}
              onClose={() => updateDocState(item.id, { queryOpen: false, queryText: "" })}
            />

            {/* Raise Query button (shown when no query open/raised) */}
            {!state.queryRaised && !state.queryOpen && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  onClick={() => openQuery(item)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: "var(--font-size-xs)", fontWeight: 700,
                    color: isAIIssue ? "#B91C1C" : "var(--color-text-secondary)",
                    background: isAIIssue ? "#FEF2F2" : "var(--color-bg)",
                    border: `1px solid ${isAIIssue ? "#FECACA" : "var(--color-border)"}`,
                    borderRadius: "var(--radius-xs)", padding: "5px 12px", cursor: "pointer",
                  }}
                >
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Raise Query
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title: string, sectionItems: typeof items) => {
    if (sectionItems.length === 0) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", marginBottom: 8 }}>
          {title} ({sectionItems.length})
        </p>
        {sectionItems.map((item) => renderDocumentCard(item))}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>




      {/* AI Completeness bar */}
      <div style={{ background: "var(--color-white)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", fontWeight: 500 }}>AI Completeness Check</span>
        </div>
        {[
          { label: "Submitted", count: items.filter(c => c.status !== "missing").length, color: "#3B82F6" },
          { label: "AI Approved", count: items.filter(c => c.status === "approved").length, color: "#15803D" },
          { label: "AI Flagged", count: items.filter(c => c.status === "inconsistent" || c.status === "incomplete" || c.status === "missing").length, color: "#B91C1C" },
          { label: "Queries Raised", count: bucketItems.length, color: "#92400E" },
        ].map(({ label, count, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
              <strong style={{ color }}>{count}</strong> {label}
            </span>
          </div>
        ))}
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginLeft: "auto" }}>
          {items.length} total documents
        </span>
      </div>

      {/* Document list grouped */}
      {renderSection("Policy & Administrative", grouped.policy)}
      {renderSection("Identity & KYC", grouped.identity)}
      {renderSection("Medical Records & Reports", grouped.medical)}

      {/* Eligibility table — only on Policy & ID tab */}
      {docFilter === "policy_id" && eligibilityItems.length > 0 && (
        <div style={{ background: "var(--color-white)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", margin: 0 }}>
              Eligibility Checks
            </p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-bg)" }}>
                {["Check", "Value", "Detail", "Verdict"].map((h) => (
                  <th key={h} style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", padding: "8px 12px", textAlign: "left", borderBottom: "1px solid var(--color-border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eligibilityItems.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: idx < eligibilityItems.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <td style={{ padding: "10px 12px", fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text-primary)" }}>{item.label}</td>
                  <td style={{ padding: "10px 12px", fontSize: "var(--font-size-base)", color: "var(--color-text-secondary)" }}>{item.value}</td>
                  <td style={{ padding: "10px 12px", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{item.detail ?? "—"}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <select
                      value={item.status}
                      onChange={(e) => onEligibilityStatusChange(item.id, e.target.value)}
                      style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, padding: "2px 8px", borderRadius: 20, border: "none", background: item.status === "pass" ? "#dcfce7" : item.status === "fail" ? "#fef2f2" : "#fefce8", color: item.status === "pass" ? "#15803d" : item.status === "fail" ? "#b91c1c" : "#92400e", cursor: "pointer" }}
                    >
                      <option value="pass">Pass</option>
                      <option value="warning">Review</option>
                      <option value="fail">Fail</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Query bucket — shown when any queries have been raised */}
      <QueryBucket
        items={bucketItems}
        preAuthKey={preAuthKey}
        patientName={patientName}
        hospitalName={hospitalName}
        onClearItem={removeBucketItem}
        allowSend={allowSend}
      />
    </div>
  );
}
