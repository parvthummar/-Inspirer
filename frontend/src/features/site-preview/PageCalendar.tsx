import { PEOPLE, hash } from "./siteContent";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const SLOTS = ["9:00", "10:30", "13:00", "15:30"];

export default function PageCalendar({ name, compact }: { name: string; compact: boolean }) {
  const seed = hash(name);
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <div className={`grid border-b border-line bg-surface/60 text-xs font-medium text-muted ${compact ? "grid-cols-3" : "grid-cols-5"}`}>
        {DAYS.slice(0, compact ? 3 : 5).map((day, i) => (
          <div key={day} className="px-3 py-2">
            {day} {12 + i}
          </div>
        ))}
      </div>
      <div className={`grid ${compact ? "grid-cols-3" : "grid-cols-5"}`}>
        {DAYS.slice(0, compact ? 3 : 5).map((day, d) => (
          <div key={day} className="min-h-[240px] space-y-2 border-r border-line p-2 last:border-r-0">
            {SLOTS.filter((_, s) => (seed + d + s) % 3 !== 0).map((slot, s) => (
              <div key={slot} className="rounded-md border-l-2 border-accent bg-accent/10 px-2 py-1.5 text-xs">
                <p className="font-medium text-ink">{slot}</p>
                <p className="truncate text-muted">{PEOPLE[(seed + d * 2 + s) % PEOPLE.length]}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
