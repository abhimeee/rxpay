
"use client";

import { useMemo, useState } from "react";
import { buildDummyPdfDataUri, PdfLine } from "@/lib/pdf-generator";

interface Comment {
    id: string;
    author: string;
    text: string;
    timestamp: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: string;
}

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    lines: PdfLine[];
    docId?: string;
    comments?: Comment[];
    onAddComment?: (docId: string, text: string) => void;
}

export function DocumentViewerModal({
    isOpen,
    onClose,
    title,
    lines,
    docId,
    comments = [],
    onAddComment
}: DocumentViewerModalProps) {
    const pdfUri = useMemo(() => buildDummyPdfDataUri(lines), [lines]);
    const [newComment, setNewComment] = useState("");
    const [activeTab, setActiveTab] = useState<'chat' | 'comments'>('chat');
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            text: "I've analyzed this document regarding the policy coverage. How can I help you?",
            timestamp: 'Just now'
        }
    ]);

    const handleSendChat = () => {
        if (!chatInput.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: chatInput,
            timestamp: 'Just now'
        };

        setChatMessages(prev => [...prev, userMsg]);
        setChatInput("");

        // Mock AI response
        setTimeout(() => {
            setChatMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: "Based on the document context, the patient's history clearly indicates a need for the requested medication, aligning with the policy's medical necessity criteria.",
                timestamp: 'Just now'
            }]);
        }, 1000);
    };

    if (!isOpen) return null;

    const handleAddComment = () => {
        if (!newComment.trim() || !docId || !onAddComment) return;
        onAddComment(docId, newComment);
        setNewComment("");
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4 py-6 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="relative flex h-full w-full max-w-[90vw] flex-row overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(event) => event.stopPropagation()}
            >
                {/* PDF Viewer Section */}
                <div className="flex flex-1 flex-col border-r border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-900 line-clamp-1">{title}</h3>
                                <p className="text-xs text-slate-500 font-medium">Policy Verification View</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">AI Verified Evidence</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-slate-100 p-4 lg:p-8 flex items-center justify-center overflow-auto">
                        <div className="w-full h-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden border border-slate-200">
                            <iframe
                                title={`${title} full view`}
                                src={pdfUri}
                                className="h-full w-full"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-200 px-6 py-3 bg-white flex items-center justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-500 transition-all active:scale-95"
                        >
                            Complete Review
                        </button>
                    </div>
                </div>

                {/* Vertical Sidebar with Tabs */}
                <div className="w-[360px] flex flex-col bg-slate-50/50 border-l border-slate-200">
                    <div className="flex flex-col border-b border-slate-200 bg-white">
                        <div className="flex items-center justify-between px-5 py-4">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Context & Notes</h4>
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-7 w-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-5 gap-6">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`pb-3 text-xs font-bold transition-all relative ${activeTab === 'chat'
                                        ? 'text-teal-600'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                AI Copilot
                                {activeTab === 'chat' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('comments')}
                                className={`pb-3 text-xs font-bold transition-all relative ${activeTab === 'comments'
                                        ? 'text-teal-600'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                Team Notes
                                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold">
                                    {comments.length}
                                </span>
                                {activeTab === 'comments' && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Chat Tab Content */}
                    {activeTab === 'chat' && (
                        <>
                            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                                {chatMessages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {msg.role === 'assistant' && (
                                                <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-1">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </div>
                                            )}

                                            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                <div className={`
                                                    p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm
                                                    ${msg.role === 'user'
                                                        ? 'bg-teal-600 text-white rounded-tr-none'
                                                        : 'bg-white border border-slate-200 text-slate-600 rounded-tl-none'
                                                    }
                                                `}>
                                                    {msg.text}
                                                </div>
                                                <span className="text-[10px] text-slate-400 mt-1.5 px-1 font-medium">
                                                    {msg.timestamp}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-white border-t border-slate-200">
                                <div className="relative">
                                    <textarea
                                        placeholder="Ask about this document..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendChat();
                                            }
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 min-h-[50px] max-h-[120px] resize-none pr-12"
                                        rows={1}
                                    />
                                    <div className="absolute right-2 bottom-1.5 h-full flex items-center">
                                        <button
                                            onClick={handleSendChat}
                                            disabled={!chatInput.trim()}
                                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-md active:scale-95"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 text-center mt-3 font-medium">
                                    AI can make mistakes. Verify important info.
                                </p>
                            </div>
                        </>
                    )}

                    {/* Comments Tab Content */}
                    {activeTab === 'comments' && (
                        <>
                            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                                {comments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-400">No notes yet</p>
                                        <p className="text-[10px] text-slate-400 px-4 mt-1">Add context or flag inconsistencies for the next review stage.</p>
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="group relative">
                                            <div className="flex items-start gap-3">
                                                <div className="h-7 w-7 rounded-lg bg-teal-100 flex items-center justify-center text-[10px] font-bold text-teal-700 border border-teal-200 shrink-0">
                                                    {comment.author.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[11px] font-bold text-slate-900 truncate pr-2">{comment.author}</span>
                                                        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{comment.timestamp}</span>
                                                    </div>
                                                    <div className="p-3 rounded-xl rounded-tl-none bg-white border border-slate-200 shadow-sm text-xs text-slate-600 leading-relaxed italic">
                                                        "{comment.text}"
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 bg-white border-t border-slate-200">
                                <div className="relative">
                                    <textarea
                                        placeholder="Add a team note..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddComment();
                                            }
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 min-h-[50px] max-h-[120px] resize-none pr-12"
                                        rows={1}
                                    />
                                    <div className="absolute right-2 bottom-1.5 h-full flex items-center">
                                        <button
                                            onClick={handleAddComment}
                                            disabled={!newComment.trim()}
                                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-md active:scale-95"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 text-center mt-3 font-medium">Flagging teammates is supported (@)</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
