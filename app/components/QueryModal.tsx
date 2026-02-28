"use client";

import { useState, useEffect } from "react";

interface QueryModalProps {
    isOpen: boolean;
    title: string;
    initialText?: string;
    onSave: (text: string, files: File[]) => void;
    onClose: () => void;
}

export function QueryModal({
    isOpen,
    title,
    initialText = "",
    onSave,
    onClose,
}: QueryModalProps) {
    const [text, setText] = useState(initialText);
    const [files, setFiles] = useState<File[]>([]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setText(initialText);
            setFiles([]);
        }
    }, [isOpen, initialText]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)", zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20
        }}>
            <div style={{
                background: "var(--color-white)", borderRadius: "var(--radius-md)",
                width: "100%", maxWidth: 500, padding: 24,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                display: "flex", flexDirection: "column", gap: 16,
            }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--color-text-primary)" }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontSize: 18, color: "var(--color-text-muted)"
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Text Area */}
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Describe what clarification is needed from the hospital…"
                    rows={5}
                    style={{
                        width: "100%", padding: 12, borderRadius: "var(--radius-xs)",
                        border: "1px solid var(--color-border)", fontSize: "var(--font-size-xs)",
                        resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                        color: "var(--color-text-primary)", outline: "none"
                    }}
                    autoFocus
                />

                {/* Attachment Upload Area */}
                <div style={{
                    border: "1px dashed var(--color-border-dark, #cbd5e1)",
                    padding: 16, borderRadius: "var(--radius-xs)",
                    textAlign: "center", background: "var(--color-bg)"
                }}>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files) {
                                setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                            }
                        }}
                        style={{ display: "none" }}
                        id="query-file-upload"
                    />
                    <label
                        htmlFor="query-file-upload"
                        style={{ cursor: "pointer", color: "var(--color-text-secondary)", fontSize: "var(--font-size-xs)", fontWeight: 500 }}
                    >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ verticalAlign: "middle", marginRight: 6 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span style={{ color: "var(--color-black)", textDecoration: "underline" }}>Click to attach images</span> or drag and drop
                    </label>

                    {/* Attached Files List */}
                    {files.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12, justifyContent: "center" }}>
                            {files.map((f, i) => (
                                <div key={i} style={{
                                    padding: "4px 8px", background: "var(--color-white)",
                                    border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)",
                                    fontSize: 11, display: "flex", alignItems: "center", gap: 6,
                                    color: "var(--color-text-primary)", fontWeight: 500
                                }}>
                                    <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {f.name}
                                    </span>
                                    <button
                                        onClick={() => setFiles(fs => fs.filter((_, idx) => idx !== i))}
                                        style={{ background: "none", border: "none", color: "var(--color-red, #DC2626)", cursor: "pointer", padding: 0, fontWeight: 700 }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "8px 16px", background: "var(--color-bg)",
                            border: "1px solid var(--color-border)", borderRadius: "var(--radius-xs)",
                            cursor: "pointer", fontWeight: 600, fontSize: "var(--font-size-xs)",
                            color: "var(--color-text-secondary)"
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onSave(text.trim(), files);
                        }}
                        disabled={text.trim().length < 5}
                        style={{
                            padding: "8px 16px",
                            background: text.trim().length >= 5 ? "var(--color-black)" : "var(--color-border)",
                            color: text.trim().length >= 5 ? "white" : "var(--color-text-muted)",
                            border: "none", borderRadius: "var(--radius-xs)",
                            cursor: text.trim().length >= 5 ? "pointer" : "not-allowed",
                            fontWeight: 600, fontSize: "var(--font-size-xs)"
                        }}
                    >
                        Save Query
                    </button>
                </div>
            </div>
        </div>
    );
}
