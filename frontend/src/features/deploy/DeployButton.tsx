import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Rocket } from "lucide-react";
import { useBuild } from "../../api/build";
import { useMessages } from "../../api/messages";
import type { Project } from "../../api/projects";
import Button from "../../components/Button";
import { useToast } from "../../components/toast-context";
import Tooltip from "../../components/Tooltip";
import { previewUrl, productionUrl } from "../../lib/previewUrl";
import DeployDrawer from "./DeployDrawer";
import { useDeploy } from "./useDeploy";

/** Header Deploy button. Owns the deploy state so a deploy keeps running while the drawer is closed. */
export default function DeployButton({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const messages = useMessages(project.id);
  const build = useBuild(project.id, ["building", "ready", "error"].includes(project.status));

  const approved = [...(messages.data ?? [])].reverse().find((m) => m.plan?.status === "approved")?.plan;
  const defaultHost = productionUrl(project.name);
  const deploy = useDeploy(project.id, approved?.content.integrations ?? [], defaultHost);
  const productionHost = deploy.state.domain?.status === "active" ? deploy.state.domain.name : defaultHost;

  // Announce when a deploy or rollback finishes, even if the drawer was closed.
  const wasActive = useRef(deploy.active);
  useEffect(() => {
    const previous = wasActive.current;
    if (previous && !deploy.active) {
      toast(previous.kind === "rollback" ? `Rolled back to v${previous.version}` : `Deployed v${previous.version} to production`);
    }
    wasActive.current = deploy.active;
  }, [deploy.active, toast]);

  const canOpen = project.status === "ready" || deploy.state.deployments.length > 0;

  if (!canOpen) {
    return (
      <Tooltip label="Deploy becomes available once your app has been built." align="end">
        <Button disabled tabIndex={-1} className="px-3 py-1.5">
          <Rocket className="h-4 w-4" aria-hidden />
          Deploy
        </Button>
      </Tooltip>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="relative px-3 py-1.5">
        {deploy.active ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Rocket className="h-4 w-4" aria-hidden />}
        {deploy.active ? "Deploying" : "Deploy"}
        {deploy.live && !deploy.active && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-panel" aria-label="Live in production" />
        )}
      </Button>
      {open && (
        <DeployDrawer
          project={project}
          build={build.data}
          deploy={deploy}
          previewHost={previewUrl(project.name)}
          productionHost={productionHost}
          defaultHost={defaultHost}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
