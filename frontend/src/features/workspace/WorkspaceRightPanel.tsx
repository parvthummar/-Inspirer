import { useState } from "react";
import { Bot, Code2, MonitorPlay, ScrollText } from "lucide-react";
import { useMessages } from "../../api/messages";
import type { Plan } from "../../api/plans";
import type { Project } from "../../api/projects";
import AgentsView from "../agents/AgentsView";
import CodeView from "./CodeView";
import LogsView from "./LogsView";
import PreviewPanel from "./PreviewPanel";
import type { BuildProgress } from "./useBuildProgress";

type Tab = "preview" | "agents" | "code" | "logs";

const allTabs: { id: Tab; label: string; icon: typeof Code2; developerOnly: boolean }[] = [
  { id: "preview", label: "Preview", icon: MonitorPlay, developerOnly: false },
  { id: "agents", label: "Agents", icon: Bot, developerOnly: false },
  { id: "code", label: "Code", icon: Code2, developerOnly: true },
  { id: "logs", label: "Logs", icon: ScrollText, developerOnly: true },
];

type WorkspaceRightPanelProps = {
  project: Project;
  progress: BuildProgress | null;
};

/** Preview and Agents in both views; Developer view adds Code and Logs. All tabs show the same project. */
export default function WorkspaceRightPanel({ project, progress }: WorkspaceRightPanelProps) {
  const [chosenTab, setTab] = useState<Tab>("preview");
  const messages = useMessages(project.id);
  const developer = project.view_mode === "developer";
  const tabs = allTabs.filter((tab) => developer || !tab.developerOnly);
  // Switching back to Simple view while on a developer tab falls back to the preview.
  const tab = tabs.some((t) => t.id === chosenTab) ? chosenTab : "preview";

  const plans = (messages.data ?? []).flatMap((message) => (message.plan ? [message.plan] : []));
  const currentPlan: Plan | null = [...plans].reverse().find((plan) => plan.status !== "revised") ?? null;
  const approvedPlan: Plan | null = [...plans].reverse().find((plan) => plan.status === "approved") ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div role="tablist" aria-label="Workspace views" className="flex h-10 shrink-0 items-end gap-1 border-b border-line bg-panel px-3">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setTab(id)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 pb-2 pt-1 text-xs font-medium ${
              tab === id ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
            {id === "logs" && project.status === "building" && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-label="Build running" />
            )}
          </button>
        ))}
      </div>
      {/* The preview stays mounted so the app keeps its state while other tabs are open. */}
      <div id="panel-preview" role="tabpanel" aria-labelledby="tab-preview" hidden={tab !== "preview"} className="min-h-0 flex-1">
        <PreviewPanel project={project} progress={progress} />
      </div>
      {tab === "agents" && (
        <div id="panel-agents" role="tabpanel" aria-labelledby="tab-agents" className="min-h-0 flex-1">
          <AgentsView project={project} plan={currentPlan} />
        </div>
      )}
      {tab === "code" && (
        <div id="panel-code" role="tabpanel" aria-labelledby="tab-code" className="min-h-0 flex-1">
          <CodeView project={project} plan={approvedPlan} progress={progress} />
        </div>
      )}
      {tab === "logs" && (
        <div id="panel-logs" role="tabpanel" aria-labelledby="tab-logs" className="min-h-0 flex-1">
          <LogsView project={project} plan={approvedPlan} progress={progress} />
        </div>
      )}
    </div>
  );
}
