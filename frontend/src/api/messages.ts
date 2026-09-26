import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { Plan } from "./plans";
import { projectKeys } from "./projects";

export type MessageStep = { label: string; status?: "done" | "running" | "pending" | "failed" };

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  steps: MessageStep[];
  /** Set when this message presents a plan, shown as a plan card. */
  plan: Plan | null;
  created_at: string;
  /** Set on the optimistic copy of a message while it is being sent. */
  pending?: boolean;
};

export const messageKeys = {
  list: (projectId: string) => ["projects", projectId, "messages"] as const,
};

export function useMessages(projectId: string) {
  return useQuery({
    queryKey: messageKeys.list(projectId),
    queryFn: () => apiFetch<Message[]>(`/api/projects/${projectId}/messages`),
  });
}

/** Sends a message. The user's message appears straight away; the reply replaces it when it arrives. */
export function useSendMessage(projectId: string) {
  const queryClient = useQueryClient();
  const key = messageKeys.list(projectId);

  return useMutation({
    mutationFn: (content: string) =>
      apiFetch<Message[]>(`/api/projects/${projectId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Message[]>(key);
      const optimistic: Message = {
        id: `pending-${Date.now()}`,
        role: "user",
        content,
        steps: [],
        plan: null,
        created_at: new Date().toISOString(),
        pending: true,
      };
      queryClient.setQueryData<Message[]>(key, (messages = []) => [...messages, optimistic]);
      return { previous };
    },
    onError: (_error, _content, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<Message[]>(key, (messages = []) => [
        ...messages.filter((message) => !message.pending),
        ...saved,
      ]);
      void queryClient.invalidateQueries({ queryKey: projectKeys.all, exact: true });
      // The reply may have started a plan revision, which changes the project's status.
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId), exact: true });
    },
  });
}
