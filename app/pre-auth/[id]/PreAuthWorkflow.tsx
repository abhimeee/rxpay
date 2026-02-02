"use client";

import { useState, useCallback } from "react";
import type { PreAuthCheckItem, WorkflowStageId, WorkflowFlaggedItem, PreAuthWorkflowData, FraudRedFlag } from "@/lib/types";
import { formatCurrency } from "@/lib/data";
import { WORKFLOW_STAGES, getWorkflowData } from "@/lib/workflow-data";
import { AnalysisFlow } from "./AnalysisFlow";

const STAGE_IDS = WORKFLOW_STAGES.map((s) => s.id);

type FraudBreakdownItem = {
  title: string;
  assessment: "Likely" | "Possible" | "Unlikely";
  detail: string;
};

const severityRank: Record<FraudRedFlag["severity"], number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

const getMaxSeverity = (flags: FraudRedFlag[], category?: FraudRedFlag["category"]) => {
  const filtered = category ? flags.filter((flag) => flag.category === category) : flags;
  return filtered.reduce((max, flag) => Math.max(max, severityRank[flag.severity]), 0);
};

const providerBreakdownsByTier: Record<"low" | "medium" | "high", FraudBreakdownItem[]> = {
  low: [
    {
      title: "Billing for procedures not performed",
      assessment: "Unlikely",
      detail: "Docs and timestamps align with procedure claims.",
    },
    {
      title: "Billing for procedures more frequently than clinically justified",
      assessment: "Possible",
      detail: "Utilization is slightly above peer benchmarks for diagnosis.",
    },
    {
      title: "Coding procedures as more expensive than what was actually done",
      assessment: "Possible",
      detail: "Codes appear higher than documented complexity in a few items.",
    },
    {
      title: "Admitting patients for unnecessary extended stays",
      assessment: "Unlikely",
      detail: "Length of stay aligns with clinical severity.",
    },
    {
      title: "Unnecessary tests bundled with all cases",
      assessment: "Possible",
      detail: "Routine add-ons appear across cases without clear indication.",
    },
  ],
  medium: [
    {
      title: "Upcoding or inflated procedure complexity",
      assessment: "Likely",
      detail: "Coding intensity is above peers; narratives do not justify upgrades.",
    },
    {
      title: "Bundling non-essential tests into standard packages",
      assessment: "Likely",
      detail: "Repeat add-on tests appear across multiple cases without indication.",
    },
    {
      title: "Billing for procedures more frequently than clinically justified",
      assessment: "Possible",
      detail: "Case frequency outpaces expected rates for this diagnosis.",
    },
    {
      title: "Extended stays without documentation of complications",
      assessment: "Possible",
      detail: "Length-of-stay patterns exceed norms for similar admissions.",
    },
  ],
  high: [
    {
      title: "Phantom or non-rendered services",
      assessment: "Likely",
      detail: "Services billed without matching operative or nursing records.",
    },
    {
      title: "Systematic upcoding to higher reimbursement bands",
      assessment: "Likely",
      detail: "Procedure codes consistently exceed documented complexity levels.",
    },
    {
      title: "Repeat admissions and duplicate billing patterns",
      assessment: "Possible",
      detail: "Similar procedures billed across overlapping dates or facilities.",
    },
    {
      title: "Unnecessary tests bundled with all cases",
      assessment: "Likely",
      detail: "Routine tests billed regardless of clinical indication.",
    },
  ],
};

const patientBreakdownsByTier: Record<"low" | "medium" | "high", FraudBreakdownItem[]> = {
  low: [
    {
      title: "Submitting false documentation",
      assessment: "Unlikely",
      detail: "Signatures and timestamps match facility records.",
    },
    {
      title: "Claiming treatment at a hospital but actually getting it elsewhere",
      assessment: "Possible",
      detail: "Location codes differ from scheduling logs.",
    },
    {
      title: "Misrepresenting pre-existing conditions",
      assessment: "Possible",
      detail: "Minor inconsistencies noted in historical records.",
    },
  ],
  medium: [
    {
      title: "Misrepresenting pre-existing conditions",
      assessment: "Likely",
      detail: "History conflicts with prior claims and chronic medication records.",
    },
    {
      title: "Using another member's policy or identity",
      assessment: "Possible",
      detail: "ID metadata and beneficiary details do not align cleanly.",
    },
    {
      title: "Claiming treatment at a hospital but receiving it elsewhere",
      assessment: "Possible",
      detail: "Facility codes differ from scheduling logs and travel metadata.",
    },
  ],
  high: [
    {
      title: "Policy misuse or identity mismatch",
      assessment: "Likely",
      detail: "Identity attributes conflict with enrollment and prior claim data.",
    },
    {
      title: "Staged or exaggerated clinical presentation",
      assessment: "Likely",
      detail: "Clinical notes diverge from prior records and baseline history.",
    },
    {
      title: "Duplicate claims across facilities or time windows",
      assessment: "Possible",
      detail: "Overlapping treatment windows and repeated submissions detected.",
    },
  ],
};

const getFraudBreakdowns = (flags: FraudRedFlag[]) => {
  const providerSeverity = getMaxSeverity(flags, "provider");
  const patientSeverity = getMaxSeverity(flags, "patient");
  const documentSeverity = getMaxSeverity(flags, "document");

  const providerTier = providerSeverity >= 3 ? "high" : providerSeverity >= 2 ? "medium" : documentSeverity >= 2 ? "medium" : "low";
  const patientTier = patientSeverity >= 3 ? "high" : patientSeverity >= 2 ? "medium" : patientSeverity >= 1 ? "medium" : "low";

  return {
    providerBreakdowns: providerBreakdownsByTier[providerTier],
    patientBreakdowns: patientBreakdownsByTier[patientTier],
  };
};

const assessmentStyles: Record<string, string> = {
  Likely: "border-red-200 bg-red-50/70",
  Possible: "border-amber-200 bg-amber-50/70",
  Unlikely: "border-emerald-200 bg-emerald-50/70",
};

interface PreAuthWorkflowProps {
  preAuthId: string;
  claimId: string;
  preAuthKey?: string;
  patientName?: string;
  policyNumber?: string;
  insurerName?: string;
  hospitalName?: string;
  procedure: string;
  diagnosis: string;
  icdCode?: string;
  estimatedAmount: number;
  sumInsured?: number;
  submittedAt?: string;
  checklist: PreAuthCheckItem[];
  analysisResult: PreAuthCheckItem[] | null;
  missingCritical: string[];
}

export function PreAuthWorkflow({
  preAuthId,
  claimId,
  preAuthKey,
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
  checklist,
  analysisResult,
  missingCritical,
}: PreAuthWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [flaggedItems, setFlaggedItems] = useState<WorkflowFlaggedItem[]>([]);
  const [decisionMade, setDecisionMade] = useState<"approve" | "deny" | "query" | "conditional" | null>(null);

  const workflowData = getWorkflowData(preAuthId);
  const stageId = STAGE_IDS[currentStep];
  const isLastStep = currentStep === STAGE_IDS.length - 1;
  const isDecisionStep = stageId === "queries_and_decision";

  const toggleFlag = useCallback(
    (stageId: WorkflowStageId, itemId: string, label: string, note?: string) => {
      setFlaggedItems((prev) => {
        const exists = prev.some((f) => f.stageId === stageId && f.itemId === itemId);
        if (exists) return prev.filter((f) => !(f.stageId === stageId && f.itemId === itemId));
        return [...prev, { stageId, itemId, label, note }];
      });
    },
    []
  );

  const isFlagged = useCallback(
    (stageId: WorkflowStageId, itemId: string) =>
      flaggedItems.some((f) => f.stageId === stageId && f.itemId === itemId),
    [flaggedItems]
  );

  const goNext = useCallback(() => {
    if (currentStep < STAGE_IDS.length - 1) setCurrentStep((s) => s + 1);
  }, [currentStep]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const items = analysisResult ?? checklist;
  const completeCount = items.filter((c) => c.status === "complete").length;
  const totalChecklist = items.length;
  const docScore = totalChecklist ? Math.round((completeCount / totalChecklist) * 100) : 0;
  const canApprove = docScore >= 80 && (workflowData?.queries.length ?? 0) === 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden min-w-0">
      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100 overflow-hidden min-w-0">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / STAGE_IDS.length) * 100}%` }}
        />
      </div>

      <div className="flex flex-col lg:flex-row min-w-0">
        {/* Stepper */}
        <div className="border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/80 p-4 lg:w-52 shrink-0 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Workflow
          </p>
          <nav className="space-y-0.5" aria-label="Workflow stages">
            {WORKFLOW_STAGES.map((stage, idx) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                  idx === currentStep
                    ? "bg-teal-600 text-white shadow-md font-medium"
                    : idx < currentStep
                      ? "bg-teal-50 text-teal-800 hover:bg-teal-100"
                      : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      idx === currentStep ? "bg-white/20" : idx < currentStep ? "bg-teal-200 text-teal-800" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {idx < currentStep ? "✓" : idx + 1}
                  </span>
                  {stage.shortTitle}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div
            key={stageId}
            className="workflow-stage-content p-6 overflow-x-hidden"
            style={{ animationDelay: "0ms" }}
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {WORKFLOW_STAGES[currentStep].title}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {WORKFLOW_STAGES[currentStep].description}
              </p>
            </div>

            {/* Stage 1: Request Initiation */}
            {stageId === "request_initiation" && (
              workflowData ? (
              <RequestInitiationContent
                data={workflowData.requestSummary}
                onToggleFlag={(itemId, label) => toggleFlag("request_initiation", itemId, label)}
                isFlagged={(itemId) => isFlagged("request_initiation", itemId)}
              />
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                  Workflow demo data not loaded for this pre-auth.
                </div>
              )
            )}

            {/* Stage 2: Documentation */}
            {stageId === "documentation" && (
              <div className="space-y-4">
                <AnalysisFlow
                  checklist={checklist}
                  analysisResult={analysisResult}
                  estimatedAmount={estimatedAmount}
                  procedure={procedure}
                  claimId={claimId}
                  missingCritical={missingCritical}
                  preAuthKey={preAuthKey}
                  patientName={patientName}
                  policyNumber={policyNumber}
                  insurerName={insurerName}
                  hospitalName={hospitalName}
                  diagnosis={diagnosis}
                  icdCode={icdCode}
                  sumInsured={sumInsured}
                  submittedAt={submittedAt}
                />
                <p className="text-xs text-slate-500">
                  IRDAI: Decision within 1 hour of complete documentation. Missing items require query to hospital.
                </p>
              </div>
            )}

            {/* Stage 3: Eligibility */}
            {stageId === "eligibility" && (workflowData ? (
              <EligibilityContent
                items={workflowData.eligibility}
                onToggleFlag={(itemId, label) => toggleFlag("eligibility", itemId, label)}
                isFlagged={(itemId) => isFlagged("eligibility", itemId)}
              />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">Workflow demo data not loaded.</div>
            ))}

            {/* Stage 4: Medical Coding */}
            {stageId === "medical_coding" && (workflowData ? (
              <CodingContent
                coding={workflowData.coding}
                onToggleFlag={(itemId, label) => toggleFlag("medical_coding", itemId, label)}
                isFlagged={(itemId) => isFlagged("medical_coding", itemId)}
              />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">Workflow demo data not loaded.</div>
            ))}

            {/* Stage 5: Medical Necessity */}
            {stageId === "medical_necessity" && (workflowData ? (
              <MedicalNecessityContent
                items={workflowData.medicalNecessity}
                score={workflowData.medicalNecessityScore}
                insights={workflowData.medicalNecessityInsights}
                onToggleFlag={(itemId, label) => toggleFlag("medical_necessity", itemId, label)}
                isFlagged={(itemId) => isFlagged("medical_necessity", itemId)}
              />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">Workflow demo data not loaded.</div>
            ))}

            {/* Stage 6: Fraud & Anomaly */}
            {stageId === "fraud_anomaly" && (workflowData ? (
              <FraudContent
                flags={workflowData.fraudFlags}
                onToggleFlag={(itemId, label) => toggleFlag("fraud_anomaly", itemId, label)}
                isFlagged={(itemId) => isFlagged("fraud_anomaly", itemId)}
              />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">Workflow demo data not loaded.</div>
            ))}

            {/* Stage 7: Queries & Decision (merged) */}
            {stageId === "queries_and_decision" && (
              <div className="space-y-6">
                {workflowData ? (
                  <QueryContent
                    queries={workflowData.queries}
                    onToggleFlag={(itemId, label) => toggleFlag("queries_and_decision", itemId, label)}
                    isFlagged={(itemId) => isFlagged("queries_and_decision", itemId)}
                  />
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-slate-500 text-sm">Workflow demo data not loaded.</div>
                )}
                <DecisionContent
                  flaggedItems={flaggedItems}
                  canApprove={canApprove}
                  procedure={procedure}
                  estimatedAmount={estimatedAmount}
                  claimId={claimId}
                  decisionMade={decisionMade}
                  onDecision={setDecisionMade}
                />
              </div>
            )}
          </div>

          {/* Next / Previous */}
          {!isDecisionStep && (
            <div className="flex items-center justify-between gap-4 px-6 pb-6 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentStep === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors"
              >
                {isLastStep ? "Queries & decision" : "Next step"}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Stage content components ---

function FlagCheckbox({
  checked,
  onChange,
  title = "Flag for hospital",
}: {
  checked: boolean;
  onChange: () => void;
  title?: string;
}) {
  return (
    <label
      className="inline-flex cursor-pointer items-center justify-center rounded p-1.5 transition-colors hover:bg-slate-100"
      title={title}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
        aria-label={title}
      />
      <svg
        className={`h-5 w-5 shrink-0 transition-colors ${checked ? "text-red-500" : "text-slate-400 hover:text-red-400"}`}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d="M5 2v20h2V14h8l2-4-2-4H7V2H5z" />
      </svg>
    </label>
  );
}

function RequestInitiationContent({
  data,
  onToggleFlag,
  isFlagged,
}: {
  data: PreAuthWorkflowData["requestSummary"];
  onToggleFlag: (itemId: string, label: string) => void;
  isFlagged: (itemId: string) => boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            data.admissionType === "emergency" ? "bg-rose-100 text-rose-800" : "bg-sky-100 text-sky-800"
          }`}
        >
          {data.admissionType === "emergency" ? "Emergency" : "Planned"}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            data.submittedWithinSLA ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {data.submittedWithinSLA ? "Submitted within SLA" : "Late submission"}
        </span>
      </div>
      <ul className="space-y-2">
        {data.items.map((item, idx) => (
          <li
            key={idx}
            className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 rounded-lg bg-slate-50 border border-slate-100"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800">{item.label}</p>
              <p className="text-sm text-slate-600">{item.value}</p>
            </div>
            <FlagCheckbox
              checked={isFlagged(`req-${idx}`)}
              onChange={() => onToggleFlag(`req-${idx}`, item.label)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function EligibilityContent({
  items,
  onToggleFlag,
  isFlagged,
}: {
  items: PreAuthWorkflowData["eligibility"];
  onToggleFlag: (itemId: string, label: string) => void;
  isFlagged: (itemId: string) => boolean;
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-wrap items-start justify-between gap-3 py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900">{item.label}</p>
            <p className="text-sm text-slate-600 mt-0.5">{item.value}</p>
            {item.detail && <p className="text-xs text-slate-500 mt-1">{item.detail}</p>}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                item.status === "pass"
                  ? "bg-emerald-100 text-emerald-800"
                  : item.status === "fail"
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {item.status === "pass" ? "Pass" : item.status === "fail" ? "Fail" : "Review"}
            </span>
            <FlagCheckbox
              checked={isFlagged(item.id)}
              onChange={() => onToggleFlag(item.id, item.label)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function CodingContent({
  coding,
  onToggleFlag,
  isFlagged,
}: {
  coding: PreAuthWorkflowData["coding"];
  onToggleFlag: (itemId: string, label: string) => void;
  isFlagged: (itemId: string) => boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">ICD-10 (Diagnosis)</h3>
        <ul className="space-y-2">
          {coding.icd10.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 rounded-lg bg-slate-50 border border-slate-100"
            >
              <div>
                <span className="font-mono font-medium text-slate-800">{item.code}</span>
                <span className="text-slate-600 ml-2">{item.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.status === "valid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {item.status === "valid" ? "Valid" : item.status}
                </span>
                <FlagCheckbox checked={isFlagged(item.id)} onChange={() => onToggleFlag(item.id, item.code)} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">CPT (Procedure)</h3>
        <ul className="space-y-2">
          {coding.cpt.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 rounded-lg bg-slate-50 border border-slate-100"
            >
              <div>
                <span className="font-mono font-medium text-slate-800">{item.code}</span>
                <span className="text-slate-600 ml-2">{item.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.status === "valid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {item.status === "valid" ? "Valid" : item.status}
                </span>
                <FlagCheckbox checked={isFlagged(item.id)} onChange={() => onToggleFlag(item.id, item.code)} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-slate-500">
        Diagnosis–procedure match verified. Incorrect codes can cause automated claim rejection.
      </p>
    </div>
  );
}

function MedicalNecessityContent({
  items,
  score,
  insights,
  onToggleFlag,
  isFlagged,
}: {
  items: PreAuthWorkflowData["medicalNecessity"];
  score: PreAuthWorkflowData["medicalNecessityScore"];
  insights: PreAuthWorkflowData["medicalNecessityInsights"];
  onToggleFlag: (itemId: string, label: string) => void;
  isFlagged: (itemId: string) => boolean;
}) {
  const levelNames: Record<number, string> = {
    1: "IRDAI / Law",
    2: "Insurer policy",
    3: "InterQual / tools",
    4: "Literature",
    5: "Treating provider",
  };
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Diagnosis ↔ procedure check</h3>
            <p className="text-xs text-slate-500">Quick view of what supports the procedure.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Necessity score: {score}/100
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {insights.map((insight) => (
            <details key={insight.id} className="group rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm text-slate-700">
                <span className="font-medium text-slate-800">
                  {insight.diagnosisCode} → {insight.procedureCode}
                </span>
                <span className="text-xs text-slate-500">{insight.aiSimilarityPct}% similar</span>
              </summary>
              <div className="mt-2 space-y-2 text-xs text-slate-600">
                <p>
                  <span className="font-semibold text-slate-700">Diagnosis:</span> {insight.diagnosisDescription}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Procedure:</span> {insight.procedureDescription}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      insight.irdaApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    IRDAI: {insight.irdaApproved ? "Yes" : "Review"}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      insight.policyApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    Policy: {insight.policyApproved ? "Yes" : "Review"}
                  </span>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                    AI view
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">{insight.aiSummary}</p>
                  <a
                    href={insight.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {insight.sourceLabel}
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3h7v7" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14L21 3" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 14v7h-7" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10V3h7" />
                    </svg>
                  </a>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-start justify-between gap-3 py-3 px-4 rounded-xl border border-slate-100 bg-slate-50/50"
          >
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-slate-500">Level {item.level}: {levelNames[item.level]}</span>
              <p className="font-medium text-slate-900 mt-0.5">{item.source}</p>
              <p className="text-sm text-slate-600">{item.finding}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  item.status === "met"
                    ? "bg-emerald-100 text-emerald-800"
                    : item.status === "not_met"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                }`}
              >
                {item.status === "met" ? "Met" : item.status === "not_met" ? "Not met" : "Conditional"}
              </span>
              <FlagCheckbox checked={isFlagged(item.id)} onChange={() => onToggleFlag(item.id, item.source)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FraudContent({
  flags,
  onToggleFlag,
  isFlagged,
}: {
  flags: PreAuthWorkflowData["fraudFlags"];
  onToggleFlag: (itemId: string, label: string) => void;
  isFlagged: (itemId: string) => boolean;
}) {
  const fraudScore = flags.length
    ? Math.max(
        ...flags.map((flag) =>
          flag.severity === "high" ? 92 : flag.severity === "medium" ? 74 : flag.severity === "low" ? 48 : 12
        )
      )
    : 0;
  const hasSuspectedFraud = flags.some((flag) => flag.severity === "high" || flag.severity === "medium");
  const { providerBreakdowns, patientBreakdowns } = getFraudBreakdowns(flags);

  return (
    <div className="space-y-4">
      {hasSuspectedFraud && (
        <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-red-800">Critical: suspected fraud detected</p>
              <p className="text-xs text-red-700 mt-0.5">
                Escalate to compliance immediately. Do not investigate directly—document and pend.
              </p>
            </div>
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              High priority
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
        <span className="font-semibold text-slate-900">Fraud score</span>
        <span className="font-mono text-slate-900">{fraudScore}/100</span>
        <span className="text-slate-500">based on anomaly strength, coding variance, and peer benchmarks</span>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Detected signals</h3>
        <ul className="mt-2 space-y-2">
          {flags.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 rounded-lg border border-slate-100 bg-slate-50/50"
            >
              <div>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium mr-2 ${
                    f.severity === "high"
                      ? "bg-red-100 text-red-800"
                      : f.severity === "medium"
                        ? "bg-amber-100 text-amber-800"
                        : f.severity === "low"
                          ? "bg-slate-200 text-slate-700"
                          : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {f.severity}
                </span>
                <span className="text-xs text-slate-500 capitalize">{f.category}</span>
                <p className="text-sm text-slate-800 mt-0.5">{f.description}</p>
              </div>
              <FlagCheckbox
                checked={isFlagged(f.id)}
                onChange={() => onToggleFlag(f.id, f.description.slice(0, 40))}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Provider-side fraud breakdown</h3>
        <div className="space-y-2">
          {providerBreakdowns.map((item) => (
            <details
              key={item.title}
              className={`group rounded-lg border ${
                assessmentStyles[item.assessment] ?? "border-slate-200 bg-slate-50"
              }`}
            >
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm text-slate-800">
                <span className="min-w-[220px]">{item.title}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 shadow-sm">
                  {item.assessment}
                </span>
              </summary>
              <div className="px-3 pb-2 text-xs text-slate-600">
                {item.detail}
              </div>
            </details>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Patient-side fraud breakdown</h3>
        <div className="space-y-2">
          {patientBreakdowns.map((item) => (
            <details
              key={item.title}
              className={`group rounded-lg border ${
                assessmentStyles[item.assessment] ?? "border-slate-200 bg-slate-50"
              }`}
            >
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm text-slate-800">
                <span className="min-w-[220px]">{item.title}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 shadow-sm">
                  {item.assessment}
                </span>
              </summary>
              <div className="px-3 pb-2 text-xs text-slate-600">
                {item.detail}
              </div>
            </details>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Flag and escalate to compliance if fraud suspected. Do not investigate—document and pend if needed.
      </p>
    </div>
  );
}

function QueryContent({
  queries,
  onToggleFlag,
  isFlagged,
}: {
  queries: PreAuthWorkflowData["queries"];
  onToggleFlag: (itemId: string, label: string) => void;
  isFlagged: (itemId: string) => boolean;
}) {
  if (queries.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-center">
        <p className="font-medium text-emerald-800">No open queries</p>
        <p className="text-sm text-emerald-700 mt-0.5">Documentation sufficient for decision or queries responded.</p>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {queries.map((q) => (
        <li
          key={q.id}
          className="flex flex-wrap items-start justify-between gap-3 py-3 px-4 rounded-xl border border-amber-200 bg-amber-50/80"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900">Query</p>
            <p className="text-slate-800 mt-0.5">{q.question}</p>
            {q.dueDate && (
              <p className="text-xs text-slate-500 mt-1">Response due: {q.dueDate} (7 days per IRDAI)</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-200 text-amber-900">
              {q.status}
            </span>
            <FlagCheckbox checked={isFlagged(q.id)} onChange={() => onToggleFlag(q.id, q.question.slice(0, 30))} />
          </div>
        </li>
      ))}
      <p className="text-xs text-slate-500">Raise queries within 4 hours (IRDAI). Default denial if no response by day 7.</p>
    </ul>
  );
}

function DecisionContent({
  flaggedItems,
  canApprove,
  procedure,
  estimatedAmount,
  claimId,
  decisionMade,
  onDecision,
}: {
  flaggedItems: WorkflowFlaggedItem[];
  canApprove: boolean;
  procedure: string;
  estimatedAmount: number;
  claimId: string;
  decisionMade: "approve" | "deny" | "query" | "conditional" | null;
  onDecision: (d: "approve" | "deny" | "query" | "conditional") => void;
}) {
  return (
    <div className="space-y-6">
      {flaggedItems.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
          <h3 className="font-semibold text-amber-900">Flagged for hospital summary</h3>
          <p className="text-sm text-amber-800 mt-0.5">The following will be included when communicating with the hospital:</p>
          <ul className="mt-2 list-disc list-inside text-sm text-amber-900 space-y-0.5">
            {flaggedItems.map((f, i) => (
              <li key={i}><span className="font-medium">{f.label}</span> {f.note && `— ${f.note}`}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600"><strong>Claim:</strong> {claimId}</p>
        <p className="text-sm text-slate-600"><strong>Procedure:</strong> {procedure}</p>
        <p className="text-sm text-slate-600"><strong>Estimated amount:</strong> {formatCurrency(estimatedAmount)}</p>
        <p className="text-xs text-slate-500 mt-2">TAT: Communicate decision within 1 hour of complete documentation (IRDAI).</p>
      </div>

      {decisionMade ? (
        <div className="rounded-xl border-2 border-teal-300 bg-teal-50 p-5 text-center">
          <p className="font-semibold text-teal-900 capitalize">Decision: {decisionMade}</p>
          <p className="text-sm text-teal-700 mt-1">
            {decisionMade === "approve" && "Authorization number will be issued; validity 15 days."}
            {decisionMade === "deny" && "Denial reason and appeal rights will be communicated."}
            {decisionMade === "query" && "Specific queries sent to hospital; 7-day response deadline."}
            {decisionMade === "conditional" && "Approval with conditions; hospital must confirm parameters."}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onDecision("approve")}
            disabled={!canApprove}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </button>
          <button
            type="button"
            onClick={() => onDecision("deny")}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 hover:border-red-300 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Deny
          </button>
          <button
            type="button"
            onClick={() => onDecision("query")}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100 hover:border-amber-300 focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Query
          </button>
          <button
            type="button"
            onClick={() => onDecision("conditional")}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-200 bg-teal-50 px-5 py-3 text-sm font-semibold text-teal-800 hover:bg-teal-100 hover:border-teal-300 focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Conditional approval
          </button>
        </div>
      )}

      {!canApprove && !decisionMade && (
        <p className="text-xs text-amber-700">
          Approve is disabled until documentation is complete and open queries are resolved. Use Query to request missing items.
        </p>
      )}
    </div>
  );
}
