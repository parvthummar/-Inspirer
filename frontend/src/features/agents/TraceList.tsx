import { Check, LoaderCircle, X } from "lucide-react";
import type { TraceStep } from "./playgroundScript";

type TraceListProps = {
  steps: TraceStep[];
  running: boolean;
  developer: boolean;
};

/** The steps an agent took. Simple view: plain labels. Developer view: calls, results, timings and tokens. */
export default function TraceList({ steps, running, developer }: TraceListProps) {
  const totalMs = steps.reduce((sum, step) => sum + step.durationMs, 0);
  const totalTokens = steps.reduce((sum, step) => sum + step.tokens, 0);

  return (
    <div className="rounded-lg bg-surface/70 p-2.5">
      <ol className="space-y-1.5">
        {steps.map((step, index) => (
          <li key={index} className="text-xs">
            <div className="flex items-center gap-1.5">
              {step.failed ? (
                <X className="h-3.5 w-3.5 shrink-0 text-danger" strokeWidth={2.5} aria-label="Failed" />
              ) : (
                <Check className="h-3.5 w-3.5 shrink-0 text-success" strokeWidth={2.5} aria-hidden />
              )}
              <span className={`${developer ? "font-mono text-[11px]" : ""} ${step.failed ? "text-danger" : ""}`}>
                {developer ? step.call : step.label}
              </span>
              {developer && <span className="ml-auto shrink-0 font-mono text-[10px] text-muted">{step.durationMs}ms</span>}
            </div>
            {developer && <p className="ml-5 font-mono text-[10px] text-muted">→ {step.result}</p>}
          </li>
        ))}
        {running && (
          <li className="flex items-center gap-1.5 text-xs text-muted">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin text-accent" aria-hidden />
            Working
          </li>
        )}
      </ol>
      {developer && !running && steps.length > 0 && (
        <p className="mt-2 border-t border-line pt-1.5 font-mono text-[10px] text-muted">
          {steps.length} steps · {(totalMs / 1000).toFixed(2)}s · {totalTokens} tokens
        </p>
      )}
    </div>
  );
}
