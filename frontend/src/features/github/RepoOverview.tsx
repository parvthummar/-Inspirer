import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, CircleCheck, GitBranch, GitCommitHorizontal, Globe, LoaderCircle, Lock } from "lucide-react";
import Button from "../../components/Button";
import { useToast } from "../../components/toast-context";
import { formatRelativeTime } from "../../lib/time";
import { remoteCommit } from "../../mocks/githubRepos";
import type { Commit } from "./commits";
import type { LinkedRepo } from "./githubStore";
import { syncStatus } from "./syncStatus";

type RepoOverviewProps = {
  repo: LinkedRepo;
  commits: Commit[];
  developer: boolean;
  onChange: (repo: LinkedRepo) => void;
  onDisconnect: () => void;
};

const SYNC_MS = 1300;

export default function RepoOverview({ repo, commits, developer, onChange, onDisconnect }: RepoOverviewProps) {
  const [syncing, setSyncing] = useState(false);
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);
  const toast = useToast();
  const status = syncStatus(repo, commits);
  const full = `${repo.owner}/${repo.name}`;

  function sync() {
    setSyncing(true);
    window.setTimeout(() => {
      const now = new Date().toISOString();
      const pulled = Array.from({ length: repo.remoteCommits }, (_, i) => ({
        sha: `f3${(Date.now() + i).toString(16).slice(-5)}`,
        message: remoteCommit.message,
        author: remoteCommit.author,
        at: new Date(Date.now() - 60_000 * (i + 5)).toISOString(),
      }));
      onChange({ ...repo, remoteCommits: 0, lastSyncedAt: now, pulled: [...repo.pulled, ...pulled] });
      setSyncing(false);
      toast(status.kind === "behind" ? "Changes pulled from GitHub" : status.kind === "ahead" ? "Changes pushed to GitHub" : "Synced with GitHub");
    }, SYNC_MS);
  }

  const statusLine =
    status.kind === "behind"
      ? { icon: ArrowDownToLine, tone: "text-accent", text: `${status.count} new ${status.count === 1 ? "change" : "changes"} on GitHub`, action: "Pull changes" }
      : status.kind === "ahead"
        ? { icon: ArrowUpFromLine, tone: "text-accent", text: `${status.count} ${status.count === 1 ? "change" : "changes"} not pushed yet`, action: "Push changes" }
        : { icon: CircleCheck, tone: "text-success", text: `Up to date · synced ${formatRelativeTime(repo.lastSyncedAt).toLowerCase()}`, action: "Sync now" };

  if (confirmingDisconnect) {
    return (
      <div>
        <p className="text-sm leading-relaxed text-muted">
          Architect will stop syncing with <span className="font-mono text-xs text-ink">{full}</span>. The repository and its
          code stay on GitHub, and you can connect again at any time.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmingDisconnect(false)} data-autofocus>
            Keep syncing
          </Button>
          <Button
            onClick={() => {
              onDisconnect();
              toast("Repository disconnected");
            }}
            className="bg-danger hover:bg-danger/90"
          >
            Disconnect repository
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 rounded-lg border border-line p-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-medium" title={`github.com/${full}`}>
            github.com/{full}
          </p>
          <p className="mt-1 flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              {repo.private ? <Lock className="h-3 w-3" aria-hidden /> : <Globe className="h-3 w-3" aria-hidden />}
              {repo.private ? "Private" : "Public"}
            </span>
            {developer && (
              <span className="flex items-center gap-1 font-mono">
                <GitBranch className="h-3 w-3" aria-hidden />
                {repo.branch}
              </span>
            )}
          </p>
        </div>
        <Button variant="secondary" onClick={sync} loading={syncing} className="shrink-0 px-3 py-1.5 text-xs">
          {syncing ? "Syncing" : statusLine.action}
        </Button>
      </div>

      <p className={`mt-3 flex items-center gap-1.5 text-sm ${statusLine.tone}`} role="status">
        {syncing ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <statusLine.icon className="h-4 w-4" aria-hidden />}
        <span className="text-ink">{syncing ? "Talking to GitHub" : statusLine.text}</span>
      </p>

      <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-md bg-surface p-2.5">
        <input
          type="checkbox"
          checked={repo.autoPush}
          onChange={() => onChange({ ...repo, autoPush: !repo.autoPush, lastSyncedAt: repo.autoPush ? new Date().toISOString() : repo.lastSyncedAt })}
          className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent-rgb))]"
        />
        <span>
          <span className="block text-sm font-medium">{developer ? "Push every build automatically" : "Back up automatically"}</span>
          <span className="block text-xs text-muted">
            {developer ? `Each build is committed to ${repo.branch}.` : "Every time Architect changes your app, a copy is saved to GitHub."}
          </span>
        </span>
      </label>

      <h3 className="mb-2 mt-5 text-xs font-semibold text-muted">{developer ? "Commits" : "History"}</h3>
      <ol className="max-h-64 divide-y divide-line overflow-y-auto rounded-md border border-line">
        {commits.map((commit) => (
          <li key={commit.sha + commit.at} className="flex items-start gap-2.5 px-3 py-2">
            <GitCommitHorizontal className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{commit.message}</p>
              <p className="text-[11px] text-muted">
                {commit.author === "architect-bot" ? "Architect" : commit.author} · {formatRelativeTime(commit.at).toLowerCase()}
                {developer && ` · ${commit.files} files`}
              </p>
            </div>
            {developer && <span className="shrink-0 font-mono text-[11px] text-muted">{commit.sha}</span>}
          </li>
        ))}
      </ol>

      <div className="mt-5 flex justify-between">
        <button type="button" onClick={() => setConfirmingDisconnect(true)} className="rounded px-1 text-xs text-danger hover:underline">
          Disconnect repository
        </button>
      </div>
    </div>
  );
}
