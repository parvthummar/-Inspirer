import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import { useProject } from "../../api/projects";
import Button from "../../components/Button";
import FullPageLoader from "../../components/FullPageLoader";
import StatusBadge from "../../components/StatusBadge";

/** Workspace entry point. The chat and preview panels are built in Phase 1, step 5. */
export default function WorkspacePage() {
  const { id = "" } = useParams();
  const project = useProject(id);

  if (project.isPending) return <FullPageLoader label="Opening your project" />;

  if (project.isError) {
    const notFound = project.error instanceof ApiError && project.error.status === 404;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm font-medium">{notFound ? "Project not found" : "We couldn't open this project"}</p>
        <p className="max-w-sm text-sm text-muted">{project.error.message}</p>
        <div className="mt-2 flex gap-2">
          {!notFound && (
            <Button variant="secondary" onClick={() => project.refetch()}>
              Try again
            </Button>
          )}
          <Link to="/" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-panel hover:bg-accent/90">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-panel px-4">
        <Link to="/" aria-label="Back to projects" className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>
        <h1 className="truncate text-sm font-semibold">{project.data.name}</h1>
        <StatusBadge status={project.data.status} />
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 p-6">
        <p className="text-xs text-muted">Your request</p>
        <p className="mt-2 rounded-lg border border-line bg-panel p-4 text-sm leading-relaxed">
          {project.data.initial_prompt}
        </p>
      </main>
    </div>
  );
}
