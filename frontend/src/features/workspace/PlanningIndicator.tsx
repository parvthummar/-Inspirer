import { useEffect, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { useRequestPlan } from "../../api/plans";
import Button from "../../components/Button";
import ArchitectAvatar from "./ArchitectAvatar";

const FIRST_PLAN_STEPS = [
  "Reading your request",
  "Choosing the agents",
  "Sketching the pages",
  "Checking which services to connect",
  "Writing up the plan",
];
const REVISION_STEPS = ["Reading your feedback", "Updating the agents and pages", "Writing up the new plan"];

const STEP_MS = 1800;
const SLOW_AFTER_MS = 60_000;

type PlanningIndicatorProps = {
  projectId: string;
  revising: boolean;
};

/** Shown in the chat while Architect writes the plan, so the wait explains itself. */
export default function PlanningIndicator({ projectId, revising }: PlanningIndicatorProps) {
  const steps = revising ? REVISION_STEPS : FIRST_PLAN_STEPS;
  const [elapsed, setElapsed] = useState(0);
  const requestPlan = useRequestPlan(projectId);

  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed(Date.now() - started), 300);
    return () => window.clearInterval(timer);
  }, []);

  // Walk through the steps, then stay on the last one until the plan arrives.
  const current = Math.min(Math.floor(elapsed / STEP_MS), steps.length - 1);
  const slow = elapsed > SLOW_AFTER_MS;

  return (
    <li className="flex gap-3" role="status" aria-live="polite">
      <ArchitectAvatar />
      <div className="min-w-0 flex-1 pt-0.5">
        <span className="text-xs font-semibold">Architect</span>
        <div className="mt-2 rounded-xl border border-line p-3">
          <p className="text-sm font-medium">{revising ? "Updating the plan" : "Drafting a plan"}</p>
          <ol className="mt-2.5 space-y-2">
            {steps.map((step, index) => (
              <li
                key={step}
                className={`flex items-center gap-2 text-xs transition-opacity ${index > current ? "opacity-40" : ""}`}
              >
                {index < current ? (
                  <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.5} aria-hidden />
                ) : index === current ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin text-accent" aria-hidden />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-line" aria-hidden />
                )}
                {step}
              </li>
            ))}
          </ol>
          {slow && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <p className="flex-1 text-xs text-muted">This is taking longer than usual.</p>
              <Button
                variant="secondary"
                onClick={() => requestPlan.mutate(undefined)}
                loading={requestPlan.isPending}
                className="px-2.5 py-1 text-xs"
              >
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
