import { useLocalState } from "../../lib/localStore";

/**
 * GitHub is a dummy flow: the connected account and each project's repository are kept in the browser.
 * The account is shared by all projects; the repository is per project.
 */

export type GitHubAccount = { username: string; connectedAt: string };

export type LinkedRepo = {
  owner: string;
  name: string;
  private: boolean;
  mode: "created" | "linked";
  branch: string;
  linkedAt: string;
  lastSyncedAt: string;
  autoPush: boolean;
  /** Commits on GitHub that aren't in Architect yet. */
  remoteCommits: number;
  /** Commits pulled from GitHub, shown in the history. */
  pulled: { sha: string; message: string; author: string; at: string }[];
};

const ACCOUNT_KEY = "architect.github.account";
const REPO_PREFIX = "architect.github.repo.";

export function useGitHub(projectId: string) {
  const [account, setAccount] = useLocalState<GitHubAccount>(ACCOUNT_KEY);
  const [repo, setRepo] = useLocalState<LinkedRepo>(REPO_PREFIX + projectId);
  return { account, repo, setAccount, setRepo };
}

/** A GitHub-style username from the user's name, e.g. "Ada Lovelace" -> "ada-lovelace". */
export function usernameFrom(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "architect-user";
}
