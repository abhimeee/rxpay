"use client";

import { useState } from "react";
import { FraudRedFlag } from "@/lib/types";
import { QueryModal } from "../../components/QueryModal";

type ResolutionAction = "safe" | "escalate" | "confirmed_fraud";

interface FlagResolution {
  action: ResolutionAction | null;
  reason: string;
  saved: boolean;
}

function FlagCard({
  flag,
  onViewDoc,
}: {
  flag: FraudRedFlag;
  onViewDoc: () => void;
}) {
  const [resolution, setResolution] = useState<FlagResolution>({
    action: null,
    reason: "",
    saved: false,
  });
  const [modalOpen, setModalOpen] = useState(false);

  const isCritical = flag.severity === "high";
  const isWarning = flag.severity === "medium";

  const borderColor = isCritical ? "#FECACA" : isWarning ? "#FDE68A" : "var(--color-border)";
  const bgColor = isCritical ? "#FEF2F2" : isWarning ? "#FFFBEB" : "var(--color-white)";

  const severityLabel = isCritical ? "Critical" : isWarning ? "Warning" : "Low";
  const severityColor = isCritical ? "#B91C1C" : isWarning ? "#92400E" : "#15803D";
  const severityBg = isCritical ? "#FEF2F2" : isWarning ? "#FFFBEB" : "#F0FDF4";
  const severityBorder = isCritical ? "#FECACA" : isWarning ? "#FDE68A" : "#BBF7D0";

  const categoryLabel = { provider: "Provider", patient: "Patient", document: "Document" }[flag.category];

  const canSave = resolution.action !== null && resolution.reason.trim().length >= 10;

  if (resolution.saved) {
    const savedLabels: Record<ResolutionAction, string> = {
      safe: "Safe",
      escalate: "Escalated to Fraud Team",
      confirmed_fraud: "Confirmed Fraud",
    };
    return (
      <div style={{
        background: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#15803D", fontWeight: 700 }}>✓</span>
          <span style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-secondary)" }}>
            Resolved as: <strong style={{ color: "var(--color-text-primary)" }}>{savedLabels[resolution.action!]}</strong>
          </span>
          <span style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted)",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xs)",
            padding: "1px 6px",
          }}>
            {flag.description.slice(0, 50)}{flag.description.length > 50 ? "…" : ""}
          </span>
        </div>
        <button
          onClick={() => setResolution({ action: null, reason: "", saved: false })}
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted)",
            background: "none",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xs)",
            padding: "2px 8px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Undo
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--radius-md)",
      padding: "16px",
      marginBottom: 0,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              padding: "2px 7px",
              borderRadius: 20,
              background: severityBg,
              color: severityColor,
              border: `1px solid ${severityBorder}`,
            }}>
              {severityLabel}
            </span>
            <span style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--color-text-muted)",
            }}>
              {categoryLabel} Flag
            </span>
          </div>
          {/* Evidence blockquote */}
          <blockquote style={{
            borderLeft: `3px solid ${isCritical ? "#FCA5A5" : isWarning ? "#FCD34D" : "#CCCCCC"}`,
            background: "rgba(255,255,255,0.6)",
            padding: "8px 12px",
            margin: 0,
            borderRadius: "0 var(--radius-xs) var(--radius-xs) 0",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-secondary)",
            fontStyle: "italic",
            marginBottom: 10,
          }}>
            {flag.description}
          </blockquote>
        </div>
      </div>

      {/* Historical context */}
      {(flag.providerFraudRate !== undefined || flag.patientClaimsCount !== undefined) && (
        <div style={{
          display: "flex",
          gap: 12,
          marginBottom: 12,
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-muted)",
        }}>
          {flag.providerFraudRate !== undefined && (
            <span>Provider fraud rate: <strong style={{ color: "var(--color-text-secondary)" }}>{flag.providerFraudRate}%</strong></span>
          )}
          {flag.patientClaimsCount !== undefined && (
            <span>Patient claims this year: <strong style={{ color: "var(--color-text-secondary)" }}>{flag.patientClaimsCount}</strong></span>
          )}
        </div>
      )}

      {/* View Evidence button */}
      <div style={{ marginBottom: 14 }}>
        <button
          onClick={onViewDoc}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: "var(--font-size-xs)",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            background: "var(--color-white)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xs)",
            padding: "4px 10px",
            cursor: "pointer",
          }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Evidence in Document
        </button>
      </div>

      {/* Resolution radio group */}
      <div style={{
        background: "var(--color-white)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        padding: "12px",
      }}>
        <p style={{
          fontSize: "var(--font-size-xs)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "var(--color-text-muted)",
          marginBottom: 10,
        }}>
          Resolution
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
          {([
            { value: "safe", label: "Mark as Safe", color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
            { value: "escalate", label: "Escalate to Fraud Team", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
            { value: "confirmed_fraud", label: "Confirm Fraud", color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" },
          ] as const).map((opt) => (
            <label
              key={opt.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 10px",
                borderRadius: "var(--radius-xs)",
                border: resolution.action === opt.value ? `1px solid ${opt.border}` : "1px solid var(--color-border)",
                background: resolution.action === opt.value ? opt.bg : "var(--color-white)",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name={`resolution-${flag.id}`}
                value={opt.value}
                checked={resolution.action === opt.value}
                onChange={() => setResolution((prev) => ({ ...prev, action: opt.value }))}
                style={{ margin: 0 }}
              />
              <span style={{
                fontSize: "var(--font-size-base)",
                fontWeight: 500,
                color: resolution.action === opt.value ? opt.color : "var(--color-text-primary)",
              }}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>

        {/* Required reasoning / confirmation action */}
        {resolution.action !== null && (
          <div style={{ marginTop: 10 }}>
            {resolution.reason.trim().length >= 10 ? (
              <div style={{ marginBottom: 10, padding: "8px 10px", background: "var(--color-bg)", borderRadius: "var(--radius-xs)", border: "1px solid var(--color-border)" }}>
                <p style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 4 }}>Reasoning Provided:</p>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-primary)", margin: 0 }}>
                  {resolution.reason.length > 50 ? resolution.reason.substring(0, 50) + "..." : resolution.reason}
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  style={{ marginTop: 6, fontSize: 10, fontWeight: 600, color: "var(--color-text-secondary)", background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xs)", padding: "2px 8px", cursor: "pointer" }}
                >
                  Edit Reasoning
                </button>
              </div>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  width: "100%",
                  marginBottom: 10,
                  padding: "6px 0",
                  background: "var(--color-white)",
                  color: "var(--color-text-primary)",
                  border: "1px dashed var(--color-border-dark)",
                  borderRadius: "var(--radius-xs)",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + Add Reasoning (Required)
              </button>
            )}

            <button
              onClick={() => setResolution((prev) => ({ ...prev, saved: true }))}
              disabled={!canSave}
              style={{
                width: "100%",
                padding: "7px 0",
                background: canSave ? "var(--color-black)" : "var(--color-border)",
                color: canSave ? "#fff" : "var(--color-text-muted)",
                border: "none",
                borderRadius: "var(--radius-xs)",
                fontSize: "var(--font-size-xs)",
                fontWeight: 600,
                cursor: canSave ? "pointer" : "not-allowed",
              }}
            >
              Save Resolution
            </button>

            <QueryModal
              isOpen={modalOpen}
              title={`Reasoning for ${resolution.action === "safe" ? "Marking Safe" : resolution.action === "escalate" ? "Escalation" : "Confirmation"}`}
              initialText={resolution.reason}
              onSave={(newReason: string) => {
                setResolution((prev) => ({ ...prev, reason: newReason }));
                setModalOpen(false);
              }}
              onClose={() => setModalOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ClearedFlagRow({ flag }: { flag: FraudRedFlag }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderBottom: "1px solid var(--color-border)",
    }}>
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#15803D" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {{ provider: "Provider", patient: "Patient", document: "Document" }[flag.category]}
      </span>
      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", flex: 1 }}>
        {flag.description}
      </span>
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "1px 6px",
        borderRadius: 20,
        background: "#F0FDF4",
        color: "#15803D",
        border: "1px solid #BBF7D0",
      }}>
        Cleared
      </span>
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
  const [clearedExpanded, setClearedExpanded] = useState(false);

  // Compute explained score
  const activeFlags = flags.filter((f) => f.severity !== "none");
  const providerFlags = flags.filter((f) => f.category === "provider");
  const docFlags = flags.filter((f) => f.category === "document");
  const patientFlags = flags.filter((f) => f.category === "patient");

  const providerScore = providerFlags.reduce((acc, f) => acc + (f.severity === "high" ? 30 : f.severity === "medium" ? 15 : f.severity === "low" ? 5 : 0), 0);
  const docScore = docFlags.reduce((acc, f) => acc + (f.severity === "high" ? 30 : f.severity === "medium" ? 15 : f.severity === "low" ? 5 : 0), 0);
  const patientScore = patientFlags.reduce((acc, f) => acc + (f.severity === "high" ? 30 : f.severity === "medium" ? 15 : f.severity === "low" ? 5 : 0), 0);
  const fraudScore = Math.min(100, providerScore + docScore + patientScore);

  const activeProviderFlags = providerFlags.filter((f) => f.severity !== "none");
  const activeDocFlags = docFlags.filter((f) => f.severity !== "none");
  const activePatientFlags = patientFlags.filter((f) => f.severity !== "none");

  const clearedFlags = flags.filter((f) => f.severity === "none" || f.resolved === true);

  const hasCritical = fraudScore >= 75;
  const isClear = fraudScore < 20;

  const scoreColor = hasCritical ? "#B91C1C" : isClear ? "#15803D" : "#92400E";
  const scoreBg = hasCritical ? "#FEF2F2" : isClear ? "#F0FDF4" : "#FFFBEB";
  const scoreBorder = hasCritical ? "#FECACA" : isClear ? "#BBF7D0" : "#FDE68A";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Score card */}
      <div style={{
        background: scoreBg,
        border: `1px solid ${scoreBorder}`,
        borderRadius: "var(--radius-md)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "flex-start",
        gap: 20,
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "var(--radius-sm)",
          background: scoreColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{fraudScore}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>
            Fraud Risk Score: {fraudScore}/100
          </p>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", marginBottom: 8 }}>
            {hasCritical
              ? "Critical anomalies detected requiring immediate review."
              : isClear
                ? "No significant risk patterns identified."
                : "Potential irregularities found — review flagged items."}
          </p>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Score calculated from: {activeProviderFlags.length} provider flag{activeProviderFlags.length !== 1 ? "s" : ""} + {activeDocFlags.length} document anomal{activeDocFlags.length !== 1 ? "ies" : "y"} + {activePatientFlags.length} patient flag{activePatientFlags.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Active flags — flagged first */}
      {activeFlags.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--color-text-muted)",
          }}>
            Active Flags ({activeFlags.length})
          </p>
          {activeFlags.map((flag) => (
            <FlagCard
              key={flag.id}
              flag={flag}
              onViewDoc={() => onViewDoc(flag)}
            />
          ))}
        </div>
      ) : (
        <div style={{
          background: "#F0FDF4",
          border: "1px solid #BBF7D0",
          borderRadius: "var(--radius-md)",
          padding: "16px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "#15803D", marginBottom: 4 }}>
            ✓ No Active Fraud Flags
          </p>
          <p style={{ fontSize: "var(--font-size-xs)", color: "#166534" }}>
            All fraud checks cleared. No suspicious patterns detected.
          </p>
        </div>
      )}

      {/* Cleared flags — collapsed section */}
      {clearedFlags.length > 0 && (
        <div style={{
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}>
          <button
            type="button"
            onClick={() => setClearedExpanded((o) => !o)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: "var(--font-size-base)", fontWeight: 600, color: "var(--color-text-secondary)" }}>
              Cleared Checks ({clearedFlags.length})
            </span>
            <svg
              width="14" height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{
                transform: clearedExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.15s",
                color: "var(--color-text-muted)",
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {clearedExpanded && (
            <div style={{ borderTop: "1px solid var(--color-border)" }}>
              {clearedFlags.map((flag) => (
                <ClearedFlagRow key={flag.id} flag={flag} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
