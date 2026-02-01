import type { WorkflowTimelineEvent } from "@/lib/types";

const timelineStatusStyles: Record<WorkflowTimelineEvent["status"], { dot: string; badge: string; label: string }> = {
  done: { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800", label: "Completed" },
  current: { dot: "bg-indigo-500", badge: "bg-indigo-100 text-indigo-800", label: "Current" },
  pending: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-800", label: "Pending" },
  info: { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-700", label: "Info" },
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-semibold text-slate-900">Case timeline</h3>
        <span className="text-xs text-slate-500">{events.length} events</span>
      </div>
      <ol className="space-y-3">
        {events.map((event, idx) => {
          const styles = timelineStatusStyles[event.status];
          return (
            <li key={event.id} className="relative pl-6">
              <span className={`absolute left-0 top-2 h-2.5 w-2.5 rounded-full ${styles.dot}`} />
              {idx < events.length - 1 && (
                <span className="absolute left-1 top-5 h-full w-px bg-slate-200" aria-hidden="true" />
              )}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{event.title}</p>
                  {event.detail && <p className="text-xs text-slate-600 mt-0.5">{event.detail}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-500">{event.timestamp}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${styles.badge}`}>
                    {styles.label}
                  </span>
                </div>
              </div>
              {event.meta && event.meta.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {event.meta.map((item, i) => {
                    const isAssignee = item.label.toLowerCase() === "assignee";
                    const value = isAssignee && assigneeName
                      ? `${assigneeName}${assigneeRole ? ` · ${assigneeRole}` : ""}`
                      : item.value;
                    return (
                      <span
                        key={`${event.id}-meta-${i}`}
                        className="text-xs text-slate-600 bg-white border border-slate-200 rounded-full px-2 py-0.5"
                      >
                        <strong className="font-medium text-slate-700">{item.label}:</strong> {value}
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
