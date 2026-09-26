import { Check, LoaderCircle } from "lucide-react";
import type { ActiveDeploy } from "./useDeploy";

type DeployProgressProps = {
  active: ActiveDeploy;
  elapsed: number;
  developer: boolean;
};

/** Live steps of a running deploy, with streaming logs in Developer view. */
export default function DeployProgress({ active, elapsed, developer }: DeployProgressProps) {
  let offset = 0;
  const states = active.steps.map((step) => {
    const start = offset;
    offset += step.durationMs;
    return { step, start, state: elapsed >= offset ? "done" : elapsed >= start ? "running" : "pending" };
  });
  const fraction = Math.min(1, elapsed / offset);
  const logs = states.flatMap(({ step, start, state }) =>
    state === "pending"
      ? []
      : [
          `▸ ${step.devLabel}`,
          ...step.logs.filter((_, i) => elapsed - start >= ((i + 1) * step.durationMs) / (step.logs.length + 1)),
        ],
  );

  return (
    <div className="rounded-lg border border-accent/40 bg-accent/[0.03] p-4" role="status" aria-live="polite">
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{active.kind === "rollback" ? `Rolling back to v${active.version}` : `Deploying v${active.version} to production`}</span>
        <span className="text-xs text-muted">{Math.round(fraction * 100)}%</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-accent/15">
        <div className="h-1.5 rounded-full bg-accent transition-[width] duration-150" style={{ width: `${fraction * 100}%` }} />
      </div>
      <ol className="mt-3 space-y-1.5">
        {states.map(({ step, state }) => (
          <li key={step.label} className={`flex items-center gap-2 text-xs ${state === "pending" ? "text-muted" : ""}`}>
            {state === "done" ? (
              <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.5} aria-hidden />
            ) : state === "running" ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin text-accent" aria-hidden />
            ) : (
              <span className="h-3.5 w-3.5 rounded-full border border-line" aria-hidden />
            )}
            <span className={developer ? "font-mono text-[11px]" : ""}>{developer ? step.devLabel : step.label}</span>
          </li>
        ))}
      </ol>
      {developer && (
        <pre className="mt-3 max-h-40 overflow-y-auto rounded-md bg-terminal p-3 font-mono text-[11px] leading-5 text-terminal-ink/80">
          {logs.join("\n")}
        </pre>
      )}
    </div>
  );
}
