import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";

export type ViewMode = "simple" | "developer";
export type ProjectStatus = "draft" | "planning" | "building" | "ready" | "error";

export type Project = {
  id: string;
  name: string;
  description: string;
  initial_prompt: string;
  view_mode: ViewMode;
  status: ProjectStatus;
  template_key: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectChanges = Partial<Pick<Project, "name" | "view_mode">>;

export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: string) => ["projects", id] as const,
};

export function useProjects() {
  return useQuery({ queryKey: projectKeys.all, queryFn: () => apiFetch<Project[]>("/api/projects") });
}

const PLANNING_POLL_MS = 1500;

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => apiFetch<Project>(`/api/projects/${id}`),
    // While Architect writes the plan in the background, check back until it's done.
    refetchInterval: (query) => (query.state.data?.status === "planning" ? PLANNING_POLL_MS : false),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prompt: string) =>
      apiFetch<Project>("/api/projects", { method: "POST", body: JSON.stringify({ prompt }) }),
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(project.id), project);
      void queryClient.invalidateQueries({ queryKey: projectKeys.all, exact: true });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: ProjectChanges }) =>
      apiFetch<Project>(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(changes) }),
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(project.id), project);
      void queryClient.invalidateQueries({ queryKey: projectKeys.all, exact: true });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/projects/${id}`, { method: "DELETE" }),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Project[]>(projectKeys.all, (projects) => projects?.filter((p) => p.id !== id));
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
    },
  });
}
