import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useMe } from "../../api/auth";
import type { Project } from "../../api/projects";
import AccountMenu from "../../components/AccountMenu";
import StatusBadge from "../../components/StatusBadge";
import DeployButton from "../deploy/DeployButton";
import GitHubButton from "../github/GitHubButton";
import ShareButton from "../team/ShareButton";
import ProjectNameEditor from "./ProjectNameEditor";
import ViewModeToggle from "./ViewModeToggle";

export default function WorkspaceHeader({ project }: { project: Project }) {
  const me = useMe();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-panel px-3">
      <Link
        to="/"
        aria-label="Back to projects"
        title="Back to projects"
        className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </Link>
      <div className="h-5 w-px bg-line" aria-hidden />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <ProjectNameEditor key={project.name} project={project} />
        <StatusBadge status={project.status} />
      </div>
      <ViewModeToggle project={project} />
      <ShareButton project={project} />
      <GitHubButton project={project} />
      <DeployButton project={project} />
      {me.data && <AccountMenu user={me.data} />}
    </header>
  );
}
