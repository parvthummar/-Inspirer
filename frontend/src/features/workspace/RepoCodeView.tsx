import { useMemo } from "react";
import { ExternalLink, GitBranch, LoaderCircle } from "lucide-react";
import { fetchFileContent, useProjectFiles } from "../../api/github";
import type { Project } from "../../api/projects";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import CodeBrowser from "./CodeBrowser";
import RepoCodeActions from "./RepoCodeActions";
import type { LoadedFile, ProjectFile } from "./projectFiles";

const PREFERRED = ["README.md", "readme.md", "README.rst", "package.json", "pyproject.toml"];

function formatSize(bytes: number): string {
  return bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Code for projects imported from GitHub: the repository's real files, read on demand. */
export default function RepoCodeView({ project }: { project: Project }) {
  const repoFiles = useProjectFiles(project.id, true);

  const files = useMemo<ProjectFile[]>(() => {
    if (!repoFiles.data) return [];
    // Opened files are kept for the session, so switching back and forth doesn't fetch them again.
    const cache = new Map<string, Promise<LoadedFile>>();
    return repoFiles.data.files.map((file) => ({
      path: file.path,
      stepId: "repository",
      load: () => {
        const cached = cache.get(file.path);
        if (cached) return cached;
        const loading = fetchFileContent(project.id, file.path).then((result): LoadedFile => {
          if (result.binary) {
            return { content: "", notice: `${file.path.split("/").pop()} is a binary file (${formatSize(file.size)}), so it isn't shown as text.` };
          }
          return {
            content: result.content,
            notice: result.truncated ? `This file is ${formatSize(file.size)}; only the first 400 KB is shown.` : undefined,
          };
        });
        loading.catch(() => cache.delete(file.path));
        cache.set(file.path, loading);
        return loading;
      },
    }));
  }, [repoFiles.data, project.id]);

  if (repoFiles.isPending) {
    return (
      <p className="flex h-full items-center justify-center gap-2 bg-panel text-sm text-muted" role="status">
        <LoaderCircle className="h-4 w-4 animate-spin text-accent" aria-hidden />
        Loading the repository's files
      </p>
    );
  }
  if (repoFiles.isError) {
    return (
      <div className="space-y-3 bg-panel p-4">
        <Alert>{repoFiles.error.message}</Alert>
        <Button variant="secondary" onClick={() => repoFiles.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const repo = repoFiles.data.repository;
  const preferred = PREFERRED.find((path) => files.some((file) => file.path === path));

  return (
    <CodeBrowser
      files={files}
      preferredPath={preferred}
      toolbar={<RepoCodeActions projectId={project.id} repo={repo} />}
      footer={`From github.com/${repo.owner}/${repo.name}, ${repo.branch} branch. To change something, describe it in the chat.`}
      header={
        <span className="block space-y-0.5">
          <a
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 truncate rounded font-mono text-[11px] text-ink hover:text-accent"
            title={`Open ${repo.owner}/${repo.name} on GitHub`}
          >
            <span className="truncate">
              {repo.owner}/{repo.name}
            </span>
            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
          </a>
          <span className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" aria-hidden />
            {repo.branch} · {files.length} files{repoFiles.data.truncated ? " (first part of a large repository)" : ""}
          </span>
        </span>
      }
    />
  );
}
