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
    {
      key: "diagnosis",
      label: "Diagnosis",
      value: isCardiac ? "Coronary artery disease" : isOrtho ? "ACL tear (right knee)" : "Acute appendicitis",
      confidence: 90,
      required: true,
    },
    {
      key: "procedure",
      label: "Procedure",
      value: isCardiac ? "Coronary angioplasty" : isOrtho ? "Arthroscopic ACL reconstruction" : "Laparoscopic appendectomy",
      confidence: 93,
      required: true,
    },
    {
      key: "icdCode",
      label: "ICD-10 Code",
      value: isCardiac ? "I25.10" : isOrtho ? "S83.511A" : "K35.80",
      confidence: 84,
    },
    {
      key: "procedureCode",
      label: "Procedure Code",
      value: isCardiac ? "CPT-92928" : isOrtho ? "CPT-29888" : "CPT-44970",
      confidence: 82,
    },
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
  const averageConfidence = 96;

  const addFiles = (incoming: FileList | File[]) => {
    const next = Array.from(incoming);
    setFiles((current) => {
      const seen = new Set(current.map((file) => `${file.name}-${file.size}`));
      const merged = [...current];
      next.forEach((file) => {
        const key = `${file.name}-${file.size}`;
        if (!seen.has(key)) {
          merged.push(file);
        }
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

    const progressSteps = [18, 33, 48, 63, 77, 91, 100];
    progressSteps.forEach((value, index) => {
      setTimeout(() => {
        setProgress(value);
      }, 300 + index * 330);
    });

    setTimeout(() => {
      setExtractedFields(demoExtraction(files[0].name));
      setWorkflow("review");
    }, 300 + progressSteps.length * 330 + 250);
  };

  const updateField = (key: string, value: string) => {
    setExtractedFields((current) =>
      current.map((field) =>
        field.key === key
          ? {
              ...field,
              value,
              confidence: Math.max(field.confidence, 95),
            }
          : field
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

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Reimbursements"
        subtitle="Upload pre-auth forms and let AI auto-fill reimbursement portal rows for review."
        titleVariant="navy"
      />

      <div className="p-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.15fr_1.85fr]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Step 1</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">Upload pre-auth forms</h3>
                  <p className="mt-2 text-base text-slate-500">Drop a PDF or image. We will extract relevant claim details for portal entry.</p>
                </div>
              </div>

              <label
                htmlFor="reimbursement-files"
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  if (event.dataTransfer.files.length > 0) {
                    addFiles(event.dataTransfer.files);
                  }
                }}
                className={`mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                  isDragging
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                }`}
              >
                <input
                  id="reimbursement-files"
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(event) => {
                    if (event.target.files) addFiles(event.target.files);
                  }}
                />
                <div className="rounded-full bg-white p-3 shadow-sm">
                  <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0L8 12m4-4l4 4M20 16.5V19a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold">Drag and drop files here</p>
                  <p className="text-sm text-slate-400">or click to browse</p>
                </div>
              </label>

              <div className="mt-5 space-y-3">
                {files.length === 0 ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-base text-slate-500">No files selected.</div>
                ) : (
                  files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-base">
                      <div>
                        <p className="font-semibold text-slate-800">{file.name}</p>
                        <p className="text-sm text-slate-400">{formatBytes(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                  {files.length} files • {formatBytes(totalSize)}
                </p>
                <button
                  type="button"
                  disabled={!files.length || workflow === "extracting" || workflow === "submitting"}
                  onClick={handleExtract}
                  className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {workflow === "extracting" ? "Extracting..." : "Extract with AI"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Flow</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">Smart intake pipeline</h3>
              <div className="mt-4 space-y-3 text-base text-slate-600">
                {[
                  "Document upload and OCR",
                  "AI extraction of key reimbursement fields",
                  "Auto-fill of portal rows",
                  "Human review and final submission",
                ].map((step) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Step 2</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">AI extraction and portal fill</h3>
                  <p className="mt-2 text-base text-slate-500">AI-filled fields are editable before submission.</p>
                </div>
                <span
                  className={`rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wider ${
                    workflow === "submitted"
                      ? "bg-green-100 text-green-700"
                      : workflow === "review"
                        ? "bg-blue-100 text-blue-700"
                        : workflow === "extracting"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {workflow === "submitted"
                    ? "Submitted"
                    : workflow === "review"
                      ? "Ready for review"
                      : workflow === "extracting"
                        ? "Extracting"
                        : "Waiting"}
                </span>
              </div>

              {workflow === "extracting" ? (
                <div className="mt-5 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-slate-50 p-5">
                  <div className="flex items-center justify-between text-base font-semibold text-slate-800">
                    <span>AI is parsing form fields</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-slate-700 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">Detecting patient details, policy references, clinical details, and billing values.</p>
                </div>
              ) : null}

              {(workflow === "review" || workflow === "submitting" || workflow === "submitted") && (
                <div className="mt-5">
                  <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Extraction quality</p>
                      <p className="text-base font-semibold text-slate-700">Average confidence: {averageConfidence}%</p>
                    </div>
                    <p className="text-sm text-slate-500">
                      {hasMissingRequired ? "Missing required fields" : "All required fields present"}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {extractedFields.map((field) => (
                      <label key={field.key} className="rounded-xl border border-slate-100 bg-white p-3">
                        <div className="mb-2">
                          <span className="text-sm font-bold uppercase tracking-wide text-slate-500">{field.label}</span>
                        </div>
                        <input
                          value={field.value}
                          onChange={(event) => updateField(field.key, event.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-700 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        />
                      </label>
                    ))}
                  </div>

                  <label className="mt-4 block text-base font-semibold text-slate-600">
                    Reviewer notes (optional)
                    <textarea
                      value={reviewNotes}
                      onChange={(event) => setReviewNotes(event.target.value)}
                      rows={3}
                      placeholder="Any corrections or comments for final processing..."
                      className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-700 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                  </label>

                  <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setExtractedFields(initialFields);
                        setWorkflow("idle");
                        setProgress(0);
                        setSubmitMessage("");
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                    >
                      Start over
                    </button>
                    <button
                      type="button"
                      disabled={workflow === "submitting" || hasMissingRequired}
                      onClick={handleSubmit}
                      className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-teal-200 transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {workflow === "submitting" ? "Submitting..." : "Submit to portal"}
                    </button>
                  </div>
                </div>
              )}

              {workflow === "idle" && (
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                  <p className="text-lg font-semibold text-slate-700">Upload a pre-auth form to begin.</p>
                  <p className="mt-1 text-base text-slate-500">AI extracted fields will appear here for quick review and correction.</p>
                </div>
              )}

              {submitMessage ? (
                <div className="mt-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-base text-green-700">
                  {submitMessage}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
