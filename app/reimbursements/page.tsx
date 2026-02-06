"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "../components/PageHeader";

type UploadStatus = "idle" | "uploading" | "success" | "error";

type UploadedFile = {
  name: string;
  size: number;
  type: string;
  previewUrl: string;
};

type Transcription = {
  filename: string;
  text: string;
  summary?: string;
  source: "pdf" | "image" | "unsupported";
};

type UploadResponse = {
  ok: boolean;
  bucket?: string;
  uploads?: Array<{ key: string; filename: string; size: number }>;
  transcriptions?: Transcription[];
  summary?: string;
  error?: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

export default function ReimbursementsPage() {
  const [claimId, setClaimId] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [memberName, setMemberName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [chatInputByFile, setChatInputByFile] = useState<Record<string, string>>({});
  const [chatByFile, setChatByFile] = useState<Record<string, ChatMessage[]>>({});
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const totalSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);
  const transcriptionByFile = useMemo(() => {
    const entries = response?.transcriptions ?? [];
    return new Map(entries.map((item) => [item.filename, item]));
  }, [response?.transcriptions]);

  useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => URL.revokeObjectURL(file.previewUrl));
    };
  }, [uploadedFiles]);

  useEffect(() => {
    if (chatContainerRef.current && selectedFile) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatByFile, selectedFile]);

  const addFiles = (incoming: FileList | File[]) => {
    const next = Array.from(incoming);
    setFiles((current) => {
      const seen = new Set(current.map((file) => `${file.name}-${file.size}`));
      const merged = [...current];
      next.forEach((file) => {
        const key = `${file.name}-${file.size}`;
        if (!seen.has(key)) merged.push(file);
      });
      return merged;
    });
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, idx) => idx !== index));
  };

  const resetStatus = () => {
    setStatus("idle");
    setErrorMessage("");
    setResponse(null);
    setSelectedFile(null);
  };

  const getSummarySnippet = (text: string) => {
    const clean = text.trim();
    if (!clean) return "No summary generated.";
    if (clean.length <= 180) return clean;
    return `${clean.slice(0, 180).trim()}…`;
  };

  const getAssistantReply = (filename: string, question: string) => {
    const transcript = transcriptionByFile.get(filename)?.text ?? "";
    const summary = transcriptionByFile.get(filename)?.summary ?? "";
    if (!transcript.trim()) {
      return "I do not have any extracted text for this file yet. Try re-uploading or asking about another document.";
    }
    
    // Provide context-aware responses based on the question
    const lowerQ = question.toLowerCase();
    
    if (lowerQ.includes("about") || lowerQ.includes("summary") || lowerQ.includes("what is")) {
      if (summary) {
        return `Based on ${filename}:\n\n${summary}\n\nFeel free to ask about specific details like charges, dates, or coverage items.`;
      }
      return `Based on ${filename}:\n\n${getSummarySnippet(transcript)}\n\nI can help you find specific information - try asking about charges, dates, or coverage.`;
    }
    
    // For other questions, provide a helpful response with context
    return `I can see the document content for ${filename}. ${summary ? `Summary: ${getSummarySnippet(summary)}` : `Key extract: ${getSummarySnippet(transcript)}`}\n\nFor specific details about your question "${question}", please specify what information you're looking for (e.g., amounts, dates, procedures, coverage).`;
  };

  const handleSendChat = (file: UploadedFile) => {
    const question = (chatInputByFile[file.name] ?? "").trim();
    if (!question) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setChatByFile((current) => ({
      ...current,
      [file.name]: [
        ...(current[file.name] ?? []),
        { role: "user", content: question, timestamp },
        {
          role: "assistant",
          content: getAssistantReply(file.name, question),
          timestamp,
        },
      ],
    }));
    setChatInputByFile((current) => ({ ...current, [file.name]: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetStatus();

    if (!files.length) {
      setStatus("error");
      setErrorMessage("Add at least one file to upload.");
      return;
    }

    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("claimId", claimId);
      formData.append("policyNumber", policyNumber);
      formData.append("memberName", memberName);
      formData.append("hospitalName", hospitalName);
      formData.append("amount", amount);
      formData.append("notes", notes);
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/reimbursements/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as UploadResponse;

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Upload failed. Please try again.");
      }

      const nextUploaded = files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: URL.createObjectURL(file),
      }));
      uploadedFiles.forEach((file) => URL.revokeObjectURL(file.previewUrl));
      setUploadedFiles(nextUploaded);
      setResponse(data);
      setStatus("success");
      setFiles([]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed. Please try again.";
      setStatus("error");
      setErrorMessage(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Reimbursement Uploads"
        subtitle="Submit reimbursement documents for intake and AI-driven processing"
        titleVariant="navy"
      />

      <div className="p-8 space-y-8">
        <div className="grid gap-6 lg:grid-cols-[2.1fr_1fr]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Claim Details</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">Request metadata</h3>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Required for routing
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm font-semibold text-slate-600">
                  Claim ID
                  <input
                    type="text"
                    value={claimId}
                    onChange={(event) => setClaimId(event.target.value)}
                    placeholder="CLM-240311"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </label>
                <label className="space-y-1.5 text-sm font-semibold text-slate-600">
                  Policy Number
                  <input
                    type="text"
                    value={policyNumber}
                    onChange={(event) => setPolicyNumber(event.target.value)}
                    placeholder="PN-9031-551"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </label>
                <label className="space-y-1.5 text-sm font-semibold text-slate-600">
                  Member Name
                  <input
                    type="text"
                    value={memberName}
                    onChange={(event) => setMemberName(event.target.value)}
                    placeholder="Anika Gupta"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </label>
                <label className="space-y-1.5 text-sm font-semibold text-slate-600">
                  Hospital / Clinic
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(event) => setHospitalName(event.target.value)}
                    placeholder="Sanjeevani Medical"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </label>
                <label className="space-y-1.5 text-sm font-semibold text-slate-600">
                  Claimed Amount
                  <input
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="120000"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </label>
              </div>

              <label className="mt-4 block space-y-1.5 text-sm font-semibold text-slate-600">
                Notes (optional)
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  placeholder="Add context for the reviewer or highlight urgent items."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Upload</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">Reimbursement documents</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  PDFs, JPGs, or ZIPs (max 10 files)
                </span>
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
                className={`mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${isDragging
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                  }`}
              >
                <input
                  id="reimbursement-files"
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.zip"
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
                  <p className="text-sm font-semibold">Drag & drop files here</p>
                  <p className="text-xs text-slate-400">or click to browse your device</p>
                </div>
              </label>

              <div className="mt-6 space-y-3">
                {files.length === 0 ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    No files selected yet.
                  </div>
                ) : (
                  files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition hover:border-slate-300 hover:text-slate-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {files.length} files • {formatBytes(totalSize)}
              </p>
              <button
                type="submit"
                disabled={status === "uploading"}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {status === "uploading" ? "Uploading..." : "Submit for processing"}
              </button>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Upload Status</p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">Live intake</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {status === "idle" && <p>Waiting for files to be submitted.</p>}
                {status === "uploading" && <p>Uploading documents to secure storage...</p>}
                {status === "success" && (
                  <div className="space-y-2">
                    <p className="font-semibold text-teal-700">Upload complete.</p>
                    {response?.uploads?.length ? (
                      <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-xs text-teal-700">
                        {response.uploads.length} files stored in {response.bucket}
                      </div>
                    ) : null}
                  </div>
                )}
                {status === "error" && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
                    {errorMessage}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-200">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-violet-600">AI Summary Report</p>
                    <h3 className="mt-0.5 text-lg font-bold text-slate-900">Transcribed Insights</h3>
                  </div>
                </div>
                {status === "success" && response?.summary && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
                    ✓ Analyzed
                  </span>
                )}
              </div>

              <div className="mt-6 space-y-4">
                {status === "idle" && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-600">Upload documents to generate AI summary</p>
                    <p className="mt-1 text-xs text-slate-400">Our AI will analyze and extract key insights automatically</p>
                  </div>
                )}
                
                {status === "uploading" && (
                  <div className="rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>
                    </div>
                    <p className="text-sm font-semibold text-violet-900">Analyzing documents with AI...</p>
                    <p className="mt-1 text-xs text-violet-600">Processing OCR, extraction, and summarization</p>
                  </div>
                )}
                
                {status === "success" && response?.summary ? (
                  <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50/50 to-purple-50/50 p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-violet-500"></div>
                      <span className="text-xs font-bold uppercase tracking-wider text-violet-600">Executive Summary</span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700">
                        {response.summary}
                      </p>
                    </div>
                  </div>
                ) : null}
                
                {status === "success" && uploadedFiles.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Interactive Chat</span>
                    </div>
                    <p className="mb-3 text-xs text-slate-500">Ask questions about your uploaded documents</p>
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <button
                          key={file.name}
                          type="button"
                          onClick={() => setSelectedFile(file)}
                          className="group flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-violet-200 hover:bg-violet-50/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm group-hover:bg-violet-100">
                              <svg className="h-4 w-4 text-slate-400 group-hover:text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
                              <p className="text-[10px] text-slate-400">{formatBytes(file.size)}</p>
                            </div>
                          </div>
                          <svg className="h-4 w-4 flex-shrink-0 text-slate-300 transition group-hover:text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                
                {status === "success" && !response?.summary && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                    <p className="text-xs font-medium text-amber-800">No summary was generated for this upload.</p>
                    <p className="mt-1 text-[10px] text-amber-600">The documents may not contain extractable text.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Processing Preview</p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">What happens next</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {[
                  "OCR + document classification",
                  "Policy & eligibility checks",
                  "Fraud signal scoring",
                  "Human review prioritization",
                ].map((step) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                Processing timelines and AI findings will appear here once ingestion completes.
              </div>
            </div>
          </aside>
        </div>
      </div>
      {selectedFile ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
          <div className="w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 flex-shrink-0">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Document Review</p>
                <h3 className="text-lg font-bold text-slate-900">{selectedFile.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="rounded-full border border-slate-200 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.3fr_1fr] overflow-y-auto">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                {selectedFile.type === "application/pdf" ? (
                  <iframe
                    title={selectedFile.name}
                    src={selectedFile.previewUrl}
                    className="h-[520px] w-full rounded-2xl border border-slate-200 bg-white"
                  />
                ) : selectedFile.type.startsWith("image/") ? (
                  <img
                    src={selectedFile.previewUrl}
                    alt={selectedFile.name}
                    className="h-[520px] w-full rounded-2xl border border-slate-200 object-contain bg-white"
                  />
                ) : (
                  <div className="flex h-[520px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
                    Preview not available for this file type.
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">AI Summary</p>
                  <div className="mt-2 max-h-48 overflow-y-auto text-sm text-slate-700">
                    <p className="whitespace-pre-wrap">
                      {transcriptionByFile.get(selectedFile.name)?.summary || "No summary available."}
                    </p>
                  </div>
                  <div className="mt-3 max-h-40 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    <p className="whitespace-pre-wrap">
                      Transcript: {transcriptionByFile.get(selectedFile.name)?.text || "No transcript captured yet."}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Chat with AI</p>
                  <div 
                    ref={chatContainerRef}
                    className="mt-3 h-64 space-y-3 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-xs text-slate-600"
                  >
                    {(chatByFile[selectedFile.name] ?? []).length === 0 ? (
                      <p className="text-slate-400">Ask a question about this document.</p>
                    ) : (
                      (chatByFile[selectedFile.name] ?? []).map((message, index) => (
                        <div key={`${message.role}-${index}`} className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {message.role === "user" ? "You" : "AI"} • {message.timestamp}
                          </p>
                          <p className="whitespace-pre-wrap text-sm text-slate-700">{message.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInputByFile[selectedFile.name] ?? ""}
                      onChange={(event) =>
                        setChatInputByFile((current) => ({
                          ...current,
                          [selectedFile.name]: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          handleSendChat(selectedFile);
                        }
                      }}
                      placeholder="Ask about charges, dates, or coverage..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendChat(selectedFile)}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition hover:bg-slate-800"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
