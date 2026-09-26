import { useState } from "react";
import { CalendarDays, CalendarRange, ClipboardCheck, Plane } from "lucide-react";
import SampleShell from "../shared/SampleShell";
import type { SampleAppProps } from "../types";
import ApprovalsView from "./ApprovalsView";
import CalendarView from "./CalendarView";
import { myRequests, teamRequests, type LeaveRequest, type RequestStatus } from "./data";
import MyLeaveView from "./MyLeaveView";

export default function LeaveTrackerApp({ appName, compact }: SampleAppProps) {
  const [page, setPage] = useState("mine");
  const [mine, setMine] = useState(myRequests);
  const [team, setTeam] = useState(teamRequests);

  const pending = team.filter((request) => request.status === "Pending").length;

  function decide(id: string, status: RequestStatus) {
    setTeam((current) => current.map((request) => (request.id === id ? { ...request, status } : request)));
  }

  return (
    <SampleShell
      appName={appName}
      accentRgb="109 76 255"
      logo={Plane}
      userName="Priya Shah"
      compact={compact}
      active={page}
      onNavigate={setPage}
      nav={[
        { id: "mine", label: "My leave", icon: CalendarDays },
        { id: "approvals", label: "Approvals", icon: ClipboardCheck, badge: pending },
        { id: "calendar", label: "Team calendar", icon: CalendarRange },
      ]}
    >
      {page === "mine" && (
        <MyLeaveView requests={mine} onRequest={(request: LeaveRequest) => setMine((current) => [request, ...current])} compact={compact} />
      )}
      {page === "approvals" && <ApprovalsView requests={team} onDecide={decide} />}
      {page === "calendar" && <CalendarView compact={compact} />}
    </SampleShell>
  );
}
