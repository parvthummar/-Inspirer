export type LeaveType = "Annual leave" | "Sick leave" | "Personal day";
export type RequestStatus = "Pending" | "Approved" | "Declined";

export type LeaveRequest = {
  id: string;
  person: string;
  type: LeaveType;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: RequestStatus;
  agentNote?: string;
};

export const balances: { type: LeaveType; left: number; total: number }[] = [
  { type: "Annual leave", left: 14, total: 20 },
  { type: "Sick leave", left: 8, total: 10 },
  { type: "Personal day", left: 2, total: 3 },
];

export const myRequests: LeaveRequest[] = [
  { id: "r1", person: "Priya Shah", type: "Annual leave", from: "2026-10-12", to: "2026-10-16", days: 5, reason: "Family trip to Lisbon", status: "Approved" },
  { id: "r2", person: "Priya Shah", type: "Personal day", from: "2026-08-21", to: "2026-08-21", days: 1, reason: "Moving house", status: "Approved" },
];

export const teamRequests: LeaveRequest[] = [
  {
    id: "t1", person: "Marcus Lee", type: "Annual leave", from: "2026-10-05", to: "2026-10-09", days: 5, reason: "Wedding in Singapore", status: "Pending",
    agentNote: "No clash: 1 other person off that week, team minimum is met.",
  },
  {
    id: "t2", person: "Aisha Bello", type: "Sick leave", from: "2026-09-28", to: "2026-09-29", days: 2, reason: "Doctor's appointment and recovery", status: "Pending",
    agentNote: "Within sick leave balance (6 days left).",
  },
  {
    id: "t3", person: "Tom Fischer", type: "Annual leave", from: "2026-10-13", to: "2026-10-15", days: 3, reason: "Long weekend", status: "Pending",
    agentNote: "Overlaps with Priya Shah on 13 to 15 Oct. Two of five people would be out.",
  },
];

/** Who is off in October 2026, for the team calendar. */
export const calendarLeaves: { person: string; from: number; to: number; type: LeaveType }[] = [
  { person: "Marcus Lee", from: 5, to: 9, type: "Annual leave" },
  { person: "Priya Shah", from: 12, to: 16, type: "Annual leave" },
  { person: "Tom Fischer", from: 13, to: 15, type: "Annual leave" },
  { person: "Aisha Bello", from: 22, to: 22, type: "Personal day" },
  { person: "Jonas Berg", from: 27, to: 30, type: "Annual leave" },
];

const dateFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });

export function formatRange(from: string, to: string): string {
  const start = dateFormat.format(new Date(from));
  return from === to ? start : `${start} to ${dateFormat.format(new Date(to))}`;
}

export function workingDaysBetween(from: string, to: string): number {
  let days = 0;
  const cursor = new Date(from);
  const end = new Date(to);
  while (cursor <= end) {
    const weekday = cursor.getDay();
    if (weekday !== 0 && weekday !== 6) days += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}
