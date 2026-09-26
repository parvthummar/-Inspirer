import { ClipboardList } from "lucide-react";
import { useRequestPlan } from "../../api/plans";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import ArchitectAvatar from "./ArchitectAvatar";

/** For a project that has no plan yet (e.g. its plan request was lost), offer to write one. */
export default function MissingPlanNotice({ projectId }: { projectId: string }) {
  const requestPlan = useRequestPlan(projectId);

  return (
    <li className="flex gap-3">
      <ArchitectAvatar />
      <div className="min-w-0 flex-1 pt-0.5">
        <span className="text-xs font-semibold">Architect</span>
        <p className="mt-1 text-sm leading-relaxed">
          I haven't written a plan for this project yet. I'll read your request and suggest the agents, pages and
          services your app needs.
        </p>
        {requestPlan.isError && (
          <div className="mt-2">
            <Alert>{requestPlan.error.message}</Alert>
          </div>
        )}
        <Button onClick={() => requestPlan.mutate(undefined)} loading={requestPlan.isPending} className="mt-3 px-3 py-1.5">
          {!requestPlan.isPending && <ClipboardList className="h-4 w-4" aria-hidden />}
          Write the plan
        </Button>
      </div>
    </li>
  );
}
