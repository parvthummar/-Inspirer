import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import type { MessageStep } from "../../api/messages";

/** The list of actions shown under an assistant message ("Created login page", ...). */
export default function MessageSteps({ steps, mono = false }: { steps: MessageStep[]; mono?: boolean }) {
  return (
    <ul className="mt-3 space-y-1.5 rounded-lg border border-line bg-surface/60 p-3">
      {steps.map((step, index) => (
        <li key={`${index}-${step.label}`} className="flex items-center gap-2 text-xs">
          {step.status === "pending" ? (
            <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-line" aria-hidden />
          ) : step.status === "running" ? (
            <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin text-accent" aria-hidden />
          ) : step.status === "failed" ? (
            <CircleAlert className="h-3.5 w-3.5 shrink-0 text-danger" aria-hidden />
          ) : (
            <Check className="h-3.5 w-3.5 shrink-0 text-success" strokeWidth={2.5} aria-hidden />
          )}
          <span
            className={`${step.status === "failed" ? "text-danger" : step.status === "pending" ? "text-muted" : "text-ink"} ${
              mono ? "font-mono text-[11px]" : ""
            }`}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
