
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate, formatDateTime, formatPreAuthKey } from "@/lib/data";
import type {
    PreAuthRequest,
    Hospital,
    Insurer,
    PolicyHolder,
    TPAAssignee,
    PreAuthCheckItem,
    PreAuthWorkflowData
} from "@/lib/types";
import { PreAuthStatusBadge } from "../../components/StatusBadge";
import { CaseTimeline } from "../../components/CaseTimeline";
import { CaseDocuments } from "../../components/CaseDocuments";
import { PreAuthWorkflow } from "./PreAuthWorkflow";
import { DocumentViewerModal } from "@/app/components/DocumentViewerModal";
import { getDocumentLinesForItem } from "@/lib/document-helper";
import { PdfLine } from "@/lib/pdf-generator";

interface Comment {
    id: string;
    author: string;
    text: string;
    timestamp: string;
}

interface PreAuthDetailClientProps {
    pa: PreAuthRequest;
    hospital: Hospital | undefined;
    insurer: Insurer | undefined;
    holder: PolicyHolder | undefined;
    assignee: TPAAssignee | null;
    simulatedResult: PreAuthCheckItem[] | null;
    workflowData: PreAuthWorkflowData | undefined;
}

export function PreAuthDetailClient({
    pa,
    hospital,
    insurer,
    holder,
    assignee,
    simulatedResult,
    workflowData
}: PreAuthDetailClientProps) {
    const [activeDoc, setActiveDoc] = useState<{ isOpen: boolean; title: string; lines: PdfLine[]; docId?: string }>({
        isOpen: false,
        title: "",
        lines: [],
    });

    const [comments, setComments] = useState<Record<string, Comment[]>>({
        "c1": [{ id: "comment-1", author: "AI Assistant", text: "Consent signature verified via biometric match.", timestamp: "2h ago" }],
        "c2": [{ id: "comment-2", author: "Rahul (Auditor)", text: "Check if the hospital stamp is legible on the last page.", timestamp: "1h ago" }]
    });

    const handleAddComment = (docId: string, text: string) => {
        const comment: Comment = {
            id: Math.random().toString(36).substr(2, 9),
            author: "Priyanshu",
            text,
            timestamp: "Just now"
        };
        setComments(prev => ({
            ...prev,
            [docId]: [...(prev[docId] || []), comment]
        }));
    };

    const openDoc = (type: string, item: any, context?: any) => {
        const { title, lines } = getDocumentLinesForItem(type, item, {
            patientName: holder?.name,
            policyNumber: holder?.policyNumber,
            insurerName: insurer?.name,
            hospitalName: hospital?.name,
            procedure: pa.procedure,
            diagnosis: pa.diagnosis,
            estimatedAmount: pa.estimatedAmount,
            sumInsured: holder?.sumInsured,
            ...context
        });
        setActiveDoc({ isOpen: true, title, lines, docId: item.id });
    };

    const commentCounts = Object.fromEntries(
        Object.entries(comments).map(([id, list]) => [id, list.length])
    );

    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden">
            <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-[60]">
                <div className="px-8 py-5">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4 min-w-0">
                            <Link
                                href="/pre-auth"
                                className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95"
                                aria-label="Back to Pre-Auth Queue"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                        {formatPreAuthKey(pa.id)}
                                    </h1>
                                    <PreAuthStatusBadge status={pa.status} />
                                </div>
                                <p className="text-sm font-semibold text-slate-500 mt-0.5 truncate max-w-md">
                                    {pa.procedure}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="hidden xl:flex items-center gap-8 border-r border-slate-100 pr-8">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Claim Amount</span>
                                    <span className="text-base font-bold text-slate-900">{formatCurrency(pa.estimatedAmount)}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">SLA Deadline</span>
                                    <span className={`text-base font-bold ${new Date(pa.slaDeadline) < new Date() ? "text-rose-600" : "text-amber-600"}`}>
                                        {formatDate(pa.slaDeadline)}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Approval Likelihood</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className={`h-2 w-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200`}>
                                            <div
                                                className={`h-full transition-all duration-1000 ${pa.aiReadinessScore >= 80 ? "bg-emerald-500" :
                                                        pa.aiReadinessScore >= 50 ? "bg-amber-500" : "bg-rose-500"
                                                    }`}
                                                style={{ width: `${pa.aiReadinessScore}%` }}
                                            />
                                        </div>
                                        <span className={`text-base font-bold ${pa.aiReadinessScore >= 80 ? "text-emerald-600" :
                                                pa.aiReadinessScore >= 50 ? "text-amber-600" : "text-rose-600"
                                            }`}>
                                            {pa.aiReadinessScore}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {assignee && (
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adjudicator</p>
                                        <p className="text-sm font-bold text-slate-900">{assignee.name}</p>
                                    </div>
                                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-100 text-base font-bold text-teal-700 shadow-sm border border-teal-200">
                                        {assignee.avatar}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/50 border-t border-slate-100 px-8 py-2.5">
                    <div className="flex flex-wrap items-center gap-x-10 gap-y-2 text-[11px]">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-400 uppercase tracking-wider">Patient:</span>
                            <span className="font-semibold text-slate-700">{holder?.name} <span className="text-slate-400 font-mono ml-1">({holder?.policyNumber})</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-400 uppercase tracking-wider">Hospital:</span>
                            <span className="font-semibold text-slate-700 truncate max-w-[200px]" title={hospital?.name}>{hospital?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-400 uppercase tracking-wider">Insurer:</span>
                            <span className="font-semibold text-slate-700">{insurer?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-400 uppercase tracking-wider">Claim ID:</span>
                            <span className="font-mono font-semibold text-slate-700">{pa.claimId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-400 uppercase tracking-wider">Submitted:</span>
                            <span className="font-semibold text-slate-700">{formatDateTime(pa.submittedAt)}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-8 min-w-0 overflow-x-hidden">
                <div className="grid gap-8 lg:grid-cols-3 min-w-0">
                    <div className="lg:col-span-2 space-y-6 min-w-0">
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
                            externalOpenDoc={openDoc}
                        />
                    </div>

                    <div className="space-y-6 min-w-0">
                        <CaseDocuments
                            documents={pa.checklist}
                            onViewDoc={(item) => openDoc("Request Item", item)}
                            commentCounts={commentCounts}
                        />

                        {workflowData && (
                            workflowData.timeline.length > 0 ? (
                                <CaseTimeline
                                    events={workflowData.timeline}
                                    assigneeName={assignee?.name}
                                    assigneeRole={assignee?.role}
                                />
                            ) : (
                                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-500">
                                    No timeline events available for this case.
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            <DocumentViewerModal
                isOpen={activeDoc.isOpen}
                onClose={() => setActiveDoc((prev) => ({ ...prev, isOpen: false }))}
                title={activeDoc.title}
                lines={activeDoc.lines}
                docId={activeDoc.docId}
                comments={activeDoc.docId ? comments[activeDoc.docId] : []}
                onAddComment={handleAddComment}
            />
        </div>
    );
}
