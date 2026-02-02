"use client";

import { useState, useCallback, useEffect } from "react";
import type { PreAuthCheckItem, WorkflowStageId, PreAuthWorkflowData, FraudRedFlag } from "@/lib/types";
import { formatCurrency } from "@/lib/data";
import { WORKFLOW_STAGES, getWorkflowData } from "@/lib/workflow-data";
import { AnalysisFlow } from "./AnalysisFlow";
import { DocumentViewerModal } from "@/app/components/DocumentViewerModal";
import { getDocumentLinesForItem } from "@/lib/document-helper";
import { PdfLine } from "@/lib/pdf-generator";
import { FraudSection } from "./FraudSection";

const STAGE_IDS = WORKFLOW_STAGES.map((s) => s.id);



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
  externalOpenDoc?: (type: string, item: any, context?: any) => void;
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
  externalOpenDoc,
}: PreAuthWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const [decisionMade, setDecisionMade] = useState<"approve" | "deny" | "query" | "conditional" | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Local state for workflow data to allow status overrides
  const [localWorkflowData, setLocalWorkflowData] = useState<PreAuthWorkflowData | null | undefined>(() => getWorkflowData(preAuthId));

  useEffect(() => {
    setLocalWorkflowData(getWorkflowData(preAuthId));
  }, [preAuthId]);

  const openDoc = (type: string, item: any, context?: any) => {
    if (externalOpenDoc) {
      externalOpenDoc(type, item, context);
      return;
    }
  };

  const updateEligibilityStatus = (itemId: string, newStatus: string) => {
    if (!localWorkflowData) return;
    setLocalWorkflowData({
      ...localWorkflowData,
      eligibility: localWorkflowData.eligibility.map((item) =>
        item.id === itemId ? { ...item, status: newStatus as any } : item
      ),
    });
  };

  const updateCodingStatus = (type: "icd10" | "cpt", itemId: string, newStatus: string) => {
    if (!localWorkflowData) return;
    setLocalWorkflowData({
      ...localWorkflowData,
      coding: {
        ...localWorkflowData.coding,
        [type]: localWorkflowData.coding[type].map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item
        ),
      },
    });
  };

  const updateMedicalNecessityStatus = (itemId: string, newStatus: string) => {
    if (!localWorkflowData) return;
    setLocalWorkflowData({
      ...localWorkflowData,
      medicalNecessity: localWorkflowData.medicalNecessity.map((item) =>
        item.id === itemId ? { ...item, status: newStatus as any } : item
      ),
    });
  };

  const updateInsightStatus = (insightId: string, field: "irdaApproved" | "policyApproved", value: boolean) => {
    if (!localWorkflowData) return;
    setLocalWorkflowData({
      ...localWorkflowData,
      medicalNecessityInsights: localWorkflowData.medicalNecessityInsights.map((insight) =>
        insight.id === insightId ? { ...insight, [field]: value } : insight
      ),
    });
  };
  const stageId = STAGE_IDS[currentStep];
  const isLastStep = currentStep === STAGE_IDS.length - 1;
  const isDecisionStep = stageId === "queries_and_decision";

  const markStepComplete = useCallback((idx: number) => {
    setCompletedSteps((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
  }, []);

  useEffect(() => {
    if (decisionMade && isDecisionStep) {
      markStepComplete(currentStep);
    }
  }, [decisionMade, isDecisionStep, currentStep, markStepComplete]);





  const isStepCompleted = completedSteps.includes(currentStep);

  const goNext = useCallback(() => {
    if (currentStep < STAGE_IDS.length - 1) setCurrentStep((s) => s + 1);
  }, [currentStep]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const items = analysisResult ?? checklist;
  const approvedCount = items.filter((c) => c.status === "approved").length;
  const totalChecklist = items.length;
  const docScore = totalChecklist ? Math.round((approvedCount / totalChecklist) * 100) : 0;
  const canApprove = docScore >= 80 && (localWorkflowData?.queries.length ?? 0) === 0;

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
            {WORKFLOW_STAGES.map((stage, idx) => {
              const isCompleted = completedSteps.includes(idx);
              const isActive = idx === currentStep;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-all duration-200 ${isActive
                    ? "bg-teal-600 text-white shadow-md font-medium"
                    : isCompleted
                      ? "bg-teal-50 text-teal-800 hover:bg-teal-100"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${isActive ? "bg-white/20" : isCompleted ? "bg-teal-200 text-teal-800" : "bg-slate-200 text-slate-600"
                        }`}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </span>
                    {stage.shortTitle}
                  </span>
                </button>
              );
            })}
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
                  onViewDoc={(item) => openDoc("Request Item", item)}
                />
                <p className="text-xs text-slate-500">
                  Decision within 1 hour of complete documentation. Missing items require query to hospital.
                </p>
              </div>
            )}

            {/* Stage 3: Eligibility */}
            {stageId === "eligibility" && (localWorkflowData ? (
              <EligibilityContent
                items={localWorkflowData.eligibility}
                onViewDoc={(item) => openDoc("Eligibility", item)}
                onStatusChange={updateEligibilityStatus}
              />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">Workflow demo data not loaded.</div>
            ))}

            {/* Stage 4: Medical Coding */}
            {stageId === "medical_coding" && (localWorkflowData ? (
              <CodingContent
                coding={localWorkflowData.coding}
                onViewDoc={(item) => openDoc("Medical Coding", item)}
                onStatusChange={updateCodingStatus}
              />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">Workflow demo data not loaded.</div>
            ))}

            {/* Stage 5: Medical Necessity */}
            {stageId === "medical_necessity" && (localWorkflowData ? (
              <MedicalNecessityContent
                items={localWorkflowData.medicalNecessity}
                score={localWorkflowData.medicalNecessityScore}
                insights={localWorkflowData.medicalNecessityInsights}
                onViewDoc={(item) => openDoc("Medical Necessity", item)}
                onStatusChange={updateMedicalNecessityStatus}
                onInsightStatusChange={updateInsightStatus}
              />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">Workflow demo data not loaded.</div>
            ))}

            {/* Stage 6: Fraud & Anomaly */}
            {stageId === "fraud_anomaly" && (localWorkflowData ? (
              <FraudSection
                flags={localWorkflowData.fraudFlags}
                onViewDoc={(item) => openDoc("Fraud & Anomaly", item)}
              />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">Workflow demo data not loaded.</div>
            ))}

            {/* Stage 7: Queries & Decision (merged) */}
            {stageId === "queries_and_decision" && (
              <div className="space-y-6">
                {localWorkflowData ? (
                  <QueryContent
                    queries={localWorkflowData.queries}
                    onViewDoc={(item) => openDoc("Query", item)}
                  />
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-slate-500 text-sm">Workflow demo data not loaded.</div>
                )}
                <DecisionContent
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
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => markStepComplete(currentStep)}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 ${isStepCompleted
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-teal-600 text-white hover:bg-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    }`}
                >
                  {isStepCompleted ? (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    "Mark as complete"
                  )}
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {isLastStep ? "Queries & decision" : "Next step"}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// --- Stage content components ---




function EligibilityContent({
  items,
  onViewDoc,
  onStatusChange,
}: {
  items: PreAuthWorkflowData["eligibility"];
  onViewDoc: (item: PreAuthWorkflowData["eligibility"][number]) => void;
  onStatusChange: (itemId: string, newStatus: string) => void;
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
            <button
              onClick={() => onViewDoc(item)}
              className="mt-2.5 inline-flex items-center gap-2 text-[11px] font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-tight"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Verify Source
            </button>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <select
                value={item.status}
                onChange={(e) => onStatusChange(item.id, e.target.value)}
                className={`appearance-none rounded-full py-0.5 pl-3 pr-7 text-xs font-medium border-0 focus:ring-2 focus:ring-opacity-50 cursor-pointer transition-colors ${item.status === "pass"
                  ? "bg-emerald-100 text-emerald-800 focus:ring-emerald-500"
                  : item.status === "fail"
                    ? "bg-red-100 text-red-800 focus:ring-red-500"
                    : "bg-amber-100 text-amber-800 focus:ring-amber-500"
                  }`}
              >
                <option value="pass">Pass</option>
                <option value="review">Review later</option>
                <option value="fail">Fail</option>
                <option value="seek_clarification">Seek clarification from hospital</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5">
                <svg className="h-3 w-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CodingContent({
  coding,
  onViewDoc,
  onStatusChange,
}: {
  coding: PreAuthWorkflowData["coding"];
  onViewDoc: (item: PreAuthWorkflowData["coding"]["icd10"][number] | PreAuthWorkflowData["coding"]["cpt"][number]) => void;
  onStatusChange: (type: "icd10" | "cpt", itemId: string, newStatus: string) => void;
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
                <button
                  onClick={() => onViewDoc(item)}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Verify Source
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={item.status}
                    onChange={(e) => onStatusChange("icd10", item.id, e.target.value)}
                    className={`appearance-none rounded-full py-0.5 pl-3 pr-7 text-xs font-medium border-0 focus:ring-2 focus:ring-opacity-50 cursor-pointer ${item.status === "valid" ? "bg-emerald-100 text-emerald-800 focus:ring-emerald-500" : "bg-amber-100 text-amber-800 focus:ring-amber-500"
                      }`}
                  >
                    <option value="valid">Valid</option>
                    <option value="review">Review later</option>
                    <option value="invalid">Invalid</option>
                    <option value="seek_clarification">Seek clarification from hospital</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5">
                    <svg className="h-3 w-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
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
                <button
                  onClick={() => onViewDoc(item)}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Verify Source
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={item.status}
                    onChange={(e) => onStatusChange("cpt", item.id, e.target.value)}
                    className={`appearance-none rounded-full py-0.5 pl-3 pr-7 text-xs font-medium border-0 focus:ring-2 focus:ring-opacity-50 cursor-pointer ${item.status === "valid" ? "bg-emerald-100 text-emerald-800 focus:ring-emerald-500" : "bg-amber-100 text-amber-800 focus:ring-amber-500"
                      }`}
                  >
                    <option value="valid">Valid</option>
                    <option value="review">Review later</option>
                    <option value="invalid">Invalid</option>
                    <option value="seek_clarification">Seek clarification from hospital</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5">
                    <svg className="h-3 w-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
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
  onViewDoc,
  onStatusChange,
  onInsightStatusChange,
}: {
  items: PreAuthWorkflowData["medicalNecessity"];
  score: PreAuthWorkflowData["medicalNecessityScore"];
  insights: PreAuthWorkflowData["medicalNecessityInsights"];
  onViewDoc: (item: PreAuthWorkflowData["medicalNecessity"][number] | { source: string; finding: string; label: string }) => void;
  onStatusChange: (itemId: string, newStatus: string) => void;
  onInsightStatusChange: (insightId: string, field: "irdaApproved" | "policyApproved", value: boolean) => void;
}) {
  const levelNames: Record<number, string> = {
    1: "Law / Regulations",
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
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-medium text-slate-600">Approved:</span>
                    <select
                      value={insight.irdaApproved ? "yes" : "review"}
                      onChange={(e) => onInsightStatusChange(insight.id, "irdaApproved", e.target.value === "yes")}
                      className={`appearance-none rounded-full py-0.5 pl-2 pr-5 text-[10px] font-medium border-0 focus:ring-0 cursor-pointer ${insight.irdaApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                    >
                      <option value="yes">Yes</option>
                      <option value="review">Review later</option>
                      <option value="seek_clarification">Seek clarification from hospital</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-medium text-slate-600">Policy:</span>
                    <select
                      value={insight.policyApproved ? "yes" : "review"}
                      onChange={(e) => onInsightStatusChange(insight.id, "policyApproved", e.target.value === "yes")}
                      className={`appearance-none rounded-full py-0.5 pl-2 pr-5 text-[10px] font-medium border-0 focus:ring-0 cursor-pointer ${insight.policyApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                    >
                      <option value="yes">Yes</option>
                      <option value="review">Review later</option>
                      <option value="seek_clarification">Seek clarification from hospital</option>
                    </select>
                  </div>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                    AI view
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">{insight.aiSummary}</p>
                  <button
                    onClick={() => onViewDoc({ source: insight.sourceLabel, finding: insight.aiSummary, label: insight.sourceLabel })}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {insight.sourceLabel}
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3h7v7" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14L21 3" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 14v7h-7" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10V3h7" />
                    </svg>
                  </button>
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
              <button
                onClick={() => onViewDoc(item)}
                className="mt-2.5 inline-flex items-center gap-2 text-[11px] font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-tight"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Verify Source
              </button>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <select
                  value={item.status}
                  onChange={(e) => onStatusChange(item.id, e.target.value)}
                  className={`appearance-none rounded-full py-0.5 pl-3 pr-7 text-xs font-medium border-0 focus:ring-2 focus:ring-opacity-50 cursor-pointer ${item.status === "met"
                    ? "bg-emerald-100 text-emerald-800 focus:ring-emerald-500"
                    : item.status === "not_met"
                      ? "bg-red-100 text-red-800 focus:ring-red-500"
                      : "bg-amber-100 text-amber-800 focus:ring-amber-500"
                    }`}
                >
                  <option value="met">Met</option>
                  <option value="conditional">Conditional</option>
                  <option value="not_met">Not met</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5">
                  <svg className="h-3 w-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


function QueryContent({
  queries,
  onViewDoc,
}: {
  queries: PreAuthWorkflowData["queries"];
  onViewDoc: (item: any) => void;
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
              <p className="text-xs text-slate-500 mt-1">Response due: {q.dueDate} (7 days)</p>
            )}
            <button
              onClick={() => onViewDoc({ label: "Query Record", value: q.question })}
              className="mt-2 inline-flex items-center gap-2 text-[11px] font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-tight"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Verify Source
            </button>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-200 text-amber-900">
              {q.status}
            </span>

          </div>
        </li>
      ))}
      <p className="text-xs text-slate-500">Raise queries within 4 hours. Default denial if no response by day 7.</p>
    </ul>
  );
}

function DecisionContent({
  canApprove,
  procedure,
  estimatedAmount,
  claimId,
  decisionMade,
  onDecision,
}: {
  canApprove: boolean;
  procedure: string;
  estimatedAmount: number;
  claimId: string;
  decisionMade: "approve" | "deny" | "query" | "conditional" | null;
  onDecision: (d: "approve" | "deny" | "query" | "conditional") => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600"><strong>Claim:</strong> {claimId}</p>
        <p className="text-sm text-slate-600"><strong>Procedure:</strong> {procedure}</p>
        <p className="text-sm text-slate-600"><strong>Estimated amount:</strong> {formatCurrency(estimatedAmount)}</p>
        <p className="text-xs text-slate-500 mt-2">TAT: Communicate decision within 1 hour of complete documentation.</p>
      </div>

      {
        decisionMade ? (
          <div className="rounded-xl border-2 border-teal-300 bg-teal-50 p-5 text-center" >
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

      {
        !canApprove && !decisionMade && (
          <p className="text-xs text-amber-700">
            Approve is disabled until documentation is complete and open queries are resolved. Use Query to request missing items.
          </p>
        )
      }
    </div >
  );
}
