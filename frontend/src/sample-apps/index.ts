import LeaveTrackerApp from "./leave-tracker/LeaveTrackerApp";
import MeetingNotesApp from "./meeting-notes/MeetingNotesApp";
import OpsDashboardApp from "./ops-dashboard/OpsDashboardApp";
import SalesCrmApp from "./sales-crm/SalesCrmApp";
import SupportDeskApp from "./support-desk/SupportDeskApp";
import type { TemplateKey } from "./templateKeys";
import type { SampleApp } from "./types";

export const sampleApps: Record<TemplateKey, SampleApp> = {
  support_desk: { key: "support_desk", component: SupportDeskApp },
  leave_tracker: { key: "leave_tracker", component: LeaveTrackerApp },
  sales_crm: { key: "sales_crm", component: SalesCrmApp },
  meeting_notes: { key: "meeting_notes", component: MeetingNotesApp },
  ops_dashboard: { key: "ops_dashboard", component: OpsDashboardApp },
};

export function sampleAppFor(templateKey: string | null): SampleApp {
  return sampleApps[(templateKey ?? "ops_dashboard") as TemplateKey] ?? sampleApps.ops_dashboard;
}
