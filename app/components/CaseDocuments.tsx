"use client";

import type { PreAuthCheckItem } from "@/lib/types";

interface CaseDocumentsProps {
    documents: PreAuthCheckItem[];
    onViewDoc?: (item: PreAuthCheckItem) => void;
    commentCounts?: Record<string, number>;
}

const docStatusColor: Record<string, string> = {
  approved: "var(--color-green)",
  missing:  "var(--color-red)",
  pending:  "var(--color-yellow)",
};

const docStatusLabel: Record<string, string> = {
  approved: "Verified",
  missing:  "Missing",
  pending:  "Pending",
};

export function CaseDocuments({ documents, onViewDoc, commentCounts = {} }: CaseDocumentsProps) {
    return (
        <div
            style={{
                background: "var(--color-white)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-text-primary)" }}>
                    Case Documents
                </p>
                <span
                    style={{
                        fontSize: "var(--font-size-xs)",
                        fontWeight: 500,
                        background: "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-xs)",
                        padding: "1px 7px",
                        color: "var(--color-text-secondary)",
                    }}
                >
                    {documents.length} files
                </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {documents.map((doc) => {
                    const statusColor = docStatusColor[doc.status] ?? "var(--color-text-muted)";
                    const statusLabel = docStatusLabel[doc.status] ?? doc.status;
                    const commentCount = commentCounts[doc.id] ?? 0;

                    return (
                        <div
                            key={doc.id}
                            onClick={() => onViewDoc?.(doc)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "8px 10px",
                                border: "1px solid var(--color-border)",
                                borderRadius: "var(--radius-sm)",
                                background: "var(--color-bg)",
                                cursor: "pointer",
                                transition: "background 0.1s, border-color 0.1s",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "var(--color-white)";
                                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-dark)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "var(--color-bg)";
                                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                            }}
                        >
                            {/* Icon */}
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "var(--color-white)",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: "var(--radius-xs)",
                                    color: "var(--color-text-muted)",
                                }}
                            >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>

                            {/* Label + status */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 500, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {doc.label}
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                                    <span style={{ fontSize: "var(--font-size-xs)", color: statusColor, fontWeight: 500 }}>
                                        {statusLabel}
                                    </span>
                                    {commentCount > 0 && (
                                        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-blue)", fontWeight: 500 }}>
                                            · {commentCount} note{commentCount > 1 ? "s" : ""}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* View arrow */}
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--color-text-muted)", flexShrink: 0 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    );
                })}
            </div>

            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textAlign: "center", marginTop: 10 }}>
                Click a file to open and add review notes.
            </p>
        </div>
    );
}
