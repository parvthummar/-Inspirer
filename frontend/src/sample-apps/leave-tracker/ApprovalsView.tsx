import { Bot, Check, X } from "lucide-react";
import PageHeader from "../shared/PageHeader";
import Pill from "../shared/Pill";
import { formatRange, type LeaveRequest, type RequestStatus } from "./data";

type ApprovalsViewProps = {
  requests: LeaveRequest[];
  onDecide: (id: string, status: RequestStatus) => void;
};

export default function ApprovalsView({ requests, onDecide }: ApprovalsViewProps) {
  const pending = requests.filter((request) => request.status === "Pending").length;

  return (
    <>
      <PageHeader
        title="Approvals"
        subtitle={pending ? `${pending} ${pending === 1 ? "request needs" : "requests need"} your decision` : "You're all caught up"}
      />
      <ul className="space-y-3">
        {requests.map((request) => (
          <li key={request.id} className="rounded-lg border border-line bg-panel p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{request.person}</p>
                <p className="text-xs text-muted">
                  {request.type} · {formatRange(request.from, request.to)} · {request.days} days
                </p>
              </div>
              {request.status !== "Pending" && (
                <Pill tone={request.status === "Approved" ? "success" : "danger"}>{request.status}</Pill>
              )}
            </div>
            <p className="mt-2 text-sm">{request.reason}</p>
            {request.agentNote && (
              <p className="mt-2 flex gap-1.5 rounded-md bg-accent/5 px-2.5 py-2 text-xs text-ink">
                <Bot className="mt-px h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                {request.agentNote}
              </p>
            )}
            {request.status === "Pending" && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onDecide(request.id, "Approved")}
                  className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-on-accent"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => onDecide(request.id, "Declined")}
                  className="inline-flex items-center gap-1 rounded-md border border-line px-3 py-1.5 text-xs font-medium"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Decline
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
