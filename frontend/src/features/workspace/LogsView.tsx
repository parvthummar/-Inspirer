import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollText, Search } from "lucide-react";
import type { Plan } from "../../api/plans";
import type { Project } from "../../api/projects";
import DemoBadge from "../../components/DemoBadge";
import PanelEmptyState from "../../components/PanelEmptyState";
import { buildLogLines, runtimeEvents, type LogLevel, type LogLine, type LogSource } from "./logLines";
import type { BuildProgress } from "./useBuildProgress";

type LogsViewProps = {
  project: Project;
  plan: Plan | null;
  progress: BuildProgress | null;
};

const RUNTIME_EVERY_MS = 2600;
const MAX_RUNTIME_LINES = 200;

const levelClass: Record<LogLevel, string> = {
  info: "text-terminal-ink/75",
  step: "text-terminal-ink font-semibold",
  success: "text-success",
  warn: "text-danger",
};

const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export default function LogsView({ project, plan, progress }: LogsViewProps) {
  const [source, setSource] = useState<"all" | LogSource>("all");
  const [query, setQuery] = useState("");
  const [follow, setFollow] = useState(true);
  const [runtime, setRuntime] = useState<LogLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const build = progress?.build;
  const buildLines = useMemo(() => (build ? buildLogLines(build) : []), [build]);
  const ready = project.status === "ready";

  // The running preview keeps producing logs while this tab is open.
  useEffect(() => {
    if (!ready || !plan) return;
    const events = runtimeEvents(plan.content);
    let index = 0;
    const timer = window.setInterval(() => {
      const event = events[index % events.length];
      index += 1;
      setRuntime((current) =>
        [...current, { ...event, id: `r${Date.now()}`, at: Date.now(), source: "runtime" as const }].slice(-MAX_RUNTIME_LINES),
      );
    }, RUNTIME_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [ready, plan]);

  // Build lines appear as the build reaches them.
  const buildStart = build ? new Date(build.started_at).getTime() : 0;
  const visibleBuild = progress ? buildLines.filter((line) => line.at - buildStart <= progress.elapsedMs) : [];
  const lines = [...visibleBuild, ...runtime].filter(
    (line) => (source === "all" || line.source === source) && line.text.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (follow) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [follow, lines.length]);

  if (!progress) {
    return (
      <PanelEmptyState
        icon={ScrollText}
        title="No logs yet"
        body="Build and runtime logs appear here once Architect starts building your app. Approve the plan in the chat to start."
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-terminal text-terminal-ink">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-terminal-ink/10 px-3 py-2">
        <div role="radiogroup" aria-label="Log source" className="flex rounded-md bg-terminal-ink/10 p-0.5">
          {(["all", "build", "runtime"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={source === option}
              onClick={() => setSource(option)}
              className={`rounded px-2 py-0.5 text-[11px] font-medium capitalize ${source === option ? "bg-terminal-ink text-terminal" : "text-terminal-ink/70 hover:text-terminal-ink"}`}
            >
              {option}
            </button>
          ))}
        </div>
        <label className="flex min-w-[140px] flex-1 items-center gap-1.5 rounded-md bg-terminal-ink/10 px-2 py-1">
          <Search className="h-3.5 w-3.5 text-terminal-ink/50" aria-hidden />
          <span className="sr-only">Filter logs</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter logs"
            className="flex-1 bg-transparent font-mono text-[11px] text-terminal-ink placeholder:text-terminal-ink/40 focus:outline-none"
          />
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-terminal-ink/70">
          <input type="checkbox" checked={follow} onChange={(event) => setFollow(event.target.checked)} className="accent-[rgb(var(--accent-rgb))]" />
          Follow
        </label>
        <span className="flex items-center gap-1.5 text-[11px] text-terminal-ink/60">
          <span className={`h-1.5 w-1.5 rounded-full ${ready ? "animate-pulse bg-success" : "bg-accent"}`} aria-hidden />
          {ready ? "Live" : project.status === "building" ? "Building" : "Stopped"}
        </span>
        <span className="rounded-full bg-panel px-0.5">
          <DemoBadge label="Simulated" align="end" explanation="Build and runtime logs are generated from your build steps and plan in this prototype." />
        </span>
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto py-2 font-mono text-[11px] leading-5" role="log" aria-live="off">
        {lines.map((line) => (
          <div key={line.id} className="flex gap-3 px-3 hover:bg-terminal-ink/5">
            <span className="shrink-0 text-terminal-ink/40">{time.format(line.at)}</span>
            <span className="w-14 shrink-0 text-terminal-ink/40">{line.source}</span>
            <span className={`min-w-0 break-words ${levelClass[line.level]}`}>
              {line.level === "step" ? "▸ " : line.level === "success" ? "✓ " : line.level === "warn" ? "! " : ""}
              {line.text}
            </span>
          </div>
        ))}
        {lines.length === 0 && <p className="px-3 text-terminal-ink/50">No log lines match your filter.</p>}
      </div>
    </div>
  );
}
