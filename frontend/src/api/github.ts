import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ImportSummary } from "../mocks/importSummaries";
import { apiFetch } from "./client";
import type { ProjectSource } from "./projects";

export type RepoAnalysis = {
  source: ProjectSource;
  summary: ImportSummary & { readme_excerpt: string };
};

export type RepoFile = { path: string; size: number };
export type RepoFiles = { repository: ProjectSource; files: RepoFile[]; truncated: boolean };
export type RepoFileContent = { path: string; content: string; binary: boolean; truncated: boolean };

/** Read a public GitHub repository for the import review. */
export function useAnalyzeRepo() {
  return useMutation({
    mutationFn: (repo: string) => apiFetch<RepoAnalysis>(`/api/github/analyze?repo=${encodeURIComponent(repo)}`),
  });
}

/** The imported repository's file list (only for projects imported from GitHub). */
export function useProjectFiles(projectId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["projects", projectId, "files"],
    queryFn: () => apiFetch<RepoFiles>(`/api/projects/${projectId}/files`),
    enabled,
    staleTime: Infinity,
  });
}

export type PullResult = RepoFiles & { added: number; removed: number; changed: number };

/** Read the imported repository again from GitHub ("Pull latest"). */
export function usePullLatest(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<PullResult>(`/api/projects/${projectId}/files/pull`, { method: "POST" }),
    onSuccess: (result) => queryClient.setQueryData<RepoFiles>(["projects", projectId, "files"], result),
  });
}

export function fetchFileContent(projectId: string, path: string): Promise<RepoFileContent> {
  return apiFetch<RepoFileContent>(`/api/projects/${projectId}/files/content?path=${encodeURIComponent(path)}`);
}
