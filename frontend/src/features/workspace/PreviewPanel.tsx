import { useEffect, useRef, useState } from "react";
import { CircleAlert, ClipboardList, LoaderCircle, Wand2 } from "lucide-react";
import { useStartBuild } from "../../api/build";
import type { Project } from "../../api/projects";
import Button from "../../components/Button";
import { previewUrl } from "../../lib/previewUrl";
import { sampleAppFor } from "../../sample-apps";
import BrowserFrame, { type Device } from "./BrowserFrame";
import BuildReveal from "./BuildReveal";
import PreviewPlaceholder from "./PreviewPlaceholder";
import ReadyBanner from "./ReadyBanner";
import type { BuildProgress } from "./useBuildProgress";

const RELOAD_MS = 600;

type PreviewPanelProps = {
  project: Project;
  progress: BuildProgress | null;
};

export default function PreviewPanel({ project, progress }: PreviewPanelProps) {
  const [device, setDevice] = useState<Device>("desktop");
  const [reloadKey, setReloadKey] = useState(0);
  const [reloading, setReloading] = useState(false);
  const startBuild = useStartBuild(project.id);

  // Celebrate only when a build finishes while the user is watching, not on every visit.
  const previousStatus = useRef(project.status);
  const [justFinished, setJustFinished] = useState(false);
  useEffect(() => {
    if (previousStatus.current === "building" && project.status === "ready") setJustFinished(true);
    previousStatus.current = project.status;
  }, [project.status]);

  function reload() {
    setReloading(true);
    window.setTimeout(() => {
      setReloadKey((key) => key + 1);
      setReloading(false);
    }, RELOAD_MS);
  }

  const compact = device === "mobile";
  const App = sampleAppFor(project.template_key).component;

  let content;
  switch (project.status) {
    case "planning":
      content = (
        <PreviewPlaceholder
          icon={<LoaderCircle className="h-5 w-5 animate-spin" aria-hidden />}
          title="Architect is drafting a plan"
          body="The plan lists the agents, pages and services your app needs. Check it in the chat, and once you approve it, the build starts here."
        />
      );
      break;
    case "draft":
      content = (
        <PreviewPlaceholder
          icon={<ClipboardList className="h-5 w-5" aria-hidden />}
          title="Your app will appear here"
          body="Architect plans first. Once you approve the plan, the build starts and you can watch your app take shape in this window."
        />
      );
      break;
    case "building":
      content = progress ? (
        <BuildReveal project={project} progress={progress} compact={compact} />
      ) : (
        <PreviewPlaceholder
          icon={<LoaderCircle className="h-5 w-5 animate-spin" aria-hidden />}
          title="Starting the build"
          body="Getting everything ready to put your app together."
        />
      );
      break;
    case "error":
      content = (
        <PreviewPlaceholder
          icon={<CircleAlert className="h-5 w-5" aria-hidden />}
          title="The build hit a problem"
          body={
            startBuild.isError
              ? startBuild.error.message
              : "Something went wrong while putting your app together. Architect can look into it and try again."
          }
          action={
            <Button onClick={() => startBuild.mutate()} loading={startBuild.isPending}>
              {!startBuild.isPending && <Wand2 className="h-4 w-4" aria-hidden />}
              Fix it for me
            </Button>
          }
        />
      );
      break;
    case "ready":
      content = reloading ? (
        <div className="flex h-full items-center justify-center" role="status" aria-label="Reloading preview">
          <LoaderCircle className="h-5 w-5 animate-spin text-muted" aria-hidden />
        </div>
      ) : (
        <div className="relative h-full">
          {justFinished && <ReadyBanner />}
          <App key={reloadKey} appName={project.name} compact={compact} />
        </div>
      );
      break;
  }

  return (
    <section aria-label="Preview" className="h-full min-h-0">
      <BrowserFrame
        url={previewUrl(project.name)}
        device={device}
        onDeviceChange={setDevice}
        live={project.status === "ready"}
        onReload={reload}
        onOpenInNewTab={() => window.open(`/project/${project.id}/preview`, "_blank", "noopener")}
      >
        {content}
      </BrowserFrame>
    </section>
  );
}
