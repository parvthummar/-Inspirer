import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TemplateKey } from "../sample-apps/templateKeys";
import { apiFetch } from "./client";
import { messageKeys } from "./messages";
import { projectKeys, type Project } from "./projects";

export type PlanAgent = { name: string; role: string; tools: string[] };
export type PlanPage = { name: string; purpose: string };

export type PlanContent = {
  summary: string;
  agents: PlanAgent[];
  pages: PlanPage[];
  integrations: string[];
  template_key: TemplateKey;
};

export type Plan = {
  id: string;
  status: "proposed" | "approved" | "revised";
  content: PlanContent;
  created_at: string;
};

function useRefreshProject(projectId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: messageKeys.list(projectId) });
    void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    void queryClient.invalidateQueries({ queryKey: projectKeys.all, exact: true });
  };
}

/** Ask for a new plan. With feedback, the current plan is revised; without, it is written again. */
export function useRequestPlan(projectId: string) {
  const queryClient = useQueryClient();
  const refresh = useRefreshProject(projectId);
  return useMutation({
    mutationFn: (feedback?: string) =>
      apiFetch<Project>(`/api/projects/${projectId}/plan`, {
        method: "POST",
        body: JSON.stringify(feedback ? { feedback } : {}),
      }),
    onSuccess: (project) => {
      // Switching to "planning" starts polling, which picks up the new plan when it's ready.
      queryClient.setQueryData(projectKeys.detail(projectId), project);
      refresh();
    },
  });
}

export function useUpdatePlan(projectId: string) {
  const refresh = useRefreshProject(projectId);
  return useMutation({
    mutationFn: (content: PlanContent) =>
      apiFetch<Plan>(`/api/projects/${projectId}/plan`, { method: "PATCH", body: JSON.stringify(content) }),
    onSuccess: refresh,
  });
}

export function useApprovePlan(projectId: string) {
  const refresh = useRefreshProject(projectId);
  return useMutation({
    mutationFn: () => apiFetch<Plan>(`/api/projects/${projectId}/plan/approve`, { method: "POST" }),
    onSuccess: refresh,
  });
}
