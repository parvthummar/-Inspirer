import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { COMPANIES, PEOPLE, hash, singular } from "./siteContent";

type Row = { id: string; title: string; owner: string; status: "Open" | "In progress" | "Done"; updated: string };

const STATUSES: Row["status"][] = ["Open", "In progress", "Done"];
const UPDATED = ["2 min ago", "18 min ago", "1 hr ago", "3 hr ago", "Yesterday", "2 days ago"];
const tone = { Open: "bg-accent/10 text-accent", "In progress": "bg-surface text-ink", Done: "bg-success/10 text-success" };

function exampleRows(pageName: string): Row[] {
  const noun = singular(pageName);
  const seed = hash(pageName);
  return Array.from({ length: 6 }, (_, i) => ({
    id: `r${i}`,
    title: i % 2 === 0 ? `${noun} for ${COMPANIES[(seed + i) % COMPANIES.length]}` : `${noun} #${1040 + ((seed + i * 7) % 60)}`,
    owner: PEOPLE[(seed + i * 3) % PEOPLE.length],
    status: STATUSES[(seed + i) % STATUSES.length],
    updated: UPDATED[i % UPDATED.length],
  }));
}

export default function PageList({ name, compact }: { name: string; compact: boolean }) {
  const [rows, setRows] = useState(() => exampleRows(name));
  const [query, setQuery] = useState("");
  const noun = singular(name);
  const shown = rows.filter((row) => row.title.toLowerCase().includes(query.toLowerCase()));

  function addRow() {
    setRows((current) => [
      { id: `n${Date.now()}`, title: `New ${noun.toLowerCase()}`, owner: "You", status: "Open", updated: "Just now" },
      ...current,
    ]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-[180px] flex-1 items-center gap-2 rounded-md border border-line bg-panel px-3 py-1.5">
          <Search className="h-4 w-4 text-muted" aria-hidden />
          <span className="sr-only">Search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${name.toLowerCase()}`} className="flex-1 bg-transparent text-sm focus:outline-none" />
        </label>
        <button type="button" onClick={addRow} className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-on-accent">
          <Plus className="h-4 w-4" aria-hidden />
          New {noun.toLowerCase()}
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border border-line bg-panel">
        {compact ? (
          <ul className="divide-y divide-line">
            {shown.map((row) => (
              <li key={row.id} className="px-3 py-2.5">
                <p className="text-sm font-medium">{row.title}</p>
                <p className="mt-0.5 flex items-center justify-between text-xs text-muted">
                  {row.owner} · {row.updated}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tone[row.status]}`}>{row.status}</span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface/60 text-xs text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">{noun}</th>
                <th className="px-4 py-2 font-medium">Owner</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map((row) => (
                <tr key={row.id} className="hover:bg-surface/50">
                  <td className="px-4 py-2.5 font-medium">{row.title}</td>
                  <td className="px-4 py-2.5 text-muted">{row.owner}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone[row.status]}`}>{row.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted">{row.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {shown.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted">Nothing matches "{query}".</p>}
      </div>
    </div>
  );
}
