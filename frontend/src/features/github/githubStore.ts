import { useCallback, useSyncExternalStore } from "react";

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
const listeners = new Set<() => void>();
const cache = new Map<string, unknown>();

function read<T>(key: string): T | null {
  if (cache.has(key)) return cache.get(key) as T | null;
  let value: T | null = null;
  try {
    const raw = localStorage.getItem(key);
    value = raw ? (JSON.parse(raw) as T) : null;
  } catch {
    value = null;
  }
  cache.set(key, value);
  return value;
}

function write<T>(key: string, value: T | null) {
  cache.set(key, value);
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable; the flow still works for this session.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useGitHub(projectId: string) {
  const account = useSyncExternalStore(subscribe, () => read<GitHubAccount>(ACCOUNT_KEY));
  const repo = useSyncExternalStore(subscribe, () => read<LinkedRepo>(REPO_PREFIX + projectId));

  const setAccount = useCallback((value: GitHubAccount | null) => write(ACCOUNT_KEY, value), []);
  const setRepo = useCallback((value: LinkedRepo | null) => write(REPO_PREFIX + projectId, value), [projectId]);

  return { account, repo, setAccount, setRepo };
}

/** A GitHub-style username from the user's name, e.g. "Ada Lovelace" -> "ada-lovelace". */
export function usernameFrom(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "architect-user";
}
