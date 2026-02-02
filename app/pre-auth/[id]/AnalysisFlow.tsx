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

const encodeBase64 = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }
  return btoa(binary);
};

const buildDummyPdfDataUri = (lines: string[]) => {
  const safeLines = lines.map((line) => escapePdfText(line || " "));
  const contentParts: string[] = [];
  if (safeLines.length > 0) {
    contentParts.push("BT", "/F1 18 Tf", "72 740 Td", `(${safeLines[0]}) Tj`);
  } else {
    contentParts.push("BT", "/F1 18 Tf", "72 740 Td", "(Document) Tj");
  }
  if (safeLines.length > 1) {
    contentParts.push("/F1 12 Tf", "0 -22 Td", `(${safeLines[1]}) Tj`);
  }
  contentParts.push("/F1 10 Tf");
  for (let i = safeLines.length > 1 ? 2 : 1; i < safeLines.length; i += 1) {
    contentParts.push("0 -14 Td", `(${safeLines[i]}) Tj`);
  }
  contentParts.push("ET");
  const content = contentParts.join("\n");
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
  return `data:application/pdf;base64,${encodeBase64(pdf)}`;
};

type DocumentContext = {
  preAuthKey?: string;
  claimId?: string;
  patientName?: string;
  policyNumber?: string;
  insurerName?: string;
  hospitalName?: string;
  procedure?: string;
  diagnosis?: string;
  icdCode?: string;
  estimatedAmount?: number;
  sumInsured?: number;
  submittedAt?: string;
};

const buildCostBreakdown = (amount?: number) => {
  if (!amount) {
    return ["Total estimate not provided.", "Breakup to follow per hospital rate card."];
  }
  const parts = [
    { label: "Room and nursing (3 days)", pct: 0.18 },
    { label: "Surgeon and assistant fees", pct: 0.22 },
    { label: "Anesthesia and consumables", pct: 0.08 },
    { label: "OT and equipment charges", pct: 0.14 },
    { label: "Implant / device", pct: 0.28 },
    { label: "Pharmacy and disposables", pct: 0.06 },
  ];
  const computed = parts.map((part) => ({
    label: part.label,
    value: Math.round(amount * part.pct),
  }));
  const totalSoFar = computed.reduce((sum, item) => sum + item.value, 0);
  const remainder = Math.max(amount - totalSoFar, 0);
  const withRemainder = [
    ...computed,
    { label: "Diagnostics and labs", value: remainder || Math.round(amount * 0.04) },
  ];
  return withRemainder.map((item) => `${item.label}: ${formatCurrency(item.value)}`);
};

const buildDocumentDetails = (label: string, context: DocumentContext) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes("pre-auth form") || lowerLabel.includes("form a")) {
    return [
      "Form ID: PA-FORM-A/2025/001",
      "Requested by: Hospital TPA desk",
      `Procedure requested: ${context.procedure ?? "As per clinical notes"}`,
      `Provisional diagnosis: ${context.diagnosis ?? "As per treating physician"}`,
      "Room category: Semi-private",
      "Expected length of stay: 3 days",
      "Treating doctor: Dr. A. Sharma (Reg. 23145)",
      "Attachments: clinical notes, investigation summary",
    ];
  }
  if (lowerLabel.includes("doctor") && lowerLabel.includes("recommendation")) {
    return [
      "Letterhead: Attending physician recommendation",
      "Physician: Dr. A. Sharma, Medicine",
      "Reg No: MCI/CH/43210",
      `Clinical summary: ${context.diagnosis ?? "Patient condition as per notes"}`,
      `Recommended procedure: ${context.procedure ?? "As per plan"}`,
      "Rationale: Standard of care; conservative care ineffective.",
      "Signed and stamped on 2025-02-01",
    ];
  }
  if (lowerLabel.includes("cost breakdown") || lowerLabel.includes("itemized")) {
    return [
      "Rate card category: Network hospital cashless",
      ...buildCostBreakdown(context.estimatedAmount),
      `Total estimate: ${context.estimatedAmount ? formatCurrency(context.estimatedAmount) : "Pending"}`,
      "Taxes/consumables included as per tariff.",
    ];
  }
  if (lowerLabel.includes("consent")) {
    return [
      `Patient/attendant: ${context.patientName ?? "On file"}`,
      "Consent type: Procedure + anesthesia",
      "Risks explained: bleeding, infection, anesthesia reactions",
      "Alternatives discussed: medical management, deferment",
      "Witness: Hospital staff on duty",
      "Signed consent stored in hospital records.",
    ];
  }
  if (
    lowerLabel.includes("investigation") ||
    lowerLabel.includes("x-ray") ||
    lowerLabel.includes("mri")
  ) {
    return [
      "Attached reports:",
      "CBC, ESR, CRP",
      "ECG / ECHO summary",
      "Imaging: X-ray / USG / MRI as applicable",
      "Key findings: within acceptable range for procedure",
      "Sample date: 2025-01-28",
    ];
  }
  if (lowerLabel.includes("policy") || lowerLabel.includes("e-card")) {
    return [
      `Insurer: ${context.insurerName ?? "On file"}`,
      `Policy number: ${context.policyNumber ?? "Pending"}`,
      `Sum insured: ${context.sumInsured ? formatCurrency(context.sumInsured) : "As per policy"}`,
      "TPA: BioPass TPA Services",
      "Network: Cashless enabled at hospital",
      "Validity: 01-Apr-2024 to 31-Mar-2025",
    ];
  }
  if (lowerLabel.includes("id proof")) {
    return [
      "ID type: Aadhaar / Passport / DL",
      "Masked ID: XXXX-XXXX-4521",
      "Issued by: UIDAI",
      "Verification: eKYC matched with policy holder",
      "Date verified: 2025-01-28",
    ];
  }
  if (lowerLabel.includes("waiting period")) {
    return [
      "Policy inception: 2023-04-01",
      "Waiting period: 24 months for pre-existing",
      "Coverage effective: 2025-04-01",
      "No waiting period breach detected",
    ];
  }
  return [
    "Document reviewed by TPA desk.",
    "Metadata and signatures verified.",
    "Uploaded via hospital cashless portal.",
    "Notes: Refer to attached clinical summary.",
  ];
};

const buildDocumentLines = (item: PreAuthCheckItem, context: DocumentContext) => {
  const reference = item.irdaiRef ?? "IRDAI documentation checklist";
  const statusLabel =
    item.status === "complete"
      ? "Complete"
      : item.status === "missing"
        ? "Missing"
        : item.status === "invalid"
          ? "Invalid"
          : item.status === "partial"
            ? "Partial"
            : "Pending";
  const diagnosisLine = context.diagnosis
    ? `${context.diagnosis}${context.icdCode ? ` (ICD ${context.icdCode})` : ""}`
    : "N/A";
  const caseDetails = [
    `Claim ID: ${context.claimId ?? "N/A"}`,
    `Pre-Auth: ${context.preAuthKey ?? "N/A"}`,
    `Patient: ${context.patientName ?? "N/A"}`,
    `Policy: ${context.policyNumber ?? "N/A"}`,
    `Hospital: ${context.hospitalName ?? "N/A"}`,
    `Procedure: ${context.procedure ?? "N/A"}`,
    `Diagnosis: ${diagnosisLine}`,
    `Estimated amount: ${context.estimatedAmount ? formatCurrency(context.estimatedAmount) : "N/A"}`,
  ];
  if (context.submittedAt) {
    caseDetails.push(`Submitted: ${context.submittedAt}`);
  }
  return [
    item.label,
    `Status: ${statusLabel}`,
    `Reference: ${reference}`,
    `Provided value: ${item.value ?? "Pending"}`,
    "",
    "Case Details",
    ...caseDetails,
    "",
    "Document Details",
    ...buildDocumentDetails(item.label, context),
    "",
    "Generated for demo preview only.",
  ];
};

const DocumentDropdown = ({ item, context }: { item: PreAuthCheckItem; context: DocumentContext }) => {
  const isMissing = MISSING_STATUSES.has(item.status);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const reference = item.irdaiRef ?? "IRDAI documentation checklist";
  const pdfUri = useMemo(
    () => buildDummyPdfDataUri(buildDocumentLines(item, context)),
    [item, context]
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
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-500">Preview (PDF)</p>
          <button
            type="button"
            onClick={() => setIsFullScreen(true)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M8 21H5a2 2 0 01-2-2v-3M16 21h3a2 2 0 002-2v-3" />
            </svg>
            Enlarge
          </button>
        </div>
        <div className="rounded-md border border-slate-200 overflow-hidden bg-white">
          <iframe
            title={`${item.label} preview`}
            src={pdfUri}
            className="w-full h-56"
          />
        </div>
        {isFullScreen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6"
            onClick={() => setIsFullScreen(false)}
          >
            <div
              className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                <button
                  type="button"
                  onClick={() => setIsFullScreen(false)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </button>
              </div>
              <iframe
                title={`${item.label} full view`}
                src={pdfUri}
                className="h-full w-full"
              />
            </div>
          </div>
        )}
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
  preAuthKey?: string;
  patientName?: string;
  policyNumber?: string;
  insurerName?: string;
  hospitalName?: string;
  diagnosis?: string;
  icdCode?: string;
  sumInsured?: number;
  submittedAt?: string;
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
  const documentContext = useMemo(
    () => ({
      preAuthKey,
      claimId,
      patientName,
      policyNumber,
      insurerName,
      hospitalName,
      procedure,
      diagnosis,
      icdCode,
      estimatedAmount,
      sumInsured,
      submittedAt,
    }),
    [
      preAuthKey,
      claimId,
      patientName,
      policyNumber,
      insurerName,
      hospitalName,
      procedure,
      diagnosis,
      icdCode,
      estimatedAmount,
      sumInsured,
      submittedAt,
    ]
  );
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
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-[22px] font-bold leading-none tracking-tight text-center">
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
                <DocumentDropdown item={item} context={documentContext} />
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
              <DocumentDropdown item={item} context={documentContext} />
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
              <DocumentDropdown item={currentItem} context={documentContext} />
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
