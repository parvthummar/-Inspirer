import { useMessages } from "../../api/messages";
import type { PlanContent } from "../../api/plans";

/** The project's current plan: the approved one if there is one, otherwise the latest proposal. */
export function usePlanContent(projectId: string): PlanContent | null {
  const messages = useMessages(projectId);
  const plans = (messages.data ?? []).flatMap((message) => (message.plan ? [message.plan] : [])).reverse();
  return (plans.find((plan) => plan.status === "approved") ?? plans.find((plan) => plan.status !== "revised"))?.content ?? null;
}
