export type RecordStatus = "Done" | "In progress" | "Waiting on you";

export type WorkRecord = {
  id: string;
  title: string;
  handledBy: string;
  status: RecordStatus;
  updated: string;
};

export const records: WorkRecord[] = [
  { id: "OPS-1042", title: "Weekly inventory report for the Leeds store", handledBy: "Agent", status: "Done", updated: "10 min ago" },
  { id: "OPS-1041", title: "Reconcile September supplier invoices", handledBy: "Agent", status: "In progress", updated: "18 min ago" },
  { id: "OPS-1040", title: "Approve refund over £500 for order 9921", handledBy: "Mia Clarke", status: "Waiting on you", updated: "42 min ago" },
  { id: "OPS-1039", title: "Update opening hours on all store pages", handledBy: "Agent", status: "Done", updated: "1 hr ago" },
  { id: "OPS-1038", title: "Flag late deliveries from Northline Freight", handledBy: "Agent", status: "Done", updated: "2 hr ago" },
  { id: "OPS-1037", title: "Confirm new supplier bank details", handledBy: "Mia Clarke", status: "Waiting on you", updated: "3 hr ago" },
  { id: "OPS-1036", title: "Summarise customer feedback from last week", handledBy: "Agent", status: "Done", updated: "Yesterday" },
];

export const tasksPerDay = [
  { label: "20 Sep", value: 38 },
  { label: "21 Sep", value: 22 },
  { label: "22 Sep", value: 57 },
  { label: "23 Sep", value: 61 },
  { label: "24 Sep", value: 49 },
  { label: "25 Sep", value: 66 },
  { label: "26 Sep", value: 41 },
];

export type Report = { id: string; name: string; schedule: string; recipients: string; enabled: boolean };

export const reports: Report[] = [
  { id: "rep1", name: "Daily operations summary", schedule: "Every weekday at 8:00", recipients: "Leadership team", enabled: true },
  { id: "rep2", name: "Weekly inventory levels", schedule: "Mondays at 7:00", recipients: "Store managers", enabled: true },
  { id: "rep3", name: "Monthly supplier performance", schedule: "1st of each month", recipients: "Mia Clarke", enabled: false },
];
