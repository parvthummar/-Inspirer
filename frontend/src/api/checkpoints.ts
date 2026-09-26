import { useMutation, useQueryClient } from "@tanstack/react-query";
import { buildKeys } from "./build";
import { apiFetch } from "./client";
import { projectKeys, type Project } from "./projects";

type RestoreResult = { project: Project; removed_messages: number };

/** Restore the project to just after a message. Everything later is removed on the server. */
export function useRestoreCheckpoint(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) =>
      apiFetch<RestoreResult>(`/api/projects/${projectId}/checkpoints/restore`, {
        method: "POST",
        body: JSON.stringify({ message_id: messageId }),
      }),
    onSuccess: ({ project }) => {
      queryClient.setQueryData(projectKeys.detail(projectId), project);
      // The build may have been undone; drop it rather than keep showing the old one.
      queryClient.removeQueries({ queryKey: buildKeys.detail(projectId) });
      // Messages, plan and build all change with a restore.
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      void queryClient.invalidateQueries({ queryKey: projectKeys.all, exact: true });
    },
  });
}
