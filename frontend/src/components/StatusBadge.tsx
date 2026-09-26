import type { ProjectStatus } from "../api/projects";

const styles: Record<ProjectStatus, { label: string; className: string; dot: string }> = {
  draft: { label: "Draft", className: "bg-surface text-muted", dot: "bg-muted" },
  planning: { label: "Planning", className: "bg-accent/10 text-accent", dot: "bg-accent" },
  building: { label: "Building", className: "bg-accent/10 text-accent", dot: "bg-accent animate-pulse" },
  ready: { label: "Ready", className: "bg-success/10 text-success", dot: "bg-success" },
  error: { label: "Needs attention", className: "bg-danger/10 text-danger", dot: "bg-danger" },
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const style = styles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${style.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden />
      {style.label}
    </span>
  );
}
