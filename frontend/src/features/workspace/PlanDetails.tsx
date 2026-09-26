import { Bot, Link2, PanelsTopLeft } from "lucide-react";
import type { ViewMode } from "../../api/projects";
import type { PlanContent } from "../../api/plans";
import PlanSection from "./PlanSection";

type PlanDetailsProps = {
  content: PlanContent;
  viewMode: ViewMode;
};

/** Read-only view of a plan: agents, pages and integrations. */
export default function PlanDetails({ content, viewMode }: PlanDetailsProps) {
  const developer = viewMode === "developer";
  const chip = `rounded px-1.5 py-0.5 text-[11px] ${developer ? "bg-ink/[0.05] font-mono text-ink" : "bg-surface text-muted"}`;

  return (
    <>
      <PlanSection title="Agents" count={content.agents.length}>
        <ul className="space-y-3">
          {content.agents.map((agent, index) => (
            <li key={`${index}-${agent.name}`} className="flex gap-2.5">
              <Bot className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-medium">{agent.name}</p>
                <p className="text-sm leading-relaxed text-muted">{agent.role}</p>
                {agent.tools.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <span className="text-[11px] text-muted">{developer ? "Tools:" : "Can:"}</span>
                    {agent.tools.map((tool) => (
                      <span key={tool} className={chip}>
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </PlanSection>

      <PlanSection title="Pages" count={content.pages.length}>
        <ul className="space-y-2">
          {content.pages.map((page, index) => (
            <li key={`${index}-${page.name}`} className="flex gap-2.5">
              <PanelsTopLeft className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
              <p className="min-w-0 text-sm leading-relaxed">
                <span className="font-medium">{page.name}</span>
                {page.purpose && <span className="text-muted"> — {page.purpose}</span>}
              </p>
            </li>
          ))}
        </ul>
      </PlanSection>

      <PlanSection title="Connects to">
        {content.integrations.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {content.integrations.map((integration) => (
              <span
                key={integration}
                className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs"
              >
                <Link2 className="h-3 w-3 text-muted" aria-hidden />
                {integration}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No outside services needed.</p>
        )}
      </PlanSection>

      {developer && (
        <p className="border-t border-line px-4 py-2 font-mono text-[11px] text-muted">
          template: {content.template_key}
        </p>
      )}
    </>
  );
}
