import { useMemo, useState } from "react";
import { useBuild } from "../../api/build";
import type { Project } from "../../api/projects";
import { commitHistory } from "./commits";
import GitHubDialog from "./GitHubDialog";
import GitHubMark from "./GitHubMark";
import { useGitHub } from "./githubStore";
import { syncStatus } from "./syncStatus";

/** Header button: shows whether the project is on GitHub and in sync, and opens the GitHub dialog. */
export default function GitHubButton({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const { repo } = useGitHub(project.id);
  const build = useBuild(project.id, ["building", "ready", "error"].includes(project.status));

  const status = useMemo(
    () => (repo ? syncStatus(repo, commitHistory(project.name, repo, build.data)) : null),
    [repo, project.name, build.data],
  );

  const dot = !status ? null : status.kind === "up_to_date" ? "bg-success" : "bg-accent";
  const label = !repo
    ? "Connect GitHub"
    : status?.kind === "behind"
      ? "GitHub: changes to pull"
      : status?.kind === "ahead"
        ? "GitHub: changes to push"
        : `GitHub: ${repo.owner}/${repo.name}, up to date`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        title={label}
        className="relative flex h-8 items-center gap-1.5 rounded-md border border-line px-2.5 text-xs font-medium text-ink hover:bg-surface"
      >
        <GitHubMark className="h-4 w-4" />
        <span className="hidden xl:inline">{repo ? repo.name : "GitHub"}</span>
        {dot && <span className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-panel ${dot}`} aria-hidden />}
      </button>
      {open && <GitHubDialog project={project} build={build.data} onClose={() => setOpen(false)} />}
    </>
  );
}
