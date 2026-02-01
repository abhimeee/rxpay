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
  status: "complete" | "missing" | "invalid" | "pending";
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
