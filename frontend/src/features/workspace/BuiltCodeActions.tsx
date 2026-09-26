import { useState } from "react";
import { Download } from "lucide-react";
import type { Build } from "../../api/build";
import type { Project } from "../../api/projects";
import Button from "../../components/Button";
import { useToast } from "../../components/toast-context";
import { createZip, downloadBlob } from "../../lib/zip";
import { slug } from "../../mocks/generatedFiles";
import GitHubDialog from "../github/GitHubDialog";
import GitHubMark from "../github/GitHubMark";
import { useGitHub } from "../github/githubStore";
import type { ProjectFile } from "./projectFiles";

type BuiltCodeActionsProps = {
  project: Project;
  build: Build;
  files: ProjectFile[];
};

/** Code tab actions for projects Architect built: download everything as a zip, or sync with GitHub. */
export default function BuiltCodeActions({ project, build, files }: BuiltCodeActionsProps) {
  const [downloading, setDownloading] = useState(false);
  const [githubOpen, setGithubOpen] = useState(false);
  const { repo } = useGitHub(project.id);
  const toast = useToast();

  async function download() {
    setDownloading(true);
    try {
      const folder = slug(project.name);
      const entries = await Promise.all(
        files.map(async (file) => {
          const loaded = await file.load();
          return { path: `${folder}/${file.path}`, content: typeof loaded === "string" ? loaded : loaded.content };
        }),
      );
      downloadBlob(createZip(entries), `${folder}.zip`);
      toast(`Downloaded ${entries.length} files`);
    } catch {
      toast("The download didn't finish. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={download} loading={downloading} className="px-2.5 py-1 text-xs">
        {!downloading && <Download className="h-3.5 w-3.5" aria-hidden />}
        {downloading ? "Preparing zip" : "Download code"}
      </Button>
      <Button variant="secondary" onClick={() => setGithubOpen(true)} className="px-2.5 py-1 text-xs">
        <GitHubMark className="h-3.5 w-3.5" />
        {repo ? `Synced with ${repo.owner}/${repo.name}` : "Sync with GitHub"}
      </Button>
      <span className="ml-auto text-[11px] text-muted">{files.length} files · .zip, ready to open in your editor</span>
      {githubOpen && <GitHubDialog project={project} build={build} onClose={() => setGithubOpen(false)} />}
    </>
  );
}
