"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { PreAuthCheckItem, EligibilityItem } from "@/lib/types";

const STEP_DURATION_MS = 1200;
const REVEAL_DURATION_MS = 800;

type Phase = "idle" | "running" | "summary";
type DocTpaStatus = "pending_review" | "valid" | "flagged" | "needs_update" | "missing" | "additional_required";

interface DocState {
  tpaStatus: DocTpaStatus;
  comment: string;
  commentOpen: boolean;
}

const MISSING_STATUSES = new Set(["missing", "invalid", "pending", "partial"]);

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
}

function categorizeDocument(label: string): "policy" | "identity" | "medical" {
  const lower = label.toLowerCase();
  if (/aadhaar|passport|id proof|kyc|photo/.test(lower)) return "identity";
  if (/form a|pre-?auth form|policy|e-card|cost breakdown|consent|rate card/.test(lower)) return "policy";
  return "medical";
}

function generateHospitalEmail(
  preAuthKey: string,
  patientName: string,
  hospitalName: string,
  docIssues: { label: string; tpaStatus: DocTpaStatus; comment: string }[]
): string {
  const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const actionMap: Record<DocTpaStatus, string> = {
    flagged: "Please resubmit with corrections — document contains discrepancies",
    missing: "Please provide this document at the earliest",
    needs_update: "The submitted version is outdated or incomplete — please resubmit",
    additional_required: "An additional supporting document is required",
    pending_review: "Pending further review",
    valid: "No action required",
  };

  const issueLines = docIssues
    .filter((d) => ["flagged", "missing", "needs_update", "additional_required"].includes(d.tpaStatus))
    .map((d, i) => {
      let line = `${i + 1}. ${d.label} — ${actionMap[d.tpaStatus]}`;
      if (d.comment.trim()) line += `\n   Note: ${d.comment.trim()}`;
      return line;
    })
    .join("\n\n");

  return `Subject: RE: Pre-Auth Request ${preAuthKey} – Additional Documents Required

Date: ${date}
To: Admissions / Medical Records Department
Hospital: ${hospitalName}
Re: Pre-Authorization Request for ${patientName}

Dear Sir/Madam,

Thank you for submitting the pre-authorization request for the above-mentioned patient. Upon review of the documentation, we require the following items to be addressed before we can proceed:

${issueLines}

Please resubmit the requested documents within 48 hours to avoid delays in processing. If you have any questions or require clarification, do not hesitate to contact our pre-auth desk.

Please quote the reference number ${preAuthKey} in all correspondence.

Warm regards,
Pre-Authorization Team
RxPay TPA Services`;
}

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
}: AnalysisFlowProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Use checklist for idle, analysisResult for summary/running
  const items = (phase === "idle") ? checklist : (analysisResult ?? checklist);
  const totalSteps = items.length;

  const submittedCount = checklist.filter((c) => c.status !== "missing").length;
  const approvedCount = items.filter((c) => c.status === "approved").length;
  const inconsistentCount = items.filter((c) => c.status === "inconsistent").length;
  const incompleteCount = items.filter((c) => c.status === "incomplete").length;

  const submissionScore = totalSteps ? Math.round((submittedCount / totalSteps) * 100) : 0;
  const qualityScore = submittedCount ? Math.round((approvedCount / submittedCount) * 100) : 0;
  const derivedMissingCritical =
    missingCritical.length > 0
      ? missingCritical
      : checklist.filter((c) => c.status === "missing").map((c) => c.label);

  // Per-document TPA state
  const [docStates, setDocStates] = useState<Map<string, DocState>>(() => {
    const map = new Map<string, DocState>();
    checklist.forEach((item) => {
      const tpaStatus: DocTpaStatus = item.status === "missing" ? "missing" : "pending_review";
      map.set(item.id, { tpaStatus, comment: "", commentOpen: false });
    });
    return map;
  });

  // When AI scan completes, auto-flag inconsistent docs
  useEffect(() => {
    if (phase === "summary" && analysisResult) {
      setDocStates((prev) => {
        const next = new Map(prev);
        analysisResult.forEach((item) => {
          if (item.status === "inconsistent") {
            const existing = next.get(item.id);
            if (existing && existing.tpaStatus === "pending_review") {
              next.set(item.id, { ...existing, tpaStatus: "flagged" });
            }
          }
        });
        return next;
      });
    }
  }, [phase, analysisResult]);

  const setDocTpaStatus = (id: string, tpaStatus: DocTpaStatus) => {
    setDocStates((prev) => {
      const next = new Map(prev);
      const existing = next.get(id) ?? { tpaStatus: "pending_review", comment: "", commentOpen: false };
      next.set(id, { ...existing, tpaStatus });
      return next;
    });
  };

  const setDocComment = (id: string, comment: string) => {
    setDocStates((prev) => {
      const next = new Map(prev);
      const existing = next.get(id) ?? { tpaStatus: "pending_review", comment: "", commentOpen: false };
      next.set(id, { ...existing, comment });
      return next;
    });
  };

  const toggleCommentOpen = (id: string) => {
    setDocStates((prev) => {
      const next = new Map(prev);
      const existing = next.get(id) ?? { tpaStatus: "pending_review", comment: "", commentOpen: false };
      next.set(id, { ...existing, commentOpen: !existing.commentOpen });
      return next;
    });
  };

  // Generate response state
  const [showResponse, setShowResponse] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const [copied, setCopied] = useState(false);

  // Eligibility section collapse state
  const allEligibilityPass = eligibilityItems.every((e) => e.status === "pass");
  const [eligibilityOpen, setEligibilityOpen] = useState(!allEligibilityPass);

  const docIssues = useMemo(() => {
    return items
      .map((item) => {
        const state = docStates.get(item.id);
        return {
          label: item.label,
          tpaStatus: state?.tpaStatus ?? ("pending_review" as DocTpaStatus),
          comment: state?.comment ?? "",
        };
      })
      .filter((d) => ["flagged", "missing", "needs_update", "additional_required"].includes(d.tpaStatus));
  }, [items, docStates]);

  const canGenerateResponse = docIssues.length > 0;

  const handleGenerateResponse = () => {
    const draft = generateHospitalEmail(preAuthKey, patientName, hospitalName, docIssues);
    setEmailDraft(draft);
    setShowResponse(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(emailDraft).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const startAnalysis = useCallback(() => {
    setPhase("running");
    setStep(0);
    setRevealed(false);
  }, []);

  useEffect(() => {
    if (phase !== "running") return;
    const currentItem = items[step];
    const isMissing = currentItem.status === "missing";
    if (!revealed) {
      if (isMissing) { setRevealed(true); return; }
      const t = setTimeout(() => setRevealed(true), STEP_DURATION_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      if (step < totalSteps - 1) { setStep((s) => s + 1); setRevealed(false); }
      else { setPhase("summary"); }
    }, REVEAL_DURATION_MS);
    return () => clearTimeout(t);
  }, [phase, revealed, step, totalSteps, items]);

  // Group documents
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

  const tpaStatusConfig: Record<DocTpaStatus, { label: string; color: string; bg: string; border: string }> = {
    pending_review: { label: "Pending Review", color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" },
    valid:          { label: "Valid ✓",         color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    flagged:        { label: "Flagged ⚑",       color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
    needs_update:   { label: "Needs Update ↻",  color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    missing:        { label: "Missing ✗",        color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" },
    additional_required: { label: "Additional Required +", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  };

  const renderDocumentCard = (item: PreAuthCheckItem, index: number) => {
    const isAnalyzed = phase === "summary" || (phase === "running" && (index < step || (index === step && revealed)));
    const isActuallyCurrent = phase === "running" && index === step && !revealed;
    const isMissing = item.status === "missing";
    const state = docStates.get(item.id) ?? { tpaStatus: "pending_review" as DocTpaStatus, comment: "", commentOpen: false };
    const tpaCfg = tpaStatusConfig[state.tpaStatus];

    // AI status badge
    let aiLabel = "";
    let aiClass = "";
    if (phase === "idle") {
      aiLabel = isMissing ? "Not Provided" : "Submitted";
      aiClass = isMissing ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-700 border border-blue-200";
    } else if (isActuallyCurrent) {
      aiLabel = "Analyzing...";
      aiClass = "bg-teal-50 text-teal-700 animate-pulse";
    } else if (isAnalyzed) {
      if (item.status === "approved") { aiLabel = "AI Approved"; aiClass = "bg-emerald-50 text-emerald-700 border border-emerald-200"; }
      else if (item.status === "inconsistent") { aiLabel = "Inconsistent"; aiClass = "bg-rose-50 text-rose-700 border border-rose-200"; }
      else if (item.status === "incomplete") { aiLabel = "Incomplete"; aiClass = "bg-amber-50 text-amber-700 border border-amber-200"; }
      else if (isMissing) { aiLabel = "Missing"; aiClass = "bg-slate-100 text-slate-500"; }
      else { aiLabel = "Verified"; aiClass = "bg-slate-100 text-slate-600"; }
    } else {
      aiLabel = "Queued";
      aiClass = "bg-slate-100 text-slate-400";
    }

    return (
      <div
        key={item.id}
        className={`rounded-md border transition-all duration-300 bg-white p-4 mb-2 ${
          isActuallyCurrent ? "border-teal-400 ring-1 ring-teal-200" :
          isAnalyzed && item.status === "inconsistent" ? "border-rose-200" :
          isAnalyzed && item.status === "incomplete" ? "border-amber-200" :
          isAnalyzed && item.status === "approved" ? "border-emerald-100" :
          "border-[#E5E5E5]"
        }`}
      >
        {/* Top row: label + AI badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#111111]">{item.label}</p>
            {isAnalyzed && item.value && (
              <p className="text-xs text-slate-500 mt-0.5">{item.value}</p>
            )}
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${aiClass}`}>
            {aiLabel}
          </span>
        </div>

        {/* AI inconsistency note */}
        {isAnalyzed && item.status !== "approved" && !isMissing && item.aiSuggestion && (
          <div className="mb-3 rounded-md bg-rose-50/60 border border-rose-100 px-3 py-2 text-xs text-slate-700">
            {item.aiSuggestion}
          </div>
        )}

        {/* Bottom row: TPA dropdown + View doc + Comment toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* TPA Status dropdown */}
          <select
            value={state.tpaStatus}
            onChange={(e) => setDocTpaStatus(item.id, e.target.value as DocTpaStatus)}
            className="text-xs font-medium rounded-full px-3 py-1 cursor-pointer border focus:outline-none focus:ring-1 focus:ring-slate-300"
            style={{
              color: tpaCfg.color,
              background: tpaCfg.bg,
              borderColor: tpaCfg.border,
            }}
          >
            <option value="pending_review">Pending Review</option>
            <option value="valid">Valid ✓</option>
            <option value="flagged">Flagged ⚑</option>
            <option value="needs_update">Needs Update ↻</option>
            <option value="missing">Missing ✗</option>
            <option value="additional_required">Additional Required +</option>
          </select>

          {/* View Document */}
          {!isMissing && (
            <button
              onClick={() => onViewDoc?.(item)}
              className="text-xs font-medium text-[#18A558] hover:underline"
            >
              View Document
            </button>
          )}

          {/* Comment toggle */}
          <button
            onClick={() => toggleCommentOpen(item.id)}
            className="text-xs text-slate-500 hover:text-slate-700 ml-auto"
          >
            {state.commentOpen ? "Hide note" : state.comment ? "Edit note" : "Add note"}
          </button>
        </div>

        {/* Inline comment — show if open or has content */}
        {(state.commentOpen || state.comment) && (
          <div className="mt-2">
            {state.commentOpen ? (
              <textarea
                value={state.comment}
                onChange={(e) => setDocComment(item.id, e.target.value)}
                placeholder="Add a note for this document..."
                rows={2}
                className="w-full text-xs border border-[#E5E5E5] rounded-md px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 resize-none"
              />
            ) : state.comment ? (
              <p className="text-xs text-slate-600 bg-slate-50 rounded-md px-3 py-1.5 border border-[#E5E5E5]">
                {state.comment}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    sectionItems: typeof items
  ) => {
    if (sectionItems.length === 0) return null;
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-slate-500">{icon}</span>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
          <span className="text-[10px] font-semibold text-slate-400">({sectionItems.length})</span>
        </div>
        <div>
          {sectionItems.map((item, i) => renderDocumentCard(item, items.indexOf(item)))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* AI Analysis Control Card */}
      <div className="rounded-lg border border-[#E5E5E5] bg-white overflow-hidden ring-1 ring-slate-100">
        {phase === "idle" && (
          <div className="p-8 text-[#0f172a]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-[#111111] tracking-tight">AI Completeness Check</h2>
                <p className="text-sm text-slate-500 mt-1">Ready to analyze {submittedCount} submitted documents for inconsistencies.</p>
              </div>
              <button
                type="button"
                onClick={startAnalysis}
                className="inline-flex items-center gap-2 rounded-md bg-[#111111] px-7 py-3.5 text-base font-bold text-white hover:bg-[#333] transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
                Run AI Review
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 items-center">
              <div className="bg-[#F5F5F5] rounded-md p-6 border border-[#E5E5E5]">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Inventory Status</span>
                  <span className="text-2xl font-black text-[#111111]">{submittedCount}/{totalSteps}</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#111111] rounded-full transition-all duration-1000" style={{ width: `${submissionScore}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-3 font-medium">Mandatory documents provided by hospital.</p>
              </div>

              <div className="bg-[#F5F5F5] rounded-md p-6 border border-[#E5E5E5] opacity-60">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Qualitative Score</span>
                  <span className="text-2xl font-black text-slate-300">--%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-200 rounded-full" style={{ width: "0%" }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-3 font-medium">Pending AI content verification.</p>
              </div>
            </div>
          </div>
        )}

        {phase === "running" && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-teal-50">
                  <svg className="h-6 w-6 animate-spin text-[#18A558]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#111111]">AI Analysis in Progress</h2>
                  <p className="text-xs text-slate-500">Cross-referencing OCR data with hospital records...</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-100 rounded-md border border-[#E5E5E5]">
                <span className="text-xs font-black text-slate-600">STEP {step + 1} / {totalSteps}</span>
              </div>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#111111] transition-all duration-500 ease-out" style={{ width: `${((step + (revealed ? 1 : 0)) / totalSteps) * 100}%` }} />
            </div>
          </div>
        )}

        {phase === "summary" && (
          <div className="p-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-md text-2xl font-black ${qualityScore >= 80 ? "bg-emerald-600 text-white" : qualityScore >= 50 ? "bg-amber-500 text-white" : "bg-rose-600 text-white"}`}>
                  {qualityScore}%
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#111111] tracking-tight">AI Review Summary</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {approvedCount} approved · {inconsistentCount} inconsistencies · {incompleteCount} incomplete
                  </p>
                </div>
              </div>
              <button
                onClick={startAnalysis}
                className="flex items-center gap-2 rounded-md border border-[#E5E5E5] bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-[#F5F5F5] transition-all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Re-scan
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md bg-teal-50/50 p-5 border border-teal-100">
                <p className="text-[10px] font-black text-[#18A558] uppercase tracking-widest mb-1">Submission Status</p>
                <p className="text-lg font-bold text-teal-900">{submittedCount} / {totalSteps} Documents</p>
              </div>
              <div className="rounded-md bg-[#F5F5F5] p-5 border border-[#E5E5E5]">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">AI Quality Score</p>
                <p className={`text-lg font-bold ${qualityScore >= 80 ? "text-emerald-700" : "text-amber-700"}`}>{qualityScore}% Verified</p>
              </div>
            </div>

            {derivedMissingCritical.length > 0 && (
              <div className="mt-8 rounded-md border border-rose-100 bg-rose-50/30 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-rose-500" />
                  <p className="text-sm font-bold text-rose-900 uppercase tracking-tight">Critical Actions Required</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {derivedMissingCritical.map((m) => (
                    <div key={m} className="flex items-center gap-2 text-sm text-rose-800 font-medium bg-white/50 px-3 py-2 rounded-md border border-rose-100/50">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Inventory — grouped */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-[#111111] tracking-tight">Document Inventory</h3>
            <span className="text-[10px] font-black text-white bg-[#222222] px-2 py-0.5 rounded-full uppercase tracking-widest">
              {totalSteps} FILES
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-[#E5E5E5]">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {submittedCount} Submitted
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-[#E5E5E5]">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              {totalSteps - submittedCount} Missing
            </div>
          </div>
        </div>

        {/* Policy & Administrative */}
        {renderSection(
          "Policy & Administrative",
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
          grouped.policy
        )}

        {/* Identity & KYC */}
        {renderSection(
          "Identity & KYC",
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
          grouped.identity
        )}

        {/* Medical Records */}
        {renderSection(
          "Medical Records & Reports",
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
          grouped.medical
        )}
      </div>

      {/* Eligibility Quick Check */}
      {eligibilityItems.length > 0 && (
        <div className="rounded-lg border border-[#E5E5E5] bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setEligibilityOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F5F5F5] transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-[#111111]">Eligibility Quick Check</span>
              {!allEligibilityPass && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Issues found
                </span>
              )}
              {allEligibilityPass && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  All pass
                </span>
              )}
            </div>
            <svg
              className={`h-4 w-4 text-slate-400 transition-transform ${eligibilityOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {eligibilityOpen && (
            <div className="px-5 pb-5 border-t border-[#E5E5E5]">
              <ul className="space-y-2 mt-3">
                {eligibilityItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-3 py-3 px-4 rounded-md border border-[#E5E5E5] bg-[#F5F5F5]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#111111] text-sm">{item.label}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{item.value}</p>
                      {item.detail && <p className="text-xs text-slate-500 mt-1">{item.detail}</p>}
                    </div>
                    <div className="relative shrink-0">
                      <select
                        value={item.status}
                        onChange={(e) => onEligibilityStatusChange(item.id, e.target.value)}
                        className={`appearance-none rounded-full py-0.5 pl-3 pr-7 text-xs font-medium border-0 focus:ring-2 focus:ring-opacity-50 cursor-pointer transition-colors ${
                          item.status === "pass"
                            ? "bg-emerald-100 text-emerald-800 focus:ring-emerald-500"
                            : item.status === "fail"
                              ? "bg-red-100 text-red-800 focus:ring-red-500"
                              : "bg-amber-100 text-amber-800 focus:ring-amber-500"
                        }`}
                      >
                        <option value="pass">Pass</option>
                        <option value="warning">Review later</option>
                        <option value="fail">Fail</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5">
                        <svg className="h-3 w-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Generate Response for Hospital */}
      <div>
        <button
          type="button"
          onClick={handleGenerateResponse}
          disabled={!canGenerateResponse}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#111111] px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#333] disabled:opacity-40 disabled:pointer-events-none"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Generate Response for Hospital
          {docIssues.length > 0 && (
            <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
              {docIssues.length} item{docIssues.length !== 1 ? "s" : ""}
            </span>
          )}
        </button>
        {!canGenerateResponse && (
          <p className="text-center text-xs text-slate-400 mt-2">
            Mark at least one document as flagged, missing, needs update, or additional required to generate a response.
          </p>
        )}

        {/* Draft panel */}
        {showResponse && (
          <div className="mt-4 rounded-lg border border-[#E5E5E5] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
              <h3 className="text-sm font-semibold text-[#111111]">Draft Response to Hospital</h3>
              <button
                onClick={() => setShowResponse(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <textarea
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                rows={18}
                className="w-full text-xs font-mono border border-[#E5E5E5] rounded-md px-4 py-3 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 resize-y"
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-md border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#F5F5F5] transition-colors"
                >
                  {copied ? (
                    <>
                      <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy to clipboard
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowResponse(false)}
                  className="inline-flex items-center rounded-md border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-medium text-slate-500 hover:bg-[#F5F5F5] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
