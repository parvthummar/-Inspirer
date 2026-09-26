import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Project } from "../../api/projects";

type GettingStartedProps = {
  projects: Project[];
  onDescribe: () => void;
  onHide: () => void;
};

function hasLiveDeploy(projectId: string): boolean {
  try {
    const raw = localStorage.getItem(`architect.deploy.${projectId}`);
    const state = raw ? (JSON.parse(raw) as { deployments?: { status: string }[] }) : null;
    return Boolean(state?.deployments?.some((deployment) => deployment.status === "live"));
  } catch {
    return false;
  }
}

/** First-steps checklist, ticked off from what the user has actually done. */
export default function GettingStarted({ projects, onDescribe, onHide }: GettingStartedProps) {
  const navigate = useNavigate();
  const latest = projects[0];
  const approved = projects.find((p) => p.template_key);
  const built = projects.find((p) => p.status === "ready");
  const open = (project?: Project) => project && navigate(`/project/${project.id}`);

  const items = [
    { label: "Describe your first app", done: projects.length > 0, action: "Describe it", run: onDescribe },
    { label: "Approve a plan", done: Boolean(approved), action: "Open project", run: () => open(latest) },
    { label: "See your app built", done: Boolean(built), action: "Open project", run: () => open(approved ?? latest) },
    { label: "Look at the code in Developer view", done: projects.some((p) => p.view_mode === "developer"), action: "Open project", run: () => open(built ?? latest) },
    { label: "Deploy to production", done: projects.some((p) => hasLiveDeploy(p.id)), action: "Open project", run: () => open(built ?? latest) },
  ];
  const doneCount = items.filter((item) => item.done).length;
  if (doneCount === items.length) return null;
  const next = items.findIndex((item) => !item.done);

  return (
    <section aria-labelledby="getting-started" className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="getting-started" className="text-sm font-semibold">
            Getting started
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {doneCount} of {items.length} done
          </p>
        </div>
        <button type="button" onClick={onHide} className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted hover:bg-surface hover:text-ink">
          <X className="h-3.5 w-3.5" aria-hidden />
          Hide
        </button>
      </div>
      <div className="mt-3 h-1 rounded-full bg-surface" aria-hidden>
        <div className="h-1 rounded-full bg-success transition-all" style={{ width: `${(doneCount / items.length) * 100}%` }} />
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-5">
        {items.map((item, index) => (
          <li
            key={item.label}
            className={`flex flex-col rounded-lg border p-3 ${index === next ? "border-accent/50 bg-accent/5" : "border-line"}`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                item.done ? "bg-success text-panel" : "border border-line text-muted"
              }`}
            >
              {item.done ? <Check className="h-3 w-3" strokeWidth={3} aria-label="Done" /> : index + 1}
            </span>
            <span className={`mt-2 text-xs ${item.done ? "text-muted line-through" : "font-medium"}`}>{item.label}</span>
            {!item.done && index === next && (
              <button type="button" onClick={item.run} className="mt-2 self-start rounded text-xs font-medium text-accent hover:underline">
                {item.action}
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
