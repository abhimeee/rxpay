"use client";

import { useState } from "react";
import { FraudRedFlag } from "@/lib/types";

// --- Helper Functions ---

const getStatus = (severity: string): "passed" | "warning" | "failed" => {
    if (severity === 'high') return 'failed';
    // Only medium severity is a warning. Low/None are passed/verified.
    if (severity === 'medium') return 'warning';
    return 'passed';
};

// --- Helper Components ---

function FraudCheckItem({
    title,
    initialStatus,
    description,
    severity,
    onViewDoc,
}: {
    title: string;
    initialStatus: "passed" | "warning" | "failed";
    description?: string;
    severity?: "low" | "medium" | "high" | "none";
    onViewDoc?: () => void;
}) {
    // Local resolution state
    const [resolution, setResolution] = useState<"pending" | "safe" | "confirmed">("pending");

    // Determine effective status based on resolution
    const effectiveStatus = resolution === "safe" ? "passed" : initialStatus;
    const isResolved = resolution !== "pending";

    const isGood = effectiveStatus === "passed";
    const isWarning = effectiveStatus === "warning";

    // Styles
    const containerClass = isGood
        ? "border-slate-200 bg-white"
        : isWarning
            ? "border-amber-200 bg-amber-50/10"
            : "border-rose-200 bg-rose-50/10";

    const icon = isGood ? (
        <div className={`flex h-5.5 w-5.5 items-center justify-center rounded-full ${resolution === 'safe' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </div>
    ) : (
        <div className={`flex h-5.5 w-5.5 items-center justify-center rounded-full ring-2 ${isWarning ? "bg-amber-100 text-amber-600 ring-amber-50" : "bg-rose-100 text-rose-600 ring-rose-50"}`}>
            <span className="text-xs font-black">!</span>
        </div>
    );

    let statusLabel = isGood ? "Verified" : isWarning ? "Warning" : "Critical";
    let statusClass = isGood
        ? "bg-slate-50 text-slate-600 border border-slate-200"
        : isWarning
            ? "bg-amber-50 text-amber-700 border border-amber-200 shadow-sm"
            : "bg-rose-50 text-rose-700 border border-rose-200 shadow-sm";

    if (resolution === 'safe') {
        statusLabel = "In Review: Safe";
        statusClass = "bg-emerald-50 text-emerald-700 border border-emerald-200";
    } else if (resolution === 'confirmed') {
        statusLabel = "Confirmed Fraud";
        statusClass = "bg-rose-900 text-white border border-rose-700 shadow-md";
    }

    return (
        <div className={`group relative rounded-2xl border p-5 mb-3 transition-all duration-300 ${containerClass}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-5 min-w-0 flex-1">
                    <div className="mt-0.5 shrink-0 flex items-center justify-center w-6 min-h-[24px]">
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-base font-bold tracking-tight text-slate-900`}>{title}</p>

                        {/* Details Block - Only shown if not good, OR if explicitly confirmed as fraud */}
                        {((description && !isGood && resolution === 'pending') || resolution === 'confirmed') && (
                            <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className={`rounded-xl border-2 px-4 py-3.5 ${resolution === 'confirmed' ? "bg-rose-100 border-rose-200" : isWarning ? "bg-amber-50/60 border-amber-100/80" : "bg-rose-50/60 border-rose-100/80"}`}>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className={`h-1.5 w-1.5 rounded-full ${resolution === 'confirmed' ? "bg-rose-600" : isWarning ? "bg-amber-500" : "bg-rose-500"}`} />
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${resolution === 'confirmed' ? "text-rose-800" : isWarning ? "text-amber-700" : "text-rose-700"}`}>
                                            {resolution === 'confirmed' ? "Fraud Confirmed" : "Analysis Finding"}
                                        </p>
                                    </div>
                                    <p className="text-[13px] text-slate-700 leading-relaxed font-semibold">
                                        {description}
                                    </p>

                                    {/* Action Buttons */}
                                    {resolution === 'pending' && (
                                        <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-slate-200/50">
                                            {onViewDoc && (
                                                <button
                                                    onClick={onViewDoc}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:text-teal-600 hover:border-teal-200 shadow-sm transition-all"
                                                >
                                                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Check Evidence
                                                </button>
                                            )}
                                            <div className="flex items-center gap-2 ml-auto">
                                                <button
                                                    onClick={() => setResolution("safe")}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Mark as Safe
                                                </button>
                                                <button
                                                    onClick={() => setResolution("confirmed")}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-100 px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    Confirm Risk
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* If resolved as safe, show a simplified message */}
                        {resolution === 'safe' && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 font-medium animate-in fade-in duration-300">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Marked as safe by user.
                                <button onClick={() => setResolution("pending")} className="text-slate-400 hover:text-slate-600 underline">Undo</button>
                            </div>
                        )}
                        {/* Default 'good' message */}
                        {isGood && resolution !== 'safe' && description && (
                            <p className="text-sm text-slate-500 mt-1">{description}</p>
                        )}
                    </div>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider transition-all shadow-sm ${statusClass}`}>
                    {statusLabel}
                </span>
            </div>
        </div>
    );
}

export function FraudSection({
    flags,
    onViewDoc,
}: {
    flags: FraudRedFlag[];
    onViewDoc: (item: FraudRedFlag) => void;
}) {
    const fraudScore = flags.length
        ? Math.max(
            ...flags.map((flag) =>
                flag.severity === "high" ? 92 : flag.severity === "medium" ? 74 : flag.severity === "low" ? 48 : 12
            )
        )
        : 0;

    const hasCritical = fraudScore > 75;
    const isClear = fraudScore < 20;

    // Group flags by category
    const providerFlags = flags.filter(f => f.category === "provider");
    const patientFlags = flags.filter(f => f.category === "patient");
    const docFlags = flags.filter(f => f.category === "document");

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* AI Analysis Control Card */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden ring-1 ring-slate-100 p-8">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fraud Risk Assessment</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {hasCritical
                                ? "Critical anomalies detected requiring immediate review."
                                : isClear
                                    ? "No significant risk patterns identified."
                                    : "Potential irregularities found in claims data."}
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl border ${hasCritical ? "bg-rose-50 border-rose-100 text-rose-700" : isClear ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
                        <span className="text-xs font-black uppercase tracking-widest block mb-0.5 opacity-70">Risk Score</span>
                        <span className="text-2xl font-black">{fraudScore}/100</span>
                    </div>
                </div>

                {/* Simple Status Bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-6">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${hasCritical ? "bg-rose-500" : isClear ? "bg-emerald-500" : "bg-amber-500"}`}
                        style={{ width: `${Math.max(5, fraudScore)}%` }}
                    />
                </div>
            </div>

            {/* Checklist Items */}
            <div>
                <div className="flex items-center gap-2 mb-6 px-1">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Risk Checks</h3>
                    <span className="text-[10px] font-black text-white bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {flags.length > 0 ? "Issues Found" : "All Clear"}
                    </span>
                </div>

                <div className="space-y-4">
                    {/* 1. Provider Integrity Check */}
                    {providerFlags.length > 0 ? (
                        providerFlags.map(flag => (
                            <FraudCheckItem
                                key={flag.id}
                                title="Provider Integrity Check"
                                initialStatus={getStatus(flag.severity)}
                                severity={flag.severity}
                                description={flag.description}
                                onViewDoc={() => onViewDoc(flag)}
                            />
                        ))
                    ) : (
                        <FraudCheckItem
                            title="Provider Integrity Check"
                            initialStatus="passed"
                            description="No historical anomalies or billing irregularities detected for this facility."
                        />
                    )}

                    {/* 2. Patient Authenticity Check */}
                    {patientFlags.length > 0 ? (
                        patientFlags.map(flag => (
                            <FraudCheckItem
                                key={flag.id}
                                title="Patient Authenticity Check"
                                initialStatus={getStatus(flag.severity)}
                                severity={flag.severity}
                                description={flag.description}
                                onViewDoc={() => onViewDoc(flag)}
                            />
                        ))
                    ) : (
                        <FraudCheckItem
                            title="Patient Authenticity Check"
                            initialStatus="passed"
                            description="Identity verified against enrollment data and biometric logs."
                        />
                    )}

                    {/* 3. Document Forensic Check */}
                    {docFlags.length > 0 ? (
                        docFlags.map(flag => (
                            <FraudCheckItem
                                key={flag.id}
                                title="Document Forensic Check"
                                initialStatus={getStatus(flag.severity)}
                                severity={flag.severity}
                                description={flag.description}
                                onViewDoc={() => onViewDoc(flag)}
                            />
                        ))
                    ) : (
                        <FraudCheckItem
                            title="Document Forensic Check"
                            initialStatus="passed"
                            description="No signs of tampering, editing, or metadata inconsistencies."
                        />
                    )}
                </div>
            </div>

        </div>
    );
}
