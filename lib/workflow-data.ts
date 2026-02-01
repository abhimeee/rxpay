// Realistic demo data for 9-stage pre-auth workflow (TPA Copilot)

import type { PreAuthWorkflowData, WorkflowStageId } from "./types";

const workflowByPreAuthId: Record<string, PreAuthWorkflowData> = {
  PA001: {
    requestSummary: {
      admissionType: "emergency",
      submittedWithinSLA: true,
      items: [
        { label: "Patient ID (Aadhaar)", value: "XXXX-XXXX-4521", present: true },
        { label: "Policy document", value: "STAR/HL/2023/456789", present: true },
        { label: "Doctor consultation notes", value: "Chief complaint: chest pain, STEMI", present: true },
        { label: "Provisional diagnosis (ICD-10)", value: "I21.9 – Acute MI", present: true },
        { label: "Proposed treatment", value: "Coronary angioplasty with stent", present: true },
        { label: "Estimated cost (rate card)", value: "₹2,85,000", present: true },
        { label: "ECG, Troponin, Lipid profile", value: "Attached", present: true },
        { label: "Past cardiac history", value: "Hypertension, no prior MI", present: true },
      ],
    },
    eligibility: [
      { id: "e1", label: "Policy status", status: "pass", value: "Active", detail: "Premiums paid; no lapse." },
      { id: "e2", label: "Coverage dates", status: "pass", value: "Within validity", detail: "Policy valid until Dec 2025." },
      { id: "e3", label: "Service coverage", status: "pass", value: "Covered", detail: "Cardiac procedures under plan." },
      { id: "e4", label: "Benefit limit", status: "pass", value: "₹10L cardiac sub-limit", detail: "₹2.85L well within limit; ₹1.2L used this year." },
      { id: "e5", label: "Waiting period", status: "pass", value: "Elapsed", detail: "24 months since inception; cardiac waiting period satisfied." },
    ],
    coding: {
      icd10: [
        { id: "icd1", type: "icd10", code: "I21.9", description: "Acute myocardial infarction, unspecified", status: "valid" },
      ],
      cpt: [
        { id: "cpt1", type: "cpt", code: "93454", description: "Catheter placement, coronary angiography", status: "valid" },
        { id: "cpt2", type: "cpt", code: "92928", description: "Percutaneous transcatheter placement, stent", status: "valid" },
      ],
    },
    medicalNecessity: [
      { id: "mn1", level: 1, source: "IRDAI Guidelines", finding: "Standard treatment for STEMI; cashless eligible.", status: "met" },
      { id: "mn2", level: 2, source: "Insurer cardiac policy", finding: "Angioplasty + stent covered for acute MI with supporting ECG/troponin.", status: "met" },
    ],
    fraudFlags: [
      { id: "f1", category: "document", severity: "low", description: "Timeline: symptoms 2 days; admission 1 day – consistent." },
      { id: "f2", category: "provider", severity: "none", description: "Hospital in network; no prior fraud flags." },
    ],
    queries: [
      { id: "q1", question: "Consent form with patient signature not received.", status: "open", dueDate: "2025-02-04" },
      { id: "q2", question: "Pre-operative investigation reports (ECG, Troponin, Lipid) requested.", status: "open", dueDate: "2025-02-04" },
    ],
    p2pRequired: false,
  },
  PA002: {
    requestSummary: {
      admissionType: "planned",
      submittedWithinSLA: true,
      items: [
        { label: "Patient ID (Aadhaar)", value: "XXXX-XXXX-7832", present: true },
        { label: "Policy document", value: "HDFC/HL/2022/234567", present: true },
        { label: "Doctor consultation notes", value: "Symptomatic gallstones, recurrent pain", present: true },
        { label: "Provisional diagnosis (ICD-10)", value: "K80.1 – Gallstones with cholecystitis", present: true },
        { label: "Proposed treatment", value: "Laparoscopic cholecystectomy", present: true },
        { label: "Estimated cost (rate card)", value: "₹1,75,000", present: true },
        { label: "USG abdomen, LFT", value: "Attached", present: true },
        { label: "Past illness records", value: "Nil relevant", present: true },
      ],
    },
    eligibility: [
      { id: "e1", label: "Policy status", status: "pass", value: "Active", detail: "Premiums paid; employee in service (group)." },
      { id: "e2", label: "Coverage dates", status: "pass", value: "Within validity", detail: "Request within policy period." },
      { id: "e3", label: "Service coverage", status: "pass", value: "Covered", detail: "Laparoscopic surgery under general surgery." },
      { id: "e4", label: "Benefit limit", status: "pass", value: "₹5L annual", detail: "₹1.75L within limit; ₹0.8L utilized this year." },
      { id: "e5", label: "Waiting period", status: "pass", value: "Elapsed", detail: "30-day initial waiting period completed." },
    ],
    coding: {
      icd10: [
        { id: "icd1", type: "icd10", code: "K80.1", description: "Calculus of gallbladder with acute cholecystitis", status: "valid" },
      ],
      cpt: [
        { id: "cpt1", type: "cpt", code: "47562", description: "Laparoscopy, surgical; cholecystectomy", status: "valid" },
      ],
    },
    medicalNecessity: [
      { id: "mn1", level: 1, source: "IRDAI Guidelines", finding: "Standard treatment for symptomatic gallstones.", status: "met" },
      { id: "mn2", level: 2, source: "Insurer surgical policy", finding: "Lap chole approved when USG + clinical picture support.", status: "met" },
    ],
    fraudFlags: [
      { id: "f1", category: "document", severity: "none", description: "Documents consistent; no anomalies." },
      { id: "f2", category: "provider", severity: "none", description: "Network hospital; no red flags." },
    ],
    queries: [],
    p2pRequired: false,
  },
  PA003: {
    requestSummary: {
      admissionType: "planned",
      submittedWithinSLA: true,
      items: [
        { label: "Patient ID", value: "Driving license – DL-09-XXXX", present: true },
        { label: "Policy document", value: "ICICI/HL/2023/789012", present: true },
        { label: "Doctor consultation notes", value: "Severe knee OA, failed conservative care", present: true },
        { label: "Provisional diagnosis (ICD-10)", value: "M17.11 – Unilateral primary OA, right knee", present: true },
        { label: "Proposed treatment", value: "Total knee replacement", present: true },
        { label: "Estimated cost (rate card)", value: "₹4,20,000 (implant breakup missing)", present: false },
        { label: "Pre-operative X-ray/MRI", value: "Not attached", present: false },
        { label: "Doctor recommendation with stamp", value: "Missing stamp", present: false },
      ],
    },
    eligibility: [
      { id: "e1", label: "Policy status", status: "pass", value: "Active", detail: "Premiums current." },
      { id: "e2", label: "Coverage dates", status: "pass", value: "Within validity", detail: "Policy valid." },
      { id: "e3", label: "Service coverage", status: "pass", value: "Covered", detail: "Orthopedic sub-limit ₹5L." },
      { id: "e4", label: "Benefit limit", status: "warning", value: "₹5L ortho sub-limit", detail: "Est. ₹4.2L; need itemized implant cost to confirm." },
      { id: "e5", label: "Waiting period", status: "pass", value: "Elapsed", detail: "Pre-existing OA; 2-year waiting period completed." },
    ],
    coding: {
      icd10: [
        { id: "icd1", type: "icd10", code: "M17.11", description: "Unilateral primary osteoarthritis, right knee", status: "valid" },
      ],
      cpt: [
        { id: "cpt1", type: "cpt", code: "27447", description: "Total knee arthroplasty with prosthesis", status: "valid" },
      ],
    },
    medicalNecessity: [
      { id: "mn1", level: 1, source: "IRDAI Guidelines", finding: "Joint replacement covered for severe OA.", status: "met" },
      { id: "mn2", level: 2, source: "Insurer ortho policy", finding: "TKR covered for OA Stage III/IV (Kellgren-Lawrence). X-ray/MRI required for severity confirmation.", status: "conditional" },
    ],
    fraudFlags: [
      { id: "f1", category: "document", severity: "medium", description: "Cost breakdown incomplete; implant cost not itemized (IRDAI requirement)." },
      { id: "f2", category: "provider", severity: "none", description: "Network hospital." },
    ],
    queries: [
      { id: "q1", question: "Please provide (1) Itemized implant cost breakup (2) Doctor recommendation with hospital stamp (3) Pre-operative X-ray/MRI showing Kellgren-Lawrence stage.", status: "open", dueDate: "2025-02-06" },
    ],
    p2pRequired: true,
    p2pSummary: { scheduled: "2025-02-05 11:00", outcome: "Pending", reviewer: "Dr. S. Rao, Ortho (Insurer)" },
  },
  PA004: {
    requestSummary: {
      admissionType: "planned",
      submittedWithinSLA: true,
      items: [
        { label: "Patient ID (Aadhaar)", value: "Pending", present: false },
        { label: "Policy document", value: "CARE/HL/2024/345678", present: false },
        { label: "Doctor consultation notes", value: "Senile cataract, bilateral", present: false },
        { label: "Provisional diagnosis (ICD-10)", value: "H25.1 – Senile cataract", present: false },
        { label: "Proposed treatment", value: "Phaco with IOL", present: false },
        { label: "Estimated cost", value: "₹1,95,000", present: false },
        { label: "Slit-lamp, A-scan", value: "Pending", present: false },
        { label: "Past illness", value: "Pending", present: false },
      ],
    },
    eligibility: [
      { id: "e1", label: "Policy status", status: "pass", value: "Active", detail: "New policy; premiums paid." },
      { id: "e2", label: "Coverage dates", status: "pass", value: "Within validity", detail: "Valid." },
      { id: "e3", label: "Service coverage", status: "pass", value: "Covered", detail: "Cataract under day-care." },
      { id: "e4", label: "Benefit limit", status: "pass", value: "Within limit", detail: "Day-care sub-limit applicable." },
      { id: "e5", label: "Waiting period", status: "pass", value: "Elapsed", detail: "30-day waiting period completed." },
    ],
    coding: {
      icd10: [
        { id: "icd1", type: "icd10", code: "H25.1", description: "Senile nuclear cataract", status: "valid" },
      ],
      cpt: [
        { id: "cpt1", type: "cpt", code: "66984", description: "Extracapsular cataract removal with IOL", status: "valid" },
      ],
    },
    medicalNecessity: [
      { id: "mn1", level: 1, source: "IRDAI Guidelines", finding: "Cataract surgery standard; day-care eligible.", status: "met" },
      { id: "mn2", level: 2, source: "Insurer policy", finding: "Phaco + IOL covered; documentation pending.", status: "conditional" },
    ],
    fraudFlags: [
      { id: "f1", category: "document", severity: "none", description: "Awaiting documents." },
      { id: "f2", category: "provider", severity: "none", description: "Network hospital." },
    ],
    queries: [
      { id: "q1", question: "Complete document set not received. Please upload Form A, consent, policy, ID proof, and pre-op reports (slit-lamp, A-scan).", status: "open", dueDate: "2025-02-08" },
    ],
    p2pRequired: false,
  },
};

export function getWorkflowData(preAuthId: string): PreAuthWorkflowData | null {
  return workflowByPreAuthId[preAuthId] ?? null;
}

export const WORKFLOW_STAGES: { id: WorkflowStageId; title: string; shortTitle: string; description: string }[] = [
  { id: "request_initiation", shortTitle: "Request", title: "Request Initiation", description: "What the hospital TPA desk collected and submitted." },
  { id: "documentation", shortTitle: "Docs", title: "Documentation Completeness", description: "Verify completeness against IRDAI checklist." },
  { id: "eligibility", shortTitle: "Eligibility", title: "Eligibility & Coverage", description: "Policy status, dates, service coverage, limits, waiting period." },
  { id: "medical_coding", shortTitle: "Coding", title: "Medical Coding Accuracy", description: "ICD-10 and CPT validation." },
  { id: "medical_necessity", shortTitle: "Necessity", title: "Medical Necessity", description: "IRDAI → insurer policy → clinical criteria." },
  { id: "fraud_anomaly", shortTitle: "Fraud", title: "Fraud & Anomaly", description: "Red flags and pattern checks." },
  { id: "queries_and_decision", shortTitle: "Queries & Decision", title: "Queries & Decision", description: "Open queries and final decision: Approve, Deny, Query, or Conditional." },
];
