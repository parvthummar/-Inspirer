import { useMemo, useState } from "react";
import { FolderCode } from "lucide-react";
import type { Plan } from "../../api/plans";
import type { Project } from "../../api/projects";
import { useAgentWorkspace } from "../agents/agentStore";
import CodeViewer from "./CodeViewer";
import PanelEmptyState from "../../components/PanelEmptyState";
import FileTree from "./FileTree";
import { projectFiles } from "./projectFiles";
import type { BuildProgress } from "./useBuildProgress";

type CodeViewProps = {
  project: Project;
  /** The approved plan the app was built from. */
  plan: Plan | null;
  progress: BuildProgress | null;
};

const PREFERRED_FIRST_FILE = "frontend/src/App.tsx";

export default function CodeView({ project, plan, progress }: CodeViewProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  // Agent edits and the framework choice from the Agents tab show up in the agent files.
  const { workspace } = useAgentWorkspace(project.id, plan ? { id: plan.id, agents: plan.content.agents } : null);
  const build = progress?.build;

  const allFiles = useMemo(() => {
    if (!plan || !build) return [];
    const overrides = workspace && {
      framework: workspace.framework,
      agents: workspace.agents.map((agent) => ({
        name: agent.name,
        role: agent.role,
        tools: agent.tools.filter((tool) => tool.enabled).map((tool) => tool.name),
      })),
    };
    return projectFiles(project.name, plan.content, build, overrides ?? undefined);
  }, [project.name, plan, build, workspace]);

  if (!plan || !progress) {
    return (
      <PanelEmptyState
        icon={FolderCode}
        title="No files yet"
        body="Architect writes the code when it builds your app. Approve the plan in the chat to start the build."
      />
    );
  }

  // While building, files appear as the step that creates them finishes.
  const doneSteps = new Set(progress.build.steps.filter((_, i) => progress.stepStates[i] === "done").map((s) => s.id));
  const files = progress.finished ? allFiles : allFiles.filter((file) => doneSteps.has(file.stepId));
  const lastDone = progress.currentIndex > 0 ? progress.build.steps[progress.currentIndex - 1]?.id : undefined;
  const freshSteps = new Set(!progress.finished && lastDone ? [lastDone] : []);

  const selected =
    files.find((file) => file.path === selectedPath) ??
    files.find((file) => file.path === PREFERRED_FIRST_FILE) ??
    files[0];

  if (!selected) {
    return (
      <PanelEmptyState icon={FolderCode} title="Writing the first files" body="Files appear here as each build step finishes." />
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-[220px_minmax(0,1fr)] bg-panel">
      <div className="min-h-0 border-r border-line">
        <p className="border-b border-line px-3 py-2 text-[11px] font-medium text-muted">
          {files.length} files{progress.finished ? "" : " so far"}
        </p>
        <FileTree files={files} selectedPath={selected.path} onSelect={setSelectedPath} freshSteps={freshSteps} />
      </div>
      <CodeViewer file={selected} />
    </div>
  );
}
