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
  /** Whether the project can be restored to just after this message. */
  has_checkpoint: boolean;
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
        has_checkpoint: false,
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

export type VisualEditInput = { element: string; instruction: string; change: string; file: string };

/** Save a click-to-edit change as a chat exchange (no AI call). Returns the request and Architect's reply. */
export function useSaveVisualEdit(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VisualEditInput) =>
      apiFetch<Message[]>(`/api/projects/${projectId}/edits`, { method: "POST", body: JSON.stringify(input) }),
    onSuccess: (saved) => {
      queryClient.setQueryData<Message[]>(messageKeys.list(projectId), (messages = []) => [...messages, ...saved]);
      void queryClient.invalidateQueries({ queryKey: projectKeys.all, exact: true });
    },
  });
}
