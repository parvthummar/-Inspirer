import type { Commit } from "./commits";
import type { LinkedRepo } from "./githubStore";

export type SyncStatus =
  | { kind: "up_to_date" }
  | { kind: "behind"; count: number }
  | { kind: "ahead"; count: number };

/** Behind: commits on GitHub not pulled yet. Ahead: Architect commits not pushed (auto-push off). */
export function syncStatus(repo: LinkedRepo, commits: Commit[]): SyncStatus {
  if (repo.remoteCommits > 0) return { kind: "behind", count: repo.remoteCommits };
  if (!repo.autoPush) {
    const unpushed = commits.filter((commit) => commit.author === "architect-bot" && commit.at > repo.lastSyncedAt).length;
    if (unpushed > 0) return { kind: "ahead", count: unpushed };
  }
  return { kind: "up_to_date" };
}
