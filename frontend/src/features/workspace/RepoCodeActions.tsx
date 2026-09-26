import { Download, ExternalLink, RefreshCw } from "lucide-react";
import { usePullLatest } from "../../api/github";
import type { ProjectSource } from "../../api/projects";
import Button from "../../components/Button";
import { useToast } from "../../components/toast-context";

type RepoCodeActionsProps = {
  projectId: string;
  repo: ProjectSource;
};

function describe(added: number, removed: number, changed: number): string {
  const parts = [
    added && `${added} new ${added === 1 ? "file" : "files"}`,
    removed && `${removed} removed`,
    changed && `${changed} changed`,
  ].filter(Boolean);
  return parts.length ? `Pulled from GitHub: ${parts.join(", ")}` : "Already up to date with GitHub";
}

/** Code tab actions for imported repositories: download from GitHub, pull the latest version, open on GitHub. */
export default function RepoCodeActions({ projectId, repo }: RepoCodeActionsProps) {
  const pull = usePullLatest(projectId);
  const toast = useToast();
  const archive = `https://github.com/${repo.owner}/${repo.name}/archive/refs/heads/${encodeURIComponent(repo.branch)}.zip`;

  return (
    <>
      <a
        href={archive}
        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-1 text-xs font-medium text-ink hover:bg-surface"
        title={`Download the ${repo.branch} branch as a .zip from GitHub`}
      >
        <Download className="h-3.5 w-3.5" aria-hidden />
        Download code
      </a>
      <Button
        variant="secondary"
        onClick={() => pull.mutate(undefined, { onSuccess: (r) => toast(describe(r.added, r.removed, r.changed)) })}
        loading={pull.isPending}
        className="px-2.5 py-1 text-xs"
      >
        {!pull.isPending && <RefreshCw className="h-3.5 w-3.5" aria-hidden />}
        {pull.isPending ? "Pulling from GitHub" : "Pull latest"}
      </Button>
      <a
        href={repo.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface hover:text-ink"
      >
        Open on GitHub
        <ExternalLink className="h-3 w-3" aria-hidden />
      </a>
      <span className="ml-auto text-[11px] text-muted" title="Pushing changes back needs you to sign in with GitHub, which isn't part of this prototype.">
        {pull.isError ? <span className="text-danger">{pull.error.message}</span> : "Read-only copy · pushing changes needs GitHub sign-in"}
      </span>
    </>
  );
}
