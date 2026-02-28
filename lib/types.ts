// TPA Copilot - Types for claims, pre-auth, fraud

export type ClaimStatus = "pending_preauth" | "preauth_approved" | "preauth_rejected" | "under_review" | "approved" | "rejected" | "paid";

export type PreAuthStatus = "draft" | "submitted" | "awaiting_docs" | "under_review" | "approved" | "rejected";

export type ComplianceStatus = "compliant" | "partial" | "non_compliant" | "pending_review";

export interface Hospital {
  id: string;
  name: string;
  city: string;
  state: string;
  empanelmentStatus: "active" | "under_review" | "suspended";
  tier: "1" | "2" | "3";
}

export interface Insurer {
  id: string;
  name: string;
  irdaiRegistration: string;
}

export interface PolicyHolder {
  id: string;
  name: string;
  policyNumber: string;
  insurerId: string;
  sumInsured: number;
  relationship: "self" | "spouse" | "child" | "parent" | "other";
}

export interface TPAAssignee {
  id: string;
  name: string;
  role: string;
  avatar?: string; // initials for display
}

export interface PreAuthCheckItem {
  id: string;
  label: string;
  status: "submitted" | "missing" | "approved" | "inconsistent" | "incomplete" | "pending";
  aiSuggestion?: string;
  value?: string;
  irdaiRef?: string;
}

export interface PreAuthRequest {
  id: string;
  claimId: string;
  hospitalId: string;
  policyHolderId: string;
  insurerId: string;
  assigneeId?: string; // TPA team member reviewing this claim
  status: PreAuthStatus;
  estimatedAmount: number;
  procedure: string;
  diagnosis: string;
  icdCode: string;
  submittedAt: string;
  slaDeadline: string;
  checklist: PreAuthCheckItem[];
  aiReadinessScore: number; // 0-100
  missingCritical: string[];
}

export interface Claim {
  id: string;
  claimNumber: string;
  preAuthId?: string;
  hospitalId: string;
  policyHolderId: string;
  insurerId: string;
  status: ClaimStatus;
  claimedAmount: number;
  approvedAmount?: number;
  procedure: string;
  admissionDate: string;
  dischargeDate: string;
  submittedAt: string;
}

export interface FraudAlert {
  id: string;
  type: "duplicate_billing" | "upcoding" | "phantom_billing" | "policy_misuse";
  severity: "high" | "medium" | "low";
  claimIds: string[];
  description: string;
  aiConfidence: number;
  detectedAt: string;
  status: "open" | "under_investigation" | "resolved" | "false_positive";
  duplicateDetails?: {
    originalClaimId: string;
    duplicateClaimId: string;
    matchingItems: string[];
    amountOverlap: number;
  };
}


// Pre-auth workflow (7 stages) - demo data types
export type WorkflowStageId =
  | "documentation"
  | "eligibility"
  | "medical_coding"
  | "medical_necessity"
  | "fraud_anomaly"
  | "queries_and_decision";

export interface WorkflowFlaggedItem {
  stageId: WorkflowStageId;
  itemId: string;
  label: string;
  note?: string;
}

export interface EligibilityItem {
  id: string;
  label: string;
  status: "pass" | "fail" | "warning";
  value: string;
  detail?: string;
}

export interface CodingItem {
  id: string;
  type: "icd10" | "cpt";
  code: string;
  description: string;
  status: "valid" | "mismatch" | "missing_specificity";
  source?: "hospital" | "ai";  // Who provided this code
  suggestion?: string;
  clinicalContext?: string;  // Quoted text from source document
  diagnosisMatch?: string;   // Plain-English compatibility note
}

export interface MedicalNecessityItem {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  source: string;
  finding: string;
  status: "met" | "not_met" | "conditional";
}

export interface MedicalNecessityInsight {
  id: string;
  diagnosisCode: string;
  diagnosisDescription: string;
  procedureCode: string;
  procedureDescription: string;
  irdaApproved: boolean;
  policyApproved: boolean;
  aiSimilarityPct: number;
  aiSummary: string;
  sourceUrl: string;
  sourceLabel: string;
}

export interface FraudRedFlag {
  id: string;
  category: "provider" | "patient" | "document";
  severity: "high" | "medium" | "low" | "none";
  description: string;
  resolved?: boolean;
  providerFraudRate?: number;   // e.g. 2.3 (percent)
  patientClaimsCount?: number;  // e.g. 3
}

export type SectionStatus = "pending" | "in_progress" | "done" | "needs_attention";

// UI tab identifiers — 6 tabs replacing the old 5-stage view
export type UiTab =
  | "policy_id_docs"
  | "medical_docs"
  | "medical_coding"
  | "medical_necessity"
  | "fraud_anomaly"
  | "queries_and_decision";

// Maps UiTab → WorkflowStageId for section status tracking
export const UI_TAB_TO_STAGE: Record<UiTab, WorkflowStageId> = {
  policy_id_docs: "documentation",
  medical_docs: "documentation",
  medical_coding: "medical_coding",
  medical_necessity: "medical_necessity",
  fraud_anomaly: "fraud_anomaly",
  queries_and_decision: "queries_and_decision",
};

export interface CrossTabQuery {
  id: string;
  sourceTab: UiTab;
  sourceLabel: string;
  question: string;
  createdAt: string;
}

export interface WorkflowQuery {
  id: string;
  question: string;
  status: "open" | "responded" | "none";
  response?: string;
  dueDate?: string;
}

export interface WorkflowTimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  status: "done" | "current" | "pending" | "info";
  detail?: string;
  meta?: { label: string; value: string }[];
}

export interface PreAuthWorkflowData {
  requestSummary: {
    admissionType: "planned" | "emergency";
    submittedWithinSLA: boolean;
    items: { label: string; value: string; present: boolean }[];
  };
  timeline: WorkflowTimelineEvent[];
  eligibility: EligibilityItem[];
  coding: { icd10: CodingItem[]; cpt: CodingItem[] };
  medicalNecessity: MedicalNecessityItem[];
  medicalNecessityScore: number;
  medicalNecessityInsights: MedicalNecessityInsight[];
  fraudFlags: FraudRedFlag[];
  queries: WorkflowQuery[];
  p2pRequired: boolean;
  p2pSummary?: { scheduled: string; outcome: string; reviewer: string };
}
