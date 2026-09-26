import { CircleCheck } from "lucide-react";
import type { Meeting } from "./data";

type MeetingDetailProps = {
  meeting: Meeting;
  onToggle: (meetingId: string, actionId: string) => void;
};

export default function MeetingDetail({ meeting, onToggle }: MeetingDetailProps) {
  return (
    <article className="rounded-lg border border-line bg-panel p-4">
      <h2 className="text-base font-semibold">{meeting.title}</h2>
      <p className="text-xs text-muted">
        {meeting.date} · {meeting.duration} · {meeting.attendees.join(", ")}
      </p>
      <p className="mt-3 text-sm leading-relaxed">{meeting.summary}</p>

      <h3 className="mt-4 text-xs font-semibold text-muted">Decisions</h3>
      <ul className="mt-1.5 space-y-1">
        {meeting.decisions.map((decision) => (
          <li key={decision} className="flex gap-2 text-sm">
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            {decision}
          </li>
        ))}
      </ul>

      <h3 className="mt-4 text-xs font-semibold text-muted">Action items</h3>
      <ul className="mt-1.5 divide-y divide-line rounded-md border border-line">
        {meeting.actions.map((action) => (
          <li key={action.id}>
            <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2">
              <input
                type="checkbox"
                checked={action.done}
                onChange={() => onToggle(meeting.id, action.id)}
                className="h-4 w-4 accent-[rgb(var(--accent-rgb))]"
              />
              <span className={`min-w-0 flex-1 text-sm ${action.done ? "text-muted line-through" : ""}`}>{action.text}</span>
              <span className="shrink-0 text-[11px] text-muted">
                {action.owner} · {action.due}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </article>
  );
}
