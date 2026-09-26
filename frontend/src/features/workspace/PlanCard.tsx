import { useState } from "react";
import { Check, ChevronDown, ClipboardList, MessageSquarePlus, Pencil } from "lucide-react";
import { useApprovePlan, type Plan } from "../../api/plans";
import type { Project } from "../../api/projects";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import { useToast } from "../../components/toast-context";
import PlanChangeRequest from "./PlanChangeRequest";
import PlanDetails from "./PlanDetails";
import PlanEditor from "./PlanEditor";

type PlanCardProps = {
  plan: Plan;
  project: Project;
};

type Mode = "view" | "edit" | "changes";

export default function PlanCard({ plan, project }: PlanCardProps) {
  const [mode, setMode] = useState<Mode>("view");
  const [expanded, setExpanded] = useState(false);
  const approvePlan = useApprovePlan(project.id);
  const toast = useToast();

  const actionable = plan.status === "proposed" && project.status === "draft";

  // An older version of the plan: collapsed, can be opened to compare.
  if (plan.status === "revised") {
    return (
      <div className="mt-3 rounded-lg border border-dashed border-line">
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-muted hover:text-ink"
        >
          <ClipboardList className="h-3.5 w-3.5" aria-hidden />
          Earlier version of the plan, replaced by a newer one
          <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden />
        </button>
        {expanded && (
          <div className="opacity-70">
            <p className="border-t border-line px-4 py-3 text-sm leading-relaxed">{plan.content.summary}</p>
            <PlanDetails content={plan.content} viewMode={project.view_mode} />
          </div>
        )}
      </div>
    );
  }

  function approve() {
    approvePlan.mutate(undefined, { onSuccess: () => toast("Plan approved") });
  }

  return (
    <article
      aria-label="Plan"
      className={`mt-3 overflow-hidden rounded-xl border bg-panel shadow-[0_1px_2px_rgba(22,32,42,0.04),0_4px_16px_rgba(22,32,42,0.05)] ${
        plan.status === "approved" ? "border-success/40" : "border-line"
      }`}
    >
      <header className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <ClipboardList className="h-4 w-4 text-accent" aria-hidden />
          {mode === "edit" ? "Edit plan" : "Plan"}
        </h3>
        {plan.status === "approved" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
            Approved
          </span>
        ) : (
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">Waiting for you</span>
        )}
      </header>

      {mode === "edit" ? (
        <PlanEditor projectId={project.id} content={plan.content} onDone={() => setMode("view")} />
      ) : (
        <>
          <p className="px-4 pb-3 text-sm leading-relaxed">{plan.content.summary}</p>
          <PlanDetails content={plan.content} viewMode={project.view_mode} />

          {actionable && mode === "changes" && (
            <PlanChangeRequest projectId={project.id} onCancel={() => setMode("view")} />
          )}

          {actionable && mode === "view" && (
            <footer className="border-t border-line bg-surface/60 px-4 py-3">
              {approvePlan.isError && (
                <div className="mb-3">
                  <Alert>{approvePlan.error.message}</Alert>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={approve} loading={approvePlan.isPending} className="px-3 py-1.5">
                  {approvePlan.isPending ? "Approving plan" : "Approve plan"}
                </Button>
                <Button variant="secondary" onClick={() => setMode("edit")} disabled={approvePlan.isPending} className="px-3 py-1.5">
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  Edit plan
                </Button>
                <Button variant="ghost" onClick={() => setMode("changes")} disabled={approvePlan.isPending} className="px-3 py-1.5">
                  <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden />
                  Ask for changes
                </Button>
              </div>
            </footer>
          )}
        </>
      )}
    </article>
  );
}
