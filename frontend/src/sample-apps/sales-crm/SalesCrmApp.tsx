import { useState } from "react";
import { Columns3, Target, Users } from "lucide-react";
import SampleShell from "../shared/SampleShell";
import type { SampleAppProps } from "../types";
import { leads as initialLeads } from "./data";
import LeadsView from "./LeadsView";
import PipelineView from "./PipelineView";

export default function SalesCrmApp({ appName, compact }: SampleAppProps) {
  const [page, setPage] = useState("leads");
  const [leads, setLeads] = useState(initialLeads);
  const newLeads = leads.filter((lead) => lead.stage === "New").length;

  function sendEmail(id: string) {
    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, stage: "Contacted" } : lead)));
  }

  return (
    <SampleShell
      appName={appName}
      accentRgb="234 88 12"
      logo={Target}
      userName="Jordan Ellis"
      compact={compact}
      active={page}
      onNavigate={setPage}
      nav={[
        { id: "leads", label: "Leads", icon: Users, badge: newLeads },
        { id: "pipeline", label: "Pipeline", icon: Columns3 },
      ]}
    >
      {page === "leads" && <LeadsView leads={leads} onSend={sendEmail} compact={compact} />}
      {page === "pipeline" && <PipelineView leads={leads} compact={compact} />}
    </SampleShell>
  );
}
