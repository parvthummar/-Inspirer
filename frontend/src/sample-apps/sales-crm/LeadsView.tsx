import { useState } from "react";
import { ArrowLeft, Bot, Send } from "lucide-react";
import PageHeader from "../shared/PageHeader";
import Pill from "../shared/Pill";
import type { Lead } from "./data";
import ScoreBadge from "./ScoreBadge";

type LeadsViewProps = {
  leads: Lead[];
  onSend: (id: string) => void;
  compact: boolean;
};

export default function LeadsView({ leads, onSend, compact }: LeadsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sorted = [...leads].sort((a, b) => b.score - a.score);
  const selected = leads.find((lead) => lead.id === selectedId);

  if (selected) {
    const canSend = selected.stage === "New" && selected.draft;
    return (
      <>
        <button type="button" onClick={() => setSelectedId(null)} className="mb-3 inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          All leads
        </button>
        <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"}`}>
          <section className="rounded-lg border border-line bg-panel p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-base font-semibold">{selected.name}</p>
                <p className="text-xs text-muted">
                  {selected.title}, {selected.company}
                </p>
              </div>
              <ScoreBadge score={selected.score} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-muted">Industry</dt>
                <dd className="font-medium">{selected.industry}</dd>
              </div>
              <div>
                <dt className="text-muted">Employees</dt>
                <dd className="font-medium">{selected.employees}</dd>
              </div>
              <div>
                <dt className="text-muted">Source</dt>
                <dd className="font-medium">{selected.source}</dd>
              </div>
              <div>
                <dt className="text-muted">Stage</dt>
                <dd className="font-medium">{selected.stage}</dd>
              </div>
            </dl>
            <p className="mt-4 flex gap-1.5 rounded-md bg-accent/5 p-2.5 text-xs leading-relaxed">
              <Bot className="mt-px h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
              {selected.research}
            </p>
          </section>
          <section className="rounded-lg border border-line bg-panel p-4">
            <p className="text-sm font-semibold">Drafted first email</p>
            {selected.draft ? (
              <pre className="mt-2 whitespace-pre-wrap rounded-md bg-surface p-3 font-sans text-sm leading-relaxed">{selected.draft}</pre>
            ) : (
              <p className="mt-2 text-sm text-muted">No email needed. This lead is already a customer.</p>
            )}
            {canSend ? (
              <button
                type="button"
                onClick={() => onSend(selected.id)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-on-accent"
              >
                <Send className="h-3.5 w-3.5" aria-hidden />
                Send email
              </button>
            ) : (
              selected.stage === "Contacted" && <p className="mt-3 text-xs text-success">Email sent. Moved to Contacted.</p>
            )}
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Leads" subtitle="Scored by the qualifier agent, highest first" />
      <div className="overflow-hidden rounded-lg border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface/60 text-[11px] text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Score</th>
              <th className="px-3 py-2 font-medium">Lead</th>
              {!compact && <th className="px-3 py-2 font-medium">Source</th>}
              <th className="px-3 py-2 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sorted.map((lead) => (
              <tr key={lead.id} onClick={() => setSelectedId(lead.id)} className="cursor-pointer hover:bg-surface/60">
                <td className="px-3 py-2.5">
                  <ScoreBadge score={lead.score} />
                </td>
                <td className="px-3 py-2.5">
                  <button type="button" onClick={() => setSelectedId(lead.id)} className="text-left">
                    <span className="block font-medium">{lead.name}</span>
                    <span className="block text-xs text-muted">{lead.company}</span>
                  </button>
                </td>
                {!compact && <td className="px-3 py-2.5 text-xs text-muted">{lead.source}</td>}
                <td className="px-3 py-2.5">
                  <Pill tone={lead.stage === "Won" ? "success" : lead.stage === "New" ? "accent" : "neutral"}>{lead.stage}</Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
