import PageHeader from "../shared/PageHeader";
import { calendarLeaves } from "./data";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// October 2026 starts on a Thursday.
const FIRST_WEEKDAY = 3;
const DAYS_IN_MONTH = 31;

export default function CalendarView({ compact }: { compact: boolean }) {
  const cells = Array.from({ length: FIRST_WEEKDAY + DAYS_IN_MONTH }, (_, index) =>
    index < FIRST_WEEKDAY ? null : index - FIRST_WEEKDAY + 1,
  );

  return (
    <>
      <PageHeader title="Team calendar" subtitle="October 2026 · Product team" />
      <div className="overflow-hidden rounded-lg border border-line bg-panel">
        <div className="grid grid-cols-7 border-b border-line bg-surface/60">
          {WEEKDAYS.map((day) => (
            <div key={day} className="px-2 py-1.5 text-[11px] font-medium text-muted">
              {compact ? day[0] : day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, index) => {
            const off = day ? calendarLeaves.filter((leave) => day >= leave.from && day <= leave.to) : [];
            const weekend = index % 7 >= 5;
            return (
              <div
                key={index}
                className={`min-h-[64px] border-b border-r border-line p-1 ${weekend ? "bg-surface/50" : ""}`}
              >
                {day && <span className="text-[11px] text-muted">{day}</span>}
                {!weekend && (
                  <div className="mt-0.5 space-y-0.5">
                    {off.map((leave) => (
                      <div
                        key={leave.person}
                        title={`${leave.person}: ${leave.type}`}
                        className={`truncate rounded px-1 text-[10px] ${
                          leave.type === "Annual leave" ? "bg-accent/15 text-accent" : "bg-success/15 text-success"
                        }`}
                      >
                        {compact ? leave.person.split(" ")[0][0] : leave.person.split(" ")[0]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-accent/40" aria-hidden /> Annual leave
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-success/40" aria-hidden /> Personal day
        </span>
      </div>
    </>
  );
}
