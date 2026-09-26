import { useState } from "react";
import { FileBarChart, LayoutDashboard, ListTodo, Search, Workflow } from "lucide-react";
import MiniBarChart from "../shared/MiniBarChart";
import PageHeader from "../shared/PageHeader";
import SampleShell from "../shared/SampleShell";
import StatCard from "../shared/StatCard";
import type { SampleAppProps } from "../types";
import { records, reports as initialReports, tasksPerDay, type RecordStatus } from "./data";
import RecordsTable from "./RecordsTable";

const FILTERS: ("All" | RecordStatus)[] = ["All", "Waiting on you", "In progress", "Done"];

export default function OpsDashboardApp({ appName, compact }: SampleAppProps) {
  const [page, setPage] = useState("overview");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [reports, setReports] = useState(initialReports);

  const waiting = records.filter((record) => record.status === "Waiting on you").length;
  const filtered = records.filter(
    (record) =>
      (filter === "All" || record.status === filter) && record.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SampleShell
      appName={appName}
      accentRgb="79 70 229"
      logo={Workflow}
      userName="Mia Clarke"
      compact={compact}
      active={page}
      onNavigate={setPage}
      nav={[
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "tasks", label: "Tasks", icon: ListTodo, badge: waiting },
        { id: "reports", label: "Reports", icon: FileBarChart },
      ]}
    >
      {page === "overview" && (
        <>
          <PageHeader title="Good morning, Mia" subtitle="Here's what the agents handled this week" />
          <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-3"}`}>
            <StatCard label="Tasks completed" value="334" note="92% without anyone stepping in" />
            <StatCard label="Hours saved" value="41 h" note="Based on 7 min per task" />
            <StatCard label="Waiting on you" value={String(waiting)} note="Oldest: 3 hours" />
          </div>
          <div className="mt-4">
            <MiniBarChart title="Tasks completed per day" data={tasksPerDay} />
          </div>
          <h2 className="mb-2 mt-5 text-sm font-semibold">Latest activity</h2>
          <RecordsTable records={records.slice(0, 4)} compact={compact} />
        </>
      )}

      {page === "tasks" && (
        <>
          <PageHeader title="Tasks" subtitle={`${records.length} tasks this week`} />
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label className="flex min-w-[180px] flex-1 items-center gap-2 rounded-md border border-line bg-panel px-3 py-1.5">
              <Search className="h-4 w-4 text-muted" aria-hidden />
              <span className="sr-only">Search tasks</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" className="flex-1 bg-transparent text-sm focus:outline-none" />
            </label>
            <div className="flex flex-wrap gap-1">
              {FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  aria-pressed={filter === option}
                  className={`rounded-full px-2.5 py-1 text-xs ${filter === option ? "bg-accent text-panel" : "bg-panel text-muted ring-1 ring-line"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <RecordsTable records={filtered} compact={compact} />
        </>
      )}

      {page === "reports" && (
        <>
          <PageHeader title="Reports" subtitle="Written and sent by the reporting agent" />
          <ul className="divide-y divide-line rounded-lg border border-line bg-panel">
            {reports.map((report) => (
              <li key={report.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{report.name}</p>
                  <p className="text-xs text-muted">
                    {report.schedule} · to {report.recipients}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={report.enabled}
                  aria-label={`Send ${report.name}`}
                  onClick={() =>
                    setReports((current) => current.map((r) => (r.id === report.id ? { ...r, enabled: !r.enabled } : r)))
                  }
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${report.enabled ? "bg-accent" : "bg-line"}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-panel shadow transition-all ${report.enabled ? "left-[18px]" : "left-0.5"}`} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </SampleShell>
  );
}
