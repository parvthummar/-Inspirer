import { useState } from "react";
import type { Build } from "../../api/build";
import type { Project } from "../../api/projects";
import Drawer from "../../components/Drawer";
import DomainTab from "./DomainTab";
import EnvVarsTab from "./EnvVarsTab";
import HistoryTab from "./HistoryTab";
import OverviewTab from "./OverviewTab";
import type { DeployController } from "./useDeploy";

type Tab = "overview" | "environment" | "domain" | "history";

type DeployDrawerProps = {
  project: Project;
  build: Build | undefined;
  deploy: DeployController;
  previewHost: string;
  productionHost: string;
  defaultHost: string;
  onClose: () => void;
};

export default function DeployDrawer({ project, build, deploy, previewHost, productionHost, defaultHost, onClose }: DeployDrawerProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const developer = project.view_mode === "developer";
  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "environment", label: developer ? "Environment" : "Keys", badge: deploy.missing.length },
    { id: "domain", label: "Domain" },
    { id: "history", label: "History" },
  ];

  return (
    <Drawer title="Deploy" subtitle={project.name} onClose={onClose}>
      <div role="tablist" aria-label="Deploy settings" className="flex shrink-0 gap-1 border-b border-line px-5">
        {tabs.map(({ id, label, badge }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-xs font-medium ${
              tab === id ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {label}
            {badge ? <span className="rounded-full bg-danger px-1.5 text-[10px] font-semibold text-panel">{badge}</span> : null}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {tab === "overview" && (
          <OverviewTab
            deploy={deploy}
            build={build}
            previewHost={previewHost}
            productionHost={productionHost}
            developer={developer}
            onOpenEnvironment={() => setTab("environment")}
          />
        )}
        {tab === "environment" && <EnvVarsTab deploy={deploy} developer={developer} />}
        {tab === "domain" && <DomainTab deploy={deploy} defaultHost={defaultHost} developer={developer} />}
        {tab === "history" && <HistoryTab deploy={deploy} developer={developer} />}
      </div>
    </Drawer>
  );
}
