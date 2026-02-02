
"use client";

import type { PreAuthCheckItem } from "@/lib/types";

interface CaseDocumentsProps {
    documents: PreAuthCheckItem[];
    onViewDoc?: (item: PreAuthCheckItem) => void;
    commentCounts?: Record<string, number>;
}

export function CaseDocuments({ documents, onViewDoc, commentCounts = {} }: CaseDocumentsProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 leading-none">Case Documents</h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter bg-slate-100 px-2 py-1 rounded-md">
                    {documents.length} Files
                </span>
            </div>

            <div className="space-y-2">
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className="group flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => onViewDoc?.(doc)}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 group-hover:text-teal-600 group-hover:border-teal-100 transition-colors">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors">{doc.label}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                                        {doc.status === "approved" ? "Verified" : doc.status}
                                    </p>
                                    {commentCounts[doc.id] > 0 && (
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-teal-600">
                                            <span className="h-1 w-1 rounded-full bg-teal-500" />
                                            {commentCounts[doc.id]} {commentCounts[doc.id] === 1 ? 'Note' : 'Notes'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="h-7 w-7 rounded-md bg-teal-50 flex items-center justify-center text-teal-600">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <p className="mt-4 text-[10px] text-slate-400 text-center font-medium italic">Click a file to open and add review notes.</p>
        </div>
    );
}
