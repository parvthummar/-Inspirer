import { useState, type FormEvent } from "react";
import PageHeader from "../shared/PageHeader";
import Pill from "../shared/Pill";
import { balances, formatRange, workingDaysBetween, type LeaveRequest, type LeaveType } from "./data";

type MyLeaveViewProps = {
  requests: LeaveRequest[];
  onRequest: (request: LeaveRequest) => void;
  compact: boolean;
};

const field = "w-full rounded-md border border-line bg-panel px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none";

export default function MyLeaveView({ requests, onRequest, compact }: MyLeaveViewProps) {
  const [type, setType] = useState<LeaveType>("Annual leave");
  const [from, setFrom] = useState("2026-11-02");
  const [to, setTo] = useState("2026-11-04");
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);

  const days = from && to && to >= from ? workingDaysBetween(from, to) : 0;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!days) return;
    onRequest({
      id: `r${Date.now()}`,
      person: "Priya Shah",
      type,
      from,
      to,
      days,
      reason: reason.trim() || "No reason given",
      status: "Pending",
    });
    setReason("");
    setSent(true);
  }

  return (
    <>
      <PageHeader title="My leave" subtitle="2026 allowance, resets on 1 January" />
      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-3"}`}>
        {balances.map((balance) => (
          <div key={balance.type} className="rounded-lg border border-line bg-panel p-4">
            <p className="text-xs text-muted">{balance.type}</p>
            <p className="mt-1 text-2xl font-semibold">
              {balance.left}
              <span className="text-sm font-normal text-muted"> of {balance.total} days left</span>
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-surface">
              <div className="h-1.5 rounded-full bg-accent" style={{ width: `${(balance.left / balance.total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-4 grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"}`}>
        <form onSubmit={submit} className="space-y-3 rounded-lg border border-line bg-panel p-4">
          <h2 className="text-sm font-semibold">Request time off</h2>
          <label className="block text-xs text-muted">
            Type
            <select value={type} onChange={(event) => setType(event.target.value as LeaveType)} className={`${field} mt-1 text-ink`}>
              {balances.map((balance) => (
                <option key={balance.type}>{balance.type}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs text-muted">
              From
              <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className={`${field} mt-1 text-ink`} />
            </label>
            <label className="block text-xs text-muted">
              To
              <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className={`${field} mt-1 text-ink`} />
            </label>
          </div>
          <label className="block text-xs text-muted">
            Reason (optional)
            <input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Visiting family" className={`${field} mt-1 text-ink`} />
          </label>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted">{days ? `${days} working ${days === 1 ? "day" : "days"}` : "Pick valid dates"}</span>
            <button type="submit" disabled={!days} className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-panel disabled:opacity-50">
              Send request
            </button>
          </div>
          {sent && <p className="text-xs text-success">Request sent. Your manager has been notified.</p>}
        </form>

        <section className="rounded-lg border border-line bg-panel">
          <h2 className="border-b border-line px-4 py-3 text-sm font-semibold">Your requests</h2>
          <ul className="divide-y divide-line">
            {requests.map((request) => (
              <li key={request.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {request.type} <span className="font-normal text-muted">· {request.days} {request.days === 1 ? "day" : "days"}</span>
                  </p>
                  <p className="truncate text-xs text-muted">
                    {formatRange(request.from, request.to)} · {request.reason}
                  </p>
                </div>
                <Pill tone={request.status === "Approved" ? "success" : request.status === "Declined" ? "danger" : "accent"}>
                  {request.status}
                </Pill>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
