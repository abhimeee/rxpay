// TPA Copilot - Types for claims, pre-auth, fraud, compliance

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
  irdaiRef?: string;
  status: "complete" | "missing" | "invalid" | "pending" | "partial";
  aiSuggestion?: string;
  value?: string;
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
  complianceStatus: ComplianceStatus;
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
  complianceFlags: string[];
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

export interface ComplianceRule {
  id: string;
  name: string;
  irdaiRef: string;
  description: string;
  category: "preauth" | "claims" | "documentation" | "timelines";
  status: ComplianceStatus;
  lastChecked: string;
}

// Pre-auth workflow (7 stages) - demo data types
export type WorkflowStageId =
  | "request_initiation"
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
  suggestion?: string;
}

export interface MedicalNecessityItem {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  source: string;
  finding: string;
  status: "met" | "not_met" | "conditional";
}

export interface FraudRedFlag {
  id: string;
  category: "provider" | "patient" | "document";
  severity: "high" | "medium" | "low" | "none";
  description: string;
  resolved?: boolean;
}

export interface WorkflowQuery {
  id: string;
  question: string;
  status: "open" | "responded" | "none";
  response?: string;
  dueDate?: string;
}

export interface PreAuthWorkflowData {
  requestSummary: {
    admissionType: "planned" | "emergency";
    submittedWithinSLA: boolean;
    items: { label: string; value: string; present: boolean }[];
  };
  eligibility: EligibilityItem[];
  coding: { icd10: CodingItem[]; cpt: CodingItem[] };
  medicalNecessity: MedicalNecessityItem[];
  fraudFlags: FraudRedFlag[];
  queries: WorkflowQuery[];
  p2pRequired: boolean;
  p2pSummary?: { scheduled: string; outcome: string; reviewer: string };
}
