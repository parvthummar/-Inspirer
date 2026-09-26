import { useState } from "react";
import { CircleAlert, ClipboardList, LoaderCircle, Wand2 } from "lucide-react";
import type { Project } from "../../api/projects";
import Button from "../../components/Button";
import BrowserFrame, { type Device } from "./BrowserFrame";
import PreviewPlaceholder from "./PreviewPlaceholder";

function previewUrl(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${slug || "my-app"}.architect.app`;
}

export default function PreviewPanel({ project }: { project: Project }) {
  const [device, setDevice] = useState<Device>("desktop");

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
      content = (
        <PreviewPlaceholder
          icon={<LoaderCircle className="h-5 w-5 animate-spin" aria-hidden />}
          title="Building your app"
          body="Architect is putting the pages and agents together. This usually takes under a minute."
        />
      );
      break;
    case "error":
      content = (
        <PreviewPlaceholder
          icon={<CircleAlert className="h-5 w-5" aria-hidden />}
          title="The build hit a problem"
          body="Something went wrong while putting your app together. Architect can look into it and try again."
          action={
            <Button>
              <Wand2 className="h-4 w-4" aria-hidden />
              Fix it for me
            </Button>
          }
        />
      );
      break;
    case "ready":
      content = (
        <PreviewPlaceholder
          icon={<ClipboardList className="h-5 w-5" aria-hidden />}
          title="Your app is ready"
          body="Open the preview to try it out."
        />
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
      >
        {content}
      </BrowserFrame>
    </section>
  );
}
