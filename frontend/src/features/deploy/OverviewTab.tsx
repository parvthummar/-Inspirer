import { useState } from "react";
import { CircleAlert, CircleCheck, Globe, KeyRound, MonitorPlay, Rocket } from "lucide-react";
import type { Build } from "../../api/build";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { formatRelativeTime } from "../../lib/time";
import DeployProgress from "./DeployProgress";
import type { DeployController } from "./useDeploy";

type OverviewTabProps = {
  deploy: DeployController;
  build: Build | undefined;
  previewHost: string;
  productionHost: string;
  developer: boolean;
  onOpenEnvironment: () => void;
};

export default function OverviewTab({ deploy, build, previewHost, productionHost, developer, onOpenEnvironment }: OverviewTabProps) {
  const [confirming, setConfirming] = useState(false);
  const { live, missing, active, elapsed, state } = deploy;
  const buildFinishedAt = build ? new Date(new Date(build.started_at).getTime() + build.total_ms).toISOString() : null;
  const previewAhead = Boolean(build && live && live.buildStartedAt !== build.started_at);
  const nextVersion = Math.max(0, ...state.deployments.map((d) => d.version)) + 1;
  const canDeploy = Boolean(build) && !active && missing.length === 0 && (!live || previewAhead);

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-line p-4">
        <div className="flex items-center gap-2">
          <MonitorPlay className="h-4 w-4 text-muted" aria-hidden />
          <h3 className="text-sm font-semibold">Preview</h3>
          <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted">For you and your team</span>
        </div>
        <p className="mt-2 font-mono text-xs">{previewHost}</p>
        <p className="mt-1 text-xs text-muted">
          Updates with every build{buildFinishedAt ? ` · last built ${formatRelativeTime(buildFinishedAt).toLowerCase()}` : ""}
        </p>
      </section>

      <section className={`rounded-lg border p-4 ${live ? "border-success/40" : "border-line"}`}>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted" aria-hidden />
          <h3 className="text-sm font-semibold">Production</h3>
          {live ? (
            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
              Live · v{live.version}
            </span>
          ) : (
            <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted">Not deployed yet</span>
          )}
        </div>
        <p className="mt-2 font-mono text-xs">{productionHost}</p>
        <p className="mt-1 text-xs text-muted">
          {live
            ? `Deployed ${formatRelativeTime(live.at).toLowerCase()}${live.kind === "rollback" ? " (rollback)" : ""}`
            : "What your users see once you deploy."}
        </p>
        {live && (
          <p className={`mt-3 flex items-center gap-1.5 text-xs ${previewAhead ? "text-accent" : "text-success"}`}>
            {previewAhead ? <CircleAlert className="h-3.5 w-3.5" aria-hidden /> : <CircleCheck className="h-3.5 w-3.5" aria-hidden />}
            <span className="text-ink">
              {previewAhead ? "The preview has changes that aren't live yet." : "Production matches the latest build."}
            </span>
          </p>
        )}
      </section>

      {active && <DeployProgress active={active} elapsed={elapsed} developer={developer} />}

      {!active && missing.length > 0 && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-danger">
            <KeyRound className="h-4 w-4" aria-hidden />
            {missing.length === 1 ? "One key is needed" : `${missing.length} keys are needed`} before going live
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {missing.map((v) => (
              <li key={v.key} className={developer ? "font-mono text-xs" : ""}>
                {developer ? v.key : v.label}
              </li>
            ))}
          </ul>
          <Button variant="secondary" onClick={onOpenEnvironment} className="mt-3 px-3 py-1.5 text-xs">
            Add {missing.length === 1 ? "the key" : "the keys"}
          </Button>
        </div>
      )}

      {!active && (
        <Button onClick={() => setConfirming(true)} disabled={!canDeploy} className="w-full">
          <Rocket className="h-4 w-4" aria-hidden />
          {live ? `Deploy v${nextVersion} to production` : "Deploy to production"}
        </Button>
      )}
      {!active && live && !previewAhead && (
        <p className="text-center text-xs text-muted">Nothing new to deploy. Build a change first, then deploy it here.</p>
      )}

      {confirming && build && (
        <Modal
          title={`Deploy v${nextVersion} to production?`}
          width="sm"
          onClose={() => setConfirming(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirming(false)}>
                Not yet
              </Button>
              <Button
                onClick={() => {
                  setConfirming(false);
                  deploy.deploy(build.started_at);
                }}
                data-autofocus
              >
                Deploy to production
              </Button>
            </>
          }
        >
          <p className="text-sm leading-relaxed text-muted">
            Everyone using <span className="font-mono text-xs text-ink">{productionHost}</span> will get the latest build. If
            anything looks wrong, you can roll back to an earlier version from History.
          </p>
        </Modal>
      )}
    </div>
  );
}
