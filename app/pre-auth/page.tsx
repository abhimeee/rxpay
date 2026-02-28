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
} from "@/lib/data";
import { PreAuthStatusBadge } from "../components/StatusBadge";
import { PageHeader } from "../components/PageHeader";

export default function PreAuthQueuePage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("time_remaining");

  const filteredRequests = useMemo(() => {
    let requests = preAuthRequests.filter((pa) => {
      const holder = getPolicyHolder(pa.policyHolderId);
      const searchLower = search.toLowerCase();

      const matchesSearch =
        search === "" ||
        pa.claimId.toLowerCase().includes(searchLower) ||
        formatPreAuthKey(pa.id).toLowerCase().includes(searchLower) ||
        holder?.name.toLowerCase().includes(searchLower) ||
        pa.procedure.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === "all" || pa.status === statusFilter;

      const matchesAssignee =
        assigneeFilter === "all" ||
        (assigneeFilter === "unassigned" ? !pa.assigneeId : pa.assigneeId === assigneeFilter);

      let matchesAmount = true;
      if (amountFilter === "under-1l") matchesAmount = pa.estimatedAmount < 100000;
      else if (amountFilter === "1l-3l") matchesAmount = pa.estimatedAmount >= 100000 && pa.estimatedAmount < 300000;
      else if (amountFilter === "3l-5l") matchesAmount = pa.estimatedAmount >= 300000 && pa.estimatedAmount < 500000;
      else if (amountFilter === "over-5l") matchesAmount = pa.estimatedAmount >= 500000;

      return matchesSearch && matchesStatus && matchesAssignee && matchesAmount;
    });

    requests.sort((a, b) => {
      if (sortBy === "time_remaining") return new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
      if (sortBy === "amount_high") return b.estimatedAmount - a.estimatedAmount;
      if (sortBy === "amount_low") return a.estimatedAmount - b.estimatedAmount;
      if (sortBy === "newest") return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      return 0;
    });

    return requests;
  }, [search, statusFilter, amountFilter, assigneeFilter, sortBy]);

  const getSLAStatus = (deadline: string) => {
    const diffMins = Math.floor((new Date(deadline).getTime() - Date.now()) / 60000);
    if (diffMins < 0) return { label: "Overdue", color: "var(--color-red)", bg: "var(--color-red-bg)" };
    if (diffMins <= 30) return { label: `${diffMins}m left`, color: "var(--color-yellow)", bg: "var(--color-yellow-bg)" };
    const h = Math.floor(diffMins / 60);
    return { label: h > 0 ? `${h}h ${diffMins % 60}m` : `${diffMins}m`, color: "var(--color-text-muted)", bg: "var(--color-bg)" };
  };

  const clearFilters = () => {
    setSearch(""); setStatusFilter("all"); setAmountFilter("all"); setAssigneeFilter("all");
  };

  const hasActiveFilters = search || statusFilter !== "all" || amountFilter !== "all" || assigneeFilter !== "all";

  const quickFilters = [
    { label: "All Cases", onClick: () => { setStatusFilter("all"); setAmountFilter("all"); setAssigneeFilter("all"); }, isActive: statusFilter === "all" && amountFilter === "all" && assigneeFilter === "all" },
    { label: "Awaiting Docs", onClick: () => setStatusFilter("awaiting_docs"), isActive: statusFilter === "awaiting_docs" },
    { label: "Under Review", onClick: () => setStatusFilter("under_review"), isActive: statusFilter === "under_review" },
    { label: "High Value (≥5L)", onClick: () => setAmountFilter("over-5l"), isActive: amountFilter === "over-5l" },
    { label: "Unassigned", onClick: () => setAssigneeFilter("unassigned"), isActive: assigneeFilter === "unassigned" },
  ];

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <PageHeader title="Pre-Auth Queue" />

      <div style={{ padding: "20px" }}>
        {/* Toolbar */}
        <div
          style={{
            background: "var(--color-white)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            marginBottom: 16,
            overflow: "hidden",
          }}
        >
          {/* Search + sort row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {/* Search */}
            <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
              <svg
                style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--color-text-muted)" }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, ID or procedure..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: 32,
                  paddingRight: 12,
                  paddingTop: 7,
                  paddingBottom: 7,
                  fontSize: "var(--font-size-base)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-white)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "7px 12px",
                fontSize: "var(--font-size-base)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                background: "var(--color-white)",
                color: "var(--color-text-primary)",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="awaiting_docs">Awaiting Docs</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "7px 12px",
                fontSize: "var(--font-size-base)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                background: "var(--color-white)",
                color: "var(--color-text-primary)",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="time_remaining">Sort by SLA</option>
              <option value="newest">Sort by Date</option>
              <option value="amount_high">Amount (High→Low)</option>
              <option value="amount_low">Amount (Low→High)</option>
            </select>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                {filteredRequests.length} result{filteredRequests.length !== 1 ? "s" : ""}
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  style={{
                    padding: "4px 10px",
                    fontSize: "var(--font-size-xs)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--color-white)",
                    color: "var(--color-text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Quick filter chips */}
          <div style={{ display: "flex", gap: 6, padding: "8px 16px", flexWrap: "wrap" }}>
            {quickFilters.map((chip) => (
              <button
                key={chip.label}
                onClick={chip.onClick}
                className={`filter-chip${chip.isActive ? " active" : ""}`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: "var(--font-size-sm, 14px)", color: "var(--color-text-muted)", marginBottom: 16 }}>
          We are pulling all these cases from emails received on <strong>claims@aknatpa.com</strong>.
        </p>

        {/* Data table */}
        <div
          style={{
            background: "var(--color-white)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          {filteredRequests.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-base)" }}>
              <thead>
                <tr>
                  {["Claim / Procedure", "Patient", "Hospital", "SLA", "Amount", "AI Score", "Status", "Assignee"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontSize: "var(--font-size-xs)",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        borderBottom: "1px solid var(--color-border)",
                        background: "var(--color-white)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((pa, i) => {
                  const hospital = getHospital(pa.hospitalId);
                  const holder = getPolicyHolder(pa.policyHolderId);
                  const assignee = pa.assigneeId ? getAssignee(pa.assigneeId) : null;
                  const sla = getSLAStatus(pa.slaDeadline);
                  const isLast = i === filteredRequests.length - 1;

                  return (
                    <tr
                      key={pa.id}
                      onClick={() => router.push(`/pre-auth/${pa.id}`)}
                      style={{ cursor: "pointer", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "10px 12px", borderBottom: isLast ? "none" : "1px solid #F0F0F0", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontFamily: "monospace", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", background: "var(--color-bg)", padding: "1px 5px", borderRadius: "var(--radius-xs)", display: "inline-block", width: "fit-content" }}>
                            {formatPreAuthKey(pa.id)}
                          </span>
                          <span style={{ fontWeight: 500, color: "var(--color-text-primary)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {pa.procedure}
                          </span>
                          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                            ICD: {pa.icdCode}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "10px 12px", borderBottom: isLast ? "none" : "1px solid #F0F0F0", verticalAlign: "middle" }}>
                        <p style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{holder?.name}</p>
                        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{holder?.policyNumber}</p>
                      </td>

                      <td style={{ padding: "10px 12px", borderBottom: isLast ? "none" : "1px solid #F0F0F0", verticalAlign: "middle" }}>
                        <p style={{ color: "var(--color-text-primary)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {hospital?.name.split(",")[0]}
                        </p>
                        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{hospital?.city}</p>
                      </td>

                      <td style={{ padding: "10px 12px", borderBottom: isLast ? "none" : "1px solid #F0F0F0", verticalAlign: "middle" }}>
                        <span
                          style={{
                            fontSize: "var(--font-size-xs)",
                            fontWeight: 500,
                            color: sla.color,
                            background: sla.bg,
                            padding: "2px 8px",
                            borderRadius: "var(--radius-xs)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {sla.label}
                        </span>
                      </td>

                      <td style={{ padding: "10px 12px", borderBottom: isLast ? "none" : "1px solid #F0F0F0", verticalAlign: "middle" }}>
                        <p
                          style={{
                            fontWeight: 600,
                            color: pa.estimatedAmount >= 500000 ? "var(--color-yellow)" : "var(--color-text-primary)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatCurrency(pa.estimatedAmount)}
                        </p>
                      </td>

                      <td style={{ padding: "10px 12px", borderBottom: isLast ? "none" : "1px solid #F0F0F0", verticalAlign: "middle" }}>
                        {pa.aiReadinessScore > 0 && (
                          <span
                            style={{
                              fontSize: "var(--font-size-xs)",
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: "var(--radius-xs)",
                              whiteSpace: "nowrap",
                              color: pa.aiReadinessScore >= 80 ? "var(--color-green)" : pa.aiReadinessScore >= 50 ? "var(--color-yellow)" : "var(--color-red)",
                              background: pa.aiReadinessScore >= 80 ? "var(--color-green-bg)" : pa.aiReadinessScore >= 50 ? "var(--color-yellow-bg)" : "var(--color-red-bg)",
                            }}
                          >
                            {pa.aiReadinessScore}%
                          </span>
                        )}
                      </td>

                      <td style={{ padding: "10px 12px", borderBottom: isLast ? "none" : "1px solid #F0F0F0", verticalAlign: "middle" }}>
                        <PreAuthStatusBadge status={pa.status} />
                      </td>

                      <td style={{ padding: "10px 12px", borderBottom: isLast ? "none" : "1px solid #F0F0F0", verticalAlign: "middle" }}>
                        {assignee ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                background: "var(--color-bg)",
                                border: "1px solid var(--color-border)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "var(--font-size-xs)",
                                fontWeight: 600,
                                color: "var(--color-text-secondary)",
                                flexShrink: 0,
                              }}
                            >
                              {assignee.avatar}
                            </div>
                            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                              {assignee.name.split(" ")[0]}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-disabled)", fontStyle: "italic" }}>
                            Unassigned
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "60px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "var(--font-size-md)", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}>
                No matching requests
              </p>
              <p style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-muted)", marginBottom: 20 }}>
                Try broadening your search or clearing filters.
              </p>
              <button
                onClick={clearFilters}
                style={{
                  padding: "7px 16px",
                  fontSize: "var(--font-size-base)",
                  fontWeight: 500,
                  background: "var(--color-black)",
                  color: "var(--color-white)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
