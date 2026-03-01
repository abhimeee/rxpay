"use client";

import { useEffect, useRef, useState } from "react";

export interface PdfHighlightRect {
    page: number; // 1-indexed
    x: number;    // 0–1 fraction of page width from left
    y: number;    // 0–1 fraction of page height from top
    w: number;    // 0–1 fraction of page width
    h: number;    // 0–1 fraction of page height
    label?: string;
}

interface Props {
    pdfUrl: string;
    highlights?: PdfHighlightRect[];
    targetPage?: number; // 1-indexed, which page to scroll to
}

export function PdfHighlightViewer({ pdfUrl, highlights = [], targetPage = 1 }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pageCount, setPageCount] = useState(0);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const canvasRefs = useRef<(HTMLDivElement | null)[]>([]);
    const hasScrolled = useRef(false);

    useEffect(() => {
        hasScrolled.current = false;
        setStatus("loading");
        setPageCount(0);
        canvasRefs.current = [];

        let cancelled = false;

        async function loadPdf() {
            try {
                // Dynamic import to avoid SSR issues
                const pdfjsLib = await import("pdfjs-dist");
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    `https://unpkg.com/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs`;

                const loadingTask = pdfjsLib.getDocument(pdfUrl);
                const pdf = await loadingTask.promise;
                if (cancelled) return;

                setPageCount(pdf.numPages);
                setStatus("ready");

                // Render each page sequentially
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    if (cancelled) break;

                    const page = await pdf.getPage(pageNum);
                    if (cancelled) break;

                    const container = canvasRefs.current[pageNum - 1];
                    if (!container) continue;

                    const scale = 1.6;
                    const viewport = page.getViewport({ scale });

                    // Create canvas
                    const canvas = document.createElement("canvas");
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    canvas.style.display = "block";
                    canvas.style.width = "100%";

                    const ctx = canvas.getContext("2d");
                    if (!ctx) continue;

                    // Render PDF page to canvas
                    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
                    if (cancelled) break;

                    // Draw yellow highlight rectangles
                    const pageHighlights = highlights.filter(h => h.page === pageNum);
                    if (pageHighlights.length > 0) {
                        ctx.save();
                        for (const h of pageHighlights) {
                            const rx = h.x * viewport.width;
                            const ry = h.y * viewport.height;
                            const rw = h.w * viewport.width;
                            const rh = h.h * viewport.height;

                            // Yellow highlight fill
                            ctx.fillStyle = "rgba(255, 220, 0, 0.38)";
                            ctx.fillRect(rx, ry, rw, rh);

                            // Amber border
                            ctx.strokeStyle = "rgba(217, 119, 6, 0.75)";
                            ctx.lineWidth = 2;
                            ctx.strokeRect(rx, ry, rw, rh);
                        }
                        ctx.restore();
                    }

                    container.innerHTML = "";
                    container.appendChild(canvas);

                    // Scroll to target page after it renders
                    if (pageNum === targetPage && !hasScrolled.current) {
                        hasScrolled.current = true;
                        setTimeout(() => {
                            container.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 80);
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("PDF load error:", err);
                    setStatus("error");
                }
            }
        }

        loadPdf();

        return () => {
            cancelled = true;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pdfUrl, JSON.stringify(highlights), targetPage]);

    return (
        <div
            ref={containerRef}
            style={{
                flex: 1,
                overflowY: "auto",
                background: "#525659",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
            }}
        >
            {status === "loading" && (
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", flex: 1, gap: 12, color: "#ccc",
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ animation: "spin 1s linear infinite", opacity: 0.7 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span style={{ fontSize: 12 }}>Rendering document…</span>
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {status === "error" && (
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", flex: 1, gap: 8, color: "#fca5a5",
                }}>
                    <span style={{ fontSize: 24 }}>⚠</span>
                    <span style={{ fontSize: 12 }}>Unable to load document.</span>
                </div>
            )}

            {/* Page containers — filled by canvas render loop */}
            {Array.from({ length: Math.max(pageCount, 0) }, (_, i) => {
                const pageNum = i + 1;
                const hasHighlight = highlights.some(h => h.page === pageNum);
                return (
                    <div key={pageNum} style={{ position: "relative" }}>
                        {/* Page number chip */}
                        <div style={{
                            position: "absolute", top: -22, left: 0,
                            fontSize: 10, color: "#aaa", fontWeight: 500,
                            letterSpacing: "0.04em",
                        }}>
                            Page {pageNum}
                            {hasHighlight && (
                                <span style={{
                                    marginLeft: 8, fontSize: 9, fontWeight: 700,
                                    padding: "1px 6px", borderRadius: 3,
                                    background: "#FBBF24", color: "#78350F",
                                }}>highlighted</span>
                            )}
                        </div>
                        <div
                            ref={el => { canvasRefs.current[i] = el; }}
                            style={{
                                background: "#fff",
                                borderRadius: 4,
                                overflow: "hidden",
                                boxShadow: hasHighlight
                                    ? "0 0 0 2px rgba(251, 191, 36, 0.7), 0 4px 16px rgba(0,0,0,0.3)"
                                    : "0 4px 16px rgba(0,0,0,0.3)",
                                minHeight: 200,
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}
