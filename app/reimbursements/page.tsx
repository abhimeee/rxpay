"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";

type WorkflowState = "idle" | "extracting" | "review" | "submitting" | "submitted";

type ExtractedField = {
  key: string;
  label: string;
  value: string;
  confidence: number;
  required?: boolean;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const getConfidenceTone = (confidence: number) => {
  if (confidence >= 90) return { border: "var(--color-green)", bg: "var(--color-green-bg)" };
  if (confidence >= 80) return { border: "var(--color-yellow)", bg: "var(--color-yellow-bg)" };
  return { border: "var(--color-red)", bg: "var(--color-red-bg)" };
};

const initialFields: ExtractedField[] = [
  { key: "insuranceId", label: "Insurance ID", value: "", confidence: 0, required: true },
  { key: "memberId", label: "Member ID", value: "", confidence: 0, required: true },
  { key: "patientName", label: "Patient Name", value: "", confidence: 0, required: true },
  { key: "patientDob", label: "Patient DOB", value: "", confidence: 0, required: true },
  { key: "patientGender", label: "Patient Gender", value: "", confidence: 0, required: true },
  { key: "mobileNumber", label: "Mobile Number", value: "", confidence: 0, required: true },
  { key: "abhaId", label: "ABHA ID", value: "", confidence: 0 },
  { key: "uhid", label: "UHID", value: "", confidence: 0 },
  { key: "insurerName", label: "Insurer Name", value: "", confidence: 0, required: true },
  { key: "tpaName", label: "TPA Name", value: "", confidence: 0, required: true },
  { key: "policyNumber", label: "Policy Number", value: "", confidence: 0, required: true },
  { key: "policyType", label: "Policy Type", value: "", confidence: 0, required: true },
  { key: "sumInsured", label: "Sum Insured (INR)", value: "", confidence: 0, required: true },
  { key: "availableCoverage", label: "Available Coverage (INR)", value: "", confidence: 0 },
  { key: "copayPercent", label: "Co-pay (%)", value: "", confidence: 0 },
  { key: "roomCategory", label: "Room Category", value: "", confidence: 0, required: true },
  { key: "preAuthRef", label: "Pre-Auth Reference", value: "", confidence: 0, required: true },
  { key: "dateOfAdmission", label: "Date of Admission", value: "", confidence: 0, required: true },
  { key: "dateOfDischarge", label: "Date of Discharge", value: "", confidence: 0 },
  { key: "providerName", label: "Hospital / Provider", value: "", confidence: 0, required: true },
  { key: "hospitalCity", label: "Hospital City", value: "", confidence: 0, required: true },
  { key: "networkHospital", label: "Network Hospital (Y/N)", value: "", confidence: 0, required: true },
  { key: "admissionDate", label: "Admission Date", value: "", confidence: 0, required: true },
  { key: "diagnosis", label: "Diagnosis", value: "", confidence: 0, required: true },
  { key: "icdCode", label: "ICD-10 Code", value: "", confidence: 0 },
  { key: "procedure", label: "Procedure", value: "", confidence: 0, required: true },
  { key: "procedureCode", label: "Procedure Code", value: "", confidence: 0 },
  { key: "claimAmount", label: "Claim Amount", value: "", confidence: 0, required: true },
  { key: "nonPayableAmount", label: "Non-payable Amount (INR)", value: "", confidence: 0 },
  { key: "finalPayableAmount", label: "Final Payable Amount (INR)", value: "", confidence: 0, required: true },
  { key: "gstin", label: "Hospital GSTIN", value: "", confidence: 0 },
  { key: "doctorName", label: "Treating Doctor", value: "", confidence: 0 },
  { key: "contactNumber", label: "Contact Number", value: "", confidence: 0 },
];

const demoExtraction = (fileName: string): ExtractedField[] => {
  const seed = fileName.toLowerCase();
  const isCardiac = seed.includes("card") || seed.includes("heart");
  const isOrtho = seed.includes("ortho") || seed.includes("knee") || seed.includes("joint");

  return [
    { key: "insuranceId", label: "Insurance ID", value: "INS-7731-4582", confidence: 99, required: true },
    { key: "memberId", label: "Member ID", value: "MBR-0029187", confidence: 97, required: true },
    { key: "patientName", label: "Patient Name", value: "Anika Gupta", confidence: 98, required: true },
    { key: "patientDob", label: "Patient DOB", value: "1992-08-11", confidence: 96, required: true },
    { key: "patientGender", label: "Patient Gender", value: "Female", confidence: 98, required: true },
    { key: "mobileNumber", label: "Mobile Number", value: "+91 98765 43210", confidence: 95, required: true },
    { key: "abhaId", label: "ABHA ID", value: "91-7845-2386-1124", confidence: 84 },
    { key: "uhid", label: "UHID", value: "UHID-2026-11492", confidence: 88 },
    { key: "insurerName", label: "Insurer Name", value: "Star Health and Allied Insurance", confidence: 97, required: true },
    { key: "tpaName", label: "TPA Name", value: "AKNA TPA Services Pvt Ltd", confidence: 99, required: true },
    { key: "policyNumber", label: "Policy Number", value: "POL-AXT-99451", confidence: 97, required: true },
    { key: "policyType", label: "Policy Type", value: "Family Floater", confidence: 93, required: true },
    { key: "sumInsured", label: "Sum Insured (INR)", value: "500000", confidence: 95, required: true },
    { key: "availableCoverage", label: "Available Coverage (INR)", value: "312500", confidence: 89 },
    { key: "copayPercent", label: "Co-pay (%)", value: "10", confidence: 86 },
    { key: "roomCategory", label: "Room Category", value: "Single Private Room", confidence: 92, required: true },
    { key: "preAuthRef", label: "Pre-Auth Reference", value: "PA-2026-02183", confidence: 95, required: true },
    { key: "dateOfAdmission", label: "Date of Admission", value: "2026-02-21", confidence: 94, required: true },
    { key: "dateOfDischarge", label: "Date of Discharge", value: "2026-02-24", confidence: 91 },
    { key: "providerName", label: "Hospital / Provider", value: "Sanjeevani Medical Center", confidence: 97, required: true },
    { key: "hospitalCity", label: "Hospital City", value: "Bengaluru", confidence: 96, required: true },
    { key: "networkHospital", label: "Network Hospital (Y/N)", value: "Y", confidence: 98, required: true },
    { key: "admissionDate", label: "Admission Date", value: "2026-02-21", confidence: 92, required: true },
    { key: "diagnosis", label: "Diagnosis", value: isCardiac ? "Coronary artery disease" : isOrtho ? "ACL tear (right knee)" : "Acute appendicitis", confidence: 90, required: true },
    { key: "procedure", label: "Procedure", value: isCardiac ? "Coronary angioplasty" : isOrtho ? "Arthroscopic ACL reconstruction" : "Laparoscopic appendectomy", confidence: 93, required: true },
    { key: "icdCode", label: "ICD-10 Code", value: isCardiac ? "I25.10" : isOrtho ? "S83.511A" : "K35.80", confidence: 84 },
    { key: "procedureCode", label: "Procedure Code", value: isCardiac ? "CPT-92928" : isOrtho ? "CPT-29888" : "CPT-44970", confidence: 82 },
    { key: "claimAmount", label: "Claim Amount", value: isCardiac ? "235000" : isOrtho ? "186000" : "124500", confidence: 96, required: true },
    { key: "nonPayableAmount", label: "Non-payable Amount (INR)", value: isCardiac ? "22000" : isOrtho ? "14000" : "9500", confidence: 86 },
    { key: "finalPayableAmount", label: "Final Payable Amount (INR)", value: isCardiac ? "213000" : isOrtho ? "172000" : "115000", confidence: 91, required: true },
    { key: "gstin", label: "Hospital GSTIN", value: "29ABCDE1234F1Z5", confidence: 79 },
    { key: "doctorName", label: "Treating Doctor", value: "Dr. R. Menon", confidence: 82 },
    { key: "contactNumber", label: "Contact Number", value: "+91 98765 43210", confidence: 88 },
  ];
};

export default function ReimbursementsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [workflow, setWorkflow] = useState<WorkflowState>("idle");
  const [progress, setProgress] = useState(0);
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>(initialFields);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  const totalSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);
  const hasMissingRequired = extractedFields.some((field) => field.required && !field.value.trim());

  const addFiles = (incoming: FileList | File[]) => {
    const next = Array.from(incoming);
    setFiles((current) => {
      const seen = new Set(current.map((file) => `${file.name}-${file.size}`));
      const merged = [...current];
      next.forEach((file) => {
        const key = `${file.name}-${file.size}`;
        if (!seen.has(key)) merged.push(file);
      });
      return merged.slice(0, 5);
    });
    setWorkflow("idle");
    setSubmitMessage("");
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, idx) => idx !== index));
  };

  const handleExtract = () => {
    if (!files.length) return;
    setWorkflow("extracting");
    setProgress(8);
    setSubmitMessage("");
    const progressSteps = [14, 26, 39, 53, 68, 82, 93, 100];
    progressSteps.forEach((value, index) => {
      setTimeout(() => setProgress(value), 500 + index * 520);
    });
    setTimeout(() => {
      setExtractedFields(demoExtraction(files[0].name));
      setWorkflow("review");
    }, 500 + progressSteps.length * 520 + 450);
  };

  const updateField = (key: string, value: string) => {
    setExtractedFields((current) =>
      current.map((field) =>
        field.key === key ? { ...field, value, confidence: Math.max(field.confidence, 95) } : field
      )
    );
  };

  const handleSubmit = () => {
    if (hasMissingRequired) return;
    setWorkflow("submitting");
    setSubmitMessage("");
    setTimeout(() => {
      setWorkflow("submitted");
      setSubmitMessage("Claim draft submitted to the reimbursement portal. The reviewer can now finalize and dispatch.");
    }, 1200);
  };

  const workflowStatusDef = {
    submitted: { label: "Submitted", bg: "var(--color-green-bg)", color: "var(--color-green)" },
    review: { label: "Ready for review", bg: "var(--color-blue-bg)", color: "var(--color-blue)" },
    extracting: { label: "Extracting", bg: "var(--color-yellow-bg)", color: "var(--color-yellow)" },
    idle: { label: "Waiting", bg: "var(--color-bg)", color: "var(--color-text-muted)" },
    submitting: { label: "Submitting", bg: "var(--color-yellow-bg)", color: "var(--color-yellow)" },
  };
  const statusDef = workflowStatusDef[workflow];

  const cardStyle: React.CSSProperties = {
    background: "var(--color-white)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    padding: "20px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "7px 10px",
    fontSize: "var(--font-size-base)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    background: "var(--color-white)",
    color: "var(--color-text-primary)",
    outline: "none",
    boxSizing: "border-box",
  };

  const btnPrimary: React.CSSProperties = {
    padding: "7px 16px",
    fontSize: "var(--font-size-base)",
    fontWeight: 500,
    background: "var(--color-black)",
    color: "var(--color-white)",
    border: "none",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    transition: "opacity 0.15s",
  };

  const btnSecondary: React.CSSProperties = {
    padding: "7px 16px",
    fontSize: "var(--font-size-base)",
    fontWeight: 500,
    background: "var(--color-white)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    transition: "background 0.15s",
  };

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <PageHeader title="Reimbursements" />

      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: 20,
            maxWidth: 1200,
          }}
        >
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Upload card */}
            <div style={cardStyle}>
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  Step 1
                </p>
                <p style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>
                  Upload pre-auth forms
                </p>
                <p style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-secondary)" }}>
                  Drop a PDF or image. AI will extract relevant claim details.
                </p>
              </div>

              {/* Drop zone */}
              <label
                htmlFor="reimbursement-files"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files); }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "28px 20px",
                  border: `1px dashed ${isDragging ? "var(--color-black)" : "var(--color-border-dark)"}`,
                  borderRadius: "var(--radius-md)",
                  background: isDragging ? "var(--color-bg-hover)" : "var(--color-bg)",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.1s",
                  marginBottom: 12,
                }}
              >
                <input id="reimbursement-files" type="file" multiple accept=".pdf,.png,.jpg,.jpeg" style={{ display: "none" }}
                  onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
                />
                <svg style={{ width: 20, height: 20, color: "var(--color-text-muted)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0L8 12m4-4l4 4M20 16.5V19a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.5" />
                </svg>
                <div>
                  <p style={{ fontSize: "var(--font-size-base)", fontWeight: 500, color: "var(--color-text-primary)" }}>
                    Drag and drop files here
                  </p>
                  <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 2 }}>
                    or click to browse · PDF, PNG, JPG
                  </p>
                </div>
              </label>

              {/* File list */}
              {files.length === 0 ? (
                <p style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-muted)", padding: "8px 0" }}>No files selected.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--color-white)",
                      }}
                    >
                      <div>
                        <p style={{ fontSize: "var(--font-size-base)", fontWeight: 500, color: "var(--color-text-primary)" }}>{file.name}</p>
                        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{formatBytes(file.size)}</p>
                      </div>
                      <button type="button" onClick={() => removeFile(index)}
                        style={{ ...btnSecondary, padding: "3px 10px", fontSize: "var(--font-size-xs)" }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  {files.length} file{files.length !== 1 ? "s" : ""} · {formatBytes(totalSize)}
                </p>
                <button
                  type="button"
                  disabled={!files.length || workflow === "extracting" || workflow === "submitting"}
                  onClick={handleExtract}
                  style={{ ...btnPrimary, opacity: (!files.length || workflow === "extracting" || workflow === "submitting") ? 0.4 : 1, cursor: (!files.length || workflow === "extracting" || workflow === "submitting") ? "not-allowed" : "pointer" }}
                >
                  {workflow === "extracting" ? "Extracting..." : "Extract with AI"}
                </button>
              </div>
            </div>

            {/* Pipeline card */}
            <div style={cardStyle}>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                Flow
              </p>
              <p style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 12 }}>
                Smart intake pipeline
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Document upload and OCR",
                  "AI extraction of key reimbursement fields",
                  "Auto-fill of portal rows",
                  "Human review and final submission",
                ].map((step, i) => (
                  <div key={step} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--color-bg)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-muted)", flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-secondary)" }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  Step 2
                </p>
                <p style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>
                  AI extraction & portal fill
                </p>
                <p style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-secondary)" }}>
                  AI-filled fields are editable before submission.
                </p>
              </div>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: "var(--radius-xs)",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 500,
                  background: statusDef.bg,
                  color: statusDef.color,
                  flexShrink: 0,
                }}
              >
                {statusDef.label}
              </span>
            </div>

            {/* Extraction progress */}
            {workflow === "extracting" && (
              <div style={{ padding: "14px 16px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "var(--font-size-base)", fontWeight: 500, color: "var(--color-text-primary)" }}>
                  <span>AI is parsing form fields</span>
                  <span>{progress}%</span>
                </div>
                <div style={{ height: 4, background: "var(--color-border)", borderRadius: 99, overflow: "hidden" }}>
                  <div
                    style={{ height: "100%", width: `${progress}%`, background: "var(--color-black)", borderRadius: 99, transition: "width 0.3s ease" }}
                  />
                </div>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 8 }}>
                  Detecting patient details, policy references, clinical details, and billing values.
                </p>
              </div>
            )}

            {/* Review fields */}
            {(workflow === "review" || workflow === "submitting" || workflow === "submitted") && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginBottom: 14,
                    maxHeight: 420,
                    overflowY: "auto",
                    paddingRight: 4,
                  }}
                >
                  {extractedFields.map((field) => {
                    const tone = getConfidenceTone(field.confidence);
                    return (
                      <label
                        key={field.key}
                        style={{
                          display: "block",
                          padding: "8px 10px",
                          border: `1px solid ${field.confidence > 0 ? tone.border + "55" : "var(--color-border)"}`,
                          borderRadius: "var(--radius-sm)",
                          background: field.confidence > 0 ? tone.bg + "44" : "var(--color-white)",
                        }}
                      >
                        <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                          {field.label}{field.required && <span style={{ color: "var(--color-red)", marginLeft: 2 }}>*</span>}
                        </p>
                        <input
                          value={field.value}
                          onChange={(e) => updateField(field.key, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          style={inputStyle}
                        />
                      </label>
                    );
                  })}
                </div>

                <label style={{ display: "block", marginBottom: 14 }}>
                  <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 4 }}>
                    Reviewer notes (optional)
                  </p>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    placeholder="Any corrections or comments for final processing..."
                    style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
                  />
                </label>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => { setExtractedFields(initialFields); setWorkflow("idle"); setProgress(0); setSubmitMessage(""); }}
                    style={btnSecondary}
                  >
                    Start over
                  </button>
                  <button
                    type="button"
                    disabled={workflow === "submitting" || hasMissingRequired}
                    onClick={handleSubmit}
                    style={{
                      ...btnPrimary,
                      background: "var(--color-accent)",
                      opacity: (workflow === "submitting" || hasMissingRequired) ? 0.4 : 1,
                      cursor: (workflow === "submitting" || hasMissingRequired) ? "not-allowed" : "pointer",
                    }}
                  >
                    {workflow === "submitting" ? "Submitting..." : "Submit to portal"}
                  </button>
                </div>
              </>
            )}

            {/* Idle state */}
            {workflow === "idle" && (
              <div
                style={{
                  border: "1px dashed var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg)",
                  padding: "40px 20px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "var(--font-size-base)", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 4 }}>
                  Upload a pre-auth form to begin.
                </p>
                <p style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-muted)" }}>
                  AI extracted fields will appear here for quick review and correction.
                </p>
              </div>
            )}

            {/* Success message */}
            {submitMessage && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background: "var(--color-green-bg)",
                  border: "1px solid var(--color-green)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--font-size-base)",
                  color: "var(--color-green)",
                }}
              >
                {submitMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
