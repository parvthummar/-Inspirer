import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { messageKeys } from "./messages";
import { projectKeys, type ProjectStatus } from "./projects";

export type BuildStep = {
  id: string;
  label: string;
  dev_label: string;
  duration_ms: number;
  logs: string[];
};

export type Build = {
  status: ProjectStatus;
  started_at: string;
  elapsed_ms: number;
  total_ms: number;
  message_id: string;
  steps: BuildStep[];
};

export const buildKeys = {
  detail: (projectId: string) => ["projects", projectId, "build"] as const,
};

/** The scripted build. Fetched once per build; the progress is animated locally from elapsed_ms. */
export function useBuild(projectId: string, enabled: boolean) {
  return useQuery({
    queryKey: buildKeys.detail(projectId),
    queryFn: () => apiFetch<Build>(`/api/projects/${projectId}/build`),
    enabled,
    staleTime: Infinity,
  });
}

/** Build again from the approved plan ("Rebuild", "Fix it for me"). */
export function useStartBuild(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<Build>(`/api/projects/${projectId}/build`, { method: "POST" }),
    onSuccess: (build) => {
      queryClient.setQueryData(buildKeys.detail(projectId), build);
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId), exact: true });
      void queryClient.invalidateQueries({ queryKey: messageKeys.list(projectId) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.all, exact: true });
    },
  });
}
