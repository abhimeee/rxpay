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
  { id: "P007", name: "Nitin Batra", policyNumber: "NIVA/HL/2023/889901", insurerId: "I005", sumInsured: 800000, relationship: "self" },
  { id: "P008", name: "Aisha Khan", policyNumber: "HDFC/HL/2023/556677", insurerId: "I002", sumInsured: 600000, relationship: "self" },
  { id: "P009", name: "Vivek Menon", policyNumber: "STAR/HL/2024/333444", insurerId: "I001", sumInsured: 1200000, relationship: "self" },
  { id: "P010", name: "Leena Joseph", policyNumber: "ICICI/HL/2023/990011", insurerId: "I003", sumInsured: 700000, relationship: "self" },
  { id: "P011", name: "Arjun Kapoor", policyNumber: "CARE/HL/2024/225588", insurerId: "I004", sumInsured: 1500000, relationship: "self" },
  { id: "P012", name: "Maya Iyer", policyNumber: "NIVA/HL/2023/114466", insurerId: "I005", sumInsured: 500000, relationship: "self" },
  { id: "P013", name: "Rohit Gulati", policyNumber: "HDFC/HL/2022/778899", insurerId: "I002", sumInsured: 1000000, relationship: "self" },
  { id: "P014", name: "Neha Varma", policyNumber: "STAR/HL/2024/661122", insurerId: "I001", sumInsured: 400000, relationship: "self" },
];

// Hardcoded relative durations (in minutes) to ensure diversity
const durations: Record<string, number> = {
  PA001: 5,
  PA002: 12,
  PA003: 28,
  PA004: 45,
  PA005: 75,
  PA006: 150,
  PA007: 240,
  PA008: 720,
  PA009: 1440,
  PA010: 2880,
  PA011: 4320,
  PA012: -10, // Overdue
};

const now = new Date();

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
    slaDeadline: new Date(now.getTime() + durations["PA001"] * 60000).toISOString(),
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
    slaDeadline: new Date(now.getTime() + durations["PA002"] * 60000).toISOString(),
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
    slaDeadline: new Date(now.getTime() + durations["PA003"] * 60000).toISOString(),
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
    slaDeadline: new Date(now.getTime() + durations["PA004"] * 60000).toISOString(),
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
  {
    id: "PA005",
    claimId: "CLM/2025/005/NIVA",
    hospitalId: "H005",
    policyHolderId: "P007",
    insurerId: "I005",
    assigneeId: "A001",
    status: "under_review",
    estimatedAmount: 320000,
    procedure: "Endoscopic Sinus Surgery",
    diagnosis: "Chronic Rhinosinusitis with Nasal Polyps",
    icdCode: "J33.9",
    submittedAt: "2025-02-02T08:15:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA005"] * 60000).toISOString(),
    aiReadinessScore: 88,
    missingCritical: [],
    complianceStatus: "compliant",
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", irdaiRef: "IRDAI Circular 12/2016", status: "complete", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "complete", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "complete", value: "₹3,20,000" },
      { id: "c4", label: "Consent form with patient signature", status: "complete", value: "Received" },
      { id: "c5", label: "Pre-operative investigation reports", status: "complete", value: "CT PNS, CBC attached" },
      { id: "c6", label: "Policy copy / e-card", status: "complete", value: "Verified" },
      { id: "c7", label: "ID proof", status: "complete", value: "Verified" },
      { id: "c8", label: "Waiting period compliance", status: "complete", value: "Compliant" },
    ],
  },
  {
    id: "PA006",
    claimId: "CLM/2025/006/HDFC",
    hospitalId: "H006",
    policyHolderId: "P008",
    insurerId: "I002",
    assigneeId: "A003",
    status: "awaiting_docs",
    estimatedAmount: 150000,
    procedure: "TURP (Transurethral Resection of Prostate)",
    diagnosis: "BPH with LUTS",
    icdCode: "N40.1",
    submittedAt: "2025-02-02T12:40:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA006"] * 60000).toISOString(),
    aiReadinessScore: 58,
    missingCritical: ["PSA report", "Uroflowmetry study"],
    complianceStatus: "partial",
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "complete", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "complete", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "complete", value: "₹1,50,000" },
      { id: "c4", label: "Consent form with patient signature", status: "complete", value: "Received" },
      { id: "c5", label: "PSA report (last 3 months)", status: "missing", aiSuggestion: "Request PSA report to rule out malignancy." },
      { id: "c6", label: "Uroflowmetry / PVR report", status: "missing", aiSuggestion: "Attach uroflowmetry and PVR for BPH severity." },
      { id: "c7", label: "Policy copy / e-card", status: "complete", value: "Verified" },
      { id: "c8", label: "ID proof", status: "complete", value: "Verified" },
    ],
  },
  {
    id: "PA007",
    claimId: "CLM/2025/007/STAR",
    hospitalId: "H002",
    policyHolderId: "P009",
    insurerId: "I001",
    status: "submitted",
    estimatedAmount: 620000,
    procedure: "Mastectomy with Reconstruction",
    diagnosis: "Carcinoma Breast, left",
    icdCode: "C50.9",
    submittedAt: "2025-02-03T09:10:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA007"] * 60000).toISOString(),
    aiReadinessScore: 72,
    missingCritical: ["Histopathology report", "Oncology board notes"],
    complianceStatus: "partial",
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "complete", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "complete", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "complete", value: "₹6,20,000" },
      { id: "c4", label: "Histopathology report", status: "missing", aiSuggestion: "Attach biopsy-confirmed histopathology report." },
      { id: "c5", label: "Oncology board notes / treatment plan", status: "missing", aiSuggestion: "Provide MDT board notes for treatment plan." },
      { id: "c6", label: "Consent form", status: "complete", value: "Received" },
      { id: "c7", label: "Policy copy / e-card", status: "complete", value: "Verified" },
      { id: "c8", label: "ID proof", status: "complete", value: "Verified" },
    ],
  },
  {
    id: "PA008",
    claimId: "CLM/2025/008/ICICI",
    hospitalId: "H003",
    policyHolderId: "P010",
    insurerId: "I003",
    assigneeId: "A002",
    status: "under_review",
    estimatedAmount: 98000,
    procedure: "Ureteroscopy with Laser Lithotripsy",
    diagnosis: "Ureteric Calculus",
    icdCode: "N20.1",
    submittedAt: "2025-02-03T14:50:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA008"] * 60000).toISOString(),
    aiReadinessScore: 95,
    missingCritical: [],
    complianceStatus: "compliant",
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "complete", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "complete", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "complete", value: "₹98,000" },
      { id: "c4", label: "Consent form with patient signature", status: "complete", value: "Received" },
      { id: "c5", label: "Pre-operative investigation reports", status: "complete", value: "USG KUB, RFT attached" },
      { id: "c6", label: "Policy copy / e-card", status: "complete", value: "Verified" },
      { id: "c7", label: "ID proof", status: "complete", value: "Verified" },
      { id: "c8", label: "Waiting period compliance", status: "complete", value: "Compliant" },
    ],
  },
  {
    id: "PA009",
    claimId: "CLM/2025/009/CARE",
    hospitalId: "H001",
    policyHolderId: "P011",
    insurerId: "I004",
    assigneeId: "A001",
    status: "submitted",
    estimatedAmount: 410000,
    procedure: "CABG (Triple Vessel)",
    diagnosis: "Coronary Artery Disease",
    icdCode: "I25.10",
    submittedAt: "2025-02-03T18:05:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA009"] * 60000).toISOString(),
    aiReadinessScore: 62,
    missingCritical: ["2D Echo report", "Coronary angiography CD"],
    complianceStatus: "partial",
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "complete", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "complete", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "complete", value: "₹4,10,000" },
      { id: "c4", label: "2D Echo report", status: "missing", aiSuggestion: "Attach 2D Echo with EF and valve assessment." },
      { id: "c5", label: "Coronary angiography CD/report", status: "missing", aiSuggestion: "Provide angiography CD/report for CABG indication." },
      { id: "c6", label: "Consent form with patient signature", status: "complete", value: "Received" },
      { id: "c7", label: "Policy copy / e-card", status: "complete", value: "Verified" },
      { id: "c8", label: "ID proof", status: "complete", value: "Verified" },
    ],
  },
  {
    id: "PA010",
    claimId: "CLM/2025/010/NIVA",
    hospitalId: "H004",
    policyHolderId: "P012",
    insurerId: "I005",
    assigneeId: "A003",
    status: "approved",
    estimatedAmount: 86000,
    procedure: "Arthroscopic Meniscectomy",
    diagnosis: "Medial Meniscus Tear",
    icdCode: "S83.241",
    submittedAt: "2025-02-01T07:40:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA010"] * 60000).toISOString(),
    aiReadinessScore: 98,
    missingCritical: [],
    complianceStatus: "compliant",
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "complete", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "complete", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "complete", value: "₹86,000" },
      { id: "c4", label: "Consent form with patient signature", status: "complete", value: "Received" },
      { id: "c5", label: "Pre-operative MRI report", status: "complete", value: "MRI knee attached" },
      { id: "c6", label: "Policy copy / e-card", status: "complete", value: "Verified" },
      { id: "c7", label: "ID proof", status: "complete", value: "Verified" },
      { id: "c8", label: "Waiting period compliance", status: "complete", value: "Compliant" },
    ],
  },
  {
    id: "PA011",
    claimId: "CLM/2025/011/HDFC",
    hospitalId: "H005",
    policyHolderId: "P013",
    insurerId: "I002",
    assigneeId: "A002",
    status: "rejected",
    estimatedAmount: 240000,
    procedure: "Bariatric Surgery (Sleeve Gastrectomy)",
    diagnosis: "Morbid Obesity",
    icdCode: "E66.01",
    submittedAt: "2025-01-31T10:30:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA011"] * 60000).toISOString(),
    aiReadinessScore: 40,
    missingCritical: ["BMI assessment report", "6-month supervised weight loss documentation"],
    complianceStatus: "non_compliant",
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "complete", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "complete", value: "Attached" },
      { id: "c3", label: "BMI assessment report", status: "missing", aiSuggestion: "Provide BMI calculation and obesity classification." },
      { id: "c4", label: "6-month supervised weight loss documentation", status: "missing", aiSuggestion: "Attach supervised weight loss program records." },
      { id: "c5", label: "Psychological evaluation report", status: "invalid", aiSuggestion: "Updated eval required within last 3 months." },
      { id: "c6", label: "Consent form", status: "complete", value: "Received" },
      { id: "c7", label: "Policy copy / e-card", status: "complete", value: "Verified" },
      { id: "c8", label: "ID proof", status: "complete", value: "Verified" },
    ],
  },
  {
    id: "PA012",
    claimId: "CLM/2025/012/STAR",
    hospitalId: "H006",
    policyHolderId: "P014",
    insurerId: "I001",
    status: "draft",
    estimatedAmount: 52000,
    procedure: "Colonoscopy with Biopsy",
    diagnosis: "Rectal Bleeding",
    icdCode: "K62.5",
    submittedAt: "2025-02-04T09:05:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA012"] * 60000).toISOString(),
    aiReadinessScore: 10,
    missingCritical: ["Signed pre-auth form", "Doctor's recommendation"],
    complianceStatus: "pending_review",
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "pending" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "pending" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "pending" },
      { id: "c4", label: "Consent form with patient signature", status: "pending" },
      { id: "c5", label: "Pre-operative investigation reports", status: "pending" },
      { id: "c6", label: "Policy copy / e-card", status: "pending" },
      { id: "c7", label: "ID proof", status: "pending" },
      { id: "c8", label: "Waiting period compliance check", status: "pending" },
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

// ==========================================
// DASHBOARD UTILITY FUNCTIONS
// ==========================================

/** Calculate SLA compliance percentage (requests within 48-hour deadline) */
export function calculateSLACompliance(): { percentage: number; overdueCount: number; totalActive: number } {
  const now = new Date();
  const activeRequests = preAuthRequests.filter(
    (p) => p.status !== "approved" && p.status !== "rejected" && p.status !== "draft"
  );
  const overdueRequests = activeRequests.filter((p) => new Date(p.slaDeadline) < now);
  const percentage = activeRequests.length > 0
    ? Math.round(((activeRequests.length - overdueRequests.length) / activeRequests.length) * 100)
    : 100;
  return { percentage, overdueCount: overdueRequests.length, totalActive: activeRequests.length };
}

/** Calculate total financial exposure (sum of pending pre-auth amounts) */
export function calculateTotalExposure(): { total: number; average: number; count: number } {
  const pendingRequests = preAuthRequests.filter(
    (p) => p.status !== "approved" && p.status !== "rejected" && p.status !== "draft"
  );
  const total = pendingRequests.reduce((sum, p) => sum + p.estimatedAmount, 0);
  const average = pendingRequests.length > 0 ? Math.round(total / pendingRequests.length) : 0;
  return { total, average, count: pendingRequests.length };
}

/** Calculate approval rate (approved vs total decided) */
export function calculateApprovalRate(): { rate: number; approved: number; rejected: number } {
  const approved = preAuthRequests.filter((p) => p.status === "approved").length;
  const rejected = preAuthRequests.filter((p) => p.status === "rejected").length;
  const total = approved + rejected;
  const rate = total > 0 ? Math.round((approved / total) * 100) : 0;
  return { rate, approved, rejected };
}

/** Get average processing time (simulated at 28 hours for demo) */
export function calculateAverageProcessingTime(): number {
  return 28;
}

/** Get overdue pre-auth requests */
export function getOverdueRequests(): PreAuthRequest[] {
  const now = new Date();
  return preAuthRequests.filter(
    (p) => p.status !== "approved" && p.status !== "rejected" && p.status !== "draft" && new Date(p.slaDeadline) < now
  );
}

/** Get high-value requests (≥₹5,00,000) */
export function getHighValueRequests(): PreAuthRequest[] {
  return preAuthRequests.filter(
    (p) => p.estimatedAmount >= 500000 && p.status !== "approved" && p.status !== "rejected" && p.status !== "draft"
  );
}

/** Calculate average AI readiness score */
export function calculateAverageAIReadiness(): number {
  const activeRequests = preAuthRequests.filter(
    (p) => p.status !== "approved" && p.status !== "rejected" && p.status !== "draft"
  );
  if (activeRequests.length === 0) return 0;
  return Math.round(activeRequests.reduce((sum, p) => sum + p.aiReadinessScore, 0) / activeRequests.length);
}

/** Calculate document completeness (% of requests with no missing critical docs) */
export function calculateDocumentCompleteness(): number {
  const activeRequests = preAuthRequests.filter(
    (p) => p.status !== "approved" && p.status !== "rejected" && p.status !== "draft"
  );
  if (activeRequests.length === 0) return 100;
  const completeRequests = activeRequests.filter((p) => p.missingCritical.length === 0);
  return Math.round((completeRequests.length / activeRequests.length) * 100);
}

/** Get hospital statistics */
export function getHospitalStats(): { hospital: Hospital; requestCount: number; avgAmount: number; totalAmount: number }[] {
  const hospitalMap = new Map<string, { count: number; totalAmount: number }>();

  preAuthRequests.forEach((p) => {
    const existing = hospitalMap.get(p.hospitalId) || { count: 0, totalAmount: 0 };
    hospitalMap.set(p.hospitalId, {
      count: existing.count + 1,
      totalAmount: existing.totalAmount + p.estimatedAmount,
    });
  });

  const stats: { hospital: Hospital; requestCount: number; avgAmount: number; totalAmount: number }[] = [];
  hospitalMap.forEach((value, hospitalId) => {
    const hospital = getHospital(hospitalId);
    if (hospital) {
      stats.push({
        hospital,
        requestCount: value.count,
        avgAmount: Math.round(value.totalAmount / value.count),
        totalAmount: value.totalAmount,
      });
    }
  });

  return stats.sort((a, b) => b.requestCount - a.requestCount);
}

/** Get insurer statistics */
export function getInsurerStats(): { insurer: Insurer; requestCount: number; totalAmount: number }[] {
  const insurerMap = new Map<string, { count: number; totalAmount: number }>();

  preAuthRequests.forEach((p) => {
    const existing = insurerMap.get(p.insurerId) || { count: 0, totalAmount: 0 };
    insurerMap.set(p.insurerId, {
      count: existing.count + 1,
      totalAmount: existing.totalAmount + p.estimatedAmount,
    });
  });

  const stats: { insurer: Insurer; requestCount: number; totalAmount: number }[] = [];
  insurerMap.forEach((value, insurerId) => {
    const insurer = getInsurer(insurerId);
    if (insurer) {
      stats.push({
        insurer,
        requestCount: value.count,
        totalAmount: value.totalAmount,
      });
    }
  });

  return stats.sort((a, b) => b.requestCount - a.requestCount);
}

/** Get daily throughput (requests processed today - simulated for demo) */
export function getDailyThroughput(): { count: number; trend: number } {
  // Simulated data for demo
  return { count: 12, trend: 15 }; // 15% improvement vs last week
}

/** Get status distribution for active requests */
export function getStatusDistribution(): { status: string; count: number; color: string; label: string }[] {
  const statusMap: Record<string, { count: number; color: string; label: string }> = {
    submitted: { count: 0, color: "bg-blue-500", label: "Submitted" },
    awaiting_docs: { count: 0, color: "bg-amber-500", label: "Awaiting Docs" },
    under_review: { count: 0, color: "bg-purple-500", label: "Under Review" },
    approved: { count: 0, color: "bg-emerald-500", label: "Approved" },
    rejected: { count: 0, color: "bg-red-500", label: "Rejected" },
    draft: { count: 0, color: "bg-slate-400", label: "Draft" },
  };

  preAuthRequests.forEach((p) => {
    if (statusMap[p.status]) {
      statusMap[p.status].count++;
    }
  });

  return Object.entries(statusMap)
    .filter(([, value]) => value.count > 0)
    .map(([status, value]) => ({ status, ...value }))
    .sort((a, b) => b.count - a.count);
}

/** Get open fraud alerts */
export function getOpenFraudAlerts(): { total: number; highSeverity: number; alerts: FraudAlert[] } {
  const openAlerts = fraudAlerts.filter((f) => f.status === "open" || f.status === "under_investigation");
  const highSeverity = openAlerts.filter((f) => f.severity === "high").length;
  return { total: openAlerts.length, highSeverity, alerts: openAlerts };
}

/** Format fraud type for display */
export function formatFraudType(type: string): string {
  const typeMap: Record<string, string> = {
    duplicate_billing: "Duplicate Billing",
    upcoding: "Upcoding",
    phantom_billing: "Phantom Billing",
    policy_misuse: "Policy Misuse",
  };
  return typeMap[type] || type;
}
