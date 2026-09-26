import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { messageKeys, useMessages, useSendMessage } from "../../api/messages";
import type { Project } from "../../api/projects";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import ChatComposer from "./ChatComposer";
import ChatMessage from "./ChatMessage";
import MessagesSkeleton from "./MessagesSkeleton";
import MissingPlanNotice from "./MissingPlanNotice";
import PlanningIndicator from "./PlanningIndicator";
import ThinkingIndicator from "./ThinkingIndicator";

export default function ChatPanel({ project }: { project: Project }) {
  const messages = useMessages(project.id);
  const sendMessage = useSendMessage(project.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const count = messages.data?.length ?? 0;
  const planning = project.status === "planning";
  const hasPlan = messages.data?.some((message) => message.plan) ?? false;

  // When the plan finishes in the background, load the message that carries it.
  const wasPlanning = useRef(planning);
  useEffect(() => {
    if (wasPlanning.current && !planning) {
      void queryClient.invalidateQueries({ queryKey: messageKeys.list(project.id) });
    }
    wasPlanning.current = planning;
  }, [planning, project.id, queryClient]);

  // Keep the newest message in view.
  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: count > 0 ? "smooth" : "auto" });
  }, [count, sendMessage.isPending, planning]);

  return (
    <section aria-label="Chat" className="flex h-full min-h-0 flex-col bg-panel">
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {messages.isPending && <MessagesSkeleton />}

        {messages.isError && (
          <div className="space-y-3 p-4">
            <Alert>We couldn't load this conversation. {messages.error.message}</Alert>
            <Button variant="secondary" onClick={() => messages.refetch()}>
              Try again
            </Button>
          </div>
        )}

        {messages.data && (
          <ol className="space-y-6 px-4 py-5" aria-live="polite">
            {messages.data.map((message) => (
              <ChatMessage key={message.id} message={message} project={project} />
            ))}
            {planning && <PlanningIndicator projectId={project.id} revising={hasPlan} />}
            {project.status === "draft" && !hasPlan && <MissingPlanNotice projectId={project.id} />}
            {sendMessage.isPending && <ThinkingIndicator label="Architect is thinking" />}
          </ol>
        )}

        {sendMessage.isError && (
          <div className="px-4 pb-4">
            <Alert>Your message wasn't sent. {sendMessage.error.message}</Alert>
          </div>
        )}
      </div>

      <ChatComposer
        sending={sendMessage.isPending}
        disabledReason={planning ? "Architect is writing the plan. You can reply once it's ready." : undefined}
        onSend={(content) => sendMessage.mutate(content)}
        placeholder={
          project.view_mode === "developer"
            ? "Ask for a change, or describe a bug"
            : "Ask Architect to change something"
        }
      />
    </section>
  );
}
