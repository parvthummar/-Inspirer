import type { AgentRun } from "../../mocks/monitorData";

type MonitorStatsProps = {
  runs: AgentRun[];
  developer: boolean;
};

export default function MonitorStats({ runs, developer }: MonitorStatsProps) {
  const total = runs.length;
  const resolved = runs.filter((run) => run.outcome === "resolved").length;
  const handedOff = runs.filter((run) => run.outcome === "handed_off").length;
  const failed = runs.filter((run) => run.outcome === "failed").length;
  const avgMs = total
    ? runs.reduce((sum, run) => sum + run.steps.filter((s) => !s.failed).reduce((s, step) => s + step.durationMs, 0), 0) / total
    : 0;

  const tiles = [
    { label: "Conversations", value: String(total) },
    { label: "Handled automatically", value: total ? `${Math.round((resolved / total) * 100)}%` : "–" },
    { label: "Handed to your team", value: String(handedOff) },
    { label: "Failed", value: String(failed), alert: failed > 0 },
    ...(developer ? [{ label: "Average run time", value: `${(avgMs / 1000).toFixed(1)}s` }] : []),
  ];

  return (
    <dl className={`grid gap-2 ${developer ? "grid-cols-5" : "grid-cols-4"}`}>
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-lg border border-line bg-panel px-3 py-2.5">
          <dt className="truncate text-[11px] text-muted">{tile.label}</dt>
          <dd className={`mt-0.5 text-lg font-semibold ${tile.alert ? "text-danger" : ""}`}>{tile.value}</dd>
        </div>
      ))}
    </dl>
  );
}
