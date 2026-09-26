import { Check, LoaderCircle } from "lucide-react";
import type { ImportStep } from "../../mocks/importFlow";

type ImportProgressProps = {
  steps: ImportStep[];
  /** Index of the step currently running; steps.length when all are done. */
  current: number;
};

export default function ImportProgress({ steps, current }: ImportProgressProps) {
  return (
    <ol className="space-y-3" aria-live="polite">
      {steps.map((step, index) => {
        const done = index < current;
        const running = index === current;
        return (
          <li key={step.label} className="flex items-center gap-3 text-sm">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                done ? "bg-success/10 text-success" : running ? "text-accent" : "border border-line"
              }`}
              aria-hidden
            >
              {done && <Check className="h-3 w-3" strokeWidth={3} />}
              {running && <LoaderCircle className="h-4 w-4 animate-spin" />}
            </span>
            <span className={done ? "text-ink" : running ? "font-medium text-ink" : "text-muted"}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
