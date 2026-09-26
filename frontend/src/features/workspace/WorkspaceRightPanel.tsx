import { useState } from "react";
import { Code2, MonitorPlay, ScrollText } from "lucide-react";
import { useMessages } from "../../api/messages";
import type { Project } from "../../api/projects";
import CodeView from "./CodeView";
import LogsView from "./LogsView";
import PreviewPanel from "./PreviewPanel";
import type { BuildProgress } from "./useBuildProgress";

type Tab = "preview" | "code" | "logs";

const tabs: { id: Tab; label: string; icon: typeof Code2 }[] = [
  { id: "preview", label: "Preview", icon: MonitorPlay },
  { id: "code", label: "Code", icon: Code2 },
  { id: "logs", label: "Logs", icon: ScrollText },
];

type WorkspaceRightPanelProps = {
  project: Project;
  progress: BuildProgress | null;
};

/** Simple view: just the preview. Developer view: Preview, Code and Logs tabs over the same project. */
export default function WorkspaceRightPanel({ project, progress }: WorkspaceRightPanelProps) {
  const [tab, setTab] = useState<Tab>("preview");
  const messages = useMessages(project.id);
  const approvedPlan =
    [...(messages.data ?? [])].reverse().find((message) => message.plan?.status === "approved")?.plan?.content ?? null;

  if (project.view_mode === "simple") {
    return <PreviewPanel project={project} progress={progress} />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div role="tablist" aria-label="Developer tools" className="flex h-10 shrink-0 items-end gap-1 border-b border-line bg-panel px-3">
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
      {/* The preview stays mounted so the app keeps its state while you look at code or logs. */}
      <div id="panel-preview" role="tabpanel" aria-labelledby="tab-preview" hidden={tab !== "preview"} className="min-h-0 flex-1">
        <PreviewPanel project={project} progress={progress} />
      </div>
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
