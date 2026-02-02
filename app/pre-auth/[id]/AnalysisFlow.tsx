"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { PreAuthCheckItem } from "@/lib/types";
import { formatCurrency } from "@/lib/data";

const STEP_DURATION_MS = 1200;
const REVEAL_DURATION_MS = 800;

type Phase = "idle" | "running" | "summary";

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
}

export function AnalysisFlow({
  checklist,
  analysisResult,
  estimatedAmount,
  procedure,
  claimId,
  missingCritical = [],
  preAuthKey,
  patientName,
  policyNumber,
  insurerName,
  hospitalName,
  diagnosis,
  icdCode,
  sumInsured,
  submittedAt,
  onViewDoc,
}: AnalysisFlowProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Use checklist for idle, analysisResult for summary/running
  const items = (phase === "idle") ? checklist : (analysisResult ?? checklist);
  const totalSteps = items.length;

  const submittedCount = checklist.filter((c) => c.status === "submitted").length;
  const approvedCount = items.filter((c) => c.status === "approved").length;
  const inconsistentCount = items.filter((c) => c.status === "inconsistent").length;
  const incompleteCount = items.filter((c) => c.status === "incomplete").length;

  const submissionScore = totalSteps ? Math.round((submittedCount / totalSteps) * 100) : 0;
  const qualityScore = submittedCount ? Math.round((approvedCount / submittedCount) * 100) : 0;
  const derivedMissingCritical =
    missingCritical.length > 0
      ? missingCritical
      : checklist.filter((c) => c.status === "missing").map((c) => c.label);

  const startAnalysis = useCallback(() => {
    setPhase("running");
    setStep(0);
    setRevealed(false);
  }, []);

  useEffect(() => {
    if (phase !== "running") return;

    // Logic for stepping through items
    const currentItem = items[step];
    const isMissing = currentItem.status === "missing";

    if (!revealed) {
      // If missing, skip the "Analyzing..." state instantly
      if (isMissing) {
        setRevealed(true);
        return;
      }
      const t = setTimeout(() => setRevealed(true), STEP_DURATION_MS);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      if (step < totalSteps - 1) {
        setStep((s) => s + 1);
        setRevealed(false);
      } else {
        setPhase("summary");
      }
    }, REVEAL_DURATION_MS);
    return () => clearTimeout(t);
  }, [phase, revealed, step, totalSteps, items]);

  const renderDocumentItem = (item: PreAuthCheckItem, index: number) => {
    const isAnalyzed = phase === "summary" || (phase === "running" && (index < step || (index === step && revealed)));
    const isActuallyCurrent = phase === "running" && index === step && !revealed;
    const isMissing = item.status === "missing";

    let statusLabel = "";
    let statusClass = "";
    let icon = null;

    if (phase === "idle") {
      if (isMissing) {
        statusLabel = "Not Provided";
        statusClass = "bg-slate-100 text-slate-500 border border-slate-200";
        icon = <div className="h-2 w-2 rounded-full bg-slate-300" />;
      } else {
        statusLabel = "Submitted";
        statusClass = "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm";
        icon = <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600"><svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg></div>;
      }
    } else if (isActuallyCurrent) {
      statusLabel = isMissing ? "Verifying absence..." : "Analyzing content...";
      statusClass = "bg-teal-50 text-teal-700 border border-teal-100 animate-pulse";
      icon = (
        <svg className="h-4 w-4 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      );
    } else if (isAnalyzed) {
      if (item.status === "approved") {
        statusLabel = "AI Approved";
        statusClass = "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm";
        icon = (
          <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      } else if (item.status === "inconsistent") {
        statusLabel = "Inconsistent";
        statusClass = "bg-rose-50 text-rose-700 border border-rose-200 shadow-sm";
        icon = (
          <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-rose-200 text-rose-700 ring-2 ring-rose-100">
            <span className="text-xs font-black">!</span>
          </div>
        );
      } else if (item.status === "incomplete") {
        statusLabel = "Incomplete";
        statusClass = "bg-amber-50 text-amber-700 border border-amber-200 shadow-sm";
        icon = (
          <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-amber-200 text-amber-700 ring-2 ring-amber-100">
            <span className="text-xs font-black">!</span>
          </div>
        );
      } else if (isMissing) {
        statusLabel = "Missing";
        statusClass = "bg-slate-50 text-slate-400 border border-slate-200";
        icon = <div className="h-2 w-2 rounded-full bg-slate-300" />;
      } else {
        statusLabel = "Verified";
        statusClass = "bg-slate-50 text-slate-700 border border-slate-200";
        icon = <div className="h-5.5 w-5.5 items-center justify-center rounded-full bg-slate-200 text-slate-700">✓</div>;
      }
    } else {
      statusLabel = "Queued";
      statusClass = "bg-slate-50 text-slate-400";
      icon = <div className="h-2 w-2 rounded-full bg-slate-200" />;
    }

    return (
      <div
        key={item.id}
        onClick={() => !isMissing && onViewDoc?.(item)}
        className={`group relative rounded-2xl border transition-all duration-500 
        ${!isMissing ? "cursor-pointer hover:ring-2 hover:ring-teal-500/20" : ""}
        ${isActuallyCurrent ? "border-teal-400 bg-teal-50/20 shadow-lg ring-1 ring-teal-200 scale-[1.01]" :
            (isAnalyzed && item.status === "inconsistent" ? "border-rose-200 bg-rose-50/10" :
              isAnalyzed && item.status === "incomplete" ? "border-amber-200 bg-amber-50/10" :
                isAnalyzed && item.status === "approved" ? "border-emerald-100 bg-emerald-50/5" :
                  "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm")} p-5 mb-3 `}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-5 min-w-0">
            <div className="mt-0.5 shrink-0 flex items-center justify-center w-6 min-h-[24px]">
              {icon}
            </div>
            <div>
              <p className={`text-base font-bold tracking-tight ${!isAnalyzed && !isActuallyCurrent ? "text-slate-400" : "text-slate-900"}`}>{item.label}</p>

              {isAnalyzed && (
                <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                  {item.value && (
                    <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100/50 rounded-lg w-fit">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Metadata:</span>
                      <span className="text-xs text-slate-800 font-bold">{item.value}</span>
                    </div>
                  )}

                  {item.status !== "approved" && (
                    <div className={`rounded-xl border-2 px-4 py-3.5 ${item.status === "inconsistent"
                      ? "bg-rose-50/60 border-rose-100/80"
                      : "bg-amber-50/60 border-amber-100/80"
                      }`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${item.status === "inconsistent" ? "bg-rose-500" : "bg-amber-500"
                          }`} />
                        <p className={`text-[10px] font-black uppercase tracking-widest ${item.status === "inconsistent"
                          ? "text-rose-700"
                          : "text-amber-700"
                          }`}>
                          AI Review Summary
                        </p>
                      </div>
                      <p className="text-[13px] text-slate-700 leading-relaxed font-semibold">
                        {item.aiSuggestion || `Automated verification failed: OCR layer detected structural anomalies or missing mandatory data points in ${item.label}.`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider transition-all shadow-sm ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* AI Analysis Control Card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden ring-1 ring-slate-100">
        {phase === "idle" && (
          <div className="p-8 text-[#0f172a]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Completeness Check</h2>
                <p className="text-sm text-slate-500 mt-1">Ready to analyze {submittedCount} submitted documents for inconsistencies.</p>
              </div>
              <button
                type="button"
                onClick={startAnalysis}
                className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-7 py-3.5 text-base font-bold text-white shadow-lg hover:bg-teal-500 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
                Run AI Review
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Inventory Status</span>
                  <span className="text-2xl font-black text-slate-900">{submittedCount}/{totalSteps}</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all duration-1000" style={{ width: `${submissionScore}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-3 font-medium">Mandatory documents provided by hospital.</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 opacity-60">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Qualitative Score</span>
                  <span className="text-2xl font-black text-slate-300">--%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-200 rounded-full transition-all duration-1000" style={{ width: `0%` }} />
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
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50">
                  <svg className="h-6 w-6 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">AI Analysis in Progress</h2>
                  <p className="text-xs text-slate-500">Cross-referencing OCR data with hospital records...</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-100 rounded-2xl border border-slate-200">
                <span className="text-xs font-black text-slate-600">STEP {step + 1} / {totalSteps}</span>
              </div>
            </div>

            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 transition-all duration-500 ease-out" style={{ width: `${((step + (revealed ? 1 : 0)) / totalSteps) * 100}%` }} />
            </div>
          </div>
        )}

        {phase === "summary" && (
          <div className="p-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-black shadow-lg ${qualityScore >= 80 ? "bg-emerald-600 text-white" : qualityScore >= 50 ? "bg-amber-500 text-white" : "bg-rose-600 text-white"}`}>
                  {qualityScore}%
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Review Summary</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {approvedCount} approved · {inconsistentCount} inconsistencies · {incompleteCount} incomplete
                  </p>
                </div>
              </div>
              <button
                onClick={startAnalysis}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Re-scan
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-teal-50/50 p-5 border border-teal-100">
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Submission Status</p>
                <p className="text-lg font-bold text-teal-900">{submittedCount} / {totalSteps} Documents</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">AI Quality Score</p>
                <p className={`text-lg font-bold ${qualityScore >= 80 ? "text-emerald-700" : "text-amber-700"}`}>{qualityScore}% Verified</p>
              </div>
            </div>

            {derivedMissingCritical.length > 0 && (
              <div className="mt-8 rounded-2xl border border-rose-100 bg-rose-50/30 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-rose-500" />
                  <p className="text-sm font-bold text-rose-900 uppercase tracking-tight">Critical Actions Required</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {derivedMissingCritical.map((m) => (
                    <div key={m} className="flex items-center gap-2 text-sm text-rose-800 font-medium bg-white/50 px-3 py-2 rounded-xl border border-rose-100/50">
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

      {/* Document Set - Separate from the AI card */}
      <div>
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Document Inventory</h3>
            <span className="text-[10px] font-black text-white bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-widest">
              {totalSteps} FILES
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {submittedCount} Submitted
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              {totalSteps - submittedCount} Missing
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {items.map((item, idx) => renderDocumentItem(item, idx))}
        </div>
      </div>
    </div>
  );
}

