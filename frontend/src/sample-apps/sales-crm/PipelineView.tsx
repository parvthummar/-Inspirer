import PageHeader from "../shared/PageHeader";
import { STAGES, type Lead } from "./data";
import ScoreBadge from "./ScoreBadge";

export default function PipelineView({ leads, compact }: { leads: Lead[]; compact: boolean }) {
  return (
    <>
      <PageHeader title="Pipeline" subtitle={`${leads.length} leads across ${STAGES.length} stages`} />
      <div className={compact ? "space-y-3" : "grid grid-cols-4 gap-3"}>
        {STAGES.map((stage) => {
          const inStage = leads.filter((lead) => lead.stage === stage);
          return (
            <section key={stage} className="rounded-lg bg-panel/60 p-2 ring-1 ring-line">
              <h2 className="flex items-center justify-between px-1 pb-2 text-xs font-semibold">
                {stage}
                <span className="font-normal text-muted">{inStage.length}</span>
              </h2>
              <ul className="space-y-2">
                {inStage.map((lead) => (
                  <li key={lead.id} className="rounded-md border border-line bg-panel p-2.5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate text-sm font-medium">{lead.company}</p>
                      <ScoreBadge score={lead.score} />
                    </div>
                    <p className="truncate text-xs text-muted">{lead.name}</p>
                  </li>
                ))}
                {inStage.length === 0 && <li className="px-1 py-3 text-center text-[11px] text-muted">No leads here yet</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
