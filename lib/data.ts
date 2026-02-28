// Realistic dummy data for TPA Copilot demo (Indian healthcare context)

import type {
  Hospital,
  Insurer,
  PolicyHolder,
  PreAuthRequest,
  PreAuthCheckItem,
  Claim,
  FraudAlert,
  TPAAssignee,
} from "./types";

export const hospitals: Hospital[] = [
  { id: "H001", name: "Apollo Hospitals, Chennai", city: "Chennai", state: "Tamil Nadu", empanelmentStatus: "active", tier: "1" },
  { id: "H002", name: "Fortis Memorial Research Institute, Gurgaon", city: "Gurgaon", state: "Haryana", empanelmentStatus: "active", tier: "1" },
  { id: "H003", name: "Max Super Speciality Hospital, Saket", city: "New Delhi", state: "Delhi", empanelmentStatus: "active", tier: "1" },
  { id: "H004", name: "Manipal Hospitals, Bangalore", city: "Bangalore", state: "Karnataka", empanelmentStatus: "active", tier: "1" },
  { id: "H005", name: "Medanta - The Medicity", city: "Gurgaon", state: "Haryana", empanelmentStatus: "active", tier: "1" },
  { id: "H006", name: "Lilavati Hospital, Mumbai", city: "Mumbai", state: "Maharashtra", empanelmentStatus: "active", tier: "1" },
  { id: "H007", name: "Sri Laxmi Multispeciality Hospital, Hyderabad", city: "Hyderabad", state: "Telangana", empanelmentStatus: "under_review", tier: "2" },
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
  { id: "P015", name: "Suresh Prabhu", policyNumber: "ICICI/HL/2023/123321", insurerId: "I003", sumInsured: 1500000, relationship: "self" },
  { id: "P016", name: "Meena Deshmukh", policyNumber: "NIVA/HL/2024/445566", insurerId: "I005", sumInsured: 600000, relationship: "self" },
  { id: "P017", name: "Anil Kumble", policyNumber: "CARE/HL/2023/998877", insurerId: "I004", sumInsured: 800000, relationship: "self" },
  { id: "P018", name: "Sunita Williams", policyNumber: "STAR/HL/2024/776655", insurerId: "I001", sumInsured: 2000000, relationship: "self" },
  { id: "P019", name: "Rajat Sharma", policyNumber: "HDFC/HL/2023/112233", insurerId: "I002", sumInsured: 500000, relationship: "self" },
  { id: "P020", name: "Lakshmi Iyer", policyNumber: "ICICI/HL/2024/554433", insurerId: "I003", sumInsured: 1000000, relationship: "self" },
  { id: "P021", name: "Mr. Ramesh Kumar", policyNumber: "POL-STAR-IND-2025-009871", insurerId: "I001", sumInsured: 500000, relationship: "self" },
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
  PA013: 15,
  PA014: 35,
  PA015: 55,
  PA016: 90,
  PA017: 120,
  PA018: 180,
  PA019: 300,
  PA020: 600,
  PA022: 90,
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
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "submitted", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "submitted", value: "₹2,85,000" },
      { id: "c4", label: "Consent form with patient signature", status: "missing" },
      { id: "c5", label: "Pre-operative investigation reports", status: "missing" },
      { id: "c6", label: "Policy copy / e-card", status: "submitted", value: "Verified" },
      { id: "c7", label: "ID proof (Aadhaar/Passport)", status: "submitted", value: "Aadhaar linked" },
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
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "submitted", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "submitted", value: "₹1,75,000" },
      { id: "c4", label: "Consent form with patient signature", status: "submitted", value: "Received" },
      { id: "c5", label: "Pre-operative investigation reports", status: "submitted", value: "USG, LFT attached" },
      { id: "c6", label: "Policy copy / e-card", status: "submitted", value: "Verified" },
      { id: "c7", label: "ID proof", status: "submitted", value: "Verified" },
      { id: "c8", label: "Waiting period compliance", status: "submitted", value: "Compliant" },
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
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "missing" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "submitted", value: "Total only; implant breakup missing" },
      { id: "c4", label: "Consent form", status: "submitted", value: "Attached but blurred" },
      { id: "c5", label: "Pre-operative X-ray/MRI", status: "missing" },
      { id: "c6", label: "Policy copy", status: "submitted", value: "Verified" },
      { id: "c7", label: "ID proof", status: "submitted", value: "Verified" },
      { id: "c8", label: "Waiting period / pre-existing", status: "submitted" },
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
    checklist: [
      { id: "c6", label: "Policy copy / e-card", status: "pending" },
      { id: "c7", label: "ID proof (Aadhaar/Passport)", status: "pending" },
    ],
  },
  {
    id: "PA005",
    claimId: "CLM/2025/005/NIVA",
    hospitalId: "H005",
    policyHolderId: "P007",
    insurerId: "I005",
    assigneeId: "A001",
    status: "approved",
    estimatedAmount: 320000,
    procedure: "Endoscopic Sinus Surgery",
    diagnosis: "Chronic Rhinosinusitis with Nasal Polyps",
    icdCode: "J33.9",
    submittedAt: "2025-02-02T08:15:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA005"] * 60000).toISOString(),
    aiReadinessScore: 94,
    missingCritical: [],
    checklist: [
      { id: "c2", label: "Doctor's recommendation with stamp", status: "submitted", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "submitted", value: "₹3,20,000" },
      { id: "c4", label: "Consent form with patient signature", status: "submitted", value: "Received" },
      { id: "c5", label: "Pre-operative investigation reports", status: "submitted", value: "CT PNS, CBC attached" },
      { id: "c6", label: "Policy copy / e-card", status: "submitted", value: "Verified" },
      { id: "c7", label: "ID proof", status: "submitted", value: "Verified" },
      { id: "c8", label: "Waiting period compliance", status: "submitted", value: "Compliant" },
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
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "submitted", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "submitted", value: "₹1,50,000" },
      { id: "c4", label: "Consent form with patient signature", status: "submitted", value: "Received" },
      { id: "c5", label: "PSA report (last 3 months)", status: "missing", aiSuggestion: "Request PSA report to rule out malignancy." },
      { id: "c6", label: "Uroflowmetry / PVR report", status: "missing", aiSuggestion: "Attach uroflowmetry and PVR for BPH severity." },
      { id: "c7", label: "Policy copy / e-card", status: "submitted", value: "Verified" },
      { id: "c8", label: "ID proof", status: "submitted", value: "Verified" },
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
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "submitted", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "submitted", value: "₹6,20,000" },
      { id: "c4", label: "Histopathology report", status: "missing", aiSuggestion: "Attach biopsy-confirmed histopathology report." },
      { id: "c5", label: "Oncology board notes / treatment plan", status: "missing", aiSuggestion: "Provide MDT board notes for treatment plan." },
      { id: "c6", label: "Consent form", status: "submitted", value: "Received" },
      { id: "c7", label: "Policy copy / e-card", status: "submitted", value: "Verified" },
      { id: "c8", label: "ID proof", status: "submitted", value: "Verified" },
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
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "submitted", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "submitted", value: "₹98,000" },
      { id: "c4", label: "Consent form with patient signature", status: "submitted", value: "Received" },
      { id: "c5", label: "Pre-operative investigation reports", status: "submitted", value: "USG KUB, RFT attached" },
      { id: "c6", label: "Policy copy / e-card", status: "submitted", value: "Verified" },
      { id: "c7", label: "ID proof", status: "submitted", value: "Verified" },
      { id: "c8", label: "Waiting period compliance", status: "submitted", value: "Compliant" },
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
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "submitted", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "submitted", value: "₹4,10,000" },
      { id: "c4", label: "2D Echo report", status: "missing", aiSuggestion: "Attach 2D Echo with EF and valve assessment." },
      { id: "c5", label: "Coronary angiography CD/report", status: "missing", aiSuggestion: "Provide angiography CD/report for CABG indication." },
      { id: "c6", label: "Consent form with patient signature", status: "submitted", value: "Received" },
      { id: "c7", label: "Policy copy / e-card", status: "submitted", value: "Verified" },
      { id: "c8", label: "ID proof", status: "submitted", value: "Verified" },
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
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "submitted", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "submitted", value: "₹86,000" },
      { id: "c4", label: "Consent form with patient signature", status: "submitted", value: "Received" },
      { id: "c5", label: "Pre-operative MRI report", status: "submitted", value: "MRI knee attached" },
      { id: "c6", label: "Policy copy / e-card", status: "submitted", value: "Verified" },
      { id: "c7", label: "ID proof", status: "submitted", value: "Verified" },
      { id: "c8", label: "Waiting period compliance", status: "submitted", value: "Compliant" },
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
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "submitted", value: "Attached" },
      { id: "c3", label: "BMI assessment report", status: "missing", aiSuggestion: "Provide BMI calculation and obesity classification." },
      { id: "c4", label: "6-month supervised weight loss documentation", status: "missing", aiSuggestion: "Attach supervised weight loss program records." },
      { id: "c5", label: "Psychological evaluation report", status: "submitted", aiSuggestion: "Updated eval required within last 3 months." },
      { id: "c6", label: "Consent form", status: "submitted", value: "Received" },
      { id: "c7", label: "Policy copy / e-card", status: "submitted", value: "Verified" },
      { id: "c8", label: "ID proof", status: "submitted", value: "Verified" },
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
  {
    id: "PA013",
    claimId: "CLM/2025/013/ICICI",
    hospitalId: "H002",
    policyHolderId: "P015",
    insurerId: "I003",
    assigneeId: "A003",
    status: "under_review",
    estimatedAmount: 315000,
    procedure: "Total Abdominal Hysterectomy",
    diagnosis: "Multiple Uterine Fibroids",
    icdCode: "D25.9",
    submittedAt: "2025-02-04T10:15:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA013"] * 60000).toISOString(),
    aiReadinessScore: 85,
    missingCritical: [],
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "submitted", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "submitted", value: "₹3,15,000" },
      { id: "c4", label: "USG Abdomen/Pelvis report", status: "submitted", value: "Attached" },
      { id: "c5", label: "Consent form", status: "submitted", value: "Received" },
      { id: "c6", label: "Policy copy / e-card", status: "submitted", value: "Verified" },
      { id: "c7", label: "ID proof", status: "submitted", value: "Verified" },
      { id: "c8", label: "Waiting period compliance", status: "submitted", value: "Compliant" },
    ],
  },
  {
    id: "PA014",
    claimId: "CLM/2025/014/NIVA",
    hospitalId: "H005",
    policyHolderId: "P016",
    insurerId: "I005",
    assigneeId: "A001",
    status: "submitted",
    estimatedAmount: 120000,
    procedure: "ORIF (Open Reduction Internal Fixation)",
    diagnosis: "Fracture Shaft of Femur",
    icdCode: "S72.30",
    submittedAt: "2025-02-04T11:45:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA014"] * 60000).toISOString(),
    aiReadinessScore: 78,
    missingCritical: ["X-ray report of Femur"],
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "submitted", value: "Attached" },
      { id: "c3", label: "Estimated cost breakdown (itemized)", status: "submitted", value: "₹1,20,000" },
      { id: "c4", label: "X-ray report of Femur", status: "missing", aiSuggestion: "X-ray confirming fracture location and type is essential for ORIF." },
      { id: "c5", label: "Trauma notes / ER summary", status: "submitted", value: "Attached" },
      { id: "c6", label: "Consent form", status: "submitted", value: "Received" },
      { id: "c7", label: "ID proof", status: "submitted", value: "Verified" },
      { id: "c8", label: "Waiting period compliance", status: "submitted", value: "Accidental case; waiver applies" },
    ],
  },
  {
    id: "PA015",
    claimId: "CLM/2025/015/CARE",
    hospitalId: "H004",
    policyHolderId: "P017",
    insurerId: "I004",
    assigneeId: "A002",
    status: "awaiting_docs",
    estimatedAmount: 65000,
    procedure: "Chemotherapy (Injection Pemetrexed + Carboplatin)",
    diagnosis: "Adenocarcinoma Lung, Stage IV",
    icdCode: "C34.9",
    submittedAt: "2025-02-04T13:20:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA015"] * 60000).toISOString(),
    aiReadinessScore: 45,
    missingCritical: ["Histopathology report", "Staging PET scan"],
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "submitted", value: "Attached" },
      { id: "c3", label: "Histopathology report", status: "missing", aiSuggestion: "Biopsy confirmation is required for oncology cases." },
      { id: "c4", label: "Staging PET scan", status: "missing", aiSuggestion: "PET scan required to confirm Stage IV status." },
      { id: "c5", label: "Drug invoice / Quote", status: "submitted", value: "Pemetrexed quote missing", aiSuggestion: "Provide itemized cost of chemotherapy drugs." },
      { id: "c6", label: "Policy copy / e-card", status: "submitted", value: "Verified" },
      { id: "c7", label: "ID proof", status: "submitted", value: "Verified" },
      { id: "c8", label: "Waiting period compliance", status: "submitted", value: "Compliant" },
    ],
  },
  {
    id: "PA016",
    claimId: "CLM/2025/016/STAR",
    hospitalId: "H001",
    policyHolderId: "P018",
    insurerId: "I001",
    assigneeId: "A003",
    status: "under_review",
    estimatedAmount: 750000,
    procedure: "Valve Replacement Surgery",
    diagnosis: "Severe Aortic Stenosis",
    icdCode: "I35.0",
    submittedAt: "2025-02-04T15:10:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA016"] * 60000).toISOString(),
    aiReadinessScore: 92,
    missingCritical: [],
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation with stamp", status: "submitted", value: "Attached" },
      { id: "c3", label: "2D Echo report", status: "submitted", value: "AVA < 1 cm2" },
      { id: "c4", label: "Estimated cost breakdown", status: "submitted", value: "₹7,50,000" },
      { id: "c5", label: "Consent form", status: "submitted", value: "Received" },
      { id: "c6", label: "Policy copy / e-card", status: "submitted", value: "Verified" },
      { id: "c7", label: "ID proof", status: "submitted", value: "Verified" },
      { id: "c8", label: "Waiting period compliance", status: "submitted", value: "Compliant" },
    ],
  },
  {
    id: "PA017",
    claimId: "CLM/2025/017/HDFC",
    hospitalId: "H003",
    policyHolderId: "P019",
    insurerId: "I002",
    status: "submitted",
    estimatedAmount: 42000,
    procedure: "Dengue Fever Management (Inpatient)",
    diagnosis: "Dengue with Thrombocytopenia",
    icdCode: "A91",
    submittedAt: "2025-02-04T16:30:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA017"] * 60000).toISOString(),
    aiReadinessScore: 35,
    missingCritical: ["NS1/IgM Positive report", "Serial platelet counts"],
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation", status: "submitted", value: "Attached" },
      { id: "c3", label: "NS1 Antigen / IgM Antibody report", status: "missing", aiSuggestion: "Lab confirmation of Dengue is required for approval." },
      { id: "c4", label: "Serial Platelet counts", status: "missing", aiSuggestion: "Provide CBC reports showing platelet trend." },
      { id: "c5", label: "Temperature charts", status: "pending" },
      { id: "c6", label: "Policy copy", status: "submitted", value: "Verified" },
      { id: "c7", label: "ID proof", status: "submitted", value: "Verified" },
      { id: "c8", label: "Admission summary", status: "submitted", value: "Emergency admission" },
    ],
  },
  {
    id: "PA018",
    claimId: "CLM/2025/018/ICICI",
    hospitalId: "H006",
    policyHolderId: "P020",
    insurerId: "I003",
    status: "draft",
    estimatedAmount: 185000,
    procedure: "Laparoscopic Hernia Repair (IPOM)",
    diagnosis: "Ventral Hernia",
    icdCode: "K43.9",
    submittedAt: "2025-02-04T17:20:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA018"] * 60000).toISOString(),
    aiReadinessScore: 10,
    missingCritical: ["Signed pre-auth form", "Clinical photos"],
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "pending" },
      { id: "c2", label: "Doctor's recommendation", status: "pending" },
      { id: "c3", label: "Mesh and Tackers cost breakup", status: "pending" },
      { id: "c4", label: "Clinical photos of hernia", status: "missing", aiSuggestion: "Clinical photo required for ventral hernia justification." },
      { id: "c5", label: "USG Abdomen report", status: "pending" },
      { id: "c6", label: "Policy copy", status: "submitted", value: "Verified" },
      { id: "c7", label: "ID proof", status: "submitted", value: "Verified" },
      { id: "c8", label: "Waiting period compliance", status: "pending" },
    ],
  },
  {
    id: "PA019",
    claimId: "CLM/2025/019/NIVA",
    hospitalId: "H002",
    policyHolderId: "P005",
    insurerId: "I005",
    status: "approved",
    estimatedAmount: 55000,
    procedure: "AV Fistula Creation",
    diagnosis: "Chronic Kidney Disease Stage V",
    icdCode: "N18.5",
    submittedAt: "2025-02-01T09:00:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA019"] * 60000).toISOString(),
    aiReadinessScore: 95,
    missingCritical: [],
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation", status: "submitted", value: "Attached" },
      { id: "c3", label: "RFT / GFR report", status: "submitted", value: "Creatinine 8.2" },
      { id: "c4", label: "Nephrologist prescription", status: "submitted", value: "Attached" },
      { id: "c5", label: "Consent form", status: "submitted", value: "Received" },
      { id: "c6", label: "Policy copy", status: "submitted", value: "Verified" },
      { id: "c7", label: "ID proof", status: "submitted", value: "Verified" },
      { id: "c8", label: "Waiting period compliance", status: "submitted", value: "Compliant" },
    ],
  },
  {
    id: "PA020",
    claimId: "CLM/2025/020/CARE",
    hospitalId: "H003",
    policyHolderId: "P009",
    insurerId: "I004",
    status: "rejected",
    estimatedAmount: 125000,
    procedure: "Root Canal Treatment with Crown",
    diagnosis: "Dental Caries",
    icdCode: "K02.9",
    submittedAt: "2025-02-02T14:00:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA020"] * 60000).toISOString(),
    aiReadinessScore: 50,
    missingCritical: ["OPD Treatment justification"],
    checklist: [
      { id: "c1", label: "Pre-auth form (Form A) duly filled", status: "submitted", value: "Uploaded" },
      { id: "c2", label: "Doctor's recommendation", status: "submitted", value: "Attached" },
      { id: "c3", label: "X-ray OPG", status: "submitted", value: "Attached" },
      { id: "c4", label: "Service inclusion check", status: "submitted", aiSuggestion: "Dental procedures are typically excluded unless due to accident." },
      { id: "c5", label: "Consent form", status: "submitted", value: "Received" },
      { id: "c6", label: "Policy copy", status: "submitted", value: "Verified" },
      { id: "c7", label: "ID proof", status: "submitted", value: "Verified" },
      { id: "c8", label: "Exclusion policy verify", status: "submitted", value: "Dental exclusion clause G.4.2 active" },
    ],
  },
  {
    id: "PA022",
    claimId: "CLM/2026/022/STAR",
    hospitalId: "H007",
    policyHolderId: "P021",
    insurerId: "I001",
    assigneeId: "A003",
    status: "awaiting_docs",
    estimatedAmount: 165000,
    procedure: "Wound Debridement + Right Toe Amputation",
    diagnosis: "Diabetic Foot Infection with Gangrene",
    icdCode: "E11.52, A41.9, N18.3",
    submittedAt: "2026-02-14T07:58:00Z",
    slaDeadline: new Date(now.getTime() + durations["PA022"] * 60000).toISOString(),
    aiReadinessScore: 85,
    missingCritical: ["Previous diabetic treatment summary (pre-existing condition record)"],
    checklist: [
      { id: "c1", label: "Cashless pre-auth request form (Form A)", status: "approved", value: "Uploaded — 14/02/2026, 07:55 AM" },
      { id: "c2", label: "Policy copy / e-card", status: "approved", value: "POL-STAR-IND-2025-009871 — active, verified" },
      { id: "c3", label: "ID proof (Aadhaar)", status: "approved", value: "XXXX-XXXX-7682 — linked and verified" },
      { id: "c4", label: "Doctor's recommendation (Dr. S. Harinath)", status: "approved", value: "Attached with surgeon stamp, 14/02/2026" },
      { id: "c5", label: "Clinical examination notes", status: "approved", value: "Fever 101.4°F; necrotic ulcer, right toe; sepsis workup initiated" },
      { id: "c6", label: "Estimated cost breakdown (itemised)", status: "approved", value: "₹1,65,000 — OT ₹55K, Medicines ₹35K, Investigations ₹18K, Room ₹6.5K" },
      { id: "c7", label: "Consent form with patient signature", status: "approved", value: "Received — patient and relative signature on file" },
      { id: "c8", label: "Previous diabetic treatment summary", status: "missing", aiSuggestion: "Diabetes listed since 2014. A brief GP/physician summary of prior management would complete the pre-existing condition record and support the emergency exception clause." },
    ],
  },
];

export const claims: Claim[] = [
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
  {
    id: "FRAUD004",
    type: "policy_misuse",
    severity: "high",
    claimIds: ["CLM/2025/011/HDFC"],
    description: "Frequent claimant anomaly: 4 bariatric-related claims in 18 months across 3 different TPAs. Suspected systemic misuse of policy terms for elective surgery.",
    aiConfidence: 91,
    detectedAt: "2025-02-01T11:20:00Z",
    status: "open",
  },
  {
    id: "FRAUD005",
    type: "phantom_billing",
    severity: "medium",
    claimIds: ["CLM/2025/007/STAR"],
    description: "Geographical anomaly detected: Patient address is 800km from hospital. No referral records found. Supporting documents show stock images for lab reports.",
    aiConfidence: 78,
    detectedAt: "2025-02-03T10:05:00Z",
    status: "under_investigation",
  },
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

/** Simulated AI analysis result for demo flow. Returns the checklist with AI-enhanced statuses. */
export function getSimulatedAnalysisResult(paId: string): PreAuthCheckItem[] | null {
  const pa = getPreAuth(paId);
  if (!pa) return null;

  // Clone checklist to avoid mutating original
  const result: PreAuthCheckItem[] = JSON.parse(JSON.stringify(pa.checklist));

  result.forEach(item => {
    if (item.status === "submitted") {
      // Logic for diverse permutations per PA case
      if (paId === "PA001") {
        if (item.id === "c2") {
          item.status = "inconsistent";
          item.aiSuggestion = "Hospital seal appears to be digitally added, not stamped.";
        } else if (item.id === "c3") {
          item.status = "incomplete";
          item.aiSuggestion = "Pharmacy cost breakdown is missing details.";
        } else {
          item.status = "approved";
        }
      } else if (paId === "PA002") {
        if (item.id === "c6") {
          item.status = "inconsistent";
          item.aiSuggestion = "Patient's photo is not clearly visible.";
        } else {
          item.status = "approved";
        }
      } else if (paId === "PA003") {
        if (item.id === "c3") {
          item.status = "incomplete";
          item.aiSuggestion = "Separate bill for Implant Serial Number is missing.";
        } else if (item.id === "c4") {
          item.status = "inconsistent";
          item.aiSuggestion = "Signature on consent form does not match our records.";
        } else if (item.id === "c1") {
          item.status = "incomplete";
          item.aiSuggestion = "Hospital PIN code is missing in the form.";
        } else {
          item.status = "approved";
        }
      } else if (paId === "PA004") {
        if (item.id === "c7") {
          item.status = "incomplete";
          item.aiSuggestion = "ID card number in document does not match policy records.";
        } else {
          item.status = "approved";
        }
      } else if (paId === "PA005") {
        if (item.id === "c2") {
          item.status = "inconsistent";
          item.aiSuggestion = "Surgeon is not registered for Robotic-Assisted procedures.";
        } else {
          item.status = "approved";
        }
      } else {
        // Fallback: 50% chance of approved if submitted, to ensure we see failures
        const rand = Math.random();
        if (rand > 0.5) {
          item.status = "approved";
        } else if (rand > 0.25) {
          item.status = "inconsistent";
          item.aiSuggestion = `Patient ID in ${item.label} matches a different policy record.`;
        } else {
          item.status = "incomplete";
          item.aiSuggestion = `Mandatory field '${item.label}' is unreadable or blank.`;
        }
      }
    }
  });

  return result;
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
