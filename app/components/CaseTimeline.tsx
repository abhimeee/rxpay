import type { WorkflowTimelineEvent } from "@/lib/types";

const statusMap: Record<WorkflowTimelineEvent["status"], { dotColor: string; labelBg: string; labelColor: string; label: string }> = {
  done:    { dotColor: "var(--color-green)",   labelBg: "var(--color-green-bg)",   labelColor: "var(--color-green)",   label: "Done" },
  current: { dotColor: "var(--color-blue)",    labelBg: "var(--color-blue-bg)",    labelColor: "var(--color-blue)",    label: "Current" },
  pending: { dotColor: "var(--color-yellow)",  labelBg: "var(--color-yellow-bg)",  labelColor: "var(--color-yellow)",  label: "Pending" },
  info:    { dotColor: "var(--color-text-muted)", labelBg: "var(--color-bg)", labelColor: "var(--color-text-secondary)", label: "Info" },
};

export function CaseTimeline({
  events,
  assigneeName,
  assigneeRole,
}: {
  events: WorkflowTimelineEvent[];
  assigneeName?: string;
  assigneeRole?: string;
}) {
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
          Case Timeline
        </p>
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          {events.length} events
        </span>
      </div>

      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {events.map((event, idx) => {
          const s = statusMap[event.status];
          return (
            <li key={event.id} style={{ position: "relative", paddingLeft: 20, paddingBottom: idx < events.length - 1 ? 14 : 0 }}>
              {/* Dot */}
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: s.dotColor,
                  display: "block",
                }}
              />
              {/* Connector line */}
              {idx < events.length - 1 && (
                <span
                  style={{
                    position: "absolute",
                    left: 3,
                    top: 14,
                    width: 1,
                    height: "calc(100% - 6px)",
                    background: "var(--color-border)",
                    display: "block",
                  }}
                  aria-hidden="true"
                />
              )}

              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 4 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: "var(--font-size-base)", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: event.detail ? 2 : 0 }}>
                    {event.title}
                  </p>
                  {event.detail && (
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>{event.detail}</p>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    {event.timestamp}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--font-size-xs)",
                      fontWeight: 500,
                      padding: "1px 7px",
                      borderRadius: "var(--radius-xs)",
                      background: s.labelBg,
                      color: s.labelColor,
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              </div>

              {event.meta && event.meta.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                  {event.meta.map((item, i) => {
                    const isAssignee = item.label.toLowerCase() === "assignee";
                    const value = isAssignee && assigneeName
                      ? `${assigneeName}${assigneeRole ? ` · ${assigneeRole}` : ""}`
                      : item.value;
                    return (
                      <span
                        key={`${event.id}-meta-${i}`}
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-text-secondary)",
                          background: "var(--color-bg)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-xs)",
                          padding: "1px 7px",
                        }}
                      >
                        <strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{item.label}:</strong>{" "}{value}
                      </span>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
