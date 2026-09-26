import { useState } from "react";
import { Bot, FlaskConical, Plus } from "lucide-react";
import type { Plan } from "../../api/plans";
import type { Project } from "../../api/projects";
import Button from "../../components/Button";
import DemoBadge from "../../components/DemoBadge";
import { useToast } from "../../components/toast-context";
import PanelEmptyState from "../../components/PanelEmptyState";
import AgentCanvas from "./AgentCanvas";
import AgentPlayground from "./AgentPlayground";
import AgentSettingsPanel from "./AgentSettingsPanel";
import { newAgent, useAgentWorkspace } from "./agentStore";
import FrameworkPicker from "./FrameworkPicker";

type AgentsViewProps = {
  project: Project;
  plan: Plan | null;
};

type SidePanel = { kind: "settings"; agentId: string } | { kind: "playground"; agentId: string } | null;

export default function AgentsView({ project, plan }: AgentsViewProps) {
  const { workspace, update } = useAgentWorkspace(project.id, plan ? { id: plan.id, agents: plan.content.agents } : null);
  const [panel, setPanel] = useState<SidePanel>(null);
  const toast = useToast();
  const developer = project.view_mode === "developer";

  if (!workspace || !plan) {
    return (
      <PanelEmptyState
        icon={Bot}
        title="No agents yet"
        body="Agents are set up from your plan. Once Architect has written the plan, they'll appear here and you can adjust and test them."
      />
    );
  }

  const agents = workspace.agents;
  const selectedAgent = panel ? agents.find((agent) => agent.id === panel.agentId) : undefined;

  function addAgent() {
    const agent = newAgent(agents);
    update((current) => ({ ...current, agents: [...current.agents, agent] }));
    setPanel({ kind: "settings", agentId: agent.id });
    toast("Agent added");
  }

  return (
    <div className="flex h-full min-h-0 bg-surface">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line bg-panel px-3 py-2">
          <p className="mr-auto text-xs text-muted">
            {agents.length} {agents.length === 1 ? "agent" : "agents"} · click one to change how it works
          </p>
          <DemoBadge explanation="Agent settings and framework changes are saved in this browser only in this prototype. Test runs are simulated." />
          {developer && (
            <FrameworkPicker
              current={workspace.framework}
              agentCount={agents.length}
              onChange={(framework) => update((current) => ({ ...current, framework }))}
            />
          )}
          <Button variant="secondary" onClick={addAgent} className="px-2.5 py-1 text-xs">
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add agent
          </Button>
          <Button
            onClick={() => setPanel({ kind: "playground", agentId: selectedAgent?.id ?? agents[0]?.id ?? "" })}
            disabled={agents.length === 0}
            className="px-2.5 py-1 text-xs"
          >
            <FlaskConical className="h-3.5 w-3.5" aria-hidden />
            Test agents
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {agents.length === 0 ? (
            <PanelEmptyState icon={Bot} title="No agents" body="Add an agent to give your app something to do the work." />
          ) : (
            <AgentCanvas
              agents={agents}
              integrations={plan.content.integrations}
              selectedId={panel?.kind === "settings" ? panel.agentId : null}
              onSelect={(agentId) => setPanel({ kind: "settings", agentId })}
              developer={developer}
            />
          )}
        </div>
      </div>

      {panel?.kind === "settings" && selectedAgent && (
        <AgentSettingsPanel
          key={selectedAgent.id}
          agent={selectedAgent}
          developer={developer}
          canDelete={agents.length > 1}
          onSave={(saved) =>
            update((current) => ({ ...current, agents: current.agents.map((a) => (a.id === saved.id ? saved : a)) }))
          }
          onDelete={() => {
            update((current) => ({ ...current, agents: current.agents.filter((a) => a.id !== selectedAgent.id) }));
            setPanel(null);
          }}
          onClose={() => setPanel(null)}
        />
      )}
      {panel?.kind === "playground" && (
        <AgentPlayground agents={agents} initialAgentId={panel.agentId} developer={developer} onClose={() => setPanel(null)} />
      )}
    </div>
  );
}
