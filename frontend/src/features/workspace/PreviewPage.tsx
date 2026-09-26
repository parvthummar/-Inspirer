import { useEffect, useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useProject } from "../../api/projects";
import FullPageLoader from "../../components/FullPageLoader";
import { previewUrl } from "../../lib/previewUrl";
import PlanSite from "../site-preview/PlanSite";
import EditLayer from "../visual-edit/EditLayer";
import { usePlanContent } from "./usePlanContent";

const COMPACT_BELOW_PX = 640;

/** The built app on its own page, as opened from the preview's "Open in a new tab" button. */
export default function PreviewPage() {
  const { id = "" } = useParams();
  const project = useProject(id);
  const plan = usePlanContent(id);
  const [compact, setCompact] = useState(() => window.innerWidth < COMPACT_BELOW_PX);

  useEffect(() => {
    const update = () => setCompact(window.innerWidth < COMPACT_BELOW_PX);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (project.data) document.title = `${project.data.name} · Preview`;
  }, [project.data]);

  if (project.isPending) return <FullPageLoader label="Loading the preview" />;

  if (project.isError || project.data.status !== "ready") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm font-medium">This preview isn't available</p>
        <p className="max-w-sm text-sm text-muted">
          {project.isError ? project.error.message : "The app hasn't finished building yet."}
        </p>
        <Link to={`/project/${id}`} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent/90">
          Back to the workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 shrink-0 items-center gap-3 bg-ink px-3 text-xs text-panel/80">
        <Link to={`/project/${id}`} className="flex items-center gap-1.5 rounded hover:text-panel">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to workspace
        </Link>
        <span className="flex min-w-0 items-center gap-1.5 font-mono">
          <Lock className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{previewUrl(project.data.name)}</span>
        </span>
        <span className="ml-auto hidden text-panel/60 sm:inline">Preview built by Architect</span>
      </div>
      <div className="min-h-0 flex-1">
        {/* Not editable here, but shows the changes made with click-to-edit. */}
        <EditLayer project={project.data} editing={false}>
          <PlanSite appName={project.data.name} plan={plan} description={project.data.description} compact={compact} />
        </EditLayer>
      </div>
    </div>
  );
}
