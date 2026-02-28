"use client";

import { useState, useEffect } from "react";
import type {
  PreAuthCheckItem,
  WorkflowStageId,
  PreAuthWorkflowData,
  SectionStatus,
  UiTab,
  CrossTabQuery,
} from "@/lib/types";
import { formatCurrency } from "@/lib/data";
import { getWorkflowData } from "@/lib/workflow-data";
import { AnalysisFlow } from "./AnalysisFlow";
import { FraudSection } from "./FraudSection";
import { QueryModal } from "../../components/QueryModal";

// ─── Raise Query inline form ──────────────────────────────────────────────────

const TAB_LABELS: Record<UiTab, string> = {
  policy_id_docs: "Policy & ID Docs",
  medical_docs: "Medical Documents",
  medical_coding: "Medical Coding",
  medical_necessity: "Medical Necessity",
  fraud_anomaly: "Fraud & Anomaly",
  queries_and_decision: "Decision",
};

function RaiseQuerySection({
  sourceTab,
  queries,
  onAdd,
  onRemove,
}: {
  sourceTab: UiTab;
  queries: CrossTabQuery[];
  onAdd: (question: string) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const tabQueries = queries.filter((q) => q.sourceTab === sourceTab);

  return (
    <div style={{ marginTop: 24 }}>
      {/* Existing raised queries for this tab */}
      {tabQueries.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <p style={{
            fontSize: "var(--font-size-xs)", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.04em",
            color: "var(--color-text-muted)", marginBottom: 8,
          }}>
            Raised Queries ({tabQueries.length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {tabQueries.map((q) => (
              <div key={q.id} style={{
                display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8,
                padding: "8px 12px",
                background: "#FFFBEB", border: "1px solid #FDE68A",
                borderRadius: "var(--radius-xs)",
              }}>
                <p style={{ fontSize: "var(--font-size-xs)", color: "#78350F", flex: 1, margin: 0 }} title={q.question}>
                  {q.question.length > 40 ? q.question.substring(0, 40) + "..." : q.question}
                </p>
                <button
                  onClick={() => onRemove(q.id)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#92400E", flexShrink: 0, padding: 0, fontSize: 14, lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add query form / trigger */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          fontSize: "var(--font-size-xs)", fontWeight: 600,
          color: "var(--color-text-muted)",
          background: "none",
          border: "1px dashed var(--color-border)",
          borderRadius: "var(--radius-xs)",
          padding: "6px 12px",
          cursor: "pointer",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Raise Query to Hospital
      </button>

      <QueryModal
        isOpen={open}
        title={`New query from ${TAB_LABELS[sourceTab]}`}
        onSave={(newText: string) => {
          onAdd(newText);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

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
  activeTab: UiTab;
  onOpenDoc: (type: string, item: any, context?: any) => void;
  sectionStatus: Record<WorkflowStageId, SectionStatus>;
  crossTabQueries: CrossTabQuery[];
  onAddQuery: (sourceTab: UiTab, sourceLabel: string, question: string) => void;
  onRemoveQuery: (id: string) => void;
}

// ─── Main workflow ────────────────────────────────────────────────────────────

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
  activeTab,
  onOpenDoc,
  sectionStatus,
  crossTabQueries,
  onAddQuery,
  onRemoveQuery,
}: PreAuthWorkflowProps) {
  const [localWorkflowData, setLocalWorkflowData] = useState<PreAuthWorkflowData | null | undefined>(() => getWorkflowData(preAuthId));

  useEffect(() => {
    setLocalWorkflowData(getWorkflowData(preAuthId));
  }, [preAuthId]);

  const updateEligibilityStatus = (itemId: string, newStatus: string) => {
    if (!localWorkflowData) return;
    setLocalWorkflowData({ ...localWorkflowData, eligibility: localWorkflowData.eligibility.map((item) => item.id === itemId ? { ...item, status: newStatus as any } : item) });
  };

  const updateCodingStatus = (type: "icd10" | "cpt", itemId: string, newStatus: string) => {
    if (!localWorkflowData) return;
    setLocalWorkflowData({ ...localWorkflowData, coding: { ...localWorkflowData.coding, [type]: localWorkflowData.coding[type].map((item) => item.id === itemId ? { ...item, status: newStatus } : item) } });
  };

  const updateMedicalNecessityStatus = (itemId: string, newStatus: string) => {
    if (!localWorkflowData) return;
    setLocalWorkflowData({ ...localWorkflowData, medicalNecessity: localWorkflowData.medicalNecessity.map((item) => item.id === itemId ? { ...item, status: newStatus as any } : item) });
  };

  const items = analysisResult ?? checklist;
  const approvedCount = items.filter((c) => c.status === "approved").length;
  const totalChecklist = items.length;
  const docScore = totalChecklist ? Math.round((approvedCount / totalChecklist) * 100) : 0;
  const openQueries = (localWorkflowData?.queries.filter((q) => q.status === "open").length ?? 0) + crossTabQueries.length;
  const canApprove = docScore >= 80 && openQueries === 0;

  const addQuery = (question: string) => {
    onAddQuery(activeTab, TAB_LABELS[activeTab], question);
  };

  // ─── Render section content ─────────────────────────────────────────────────

  return (
    <div>
      {/* Policy & ID Docs */}
      {activeTab === "policy_id_docs" && (
        <>
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
            onViewDoc={(item) => onOpenDoc("Request Item", item)}
            eligibilityItems={localWorkflowData?.eligibility ?? []}
            onEligibilityStatusChange={updateEligibilityStatus}
            docFilter="policy_id"
            onRaiseDocQuery={(label, text) => addQuery(`[Policy & ID] ${label}: ${text}`)}
          />
          <RaiseQuerySection
            sourceTab={activeTab}
            queries={crossTabQueries}
            onAdd={addQuery}
            onRemove={onRemoveQuery}
          />
        </>
      )}

      {/* Medical Docs */}
      {activeTab === "medical_docs" && (
        <>
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
            onViewDoc={(item) => onOpenDoc("Request Item", item)}
            eligibilityItems={localWorkflowData?.eligibility ?? []}
            onEligibilityStatusChange={updateEligibilityStatus}
            docFilter="medical"
            onRaiseDocQuery={(label, text) => addQuery(`[Medical Docs] ${label}: ${text}`)}
          />
          <RaiseQuerySection
            sourceTab={activeTab}
            queries={crossTabQueries}
            onAdd={addQuery}
            onRemove={onRemoveQuery}
          />
        </>
      )}

      {/* Medical Coding */}
      {activeTab === "medical_coding" && (
        <>
          {localWorkflowData ? (
            <CodingContent
              coding={localWorkflowData.coding}
              onViewDoc={(item) => onOpenDoc("Medical Coding", item)}
              onStatusChange={updateCodingStatus}
            />
          ) : <EmptyState />}
          <RaiseQuerySection
            sourceTab={activeTab}
            queries={crossTabQueries}
            onAdd={addQuery}
            onRemove={onRemoveQuery}
          />
        </>
      )}

      {/* Medical Necessity */}
      {activeTab === "medical_necessity" && (
        <>
          {localWorkflowData ? (
            <MedicalNecessityContent
              items={localWorkflowData.medicalNecessity}
              score={localWorkflowData.medicalNecessityScore}
              p2pRequired={localWorkflowData.p2pRequired}
              p2pSummary={localWorkflowData.p2pSummary}
              onViewDoc={(item) => onOpenDoc("Medical Necessity", item)}
              onStatusChange={updateMedicalNecessityStatus}
            />
          ) : <EmptyState />}
          <RaiseQuerySection
            sourceTab={activeTab}
            queries={crossTabQueries}
            onAdd={addQuery}
            onRemove={onRemoveQuery}
          />
        </>
      )}

      {/* Fraud & Anomaly */}
      {activeTab === "fraud_anomaly" && (
        <>
          {localWorkflowData ? (
            <FraudSection
              flags={localWorkflowData.fraudFlags}
              onViewDoc={(item) => onOpenDoc("Fraud & Anomaly", item)}
            />
          ) : <EmptyState />}
          <RaiseQuerySection
            sourceTab={activeTab}
            queries={crossTabQueries}
            onAdd={addQuery}
            onRemove={onRemoveQuery}
          />
        </>
      )}

      {/* Queries & Decision */}
      {activeTab === "queries_and_decision" && (
        <DecisionStage
          backendQueries={localWorkflowData?.queries ?? []}
          crossTabQueries={crossTabQueries}
          onRemoveCrossTabQuery={onRemoveQuery}
          canApprove={canApprove}
          procedure={procedure}
          estimatedAmount={estimatedAmount}
          claimId={claimId}
          preAuthKey={preAuthKey ?? claimId}
          patientName={patientName ?? "Patient"}
          hospitalName={hospitalName ?? "the Hospital"}
          sectionStatus={sectionStatus}
          onViewDoc={(item) => onOpenDoc("Query", item)}
        />
      )}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      background: "var(--color-white)", border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-md)", padding: 24,
      textAlign: "center", fontSize: "var(--font-size-base)", color: "var(--color-text-muted)",
    }}>
      Workflow data not loaded.
    </div>
  );
}

// ─── Stage 2: Medical Coding ──────────────────────────────────────────────────

function CodingContent({
  coding, onViewDoc, onStatusChange,
}: {
  coding: PreAuthWorkflowData["coding"];
  onViewDoc: (item: any) => void;
  onStatusChange: (type: "icd10" | "cpt", itemId: string, newStatus: string) => void;
}) {
  const [codingVerdicts, setCodingVerdicts] = useState<Record<string, string>>({});
  const allItems = [...coding.icd10, ...coding.cpt];
  const setVerdict = (id: string, v: string) => setCodingVerdicts((prev) => ({ ...prev, [id]: v }));

  const renderCodeCard = (item: typeof allItems[number], type: "icd10" | "cpt") => {
    const verdict = codingVerdicts[item.id] ?? "accept";
    const vc = { accept: { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" }, query: { color: "#92400e", bg: "#fffbeb", border: "#fde68a" }, reject: { color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" } }[verdict]!;

    return (
      <div key={item.id} style={{ background: "var(--color-white)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xs)", padding: "1px 6px" }}>
                {item.code}
              </span>
              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {type === "icd10" ? "ICD-10 Diagnosis" : "CPT Procedure"}
              </span>
            </div>
            <p style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-primary)", fontWeight: 500, marginBottom: 4 }}>{item.description}</p>
          </div>
          <select value={verdict} onChange={(e) => setVerdict(item.id, e.target.value)} style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, padding: "3px 8px", borderRadius: "var(--radius-xs)", border: `1px solid ${vc.border}`, background: vc.bg, color: vc.color, cursor: "pointer", flexShrink: 0 }}>
            <option value="accept">Accept</option>
            <option value="query">Query</option>
            <option value="reject">Reject</option>
          </select>
        </div>

        {item.diagnosisMatch && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: "var(--font-size-xs)", color: "#15803d", fontWeight: 500 }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            {item.diagnosisMatch}
          </div>
        )}
        {item.clinicalContext && (
          <blockquote style={{ borderLeft: "3px solid #CCCCCC", background: "var(--color-bg)", padding: "8px 12px", margin: "8px 0", borderRadius: "0 var(--radius-xs) var(--radius-xs) 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", fontStyle: "italic" }}>
            {item.clinicalContext}
          </blockquote>
        )}
        {item.suggestion && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "var(--radius-xs)", marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" /></svg>
            <p style={{ fontSize: "var(--font-size-xs)", color: "#1D4ED8", margin: 0 }}><strong>AI Hint:</strong> {item.suggestion}</p>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
          <select value={item.status} onChange={(e) => onStatusChange(type, item.id, e.target.value)} style={{ fontSize: "var(--font-size-xs)", padding: "2px 8px", borderRadius: 20, border: "none", background: item.status === "valid" ? "#dcfce7" : item.status === "mismatch" ? "#fef2f2" : "#fefce8", color: item.status === "valid" ? "#15803d" : item.status === "mismatch" ? "#b91c1c" : "#92400e", cursor: "pointer", fontWeight: 600 }}>
            <option value="valid">Valid</option>
            <option value="mismatch">Mismatch</option>
            <option value="missing_specificity">Missing Specificity</option>
          </select>
          <button onClick={() => onViewDoc(item)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-secondary)", background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xs)", padding: "3px 8px", cursor: "pointer" }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            View in Document
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", marginBottom: 10 }}>ICD-10 Diagnosis Codes</h3>
        {coding.icd10.map((item) => renderCodeCard(item, "icd10"))}
      </div>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", marginBottom: 10 }}>CPT Procedure Codes</h3>
        {coding.cpt.map((item) => renderCodeCard(item, "cpt"))}
      </div>
      <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
        Diagnosis–procedure match verified. Incorrect codes can cause automated claim rejection.
      </p>
    </div>
  );
}

// ─── Stage 3: Medical Necessity ───────────────────────────────────────────────

const TIER_NAMES: Record<number, string> = {
  1: "IRDAI Guidelines",
  2: "Insurer Policy",
  3: "Clinical Tool",
  4: "Clinical Literature",
  5: "Treating Provider",
};

function MedicalNecessityContent({
  items, score, p2pRequired, p2pSummary, onViewDoc, onStatusChange,
}: {
  items: PreAuthWorkflowData["medicalNecessity"];
  score: PreAuthWorkflowData["medicalNecessityScore"];
  p2pRequired: boolean;
  p2pSummary?: PreAuthWorkflowData["p2pSummary"];
  onViewDoc: (item: any) => void;
  onStatusChange: (itemId: string, newStatus: string) => void;
}) {
  const [necessityVerdict, setNecessityVerdict] = useState<"confirmed" | "disputed" | null>(null);
  const scoreColor = score >= 80 ? "var(--color-green, #15803D)" : score >= 50 ? "var(--color-yellow, #CA8A04)" : "var(--color-red, #DC2626)";
  const scoreBg = score >= 80 ? "#F0FDF4" : score >= 50 ? "#FFFBEB" : "#FEF2F2";
  const scoreBorder = score >= 80 ? "#BBF7D0" : score >= 50 ? "#FDE68A" : "#FECACA";
  const scoreText = score >= 80 ? "Procedure is medically indicated — strong clinical evidence present" : score >= 50 ? "Procedure is conditionally indicated — some criteria need clarification" : "Insufficient evidence — procedure necessity requires further justification";

  const necessityChecklist = [
    { id: "nc1", question: "Was conservative treatment tried?", answer: score >= 80 ? "Yes — patient presented with acute STEMI requiring immediate intervention; conservative treatment not appropriate." : "Unclear — no documentation of prior conservative management found." },
    { id: "nc2", question: "Is timing appropriate?", answer: score >= 80 ? "Yes — emergency presentation with door-to-balloon time within IRDAI-recommended 90-minute window." : "Timing documentation incomplete." },
    { id: "nc3", question: "Does severity justify the procedure?", answer: score >= 80 ? "Yes — ECG confirmed STEMI with ST-elevation ≥2mm; troponin 2.4× ULN indicates significant myocardial injury." : "Severity data insufficient for definitive assessment." },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: scoreBg, border: `1px solid ${scoreBorder}`, borderRadius: "var(--radius-md)", padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: "var(--radius-sm)", background: scoreColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{score}%</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>Necessity Score: {score}/100</p>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", marginBottom: 8 }}>{scoreText}</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: "var(--radius-xs)", background: p2pRequired ? "#FEF2F2" : "#F0FDF4", border: `1px solid ${p2pRequired ? "#FECACA" : "#BBF7D0"}`, fontSize: "var(--font-size-xs)", fontWeight: 600, color: p2pRequired ? "#B91C1C" : "#15803D" }}>
            {p2pRequired ? "⚠ P2P Review Required" : "✓ No P2P Required"}
          </div>
        </div>
      </div>

      <div style={{ background: "var(--color-white)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
          <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)" }}>Clinical Necessity Checklist</p>
        </div>
        {necessityChecklist.map((nc, idx) => (
          <div key={nc.id} style={{ padding: "12px 16px", borderBottom: idx < necessityChecklist.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <p style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>{nc.question}</p>
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>{nc.answer}</p>
          </div>
        ))}
      </div>

      <div>
        <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", marginBottom: 10 }}>Supporting Evidence</p>
        {items.map((item) => (
          <div key={item.id} style={{ background: "var(--color-white)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)" }}>{TIER_NAMES[item.level] ?? `Level ${item.level}`}</span>
                <p style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 6, marginTop: 4 }}>{item.source}</p>
                <blockquote style={{ borderLeft: "3px solid #CCCCCC", background: "var(--color-bg)", padding: "8px 12px", margin: 0, borderRadius: "0 var(--radius-xs) var(--radius-xs) 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", fontStyle: "italic" }}>
                  {item.finding}
                </blockquote>
              </div>
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <select value={item.status} onChange={(e) => onStatusChange(item.id, e.target.value)} style={{ fontSize: "var(--font-size-xs)", padding: "2px 8px", borderRadius: 20, border: "none", background: item.status === "met" ? "#dcfce7" : item.status === "not_met" ? "#fef2f2" : "#fefce8", color: item.status === "met" ? "#15803d" : item.status === "not_met" ? "#b91c1c" : "#92400e", cursor: "pointer", fontWeight: 600 }}>
                  <option value="met">Met</option>
                  <option value="conditional">Conditional</option>
                  <option value="not_met">Not Met</option>
                </select>
                <button onClick={() => onViewDoc(item)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-secondary)", background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xs)", padding: "3px 8px", cursor: "pointer", whiteSpace: "nowrap" }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  View in Doc
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--color-white)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: 16 }}>
        <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", marginBottom: 12 }}>TPA Necessity Verdict</p>
        <div style={{ display: "flex", gap: 10 }}>
          {(["confirmed", "disputed"] as const).map((v) => (
            <button key={v} onClick={() => setNecessityVerdict(v)} style={{ flex: 1, padding: "8px 0", borderRadius: "var(--radius-sm)", border: necessityVerdict === v ? `2px solid ${v === "confirmed" ? "#16A34A" : "#DC2626"}` : "1px solid var(--color-border)", background: necessityVerdict === v ? (v === "confirmed" ? "#F0FDF4" : "#FEF2F2") : "var(--color-white)", color: necessityVerdict === v ? (v === "confirmed" ? "#15803D" : "#B91C1C") : "var(--color-text-secondary)", fontWeight: 600, fontSize: "var(--font-size-base)", cursor: "pointer" }}>
              {v === "confirmed" ? "✓ Necessity Confirmed" : "✗ Necessity Disputed"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stage 5: Queries & Decision ─────────────────────────────────────────────

function generateDecisionLetter(decision: string, preAuthKey: string, patientName: string, hospitalName: string, procedure: string, estimatedAmount: number, note: string, crossTabQueries: CrossTabQuery[]): string {
  const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const decisionText = { approve: "APPROVED", deny: "DENIED", query: "PENDING — ADDITIONAL INFORMATION REQUIRED", conditional: "CONDITIONALLY APPROVED" }[decision] ?? decision.toUpperCase();
  const body = { approve: `We are pleased to inform you that the above pre-authorization request has been approved. An authorization number will be issued separately and is valid for 15 days from the date of this letter.`, deny: `After careful review, we are unable to approve the above pre-authorization request. The detailed reason for denial and information on your right to appeal will be communicated separately.`, query: `We have reviewed the pre-authorization request and require additional information before a final decision can be made. Our specific queries have been communicated separately and a response is requested within 7 days.`, conditional: `The above pre-authorization request is approved subject to the conditions stated separately. The hospital must confirm compliance before proceeding.` }[decision] ?? "";

  const querySection = crossTabQueries.length > 0
    ? `\nPending Queries:\n${crossTabQueries.map((q, i) => `${i + 1}. [${q.sourceLabel}] ${q.question}`).join("\n")}\n`
    : "";

  return `Reference: ${preAuthKey}\nDate: ${date}\n\nTo: Admissions Department\nHospital: ${hospitalName}\nRe: Pre-Authorization Decision — ${patientName}\n\nProcedure: ${procedure}\nEstimated Amount: ₹${estimatedAmount.toLocaleString("en-IN")}\n\nDECISION: ${decisionText}\n\nDear Sir/Madam,\n\n${body}${querySection}\n${note ? `Adjudicator Note:\n${note}\n` : ""}\nThis decision is issued pursuant to IRDAI guidelines and the applicable insurance policy terms.\n\nRegards,\nPre-Authorization Team\nRxPay TPA Services`;
}

function DecisionStage({
  backendQueries, crossTabQueries, onRemoveCrossTabQuery,
  canApprove, procedure, estimatedAmount, claimId, preAuthKey,
  patientName, hospitalName, sectionStatus, onViewDoc,
}: {
  backendQueries: PreAuthWorkflowData["queries"];
  crossTabQueries: CrossTabQuery[];
  onRemoveCrossTabQuery: (id: string) => void;
  canApprove: boolean;
  procedure: string;
  estimatedAmount: number;
  claimId: string;
  preAuthKey: string;
  patientName: string;
  hospitalName: string;
  sectionStatus: Record<WorkflowStageId, SectionStatus>;
  onViewDoc: (item: any) => void;
}) {
  const [decision, setDecision] = useState<"approve" | "deny" | "query" | "conditional" | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const noteValid = note.trim().length >= 20;
  const canSubmit = decision !== null && noteValid;
  const showLetter = decision !== null && noteValid;

  const letterPreview = showLetter
    ? generateDecisionLetter(decision!, preAuthKey, patientName, hospitalName, procedure, estimatedAmount, note, crossTabQueries)
    : "";

  if (submitted) {
    return (
      <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "var(--radius-md)", padding: 24, textAlign: "center" }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#15803D", marginBottom: 4 }}>✓ Decision Submitted</p>
        <p style={{ fontSize: "var(--font-size-base)", color: "#166534" }}>
          {decision === "approve" && "Authorization will be issued. Validity: 15 days."}
          {decision === "deny" && "Denial reason and appeal rights will be communicated."}
          {decision === "query" && "Specific queries sent to hospital; 7-day response deadline."}
          {decision === "conditional" && "Approval with conditions; hospital must confirm parameters."}
        </p>
        <button onClick={() => { setSubmitted(false); setDecision(null); setNote(""); }} style={{ marginTop: 12, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xs)", padding: "4px 12px", cursor: "pointer" }}>Undo</button>
      </div>
    );
  }

  const summaryStages: WorkflowStageId[] = ["documentation", "medical_coding", "medical_necessity", "fraud_anomaly"];
  const SECTION_LABELS: Record<WorkflowStageId, string> = { documentation: "Docs", eligibility: "Eligibility", medical_coding: "Coding", medical_necessity: "Necessity", fraud_anomaly: "Fraud", queries_and_decision: "Decision" };
  const TAB_COLORS = { done: { bg: "#F0FDF4", border: "#BBF7D0", color: "#15803D", icon: "✓" }, needs_attention: { bg: "#FEF2F2", border: "#FECACA", color: "#B91C1C", icon: "⚠" }, in_progress: { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E", icon: "●" }, pending: { bg: "var(--color-bg)", border: "var(--color-border)", color: "var(--color-text-muted)", icon: "—" } };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Case summary */}
      <div style={{ background: "var(--color-white)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: 16 }}>
        <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", marginBottom: 12 }}>Case Summary</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {summaryStages.map((stageId) => {
            const status = sectionStatus[stageId];
            const c = TAB_COLORS[status] ?? TAB_COLORS.pending;
            return (
              <div key={stageId} style={{ flex: "1 1 140px", background: c.bg, border: `1px solid ${c.border}`, borderRadius: "var(--radius-sm)", padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: c.color }}>{c.icon}</span>
                <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: c.color }}>{SECTION_LABELS[stageId]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-tab queries — grouped by source tab */}
      {crossTabQueries.length > 0 && (() => {
        // Color palette per source tab
        const TAB_COLORS_MAP: Record<string, { bg: string; border: string; color: string; dot: string }> = {
          "Policy & ID Docs": { bg: "#EFF6FF", border: "#BFDBFE", color: "#1D4ED8", dot: "#3B82F6" },
          "Medical Documents": { bg: "#F0FDF4", border: "#BBF7D0", color: "#15803D", dot: "#22C55E" },
          "Medical Coding": { bg: "#F5F3FF", border: "#DDD6FE", color: "#6D28D9", dot: "#8B5CF6" },
          "Medical Necessity": { bg: "#FFF7ED", border: "#FED7AA", color: "#C2410C", dot: "#F97316" },
          "Fraud & Anomaly": { bg: "#FEF2F2", border: "#FECACA", color: "#B91C1C", dot: "#EF4444" },
          "Decision": { bg: "#F8FAFC", border: "#E2E8F0", color: "#475569", dot: "#64748B" },
        };
        // Group queries by sourceLabel — preserving insertion order
        const groups: { label: string; queries: typeof crossTabQueries }[] = [];
        const seen = new Map<string, typeof crossTabQueries>();
        crossTabQueries.forEach((q) => {
          if (!seen.has(q.sourceLabel)) {
            seen.set(q.sourceLabel, []);
            groups.push({ label: q.sourceLabel, queries: seen.get(q.sourceLabel)! });
          }
          seen.get(q.sourceLabel)!.push(q);
        });

        return (
          <div style={{ background: "var(--color-white)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", margin: 0 }}>
                Pending Queries from Analyst
              </p>
              <span style={{ fontSize: 10, fontWeight: 700, background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 20, padding: "1px 8px", color: "var(--color-text-muted)" }}>
                {crossTabQueries.length} total
              </span>
            </div>
            {groups.map((group, gIdx) => {
              const c = TAB_COLORS_MAP[group.label] ?? TAB_COLORS_MAP["Decision"];
              return (
                <div key={group.label} style={{ borderBottom: gIdx < groups.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  {/* Group header */}
                  <div style={{ padding: "8px 16px", background: "var(--color-bg)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, flexShrink: 0, display: "inline-block" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: c.color, flex: 1 }}>
                      {group.label}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                      {group.queries.length}
                    </span>
                  </div>
                  {/* Queries in this group */}
                  {group.queries.map((q, qIdx) => (
                    <div key={q.id} style={{
                      padding: "10px 16px 10px 32px",
                      borderTop: "1px solid var(--color-border)",
                      display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-muted)" }}>Q{qIdx + 1}</span>
                          <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 600 }}>
                            {group.label}
                          </span>
                        </div>
                        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-primary)", margin: 0 }} title={q.question}>{q.question.length > 40 ? q.question.substring(0, 40) + "..." : q.question}</p>
                      </div>
                      <button
                        onClick={() => onRemoveCrossTabQuery(q.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", flexShrink: 0, fontSize: 14, padding: 0, lineHeight: 1 }}
                        title="Remove query"
                      >✕</button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Backend queries (already sent) */}
      {backendQueries.length > 0 && (
        <div style={{ background: "var(--color-white)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)" }}>Open Queries — Sent to Hospital ({backendQueries.filter(q => q.status === "open").length})</p>
          </div>
          {backendQueries.map((q, idx) => {
            const daysSinceSent = q.dueDate ? Math.max(0, 7 - Math.round((new Date(q.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
            return (
              <div key={q.id} style={{ padding: "10px 16px", borderBottom: idx < backendQueries.length - 1 ? "1px solid var(--color-border)" : "none", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-primary)", fontWeight: 500, marginBottom: 4 }}>{q.question}</p>
                  <div style={{ display: "flex", gap: 12 }}>
                    {daysSinceSent !== null && <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Sent {daysSinceSent}d ago</span>}
                    {q.dueDate && <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Due: {q.dueDate}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: q.status === "open" ? "#FFFBEB" : "#F0FDF4", color: q.status === "open" ? "#92400E" : "#15803D" }}>{q.status}</span>
                  {q.status === "open" && <button onClick={() => onViewDoc({ label: "Query", value: q.question })} style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-secondary)", background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xs)", padding: "2px 8px", cursor: "pointer" }}>Send Reminder</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision radio + note + letter */}
      <div style={{ background: "var(--color-white)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: 16 }}>
        <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", marginBottom: 12 }}>Decision</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {(["approve", "deny", "query", "conditional"] as const).map((d) => {
            const labels = { approve: "Approve", deny: "Deny", query: "Send Query", conditional: "Conditional Approval" };
            const isSelected = decision === d;
            const isApproveBlocked = d === "approve" && !canApprove;
            return (
              <label key={d} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: "var(--radius-sm)", border: isSelected ? "2px solid var(--color-black)" : "1px solid var(--color-border)", background: isSelected ? "var(--color-bg)" : "var(--color-white)", cursor: isApproveBlocked ? "not-allowed" : "pointer", opacity: isApproveBlocked ? 0.5 : 1 }}>
                <input type="radio" name="decision" value={d} checked={isSelected} disabled={isApproveBlocked} onChange={() => setDecision(d)} style={{ margin: 0 }} />
                <span style={{ fontSize: "var(--font-size-base)", fontWeight: 500, color: "var(--color-text-primary)" }}>{labels[d]}</span>
                {isApproveBlocked && <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-red)", marginLeft: "auto" }}>⚠ Resolve open items first</span>}
              </label>
            );
          })}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 6 }}>
            Decision Note <span style={{ fontWeight: 400 }}>(IRDAI audit trail — min 20 characters)</span>
          </label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Provide the rationale for your decision…" rows={3} style={{ width: "100%", fontSize: "var(--font-size-base)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "8px 12px", color: "var(--color-text-primary)", background: "var(--color-white)", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 4 }}>{note.trim().length} / 20 minimum</p>
        </div>

        {showLetter && (
          <div style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: 12, marginBottom: 12 }}>
            <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", marginBottom: 8 }}>Hospital Communication Preview</p>
            <pre style={{ fontSize: 11, fontFamily: "monospace", color: "var(--color-text-secondary)", whiteSpace: "pre-wrap", margin: 0, lineHeight: 1.6 }}>{letterPreview}</pre>
          </div>
        )}

        <button onClick={() => setSubmitted(true)} disabled={!canSubmit} style={{ width: "100%", padding: "10px 0", background: canSubmit ? "var(--color-black)" : "var(--color-border)", color: canSubmit ? "#fff" : "var(--color-text-muted)", border: "none", borderRadius: "var(--radius-sm)", fontSize: "var(--font-size-base)", fontWeight: 600, cursor: canSubmit ? "pointer" : "not-allowed" }}>
          Submit Decision
        </button>
        {!canSubmit && (
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 6, textAlign: "center" }}>
            {decision === null ? "Select a decision above" : !noteValid ? `Add ${20 - note.trim().length} more characters to the note` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
