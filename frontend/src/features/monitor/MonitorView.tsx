import { useEffect, useMemo, useState } from "react";
import { Activity } from "lucide-react";
import type { Plan } from "../../api/plans";
import type { Project } from "../../api/projects";
import MiniBarChart from "../../components/MiniBarChart";
import PanelEmptyState from "../../components/PanelEmptyState";
import { formatRelativeTime } from "../../lib/time";
import { generateHistory, generateRun, type AgentRun } from "../../mocks/monitorData";
import MonitorStats from "./MonitorStats";
import RunDetail from "./RunDetail";
import RunOutcomePill from "./RunOutcomePill";

type MonitorViewProps = {
  project: Project;
  plan: Plan | null;
};

type Filter = "all" | "attention";
const NEW_RUN_EVERY_MS = 9000;
const HOUR = 3_600_000;

/** How the live agents are doing: every conversation, failures to fix, and a trace of each run. */
export default function MonitorView({ project, plan }: MonitorViewProps) {
  const [range, setRange] = useState<24 | 168>(24);
  const [filter, setFilter] = useState<Filter>("all");
  const [agent, setAgent] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fixedIds, setFixedIds] = useState<Set<string>>(new Set());
  const [live, setLive] = useState<AgentRun[]>([]);
  const [openedAt] = useState(() => Date.now());

  const content = plan?.content;
  const history = useMemo(
    () => (content ? generateHistory(content, project.id, openedAt, range) : []),
    [content, project.id, openedAt, range],
  );

  // New conversations keep arriving while the tab is open.
  useEffect(() => {
    if (!content || project.status !== "ready") return;
    let seed = 1;
    const timer = window.setInterval(() => {
      seed += 1;
      setLive((current) => [generateRun(content, openedAt + seed * 104729, Date.now()), ...current]);
    }, NEW_RUN_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [content, project.status, openedAt]);

  if (!content || project.status !== "ready") {
    return (
      <PanelEmptyState
        icon={Activity}
        title="Nothing to monitor yet"
        body="Once your app is built and people start using it, every conversation your agents handle shows up here, with anything that needs your attention."
      />
    );
  }

  const runs = [...live, ...history];
  const shown = runs.filter(
    (run) =>
      (agent === "all" || run.agent === agent) &&
      (filter === "all" || (run.outcome !== "resolved" && !fixedIds.has(run.id))),
  );
  const selected = shown.find((run) => run.id === selectedId) ?? shown[0];
  const developer = project.view_mode === "developer";
  const attentionCount = runs.filter((run) => run.outcome !== "resolved" && !fixedIds.has(run.id)).length;

  const buckets = range === 24 ? 12 : 7;
  const bucketMs = (range * HOUR) / buckets;
  const perBucket = Array.from({ length: buckets }, (_, i) => {
    const end = openedAt - (buckets - 1 - i) * bucketMs;
    const label =
      range === 24
        ? new Date(end).toLocaleTimeString("en", { hour: "numeric" })
        : new Date(end).toLocaleDateString("en", { weekday: "short" });
    return { label, value: runs.filter((run) => run.at > end - bucketMs && run.at <= end).length };
  });

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line bg-panel px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" aria-hidden />
          Live
        </span>
        <div role="radiogroup" aria-label="Show" className="ml-2 flex rounded-md bg-surface p-0.5">
          {(
            [
              ["all", "All"],
              ["attention", `Needs attention (${attentionCount})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={filter === id}
              onClick={() => setFilter(id)}
              className={`rounded px-2 py-0.5 text-[11px] font-medium ${filter === id ? "bg-panel shadow-sm" : "text-muted"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="ml-auto flex items-center gap-1.5 text-[11px] text-muted">
          Agent
          <select value={agent} onChange={(e) => setAgent(e.target.value)} className="rounded border border-line bg-panel px-1.5 py-0.5 text-[11px] text-ink">
            <option value="all">All agents</option>
            {content.agents.map((a) => (
              <option key={a.name}>{a.name}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-muted">
          Period
          <select value={range} onChange={(e) => setRange(Number(e.target.value) as 24 | 168)} className="rounded border border-line bg-panel px-1.5 py-0.5 text-[11px] text-ink">
            <option value={24}>Last 24 hours</option>
            <option value={168}>Last 7 days</option>
          </select>
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-3 p-3">
          <MonitorStats runs={runs} developer={developer} />
          <MiniBarChart title={range === 24 ? "Conversations, last 24 hours" : "Conversations, last 7 days"} data={perBucket} height={72} />
          <div className="grid min-h-[360px] grid-cols-[minmax(0,2fr)_minmax(0,3fr)] overflow-hidden rounded-lg border border-line bg-panel">
            <ul className="max-h-[520px] divide-y divide-line overflow-y-auto border-r border-line" aria-label="Conversations">
              {shown.map((run) => (
                <li key={run.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(run.id)}
                    aria-current={selected?.id === run.id ? "true" : undefined}
                    className={`w-full px-3 py-2.5 text-left ${selected?.id === run.id ? "bg-accent/5" : "hover:bg-surface"}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{run.customer}</span>
                      <RunOutcomePill outcome={run.outcome} fixed={fixedIds.has(run.id)} />
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">{run.conversation[0].text}</span>
                    <span className="mt-0.5 block text-[11px] text-muted">
                      {run.agent} · {formatRelativeTime(new Date(run.at).toISOString()).toLowerCase()}
                    </span>
                  </button>
                </li>
              ))}
              {shown.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-muted">
                  {filter === "attention" ? "Nothing needs your attention. Nice." : "No conversations for this agent yet."}
                </li>
              )}
            </ul>
            <div className="min-w-0 overflow-y-auto">
              {selected ? (
                <RunDetail
                  key={selected.id}
                  run={selected}
                  fixed={fixedIds.has(selected.id)}
                  developer={developer}
                  onFixed={() => setFixedIds((current) => new Set(current).add(selected.id))}
                />
              ) : (
                <p className="p-6 text-sm text-muted">Pick a conversation to see what happened.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
