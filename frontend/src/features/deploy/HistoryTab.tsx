import { useState } from "react";
import { ChevronDown, History, RotateCcw } from "lucide-react";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import PanelEmptyState from "../../components/PanelEmptyState";
import { formatRelativeTime } from "../../lib/time";
import type { DeployController, Deployment } from "./useDeploy";

type HistoryTabProps = {
  deploy: DeployController;
  developer: boolean;
};

export default function HistoryTab({ deploy, developer }: HistoryTabProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<Deployment | null>(null);
  const { state, active, live } = deploy;

  if (state.deployments.length === 0) {
    return <PanelEmptyState icon={History} title="No deployments yet" body="Each time you deploy to production, it shows up here so you can go back to it." />;
  }

  return (
    <div>
      <ol className="divide-y divide-line rounded-lg border border-line">
        {state.deployments.map((deployment) => {
          const isLive = deployment.status === "live";
          const open = openId === deployment.id;
          return (
            <li key={deployment.id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${isLive ? "bg-success" : "bg-line"}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    v{deployment.version}
                    {deployment.kind === "rollback" && <span className="font-normal text-muted"> · rollback</span>}
                    {isLive && <span className="ml-2 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">Live</span>}
                  </p>
                  <p className="text-xs text-muted">
                    {formatRelativeTime(deployment.at)} · took {(deployment.durationMs / 1000).toFixed(1)}s
                  </p>
                </div>
                {!isLive && deployment.kind === "deploy" && (
                  <Button variant="secondary" onClick={() => setRollbackTarget(deployment)} disabled={Boolean(active)} className="px-2.5 py-1 text-xs">
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                    {live && deployment.version > live.version ? "Restore" : "Roll back"}
                  </Button>
                )}
                {developer && (
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : deployment.id)}
                    aria-expanded={open}
                    aria-label={`${open ? "Hide" : "Show"} logs for v${deployment.version}`}
                    className="rounded p-1 text-muted hover:text-ink"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                )}
              </div>
              {developer && open && (
                <pre className="mt-3 max-h-48 overflow-y-auto rounded-md bg-ink p-3 font-mono text-[11px] leading-5 text-panel/80">
                  {deployment.logs.join("\n")}
                </pre>
              )}
            </li>
          );
        })}
      </ol>

      {rollbackTarget && (
        <Modal
          title={`Switch production to v${rollbackTarget.version}?`}
          width="sm"
          onClose={() => setRollbackTarget(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setRollbackTarget(null)} data-autofocus>
                Keep v{live?.version}
              </Button>
              <Button
                onClick={() => {
                  deploy.rollback(rollbackTarget);
                  setRollbackTarget(null);
                }}
              >
                Switch to v{rollbackTarget.version}
              </Button>
            </>
          }
        >
          <p className="text-sm leading-relaxed text-muted">
            Production switches back to the version deployed {formatRelativeTime(rollbackTarget.at).toLowerCase()}. It takes a few
            seconds and nobody needs to sign in again. You can deploy the newer version again at any time.
          </p>
        </Modal>
      )}
    </div>
  );
}
