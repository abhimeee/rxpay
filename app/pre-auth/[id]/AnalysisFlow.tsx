"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { PreAuthCheckItem } from "@/lib/types";
import { formatCurrency } from "@/lib/data";

const STEP_DURATION_MS = 1200;
const REVEAL_DURATION_MS = 800;

type Phase = "idle" | "running" | "summary";

const MISSING_STATUSES = new Set(["missing", "invalid", "pending", "partial"]);

const padPdfOffset = (offset: number) => String(offset).padStart(10, "0");

const escapePdfText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const buildDummyPdfDataUri = (title: string, subtitle: string, details: string) => {
  const lines = [title, subtitle, details, "Generated for demo preview only."].map(escapePdfText);
  const content = [
    "BT",
    "/F1 22 Tf",
    "72 720 Td",
    `(${lines[0]}) Tj`,
    "0 -26 Td",
    "/F1 14 Tf",
    `(${lines[1]}) Tj`,
    "0 -20 Td",
    `(${lines[2]}) Tj`,
    "0 -18 Td",
    "/F1 12 Tf",
    `(${lines[3]}) Tj`,
    "ET",
  ].join("\n");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];
  let offset = "%PDF-1.4\n".length;
  const offsets = objects.map((obj) => {
    const current = offset;
    offset += obj.length;
    return current;
  });
  const xrefOffset = offset;
  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.map((o) => `${padPdfOffset(o)} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
  ].join("\n");
  const pdf = `%PDF-1.4\n${objects.join("")}${xref}`;
  return `data:application/pdf;base64,${btoa(pdf)}`;
};

const DocumentDropdown = ({ item }: { item: PreAuthCheckItem }) => {
  const isMissing = MISSING_STATUSES.has(item.status);
  const reference = item.irdaiRef ?? "IRDAI documentation checklist";
  const pdfUri = useMemo(
    () =>
      buildDummyPdfDataUri(
        item.label,
        `Status: ${item.status.toUpperCase()}`,
        `Reference: ${reference}`
      ),
    [item.label, item.status, reference]
  );

  return (
    <details className="mt-2 rounded-lg border border-slate-200 bg-slate-50">
      <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium text-slate-700 flex items-center justify-between">
        <span>Document preview</span>
        <span className="text-xs text-slate-500">PDF</span>
      </summary>
      <div className="px-3 pb-3">
        {isMissing && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-md px-2 py-1 mb-2">
            Missing item cited: {reference}
          </p>
        )}
        {item.aiSuggestion && isMissing && (
          <p className="text-xs text-slate-600 mb-2">{item.aiSuggestion}</p>
        )}
        <div className="rounded-md border border-slate-200 overflow-hidden bg-white">
          <iframe
            title={`${item.label} preview`}
            src={pdfUri}
            className="w-full h-56"
          />
        </div>
      </div>
    </details>
  );
};

interface AnalysisFlowProps {
  checklist: PreAuthCheckItem[];
  analysisResult: PreAuthCheckItem[] | null;
  estimatedAmount: number;
  procedure: string;
  claimId: string;
  missingCritical?: string[];
}

export function AnalysisFlow({
  checklist,
  analysisResult,
  estimatedAmount,
  procedure,
  claimId,
  missingCritical = [],
}: AnalysisFlowProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const items = analysisResult ?? checklist;
  const totalSteps = items.length;

  const currentItem = items[step];
  const isChecking = phase === "running" && !revealed;
  const isRevealed = phase === "running" && revealed;

  const completeCount = items.filter((c) => c.status === "complete").length;
  const missingCount = items.filter((c) => c.status === "missing" || c.status === "invalid").length;
  const score = totalSteps ? Math.round((completeCount / totalSteps) * 100) : 0;
  const derivedMissingCritical =
    missingCritical.length > 0
      ? missingCritical
      : items.filter((c) => c.status === "missing" || c.status === "invalid").map((c) => c.label);

  const startAnalysis = useCallback(() => {
    setPhase("running");
    setStep(0);
    setRevealed(false);
  }, []);

  useEffect(() => {
    if (phase !== "running") return;
    if (!revealed) {
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
  }, [phase, revealed, step, totalSteps]);

  if (phase === "summary") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
        <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-6 py-8 text-white">
          <h2 className="text-xl font-semibold tracking-tight">Analysis complete</h2>
          <p className="mt-1 text-teal-100 text-sm">
            {claimId} · {procedure}
          </p>
          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-2xl font-bold">
                {score}%
              </div>
              <div>
                <p className="text-sm text-teal-200">AI Readiness</p>
                <p className="font-semibold">
                  {completeCount}/{totalSteps} items complete
                </p>
              </div>
            </div>
            <div className="h-12 w-px bg-teal-500/50" />
            <div>
              <p className="text-sm text-teal-200">Estimated amount</p>
              <p className="text-lg font-semibold">{formatCurrency(estimatedAmount)}</p>
            </div>
          </div>
        </div>
        {derivedMissingCritical.length > 0 && (
          <div className="border-b border-amber-200 bg-amber-50/80 px-6 py-4">
            <p className="text-sm font-medium text-amber-900">Critical items missing</p>
            <ul className="mt-1 list-inside list-disc text-sm text-amber-800">
              {derivedMissingCritical.slice(0, 5).map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="p-6">
          <p className="text-sm font-medium text-slate-700 mb-4">Recommended action</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              disabled={missingCount > 0}
              title={missingCount > 0 ? "Resolve missing items first" : undefined}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Deny
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-200 bg-teal-50 px-5 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-100 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Query hospital
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            {missingCount > 0
              ? "Approve is disabled until critical items are received. Use Query hospital to request missing documents."
              : "All mandatory items present. You may approve or deny per policy."}
          </p>
        </div>
        <div className="border-t border-slate-100 p-6">
          <p className="text-sm font-medium text-slate-700 mb-3">Document set</p>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    {item.value && item.status === "complete" && (
                      <p className="mt-1 text-xs text-slate-600">{item.value}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === "complete"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.status === "missing" || item.status === "invalid"
                          ? "bg-red-100 text-red-800"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.status === "complete"
                      ? "Complete"
                      : item.status === "missing"
                        ? "Missing"
                        : item.status === "invalid"
                          ? "Invalid"
                          : "Pending"}
                  </span>
                </div>
                <DocumentDropdown item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "idle") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
          <h2 className="font-semibold text-slate-900">AI Completeness Checklist</h2>
          <p className="mt-0.5 text-sm text-slate-600">
            Run AI analysis to verify documents against IRDAI circulars. Results will appear step by step.
          </p>
        </div>
        <div className="p-5">
          <button
            type="button"
            onClick={startAnalysis}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start analysis
          </button>
        </div>
      </div>
    );
  }

  // phase === "running": show current item checking, then revealed; and list of previous items
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Running AI checklist</span>
        <span className="text-xs text-slate-500">
          Step {step + 1} of {totalSteps}
        </span>
      </div>
      <div className="p-5 space-y-0">
        {items.slice(0, step).map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0 opacity-90"
          >
            <span
              className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                item.status === "complete"
                  ? "bg-emerald-100 text-emerald-700"
                  : item.status === "missing" || item.status === "invalid"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {item.status === "complete" ? "✓" : item.status === "missing" || item.status === "invalid" ? "!" : "—"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">{item.label}</p>
              {item.value && item.status === "complete" && (
                <p className="mt-0.5 text-sm text-slate-600">{item.value}</p>
              )}
              {item.aiSuggestion && (item.status === "missing" || item.status === "invalid") && (
                <p className="mt-1 text-sm text-teal-700 bg-teal-50 rounded-lg px-2 py-1">{item.aiSuggestion}</p>
              )}
              <DocumentDropdown item={item} />
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                item.status === "complete"
                  ? "bg-emerald-100 text-emerald-800"
                  : item.status === "missing" || item.status === "invalid"
                    ? "bg-red-100 text-red-800"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {item.status === "complete" ? "Complete" : item.status === "missing" ? "Missing" : item.status === "invalid" ? "Invalid" : "Pending"}
            </span>
          </div>
        ))}
        {currentItem && (
          <div
            className={`flex items-start gap-3 py-4 rounded-xl transition-all duration-300 ${
              isChecking ? "bg-slate-50 ring-2 ring-teal-200" : "bg-white"
            }`}
          >
            <span
              className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                isChecking
                  ? "bg-teal-100 text-teal-700 animate-pulse"
                  : currentItem.status === "complete"
                    ? "bg-emerald-100 text-emerald-700"
                    : currentItem.status === "missing" || currentItem.status === "invalid"
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-600"
              }`}
            >
              {isChecking ? (
                <svg className="h-3.5 w-3.5 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : currentItem.status === "complete" ? (
                "✓"
              ) : currentItem.status === "missing" || currentItem.status === "invalid" ? (
                "!"
              ) : (
                "—"
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">{currentItem.label}</p>
              {isRevealed && currentItem.value && currentItem.status === "complete" && (
                <p className="mt-0.5 text-sm text-slate-600">{currentItem.value}</p>
              )}
              {isRevealed && currentItem.aiSuggestion && (currentItem.status === "missing" || currentItem.status === "invalid") && (
                <p className="mt-1 text-sm text-teal-700 bg-teal-50 rounded-lg px-2 py-1">
                  {currentItem.aiSuggestion}
                </p>
              )}
              {isChecking && (
                <p className="mt-1 text-sm text-slate-500 italic">Checking against IRDAI guidelines…</p>
              )}
              <DocumentDropdown item={currentItem} />
            </div>
            {isRevealed && (
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  currentItem.status === "complete"
                    ? "bg-emerald-100 text-emerald-800"
                    : currentItem.status === "missing" || currentItem.status === "invalid"
                      ? "bg-red-100 text-red-800"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {currentItem.status === "complete" ? "Complete" : currentItem.status === "missing" ? "Missing" : currentItem.status === "invalid" ? "Invalid" : "Pending"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
