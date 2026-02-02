"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  preAuthRequests,
  formatCurrency,
  formatPreAuthKey,
  getHospital,
  getPolicyHolder,
  getAssignee,
  hospitals,
  tpaAssignees,
} from "@/lib/data";
import { getWorkflowData } from "@/lib/workflow-data";
import { PreAuthStatusBadge, ComplianceStatusBadge } from "../components/StatusBadge";
import { PageHeader } from "../components/PageHeader";

export default function PreAuthQueuePage() {
  const router = useRouter();

  // Filter & Sort States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("time_remaining");

  // Filtering & Sorting Logic
  const filteredRequests = useMemo(() => {
    let requests = preAuthRequests.filter((pa) => {
      const holder = getPolicyHolder(pa.policyHolderId);
      const searchLower = search.toLowerCase();

      // Search matches
      const matchesSearch =
        search === "" ||
        pa.claimId.toLowerCase().includes(searchLower) ||
        formatPreAuthKey(pa.id).toLowerCase().includes(searchLower) ||
        holder?.name.toLowerCase().includes(searchLower) ||
        pa.procedure.toLowerCase().includes(searchLower);

      // Status match
      const matchesStatus = statusFilter === "all" || pa.status === statusFilter;

      // Hospital match
      const matchesHospital = hospitalFilter === "all" || pa.hospitalId === hospitalFilter;

      // Assignee match
      const matchesAssignee =
        assigneeFilter === "all" ||
        (assigneeFilter === "unassigned" ? !pa.assigneeId : pa.assigneeId === assigneeFilter);

      // Amount match
      let matchesAmount = true;
      if (amountFilter === "under-1l") matchesAmount = pa.estimatedAmount < 100000;
      else if (amountFilter === "1l-3l") matchesAmount = pa.estimatedAmount >= 100000 && pa.estimatedAmount < 300000;
      else if (amountFilter === "3l-5l") matchesAmount = pa.estimatedAmount >= 300000 && pa.estimatedAmount < 500000;
      else if (amountFilter === "over-5l") matchesAmount = pa.estimatedAmount >= 500000;

      return matchesSearch && matchesStatus && matchesHospital && matchesAssignee && matchesAmount;
    });

    // Sort Logic
    requests.sort((a, b) => {
      if (sortBy === "time_remaining") {
        return new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
      } else if (sortBy === "amount_high") {
        return b.estimatedAmount - a.estimatedAmount;
      } else if (sortBy === "amount_low") {
        return a.estimatedAmount - b.estimatedAmount;
      } else if (sortBy === "newest") {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
      return 0;
    });

    return requests;
  }, [search, statusFilter, hospitalFilter, amountFilter, assigneeFilter, sortBy]);

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const then = new Date(deadline);
    const diffMs = then.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 0) return "Overdue";
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m remaining`;
    return `${diffMins}m remaining`;
  };

  const isUrgent = (deadline: string) => {
    const now = new Date();
    const then = new Date(deadline);
    const diffMins = Math.floor((then.getTime() - now.getTime()) / (1000 * 60));
    return diffMins > 0 && diffMins <= 30;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Pre-Auth Queue"
        subtitle="AI checks each request for completeness and IRDAI compliance"
        titleVariant="navy"
      />

      <div className="p-8 space-y-8">
        {/* Main List & Filters */}
        <div className="space-y-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between font-outfit">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Queue</h2>
                <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
                  {filteredRequests.length} results found {search && `for "${search}"`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                {/* Search */}
                <div className="relative flex-grow lg:flex-grow-0 lg:w-72">
                  <input
                    type="text"
                    placeholder="Search by name, ID or procedure..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-slate-400"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <svg className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    className="flex-grow sm:flex-grow-0 px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer appearance-none pr-10 relative"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="awaiting_docs">Awaiting Docs</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <select
                    className="flex-grow sm:flex-grow-0 px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all cursor-pointer appearance-none pr-10 relative"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="time_remaining">Sort by SLA (Closest)</option>
                    <option value="newest">Sort by Date (Newest)</option>
                    <option value="amount_high">Sort by Amount (High)</option>
                    <option value="amount_low">Sort by Amount (Low)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Status Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Quick Filters:</span>
              {[
                { label: "All Cases", id: "all" },
                { label: "Awaiting Docs", id: "awaiting_docs" },
                { label: "Under Review", id: "under_review" },
                { label: "High Value (≥5L)", id: "over-5l", type: "amount" },
                { label: "Unassigned", id: "unassigned", type: "assignee" }
              ].map((chip) => {
                const isActive = chip.type === "amount"
                  ? amountFilter === chip.id
                  : chip.type === "assignee"
                    ? assigneeFilter === chip.id
                    : statusFilter === chip.id;

                return (
                  <button
                    key={chip.id}
                    onClick={() => {
                      if (chip.type === "amount") setAmountFilter(chip.id);
                      else if (chip.type === "assignee") setAssigneeFilter(chip.id);
                      else setStatusFilter(chip.id);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${isActive
                      ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-200"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    {chip.label}
                  </button>
                );
              })}

              {(search || statusFilter !== "all" || hospitalFilter !== "all" || amountFilter !== "all" || assigneeFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setHospitalFilter("all");
                    setAmountFilter("all");
                    setAssigneeFilter("all");
                  }}
                  className="px-4 py-1.5 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* List of Cards */}
          <div className="grid gap-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((pa) => {
                const hospital = getHospital(pa.hospitalId);
                const holder = getPolicyHolder(pa.policyHolderId);
                const assignee = pa.assigneeId ? getAssignee(pa.assigneeId) : null;
                const urgent = isUrgent(pa.slaDeadline);
                const timeRemaining = getTimeRemaining(pa.slaDeadline);

                return (
                  <div
                    key={pa.id}
                    onClick={() => router.push(`/pre-auth/${pa.id}`)}
                    className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer ${urgent
                      ? "border-amber-300 bg-amber-50/50 shadow-sm shadow-amber-100/50"
                      : "bg-white border-slate-100 hover:shadow-slate-200/50"
                      }`}
                  >
                    {urgent && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400" />
                    )}

                    <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Left: Claim & Procedure */}
                      <div className="flex-grow min-w-0 lg:max-w-[30%]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter bg-slate-50 px-1.5 py-0.5 rounded leading-none">
                            {formatPreAuthKey(pa.id)}
                          </span>
                          <span className="text-sm font-bold text-slate-900 leading-none">{pa.claimId}</span>
                          {urgent && (
                            <span className="ml-1 animate-pulse h-2 w-2 rounded-full bg-amber-500" />
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-slate-600 transition-colors mt-2">
                          {pa.procedure}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">
                            ICD: {pa.icdCode}
                          </p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${urgent ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                            }`}>
                            {timeRemaining}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Patient & Hospital */}
                      <div className="grid grid-cols-2 lg:flex gap-6 lg:flex-grow">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Patient</p>
                          <p className="text-sm font-bold text-slate-900 leading-tight">{holder?.name}</p>
                          <p className="text-xs text-slate-500 mt-1 font-medium leading-none">{holder?.policyNumber}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Hospital</p>
                          <p className="text-sm font-bold text-slate-700 leading-tight">{hospital?.name.split(',')[0]}</p>
                          <p className="text-xs text-slate-500 mt-1 font-medium leading-none">{hospital?.city}</p>
                        </div>
                      </div>

                      {/* Right: Amount, Assignee & Status */}
                      <div className="flex items-center justify-between lg:justify-end gap-10 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Estimated</p>
                          <p className={`text-xl font-black tracking-tight leading-none ${pa.estimatedAmount >= 500000 ? "text-amber-600" : "text-slate-900"}`}>
                            {formatCurrency(pa.estimatedAmount)}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2.5">
                          <PreAuthStatusBadge status={pa.status} />
                          {assignee ? (
                            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-600 font-medium">{assignee.name.split(' ')[0]}</span>
                              <div className="h-4 w-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-600">
                                {assignee.avatar}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider italic">Unassigned</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer: Compliance & Actions */}
                    <div className="px-5 py-3.5 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Compliance</span>
                          <ComplianceStatusBadge status={pa.complianceStatus} />
                        </div>
                        {pa.aiReadinessScore > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approval Likelihood</span>
                            <div className="flex items-center gap-1.5 font-bold">
                              <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${pa.aiReadinessScore >= 80 ? 'bg-teal-500' : pa.aiReadinessScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${pa.aiReadinessScore}%` }}
                                />
                              </div>
                              <span className={`text-[10px] ${pa.aiReadinessScore >= 80 ? "text-teal-700" : pa.aiReadinessScore >= 50 ? "text-amber-700" : "text-red-700"
                                }`}>
                                {pa.aiReadinessScore}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-slate-900 font-bold text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                        Open Case
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">No matching requests</h3>
                <p className="text-sm text-slate-500 mt-1.5 max-w-xs mx-auto">Try broadening your search criteria or clearing active filters to see more results.</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setHospitalFilter("all");
                    setAmountFilter("all");
                    setAssigneeFilter("all");
                  }}
                  className="mt-8 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
