import { useCallback, useState } from "react";
import { ListChecks, NotebookPen, Video } from "lucide-react";
import PageHeader from "../shared/PageHeader";
import SampleShell from "../shared/SampleShell";
import type { SampleAppProps } from "../types";
import { meetings as initialMeetings, uploadedMeeting } from "./data";
import MeetingDetail from "./MeetingDetail";
import UploadTranscript from "./UploadTranscript";

export default function MeetingNotesApp({ appName, compact }: SampleAppProps) {
  const [page, setPage] = useState("meetings");
  const [meetings, setMeetings] = useState(initialMeetings);
  const [selectedId, setSelectedId] = useState(initialMeetings[0].id);
  const selected = meetings.find((meeting) => meeting.id === selectedId) ?? meetings[0];
  const openActions = meetings.flatMap((meeting) => meeting.actions.map((action) => ({ ...action, meeting })))
    .filter((action) => !action.done);

  function toggle(meetingId: string, actionId: string) {
    setMeetings((current) =>
      current.map((meeting) =>
        meeting.id !== meetingId
          ? meeting
          : { ...meeting, actions: meeting.actions.map((a) => (a.id === actionId ? { ...a, done: !a.done } : a)) },
      ),
    );
  }

  const addUploaded = useCallback(() => {
    setMeetings((current) => (current.some((m) => m.id === uploadedMeeting.id) ? current : [uploadedMeeting, ...current]));
    setSelectedId(uploadedMeeting.id);
  }, []);

  return (
    <SampleShell
      appName={appName}
      accentRgb="2 132 199"
      logo={NotebookPen}
      userName="Nadia Rahman"
      compact={compact}
      active={page}
      onNavigate={setPage}
      nav={[
        { id: "meetings", label: "Meetings", icon: Video },
        { id: "actions", label: "Action items", icon: ListChecks, badge: openActions.length },
      ]}
    >
      {page === "meetings" && (
        <>
          <PageHeader title="Meetings" subtitle="Summaries written by the notes agent" />
          <UploadTranscript onDone={addUploaded} />
          <div className={`mt-4 grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-[minmax(0,2fr)_minmax(0,5fr)]"}`}>
            <ul className="space-y-1.5">
              {meetings.map((meeting) => (
                <li key={meeting.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(meeting.id)}
                    className={`w-full rounded-md border px-3 py-2 text-left ${
                      meeting.id === selected.id ? "border-accent/50 bg-accent/5" : "border-line bg-panel hover:bg-surface"
                    }`}
                  >
                    <span className="block truncate text-sm font-medium">{meeting.title}</span>
                    <span className="text-[11px] text-muted">
                      {meeting.date} · {meeting.duration}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <MeetingDetail meeting={selected} onToggle={toggle} />
          </div>
        </>
      )}
      {page === "actions" && (
        <>
          <PageHeader title="Action items" subtitle={`${openActions.length} open across all meetings`} />
          <ul className="divide-y divide-line rounded-lg border border-line bg-panel">
            {openActions.map((action) => (
              <li key={action.id}>
                <label className="flex cursor-pointer items-center gap-2.5 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={action.done}
                    onChange={() => toggle(action.meeting.id, action.id)}
                    className="h-4 w-4 accent-[rgb(var(--accent-rgb))]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm">{action.text}</span>
                    <span className="block text-[11px] text-muted">From {action.meeting.title}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-muted">
                    {action.owner} · {action.due}
                  </span>
                </label>
              </li>
            ))}
            {openActions.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">Every action item is done.</li>}
          </ul>
        </>
      )}
    </SampleShell>
  );
}
