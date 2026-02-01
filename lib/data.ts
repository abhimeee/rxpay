// Realistic dummy data for TPA Copilot demo (Indian healthcare context)

import type {
  Hospital,
  Insurer,
  PolicyHolder,
  PreAuthRequest,
  PreAuthCheckItem,
  Claim,
  FraudAlert,
  ComplianceRule,
  TPAAssignee,
} from "./types";

export const hospitals: Hospital[] = [
  { id: "H001", name: "Apollo Hospitals, Chennai", city: "Chennai", state: "Tamil Nadu", empanelmentStatus: "active", tier: "1" },
  { id: "H002", name: "Fortis Memorial Research Institute, Gurgaon", city: "Gurgaon", state: "Haryana", empanelmentStatus: "active", tier: "1" },
  { id: "H003", name: "Max Super Speciality Hospital, Saket", city: "New Delhi", state: "Delhi", empanelmentStatus: "active", tier: "1" },
  { id: "H004", name: "Manipal Hospitals, Bangalore", city: "Bangalore", state: "Karnataka", empanelmentStatus: "active", tier: "1" },
  { id: "H005", name: "Medanta - The Medicity", city: "Gurgaon", state: "Haryana", empanelmentStatus: "active", tier: "1" },
  { id: "H006", name: "Lilavati Hospital, Mumbai", city: "Mumbai", state: "Maharashtra", empanelmentStatus: "active", tier: "1" },
];

export const insurers: Insurer[] = [
  { id: "I001", name: "Star Health and Allied Insurance", irdaiRegistration: "IRDAI/HLT/STAR/2020" },
  { id: "I002", name: "HDFC ERGO General Insurance", irdaiRegistration: "IRDAI/HLT/HDFC/2019" },
  { id: "I003", name: "ICICI Lombard General Insurance", irdaiRegistration: "IRDAI/HLT/ICICI/2018" },
  { id: "I004", name: "Care Health Insurance", irdaiRegistration: "IRDAI/HLT/CARE/2021" },
  { id: "I005", name: "Niva Bupa Health Insurance", irdaiRegistration: "IRDAI/HLT/NIVA/2019" },
];

export const tpaAssignees: TPAAssignee[] = [
  { id: "A001", name: "Anita Desai", role: "Senior Claims Analyst", avatar: "AD" },
  { id: "A002", name: "Rahul Mehta", role: "Claims Analyst", avatar: "RM" },
  { id: "A003", name: "Kavitha Krishnan", role: "Medical Review Specialist", avatar: "KK" },
];

export const policyHolders: PolicyHolder[] = [
  { id: "P001", name: "Rajesh Kumar", policyNumber: "STAR/HL/2023/456789", insurerId: "I001", sumInsured: 1000000, relationship: "self" },
  { id: "P002", name: "Priya Sharma", policyNumber: "HDFC/HL/2022/234567", insurerId: "I002", sumInsured: 500000, relationship: "self" },
  { id: "P003", name: "Amit Patel", policyNumber: "ICICI/HL/2023/789012", insurerId: "I003", sumInsured: 750000, relationship: "self" },
  { id: "P004", name: "Sneha Reddy", policyNumber: "CARE/HL/2024/345678", insurerId: "I004", sumInsured: 1000000, relationship: "self" },
  { id: "P005", name: "Vikram Singh", policyNumber: "NIVA/HL/2022/567890", insurerId: "I005", sumInsured: 500000, relationship: "self" },
  { id: "P006", name: "Kavita Nair", policyNumber: "STAR/HL/2023/111222", insurerId: "I001", sumInsured: 750000, relationship: "self" },
];

export const preAuthRequests: PreAuthRequest[] = [
  {
    id: "PA001",
    claimId: "CLM/2025/001/STAR",
    hospitalId: "H001",
    policyHolderId: "P001",
    insurerId: "I001",
    assigneeId: "A001",
    status: "awaiting_docs",
    estimatedAmount: 285000,
    procedure: "Coronary Angioplasty with Stent",
    diagnosis: "Acute STEMI",
    icdCode: "I21.9",
    submittedAt: "2025-01-28T09:30:00Z",
    slaDeadline: "2025-01-31T18:00:00Z",
    aiReadinessScore: 65,
    missingCritical: ["Consent form with patient signature", "Pre-operative investigation reports"],
    complianceStatus: "partial",
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", irdaiRef: "IRDAI Circular 12/2016", status: "complete", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", irdaiRef: "IRDAI Circular 12/2016", status: "complete", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", irdaiRef: "IRDAI Circular 12/2016", status: "complete", value: "₹2,85,000" },
      { id: "c4", label: "Consent form with patient signature", irdaiRef: "IRDAI Circular 12/2016", status: "missing", aiSuggestion: "Request signed consent from hospital. Template available per IRDAI guidelines." },
      { id: "c5", label: "Pre-operative investigation reports", irdaiRef: "IRDAI Circular 12/2016", status: "missing", aiSuggestion: "ECG, Troponin, Lipid profile required for cardiac procedures." },
      { id: "c6", label: "Policy copy / e-card", status: "complete", value: "Verified" },
      { id: "c7", label: "ID proof (Aadhaar/Passport)", status: "complete", value: "Aadhaar linked" },
      { id: "c8", label: "Waiting period compliance check", irdaiRef: "Policy terms", status: "complete", value: "24 months elapsed" },
    ],
  },
  {
    id: "PA002",
    claimId: "CLM/2025/002/HDFC",
    hospitalId: "H002",
    policyHolderId: "P002",
    insurerId: "I002",
    assigneeId: "A002",
    status: "under_review",
    estimatedAmount: 175000,
    procedure: "Laparoscopic Cholecystectomy",
    diagnosis: "Symptomatic Gallstones",
    icdCode: "K80.1",
    submittedAt: "2025-01-29T11:00:00Z",
    slaDeadline: "2025-02-01T18:00:00Z",
    aiReadinessScore: 92,
    missingCritical: [],
    complianceStatus: "compliant",
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", irdaiRef: "IRDAI Circular 12/2016", status: "complete", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "complete", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "complete", value: "₹1,75,000" },
      { id: "c4", label: "Consent form with patient signature", status: "complete", value: "Received" },
      { id: "c5", label: "Pre-operative investigation reports", status: "complete", value: "USG, LFT attached" },
      { id: "c6", label: "Policy copy / e-card", status: "complete", value: "Verified" },
      { id: "c7", label: "ID proof", status: "complete", value: "Verified" },
      { id: "c8", label: "Waiting period compliance", status: "complete", value: "Compliant" },
    ],
  },
  {
    id: "PA003",
    claimId: "CLM/2025/003/ICICI",
    hospitalId: "H003",
    policyHolderId: "P003",
    insurerId: "I003",
    assigneeId: "A003",
    status: "submitted",
    estimatedAmount: 420000,
    procedure: "Total Knee Replacement",
    diagnosis: "Severe Osteoarthritis Knee",
    icdCode: "M17.11",
    submittedAt: "2025-01-30T14:20:00Z",
    slaDeadline: "2025-02-02T18:00:00Z",
    aiReadinessScore: 45,
    missingCritical: ["Implant cost breakup", "Doctor's recommendation with stamp", "Pre-operative X-ray/MRI"],
    complianceStatus: "non_compliant",
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "complete", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "missing", aiSuggestion: "Ensure hospital stamp and registration number on recommendation." },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "partial", value: "Total only; implant breakup missing", aiSuggestion: "IRDAI requires separate implant cost. Request itemized quote." },
      { id: "c4", label: "Consent form", status: "pending" },
      { id: "c5", label: "Pre-operative X-ray/MRI", status: "missing", aiSuggestion: "Radiological evidence required for joint replacement pre-auth." },
      { id: "c6", label: "Policy copy", status: "complete", value: "Verified" },
      { id: "c7", label: "ID proof", status: "complete", value: "Verified" },
      { id: "c8", label: "Waiting period / pre-existing", status: "pending" },
    ],
  },
  {
    id: "PA004",
    claimId: "CLM/2025/004/CARE",
    hospitalId: "H004",
    policyHolderId: "P004",
    insurerId: "I004",
    assigneeId: "A002",
    status: "submitted",
    estimatedAmount: 195000,
    procedure: "Cataract Surgery (Phaco with IOL)",
    diagnosis: "Senile Cataract, Bilateral",
    icdCode: "H25.1",
    submittedAt: "2025-02-01T10:00:00Z",
    slaDeadline: "2025-02-03T18:00:00Z",
    aiReadinessScore: 0,
    missingCritical: [],
    complianceStatus: "pending_review",
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", irdaiRef: "IRDAI Circular 12/2016", status: "pending" },
      { id: "c2", label: "Doctor's recommendation with stamp", irdaiRef: "IRDAI Circular 12/2016", status: "pending" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", irdaiRef: "IRDAI Circular 12/2016", status: "pending" },
      { id: "c4", label: "Consent form with patient signature", irdaiRef: "IRDAI Circular 12/2016", status: "pending" },
      { id: "c5", label: "Pre-operative investigation reports", irdaiRef: "IRDAI Circular 12/2016", status: "pending" },
      { id: "c6", label: "Policy copy / e-card", status: "pending" },
      { id: "c7", label: "ID proof (Aadhaar/Passport)", status: "pending" },
      { id: "c8", label: "Waiting period compliance check", irdaiRef: "Policy terms", status: "pending" },
    ],
  },
];

export const claims: Claim[] = [
  { id: "CLM001", claimNumber: "CLM/2025/001/STAR", preAuthId: "PA001", hospitalId: "H001", policyHolderId: "P001", insurerId: "I001", status: "pending_preauth", claimedAmount: 0, procedure: "Coronary Angioplasty", admissionDate: "2025-01-28", dischargeDate: "", submittedAt: "2025-01-28T09:30:00Z", complianceFlags: ["Pre-auth pending docs"] },
  { id: "CLM002", claimNumber: "CLM/2025/002/HDFC", preAuthId: "PA002", hospitalId: "H002", policyHolderId: "P002", insurerId: "I002", status: "under_review", claimedAmount: 0, procedure: "Laparoscopic Cholecystectomy", admissionDate: "2025-01-29", dischargeDate: "", submittedAt: "2025-01-29T11:00:00Z", complianceFlags: [] },
  { id: "CLM003", claimNumber: "CLM/2025/003/ICICI", preAuthId: "PA003", hospitalId: "H003", policyHolderId: "P003", insurerId: "I003", status: "pending_preauth", claimedAmount: 0, procedure: "Total Knee Replacement", admissionDate: "2025-01-30", dischargeDate: "", submittedAt: "2025-01-30T14:20:00Z", complianceFlags: ["Incomplete documentation"] },
  { id: "CLM004", claimNumber: "CLM/2025/004/CARE", hospitalId: "H004", policyHolderId: "P004", insurerId: "I004", status: "under_review", claimedAmount: 125000, approvedAmount: 118000, procedure: "Appendectomy", admissionDate: "2025-01-25", dischargeDate: "2025-01-27", submittedAt: "2025-01-27T16:00:00Z", complianceFlags: [] },
  { id: "CLM005", claimNumber: "CLM/2025/005/STAR", hospitalId: "H001", policyHolderId: "P006", insurerId: "I001", status: "under_review", claimedAmount: 45000, approvedAmount: undefined, procedure: "Dengue Management", admissionDate: "2025-01-20", dischargeDate: "2025-01-24", submittedAt: "2025-01-24T10:00:00Z", complianceFlags: [] },
];

export const fraudAlerts: FraudAlert[] = [
  {
    id: "FRAUD001",
    type: "duplicate_billing",
    severity: "high",
    claimIds: ["CLM/2024/892/STAR", "CLM/2024/901/STAR"],
    description: "Duplicate billing detected: Same patient, same procedure (Cataract Surgery), same hospital, 11 days apart. Item-level overlap in pharmacy and OT charges.",
    aiConfidence: 94,
    detectedAt: "2025-01-30T08:15:00Z",
    status: "under_investigation",
    duplicateDetails: {
      originalClaimId: "CLM/2024/892/STAR",
      duplicateClaimId: "CLM/2024/901/STAR",
      matchingItems: ["Pharmacy - Same drug list 80% match", "OT charges - Same procedure code", "Room charges - Overlapping dates"],
      amountOverlap: 125000,
    },
  },
  {
    id: "FRAUD002",
    type: "duplicate_billing",
    severity: "medium",
    claimIds: ["CLM/2024/756/HDFC", "CLM/2025/012/HDFC"],
    description: "Possible duplicate: Same policyholder, same diagnosis (UTI), two different hospitals within 7 days. AI flagged for manual review.",
    aiConfidence: 72,
    detectedAt: "2025-01-29T14:30:00Z",
    status: "open",
    duplicateDetails: {
      originalClaimId: "CLM/2024/756/HDFC",
      duplicateClaimId: "CLM/2025/012/HDFC",
      matchingItems: ["Diagnosis code N39.0", "Similar pharmacy items"],
      amountOverlap: 18000,
    },
  },
  {
    id: "FRAUD003",
    type: "upcoding",
    severity: "medium",
    claimIds: ["CLM/2025/008/ICICI"],
    description: "Procedure code mismatch: Billed as major surgery (ICD-10-PCS) but supporting notes suggest minor procedure. Recommend audit.",
    aiConfidence: 68,
    detectedAt: "2025-01-31T09:00:00Z",
    status: "open",
  },
];

export const complianceRules: ComplianceRule[] = [
  { id: "CR1", name: "Pre-auth timeline (48 hrs)", irdaiRef: "IRDAI Circular 12/2016", description: "TPA must respond to pre-auth within 48 hours of complete documents.", category: "preauth", status: "compliant", lastChecked: "2025-01-31" },
  { id: "CR2", name: "Cashless approval documentation", irdaiRef: "IRDAI Circular 12/2016", description: "All mandatory documents as per checklist must be obtained before approval.", category: "documentation", status: "compliant", lastChecked: "2025-01-31" },
  { id: "CR3", name: "Claim settlement timeline", irdaiRef: "IRDAI Circular 21/2019", description: "Reimbursement claims to be settled within 30 days of document receipt.", category: "claims", status: "compliant", lastChecked: "2025-01-28" },
  { id: "CR4", name: "Hospital empanelment validity", irdaiRef: "Insurer TPA agreement", description: "Only empanelled hospitals for cashless. Verify active empanelment.", category: "preauth", status: "compliant", lastChecked: "2025-01-31" },
];

export function getHospital(id: string): Hospital | undefined {
  return hospitals.find((h) => h.id === id);
}

export function getInsurer(id: string): Insurer | undefined {
  return insurers.find((i) => i.id === id);
}

export function getPolicyHolder(id: string): PolicyHolder | undefined {
  return policyHolders.find((p) => p.id === id);
}

export function getAssignee(id: string): TPAAssignee | undefined {
  return tpaAssignees.find((a) => a.id === id);
}

export function getPreAuth(id: string): PreAuthRequest | undefined {
  return preAuthRequests.find((p) => p.id === id);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Display pre-auth key e.g. PA001 → PA/2025/001 */
export function formatPreAuthKey(id: string): string {
  const num = id.replace(/\D/g, "") || "0";
  return `PA/2025/${num.padStart(3, "0")}`;
}

/** Simulated AI analysis result for demo flow (step-by-step checklist run). Used when checklist is pending. */
export function getSimulatedAnalysisResult(paId: string): PreAuthCheckItem[] | null {
  const pa = getPreAuth(paId);
  if (!pa) return null;
  const allPending = pa.checklist.every((c) => c.status === "pending");
  if (!allPending) return null; // already analysed, use existing checklist
  // PA004 demo: simulate result (mix of complete and missing, like PA001)
  if (paId === "PA004") {
    return [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", irdaiRef: "IRDAI Circular 12/2016", status: "complete", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", irdaiRef: "IRDAI Circular 12/2016", status: "complete", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", irdaiRef: "IRDAI Circular 12/2016", status: "complete", value: "₹1,95,000" },
      { id: "c4", label: "Consent form with patient signature", irdaiRef: "IRDAI Circular 12/2016", status: "missing", aiSuggestion: "Request signed consent from hospital. Template available per IRDAI guidelines." },
      { id: "c5", label: "Pre-operative investigation reports", irdaiRef: "IRDAI Circular 12/2016", status: "missing", aiSuggestion: "Slit-lamp, A-scan required for cataract pre-auth." },
      { id: "c6", label: "Policy copy / e-card", status: "complete", value: "Verified" },
      { id: "c7", label: "ID proof (Aadhaar/Passport)", status: "complete", value: "Aadhaar linked" },
      { id: "c8", label: "Waiting period compliance check", irdaiRef: "Policy terms", status: "complete", value: "Compliant" },
    ];
  }
  return null;
}
