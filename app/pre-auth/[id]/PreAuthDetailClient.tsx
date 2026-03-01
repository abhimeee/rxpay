
"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
    formatCurrency, formatDate, formatDateTime, formatPreAuthKey,
} from "@/lib/data";
import type {
    PreAuthRequest, Hospital, Insurer, PolicyHolder, TPAAssignee,
    PreAuthCheckItem, PreAuthWorkflowData, WorkflowStageId,
    SectionStatus, UiTab, CrossTabQuery,
} from "@/lib/types";
import { UI_TAB_TO_STAGE } from "@/lib/types";
import { PreAuthStatusBadge } from "../../components/StatusBadge";
import { PreAuthWorkflow } from "./PreAuthWorkflow";
import { getDocumentLinesForItem } from "@/lib/document-helper";
import { PdfLine } from "@/lib/pdf-generator";
import { PdfHighlightViewer, PdfHighlightRect } from "../../components/PdfHighlightViewer";

interface PreAuthDetailClientProps {
    pa: PreAuthRequest;
    hospital: Hospital | undefined;
    insurer: Insurer | undefined;
    holder: PolicyHolder | undefined;
    assignee: TPAAssignee | null;
    simulatedResult: PreAuthCheckItem[] | null;
    workflowData: PreAuthWorkflowData | undefined;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface DocOverlayState {
    isOpen: boolean;
    title: string;
    lines: PdfLine[];
    docId?: string;
    aiSuggestion?: string;
    docType?: string;
    pdfUrl?: string;             // When set, shows actual PDF on left instead of text rendering
    pdfHighlights?: PdfHighlightRect[]; // Yellow highlight boxes on the PDF
    pdfTargetPage?: number;      // 1-indexed page to scroll to
}

// ─── Constants ───────────────────────────────────────────────────────────────

const UI_TABS: { id: UiTab; label: string; short: string }[] = [
    { id: "policy_id_docs", label: "Policy & ID Docs", short: "Policy & ID" },
    { id: "medical_docs", label: "Medical Documents", short: "Medical Docs" },
    { id: "medical_coding", label: "Medical Coding", short: "Coding" },
    { id: "medical_necessity", label: "Medical Necessity", short: "Necessity" },
    { id: "queries_and_decision", label: "Query Bucket & Decision", short: "Q-Bucket & Decision" },
];

// ─── Mock AI chat helper ─────────────────────────────────────────────────────

function getMockAIResponse(question: string, lines: PdfLine[]): string {
    const q = question.toLowerCase();
    const hasInconsistency = lines.some((l) => l.inconsistency);
    const keyFields = lines.filter((l) => l.highlight || l.inconsistency).map((l) => l.text).filter(Boolean);

    if (/inconsisten|issue|flag|problem|yellow|discrepan/.test(q)) {
        return hasInconsistency
            ? "The yellow-highlighted sections indicate AI-detected inconsistencies — these data points don't match cross-referenced records from other sources. Please verify against the original physical documents and flag for hospital query if confirmed."
            : "No inconsistencies were detected in this document by the AI system. All key data points are consistent with reference records.";
    }
    if (/summary|extract|key|important|fields/.test(q)) {
        return keyFields.length > 0
            ? `Key extracted fields from this document:\n${keyFields.map((f) => `• ${f}`).join("\n")}`
            : "No specific fields were highlighted for extraction from this document.";
    }
    if (/valid|authentic|genuine|tamper/.test(q)) {
        return "Document authenticity is assessed based on metadata consistency, OCR confidence scores, and cross-reference with hospital records. Green-highlighted fields were successfully verified; yellow fields require manual review.";
    }
    if (/action|next|recommend|should/.test(q)) {
        return hasInconsistency
            ? "Recommended action: Flag this document in the TPA status dropdown, add an audit note explaining the discrepancy, and include it in the hospital query letter using 'Generate Response for Hospital'."
            : "Document appears complete and consistent. Verify the highlighted fields match source records, then mark as Valid in the TPA status dropdown.";
    }
    if (/date|when|time/.test(q)) {
        return "The document timestamps and event dates are extracted and cross-referenced against the admission timeline. Any date discrepancies would appear highlighted in yellow.";
    }
    return `Based on my analysis of this document: ${hasInconsistency ? "⚠ Some inconsistencies were detected (shown in yellow) that require your attention." : "✓ No major issues detected."} The document contains ${keyFields.length} key extracted data points. Would you like me to explain any specific aspect?`;
}

// ─── Document Viewer Overlay ─────────────────────────────────────────────────

function DocumentViewerOverlay({
    overlay,
    onClose,
}: {
    overlay: DocOverlayState;
    onClose: () => void;
}) {
    const [rightTab, setRightTab] = useState<"summary" | "chat">("summary");
    const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
        { role: "ai", text: "I've analyzed this document. Ask me anything — about specific data points, inconsistencies, or what action to take." },
    ]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const inconsistencyCount = overlay.lines.filter((l) => l.inconsistency).length;

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // Extract summary fields from highlighted/inconsistency lines
    const summaryFields = useMemo(() => {
        return overlay.lines
            .filter((l) => (l.highlight || l.inconsistency) && l.text.trim())
            .map((l) => ({
                text: l.text.trim(),
                isIssue: !!l.inconsistency,
            }));
    }, [overlay.lines]);

    const sendMessage = () => {
        if (!chatInput.trim() || chatLoading) return;
        const userText = chatInput.trim();
        setChatMessages((prev) => [...prev, { role: "user", text: userText }]);
        setChatInput("");
        setChatLoading(true);
        setTimeout(() => {
            setChatMessages((prev) => [...prev, { role: "ai", text: getMockAIResponse(userText, overlay.lines) }]);
            setChatLoading(false);
        }, 700);
    };

    if (!overlay.isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "rgba(0,0,0,0.68)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                style={{
                    width: "min(1340px, 97vw)",
                    height: "min(880px, 94vh)",
                    background: "var(--color-white)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
                }}
            >
                {/* Overlay header */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 20px",
                    borderBottom: "1px solid var(--color-border)",
                    background: "var(--color-white)",
                    flexShrink: 0,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--color-text-muted)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>
                            {overlay.title}
                        </p>
                        {overlay.docType && (
                            <span style={{
                                fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em",
                                padding: "2px 7px", borderRadius: 3,
                                background: "var(--color-bg)", color: "var(--color-text-muted)",
                                border: "1px solid var(--color-border)",
                            }}>
                                {overlay.docType}
                            </span>
                        )}
                        {inconsistencyCount > 0 && (
                            <span style={{
                                fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                                padding: "2px 8px", borderRadius: 3,
                                background: "#FFFBEB", color: "#92400E",
                                border: "1px solid #FCD34D",
                                display: "flex", alignItems: "center", gap: 4,
                            }}>
                                <span>⚠</span>{inconsistencyCount} inconsistenc{inconsistencyCount === 1 ? "y" : "ies"}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: 28, height: 28, borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--color-border)", background: "var(--color-white)",
                            cursor: "pointer", color: "var(--color-text-secondary)",
                        }}
                    >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body: left doc + right panel */}
                <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                    {/* Left: Document content — PDF iframe or text rendering */}
                    {overlay.pdfUrl ? (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid var(--color-border)", overflow: "hidden" }}>
                            {/* PDF header strip */}
                            <div style={{
                                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "8px 16px", borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--color-text-muted)", flexShrink: 0 }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-primary)" }}>Source Document</span>
                                    <span style={{
                                        fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                                        padding: "1px 7px", borderRadius: 3,
                                        background: "#EFF6FF", color: "#1D4ED8",
                                        border: "1px solid #BFDBFE",
                                    }}>casefile.pdf</span>
                                </div>
                                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--color-text-muted)", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <span style={{ width: 10, height: 10, background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: 2, display: "inline-block" }} />
                                        Verified field
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <span style={{ width: 10, height: 10, background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 2, display: "inline-block" }} />
                                        AI-flagged issue
                                    </div>
                                    <span style={{ color: "var(--color-text-muted)", fontSize: 10 }}>(see extracted fields →)</span>
                                </div>
                            </div>
                            {/* PDF rendered with canvas + highlight boxes */}
                            <PdfHighlightViewer
                                pdfUrl={overlay.pdfUrl!}
                                highlights={overlay.pdfHighlights}
                                targetPage={overlay.pdfTargetPage ?? 1}
                            />
                        </div>
                    ) : (
                    <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", borderRight: "1px solid var(--color-border)", background: "#FAFAFA" }}>
                        {/* Highlight legend */}
                        <div style={{ display: "flex", gap: 16, marginBottom: 20, fontSize: 11, color: "var(--color-text-muted)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 12, height: 12, background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: 2, display: "inline-block" }} />
                                Verified / extracted field
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 12, height: 12, background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 2, display: "inline-block" }} />
                                AI-flagged inconsistency
                            </div>
                        </div>

                        {/* AI finding banner */}
                        {overlay.aiSuggestion && (
                            <div style={{
                                background: "#FFFBEB", border: "1px solid #FCD34D",
                                borderRadius: "var(--radius-sm)", padding: "10px 14px",
                                marginBottom: 20, fontSize: 12, color: "#92400E",
                                display: "flex", gap: 8, alignItems: "flex-start",
                            }}>
                                <span style={{ fontWeight: 800, flexShrink: 0 }}>⚠</span>
                                <span><strong>AI Finding:</strong> {overlay.aiSuggestion}</span>
                            </div>
                        )}

                        {/* Document lines */}
                        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12.5, lineHeight: 1.9 }}>
                            {overlay.lines.map((line, i) => {
                                const isIssue = !!line.inconsistency;
                                const isGood = !!line.highlight && !isIssue;
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            padding: "1px 8px",
                                            background: isIssue ? "#FFFBEB" : isGood ? "#F0FDF4" : "transparent",
                                            borderLeft: isIssue ? "3px solid #FCD34D" : isGood ? "3px solid #86EFAC" : "3px solid transparent",
                                            color: isIssue ? "#78350F" : isGood ? "#14532D" : "var(--color-text-secondary)",
                                            fontWeight: (isIssue || isGood) ? 600 : 400,
                                            marginBottom: 0,
                                        }}
                                    >
                                        {line.text || "\u00A0"}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    )}

                    {/* Right: Summary + Chat tabs */}
                    <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", background: "var(--color-white)" }}>
                        {/* Tab bar */}
                        <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", flexShrink: 0 }}>
                            {(["summary", "chat"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setRightTab(t)}
                                    style={{
                                        flex: 1, height: 40, background: "none", border: "none",
                                        borderBottom: rightTab === t ? "2px solid var(--color-black)" : "2px solid transparent",
                                        cursor: "pointer",
                                        fontSize: 13, fontWeight: rightTab === t ? 600 : 400,
                                        color: rightTab === t ? "var(--color-text-primary)" : "var(--color-text-muted)",
                                        transition: "color 0.1s",
                                        marginBottom: -1,
                                    }}
                                >
                                    {t === "summary" ? "Summary" : "Chat with AI"}
                                </button>
                            ))}
                        </div>

                        {/* Summary tab */}
                        {rightTab === "summary" && (
                            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", marginBottom: 12 }}>
                                    Extracted Fields
                                </p>
                                {summaryFields.length === 0 ? (
                                    <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>No fields extracted for this document.</p>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {summaryFields.map((f, i) => {
                                            const colonIdx = f.text.indexOf(":");
                                            const key = colonIdx > -1 ? f.text.slice(0, colonIdx).trim() : "";
                                            const val = colonIdx > -1 ? f.text.slice(colonIdx + 1).trim() : f.text;
                                            return (
                                                <div
                                                    key={i}
                                                    style={{
                                                        background: f.isIssue ? "#FFFBEB" : "var(--color-bg)",
                                                        border: `1px solid ${f.isIssue ? "#FDE68A" : "var(--color-border)"}`,
                                                        borderRadius: "var(--radius-xs)",
                                                        padding: "8px 10px",
                                                    }}
                                                >
                                                    {key && (
                                                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: f.isIssue ? "#92400E" : "var(--color-text-muted)", marginBottom: 2 }}>
                                                            {f.isIssue ? "⚠ " : ""}{key}
                                                        </p>
                                                    )}
                                                    <p style={{ fontSize: 12, color: f.isIssue ? "#78350F" : "var(--color-text-primary)", fontWeight: f.isIssue ? 600 : 400 }}>
                                                        {val || f.text}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {overlay.aiSuggestion && (
                                    <div style={{ marginTop: 16 }}>
                                        <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-muted)", marginBottom: 8 }}>
                                            AI Analysis
                                        </p>
                                        <div style={{
                                            background: "#FFFBEB", border: "1px solid #FDE68A",
                                            borderRadius: "var(--radius-xs)", padding: "10px 12px",
                                            fontSize: 12, color: "#92400E",
                                        }}>
                                            {overlay.aiSuggestion}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Chat tab */}
                        {rightTab === "chat" && (
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                                {/* Messages */}
                                <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                                            <div style={{
                                                maxWidth: "85%",
                                                padding: "8px 12px",
                                                borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                                                background: msg.role === "user" ? "var(--color-black)" : "var(--color-bg)",
                                                border: msg.role === "ai" ? "1px solid var(--color-border)" : "none",
                                                color: msg.role === "user" ? "#fff" : "var(--color-text-primary)",
                                                fontSize: 12,
                                                lineHeight: 1.6,
                                                whiteSpace: "pre-wrap",
                                            }}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {chatLoading && (
                                        <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                            <div style={{
                                                padding: "8px 14px",
                                                borderRadius: "12px 12px 12px 3px",
                                                background: "var(--color-bg)",
                                                border: "1px solid var(--color-border)",
                                                fontSize: 18,
                                                color: "var(--color-text-muted)",
                                                letterSpacing: 2,
                                            }}>
                                                ···
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                                {/* Input */}
                                <div style={{ flexShrink: 0, padding: "12px 16px", borderTop: "1px solid var(--color-border)", display: "flex", gap: 8 }}>
                                    <input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                        placeholder="Ask about this document…"
                                        style={{
                                            flex: 1, fontSize: 12,
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "var(--radius-xs)",
                                            padding: "7px 10px",
                                            outline: "none",
                                            fontFamily: "inherit",
                                            color: "var(--color-text-primary)",
                                        }}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!chatInput.trim() || chatLoading}
                                        style={{
                                            background: chatInput.trim() ? "var(--color-black)" : "var(--color-border)",
                                            color: chatInput.trim() ? "#fff" : "var(--color-text-muted)",
                                            border: "none",
                                            borderRadius: "var(--radius-xs)",
                                            padding: "7px 12px",
                                            cursor: chatInput.trim() ? "pointer" : "not-allowed",
                                            fontSize: 12,
                                            fontWeight: 600,
                                            flexShrink: 0,
                                        }}
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Case Sidebar ─────────────────────────────────────────────────────────────

function CaseSidebar({
    pa,
    hospital,
    insurer,
    holder,
    assignee,
    workflowData,
    onViewDoc,
}: {
    pa: PreAuthRequest;
    hospital: Hospital | undefined;
    insurer: Insurer | undefined;
    holder: PolicyHolder | undefined;
    assignee: TPAAssignee | null;
    workflowData: PreAuthWorkflowData | undefined;
    onViewDoc: (type: string, item: any, context?: any) => void;
}) {
    const [timelineOpen, setTimelineOpen] = useState(false);
    const [internalOpen, setInternalOpen] = useState(false);

    const isOverdue = new Date(pa.slaDeadline) < new Date();
    const daysSince = Math.round((Date.now() - new Date(pa.submittedAt).getTime()) / (1000 * 60 * 60 * 24));

    // Pick 3 essential docs: 1 identity, 1 policy, 1 medical
    const essentialDocs = useMemo(() => {
        const identityDoc = pa.checklist.find((d) => /aadhaar|passport|id proof|kyc/i.test(d.label));
        const policyDoc = pa.checklist.find((d) => /policy|e-card|form a|pre-?auth form/i.test(d.label));
        const medicalDoc = pa.checklist.find((d) => /consultation|ecg|investigation|report/i.test(d.label));
        return [identityDoc, policyDoc, medicalDoc].filter(Boolean) as typeof pa.checklist;
    }, [pa.checklist]);

    const sectionStyle: React.CSSProperties = {
        borderBottom: "1px solid var(--color-border)",
        padding: "14px 16px",
    };

    const labelStyle: React.CSSProperties = {
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "var(--color-text-muted)",
        marginBottom: 10,
    };

    const rowStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 8,
        marginBottom: 7,
    };

    const keyStyle: React.CSSProperties = {
        fontSize: 11,
        color: "var(--color-text-muted)",
        flexShrink: 0,
    };

    const valStyle: React.CSSProperties = {
        fontSize: 12,
        fontWeight: 600,
        color: "var(--color-text-primary)",
        textAlign: "right",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: 200,
    };

    return (
        <div
            style={{
                width: 380,
                flexShrink: 0,
                background: "var(--color-white)",
                borderLeft: "1px solid var(--color-border)",
                alignSelf: "flex-start",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Sidebar header */}
            <div style={{
                padding: "10px 16px",
                borderBottom: "1px solid var(--color-border)",
                background: "var(--color-bg)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
            }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--color-text-muted)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.07em", color: "var(--color-text-muted)", margin: 0,
                }}>Case Info</p>
            </div>

            {/* Patient & Policy */}
            <div style={sectionStyle}>
                <p style={labelStyle}>Patient & Policy</p>
                {[
                    { k: "Patient", v: holder?.name },
                    { k: "Policy No.", v: holder?.policyNumber },
                    { k: "Insurer", v: insurer?.name },
                    { k: "Sum Insured", v: holder?.sumInsured ? formatCurrency(holder.sumInsured) : "—" },
                    { k: "Relationship", v: holder?.relationship ?? "—" },
                ].map(({ k, v }) => v && (
                    <div key={k} style={rowStyle}>
                        <span style={keyStyle}>{k}</span>
                        <span style={valStyle} title={v}>{v}</span>
                    </div>
                ))}
            </div>

            {/* Hospital & Claim */}
            <div style={sectionStyle}>
                <p style={labelStyle}>Hospital & Claim</p>
                {[
                    { k: "Hospital", v: hospital?.name },
                    { k: "City", v: hospital ? `${hospital.city}, ${hospital.state}` : undefined },
                    { k: "Tier", v: hospital?.tier ? `Tier ${hospital.tier}` : undefined },
                    { k: "Claim ID", v: pa.claimId },
                    { k: "Pre-Auth", v: formatPreAuthKey(pa.id) },
                    { k: "Procedure", v: pa.procedure },
                    { k: "ICD Code", v: pa.icdCode },
                    { k: "Amount", v: formatCurrency(pa.estimatedAmount) },
                ].map(({ k, v }) => v && (
                    <div key={k} style={rowStyle}>
                        <span style={keyStyle}>{k}</span>
                        <span style={valStyle} title={v}>{v}</span>
                    </div>
                ))}
                {/* Admission type badge */}
                {workflowData?.requestSummary.admissionType && (
                    <div style={{ marginTop: 6 }}>
                        <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                            background: workflowData.requestSummary.admissionType === "emergency" ? "#FEF2F2" : "#EFF6FF",
                            color: workflowData.requestSummary.admissionType === "emergency" ? "#B91C1C" : "#1D4ED8",
                            border: `1px solid ${workflowData.requestSummary.admissionType === "emergency" ? "#FECACA" : "#BFDBFE"}`,
                            textTransform: "uppercase", letterSpacing: "0.04em",
                        }}>
                            {workflowData.requestSummary.admissionType === "emergency" ? "⚡ Emergency" : "Planned"}
                        </span>
                    </div>
                )}
            </div>

            {/* Key Metrics */}
            <div style={sectionStyle}>
                <p style={labelStyle}>Key Metrics</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* SLA */}
                    <div style={{
                        background: isOverdue ? "#FEF2F2" : "#FFFBEB",
                        border: `1px solid ${isOverdue ? "#FECACA" : "#FDE68A"}`,
                        borderRadius: "var(--radius-xs)",
                        padding: "8px 10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}>
                        <span style={{ fontSize: 11, color: isOverdue ? "#B91C1C" : "#92400E", fontWeight: 600 }}>SLA Deadline</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: isOverdue ? "#B91C1C" : "#92400E" }}>
                            {formatDate(pa.slaDeadline)}
                        </span>
                    </div>
                    {/* AI Readiness */}
                    <div style={{
                        background: pa.aiReadinessScore >= 80 ? "#F0FDF4" : pa.aiReadinessScore >= 50 ? "#FFFBEB" : "#FEF2F2",
                        border: `1px solid ${pa.aiReadinessScore >= 80 ? "#BBF7D0" : pa.aiReadinessScore >= 50 ? "#FDE68A" : "#FECACA"}`,
                        borderRadius: "var(--radius-xs)",
                        padding: "8px 10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}>
                        <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 600 }}>AI Readiness</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: pa.aiReadinessScore >= 80 ? "#15803D" : pa.aiReadinessScore >= 50 ? "#92400E" : "#B91C1C" }}>
                            {pa.aiReadinessScore}%
                        </span>
                    </div>
                    <div style={rowStyle}>
                        <span style={keyStyle}>Days since submission</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: daysSince > 3 ? "#B91C1C" : "var(--color-text-primary)" }}>{daysSince}d</span>
                    </div>
                </div>
            </div>

            {/* Quick Doc Access */}
            {essentialDocs.length > 0 && (
                <div style={sectionStyle}>
                    <p style={labelStyle}>Essential Documents</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {essentialDocs.map((doc) => (
                            <div
                                key={doc.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 8,
                                    padding: "6px 8px",
                                    background: doc.status === "missing" ? "#FEF2F2" : "var(--color-bg)",
                                    border: `1px solid ${doc.status === "missing" ? "#FECACA" : "var(--color-border)"}`,
                                    borderRadius: "var(--radius-xs)",
                                }}
                            >
                                <span style={{ fontSize: 11, color: doc.status === "missing" ? "#B91C1C" : "var(--color-text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {doc.label}
                                </span>
                                {doc.status !== "missing" ? (
                                    <button
                                        onClick={() => onViewDoc("Request Item", doc)}
                                        style={{
                                            fontSize: 10, fontWeight: 600,
                                            color: "var(--color-text-secondary)",
                                            background: "var(--color-white)",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "var(--radius-xs)",
                                            padding: "2px 7px",
                                            cursor: "pointer",
                                            flexShrink: 0,
                                        }}
                                    >
                                        View
                                    </button>
                                ) : (
                                    <span style={{ fontSize: 10, color: "#B91C1C", fontWeight: 700, flexShrink: 0 }}>Missing</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Internal TPA Details — collapsible */}
            <div style={{ borderBottom: "1px solid var(--color-border)" }}>
                <button
                    onClick={() => setInternalOpen((o) => !o)}
                    style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                    }}
                >
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", margin: 0 }}>
                        Internal Details
                    </p>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        style={{ transform: internalOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s", color: "var(--color-text-muted)", flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {internalOpen && (
                    <div style={{ padding: "0 16px 14px" }}>
                        {assignee && (
                            <div style={rowStyle}>
                                <span style={keyStyle}>Adjudicator</span>
                                <span style={valStyle}>{assignee.name}</span>
                            </div>
                        )}
                        {assignee?.role && (
                            <div style={rowStyle}>
                                <span style={keyStyle}>Role</span>
                                <span style={valStyle}>{assignee.role}</span>
                            </div>
                        )}
                        <div style={rowStyle}>
                            <span style={keyStyle}>Submitted</span>
                            <span style={{ ...valStyle, fontSize: 11 }}>{formatDateTime(pa.submittedAt)}</span>
                        </div>
                        {workflowData && (
                            <div style={rowStyle}>
                                <span style={keyStyle}>P2P Required</span>
                                <span style={{ ...valStyle, color: workflowData.p2pRequired ? "#B91C1C" : "#15803D" }}>
                                    {workflowData.p2pRequired ? "Yes" : "No"}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Case Timeline — collapsible */}
            {workflowData && workflowData.timeline.length > 0 && (
                <div style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <button
                        onClick={() => setTimelineOpen((o) => !o)}
                        style={{
                            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                        }}
                    >
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", margin: 0 }}>
                            Case Timeline
                        </p>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            style={{ transform: timelineOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s", color: "var(--color-text-muted)", flexShrink: 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {timelineOpen && (
                        <div style={{ padding: "0 16px 14px" }}>
                            {workflowData.timeline.map((event, idx) => (
                                <div key={event.id} style={{ display: "flex", gap: 8, marginBottom: 0 }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: "50%", marginTop: 3, flexShrink: 0,
                                            background: event.status === "done" ? "var(--color-green, #16A34A)" : event.status === "current" ? "var(--color-black)" : event.status === "info" ? "var(--color-yellow, #CA8A04)" : "var(--color-border-dark)",
                                        }} />
                                        {idx < workflowData.timeline.length - 1 && (
                                            <div style={{ width: 1, flex: 1, background: "var(--color-border)", margin: "2px 0" }} />
                                        )}
                                    </div>
                                    <div style={{ paddingBottom: idx < workflowData.timeline.length - 1 ? 10 : 0, minWidth: 0 }}>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 1 }}>{event.title}</p>
                                        <p style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{event.timestamp}</p>
                                        {event.detail && <p style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 1 }}>{event.detail}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Status indicator for tab bar ────────────────────────────────────────────

function TabStatusDot({ status }: { status: SectionStatus }) {
    if (status === "done") return <span style={{ color: "#15803D", fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>;
    if (status === "needs_attention") return (
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", background: "var(--color-red)", color: "#fff", fontSize: 9, fontWeight: 800, lineHeight: 1 }}>!</span>
    );
    if (status === "in_progress") return <span style={{ color: "#CA8A04", fontSize: 11, fontWeight: 700, lineHeight: 1 }}>●</span>;
    return null;
}

// ─── Casefile PDF highlight map (PA022 — Ramesh Kumar, 3-page scanned form) ──
//
// Coordinates are fractions (0–1) of page width/height.
// Estimated from standard Indian hospital cashless form layouts.
//
// Page 1: Cashless Pre-Auth Request Form (Star Health)
//   — TPA header, patient name, policy number, Aadhaar, consent/signature
// Page 2: Doctor's Letter & Clinical Examination Notes
//   — Diagnosis, ICD codes, clinical findings, procedure recommendation
// Page 3: Estimated Cost Breakdown
//   — Room, OT, medicines, investigations, total

function getCasefileHighlights(type: string, label: string): {
    page: number;
    highlights: PdfHighlightRect[];
} {
    // ── Page 1 items ──────────────────────────────────────────────────────────
    if (/cashless|pre-?auth.*form|form a/i.test(label)) {
        return {
            page: 1,
            highlights: [
                { page: 1, x: 0.03, y: 0.05, w: 0.94, h: 0.12, label: "Cashless pre-auth request form header" },
                { page: 1, x: 0.03, y: 0.18, w: 0.6,  h: 0.06, label: "TPA / hospital details" },
            ],
        };
    }
    if (/policy|e-?card|policynum/i.test(label)) {
        return {
            page: 1,
            highlights: [
                { page: 1, x: 0.03, y: 0.30, w: 0.55, h: 0.06, label: "Policy / card number" },
                { page: 1, x: 0.03, y: 0.37, w: 0.45, h: 0.05, label: "Sum insured" },
            ],
        };
    }
    if (/aadhaar|id proof/i.test(label)) {
        return {
            page: 1,
            highlights: [
                { page: 1, x: 0.03, y: 0.43, w: 0.52, h: 0.06, label: "Aadhaar / ID proof" },
            ],
        };
    }
    if (/consent/i.test(label)) {
        return {
            page: 1,
            highlights: [
                { page: 1, x: 0.03, y: 0.80, w: 0.94, h: 0.12, label: "Patient consent & signature" },
            ],
        };
    }

    // ── Page 2 items ──────────────────────────────────────────────────────────
    if (/doctor|recommendation/i.test(label)) {
        return {
            page: 2,
            highlights: [
                { page: 2, x: 0.03, y: 0.06, w: 0.94, h: 0.16, label: "Doctor's letterhead & recommendation" },
                { page: 2, x: 0.03, y: 0.72, w: 0.55, h: 0.10, label: "Doctor signature & stamp" },
            ],
        };
    }
    if (/clinical|examination/i.test(label)) {
        return {
            page: 2,
            highlights: [
                { page: 2, x: 0.03, y: 0.28, w: 0.94, h: 0.28, label: "Clinical examination findings" },
            ],
        };
    }
    if (/diagnosis|icd|medical.cod|nephr/i.test(label) || type === "Medical Coding") {
        return {
            page: 2,
            highlights: [
                { page: 2, x: 0.03, y: 0.24, w: 0.94, h: 0.10, label: "Diagnosis" },
                { page: 2, x: 0.03, y: 0.36, w: 0.70, h: 0.08, label: "ICD codes" },
            ],
        };
    }
    if (type === "Medical Necessity") {
        return {
            page: 2,
            highlights: [
                { page: 2, x: 0.03, y: 0.24, w: 0.94, h: 0.10, label: "Diagnosis / necessity" },
                { page: 2, x: 0.03, y: 0.46, w: 0.94, h: 0.16, label: "Procedure justification" },
            ],
        };
    }

    // ── Page 3 items ──────────────────────────────────────────────────────────
    if (/cost|breakdown|itemis/i.test(label)) {
        return {
            page: 3,
            highlights: [
                { page: 3, x: 0.03, y: 0.05, w: 0.94, h: 0.08, label: "Cost breakdown header" },
                { page: 3, x: 0.03, y: 0.18, w: 0.94, h: 0.60, label: "Itemised cost table" },
            ],
        };
    }
    if (/room|bed/i.test(label)) {
        return {
            page: 3,
            highlights: [{ page: 3, x: 0.03, y: 0.26, w: 0.88, h: 0.08, label: "Room / bed charges" }],
        };
    }
    if (/medicine|pharma/i.test(label)) {
        return {
            page: 3,
            highlights: [{ page: 3, x: 0.03, y: 0.46, w: 0.88, h: 0.08, label: "Medicine / pharmacy charges" }],
        };
    }
    if (/investigation|lab/i.test(label)) {
        return {
            page: 3,
            highlights: [{ page: 3, x: 0.03, y: 0.56, w: 0.88, h: 0.08, label: "Investigation / lab charges" }],
        };
    }

    // ── Fraud & Anomaly → show page 1 (provider / patient info) ──────────────
    if (type === "Fraud & Anomaly" || /fraud|anomaly/i.test(type)) {
        return {
            page: 1,
            highlights: [
                { page: 1, x: 0.03, y: 0.05, w: 0.94, h: 0.16, label: "Provider / hospital details" },
                { page: 1, x: 0.03, y: 0.22, w: 0.60, h: 0.08, label: "Patient information" },
            ],
        };
    }

    // ── Default fallback: first page, no specific highlight ───────────────────
    return {
        page: 1,
        highlights: [
            { page: 1, x: 0.03, y: 0.05, w: 0.94, h: 0.08, label: "Document header" },
        ],
    };
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PreAuthDetailClient({
    pa,
    hospital,
    insurer,
    holder,
    assignee,
    simulatedResult,
    workflowData,
}: PreAuthDetailClientProps) {
    const [activeTab, setActiveTab] = useState<UiTab>("policy_id_docs");
    const [tabStatus, setTabStatus] = useState<Record<UiTab, SectionStatus>>({
        policy_id_docs: "in_progress",
        medical_docs: "in_progress",
        medical_coding: "pending",
        medical_necessity: "pending",
        fraud_anomaly: "pending",
        queries_and_decision: "pending",
    });

    const [docOverlay, setDocOverlay] = useState<DocOverlayState>({ isOpen: false, title: "", lines: [] });
    const [crossTabQueries, setCrossTabQueries] = useState<CrossTabQuery[]>([]);

    const updateTabStatus = useCallback((tab: UiTab, status: SectionStatus) => {
        setTabStatus((prev) => ({ ...prev, [tab]: status }));
    }, []);

    const openDoc = useCallback((type: string, item: any, context?: any) => {
        const { title, lines } = getDocumentLinesForItem(type, item, {
            patientName: holder?.name,
            policyNumber: holder?.policyNumber,
            insurerName: insurer?.name,
            hospitalName: hospital?.name,
            procedure: pa.procedure,
            diagnosis: pa.diagnosis,
            estimatedAmount: pa.estimatedAmount,
            sumInsured: holder?.sumInsured,
            ...context,
        });

        // For the Ramesh Kumar demo case (PA022), show the actual casefile PDF with yellow highlights.
        let pdfUrl: string | undefined;
        let pdfHighlights: PdfHighlightRect[] | undefined;
        let pdfTargetPage: number | undefined;

        if (pa.id === "PA022") {
            pdfUrl = "/casefile.pdf";
            const label = (item?.label ?? "").toLowerCase();
            const result = getCasefileHighlights(type, label);
            pdfHighlights = result.highlights;
            pdfTargetPage = result.page;
        }

        setDocOverlay({
            isOpen: true,
            title,
            lines,
            docId: item?.id,
            aiSuggestion: item?.aiSuggestion,
            docType: type,
            pdfUrl,
            pdfHighlights,
            pdfTargetPage,
        });
    }, [holder, insurer, hospital, pa]);

    const addQuery = useCallback((sourceTab: UiTab, sourceLabel: string, question: string) => {
        setCrossTabQueries((prev) => [
            ...prev,
            { id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, sourceTab, sourceLabel, question, createdAt: new Date().toISOString() },
        ]);
    }, []);

    const removeQuery = useCallback((id: string) => {
        setCrossTabQueries((prev) => prev.filter((q) => q.id !== id));
    }, []);

    // Derive WorkflowStageId-keyed sectionStatus from tabStatus (for Decision's case summary)
    const sectionStatus: Record<WorkflowStageId, SectionStatus> = useMemo(() => {
        const docStatus = tabStatus.policy_id_docs === "needs_attention" || tabStatus.medical_docs === "needs_attention"
            ? "needs_attention"
            : tabStatus.policy_id_docs === "done" && tabStatus.medical_docs === "done"
                ? "done"
                : "in_progress";
        return {
            documentation: docStatus,
            eligibility: "pending",
            medical_coding: tabStatus.medical_coding,
            medical_necessity: tabStatus.medical_necessity,
            fraud_anomaly: tabStatus.fraud_anomaly,
            queries_and_decision: tabStatus.queries_and_decision,
        };
    }, [tabStatus]);

    // Attention badges per tab
    const items = simulatedResult ?? pa.checklist;
    const allIssueItems = items.filter((c) => c.status === "missing" || c.status === "inconsistent" || c.status === "incomplete");

    const getBadge = (tab: UiTab): number => {
        if (tab === "policy_id_docs") {
            return allIssueItems.filter((c) => {
                const lower = c.label.toLowerCase();
                return /aadhaar|passport|id proof|kyc|policy|e-card|form a|pre-?auth|rate card|consent/.test(lower);
            }).length;
        }
        if (tab === "medical_docs") {
            return allIssueItems.filter((c) => {
                const lower = c.label.toLowerCase();
                return !/aadhaar|passport|id proof|kyc|policy|e-card|form a|pre-?auth|rate card|consent/.test(lower);
            }).length;
        }
        if (tab === "fraud_anomaly") {
            return workflowData?.fraudFlags.filter((f) => f.severity !== "none").length ?? 0;
        }
        if (tab === "queries_and_decision") {
            return crossTabQueries.length + (workflowData?.queries.filter((q) => q.status === "open").length ?? 0);
        }
        return 0;
    };

    return (
        <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
            {/* Document Viewer Overlay */}
            <DocumentViewerOverlay
                overlay={docOverlay}
                onClose={() => setDocOverlay((prev) => ({ ...prev, isOpen: false }))}
            />

            {/* Topbar */}
            <div style={{
                height: "var(--topbar-height)",
                background: "var(--color-white)",
                borderBottom: "1px solid var(--color-border)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 20px",
                position: "sticky", top: 0, zIndex: 60,
                gap: 12,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <Link href="/pre-auth" aria-label="Back to Pre-Auth Queue" style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28,
                        border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)",
                        background: "var(--color-white)", color: "var(--color-text-secondary)",
                        textDecoration: "none", flexShrink: 0,
                    }}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--font-size-base)", color: "var(--color-text-muted)" }}>
                        <Link href="/" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>RxPay</Link>
                        <span style={{ color: "var(--color-border-dark)" }}>/</span>
                        <Link href="/pre-auth" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Pre-Auth Queue</Link>
                        <span style={{ color: "var(--color-border-dark)" }}>/</span>
                        <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{formatPreAuthKey(pa.id)}</span>
                    </div>
                    <PreAuthStatusBadge status={pa.status} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>Claim Amount</p>
                        <p style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text-primary)" }}>{formatCurrency(pa.estimatedAmount)}</p>
                    </div>
                    <div style={{ width: 1, height: 28, background: "var(--color-border)" }} />
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>SLA Deadline</p>
                        <p style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: new Date(pa.slaDeadline) < new Date() ? "var(--color-red)" : "var(--color-yellow)" }}>
                            {formatDate(pa.slaDeadline)}
                        </p>
                    </div>
                    {assignee && (
                        <>
                            <div style={{ width: 1, height: 28, background: "var(--color-border)" }} />
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <p style={{ fontSize: "var(--font-size-base)", fontWeight: 500, color: "var(--color-text-primary)" }}>{assignee.name}</p>
                                <div style={{
                                    width: 28, height: 28, borderRadius: "50%",
                                    background: "var(--color-bg)", border: "1px solid var(--color-border)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-secondary)",
                                }}>
                                    {assignee.avatar}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Section Tab Bar */}
            <div style={{
                background: "var(--color-white)",
                borderBottom: "1px solid var(--color-border)",
                padding: "0 20px",
                display: "flex",
                alignItems: "flex-end",
                position: "sticky",
                top: "var(--topbar-height)",
                zIndex: 55,
                height: 40,
            }}>
                {UI_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const badge = getBadge(tab.id);
                    const status = tabStatus[tab.id];
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: "flex", alignItems: "center", gap: 5,
                                padding: "0 12px", height: "100%",
                                background: "none", border: "none",
                                borderBottom: isActive ? "2px solid var(--color-black)" : "2px solid transparent",
                                cursor: "pointer",
                                fontSize: "var(--font-size-base)",
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                                whiteSpace: "nowrap",
                                transition: "color 0.1s, border-color 0.1s",
                                marginBottom: -1,
                            }}
                        >
                            {tab.short}
                            <TabStatusDot status={status} />
                            {badge > 0 && (
                                <span style={{
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    minWidth: 15, height: 15, borderRadius: 8,
                                    background: "var(--color-red)", color: "#fff",
                                    fontSize: 9, fontWeight: 800, padding: "0 3px",
                                }}>
                                    {badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Main content + sidebar */}
            <div style={{ display: "flex", alignItems: "flex-start" }}>
                {/* Workflow content */}
                <div style={{ flex: 1, minWidth: 0, padding: 20 }}>
                    <PreAuthWorkflow
                        preAuthId={pa.id}
                        claimId={pa.claimId}
                        preAuthKey={formatPreAuthKey(pa.id)}
                        patientName={holder?.name}
                        policyNumber={holder?.policyNumber}
                        insurerName={insurer?.name}
                        hospitalName={hospital?.name}
                        procedure={pa.procedure}
                        diagnosis={pa.diagnosis}
                        icdCode={pa.icdCode}
                        estimatedAmount={pa.estimatedAmount}
                        sumInsured={holder?.sumInsured}
                        submittedAt={formatDateTime(pa.submittedAt)}
                        checklist={pa.checklist}
                        analysisResult={simulatedResult}
                        missingCritical={pa.missingCritical}
                        activeTab={activeTab}
                        onOpenDoc={openDoc}
                        sectionStatus={sectionStatus}
                        crossTabQueries={crossTabQueries}
                        onAddQuery={addQuery}
                        onRemoveQuery={removeQuery}
                    />
                </div>

                {/* Sticky case sidebar */}
                <CaseSidebar
                    pa={pa}
                    hospital={hospital}
                    insurer={insurer}
                    holder={holder}
                    assignee={assignee}
                    workflowData={workflowData}
                    onViewDoc={openDoc}
                />
            </div>
        </div>
    );
}
