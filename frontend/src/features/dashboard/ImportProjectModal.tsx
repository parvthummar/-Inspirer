import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { FileArchive, GitBranch, Layers, Lock, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateProject, useUpdateProject } from "../../api/projects";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import TextField from "../../components/TextField";
import { useToast } from "../../components/toast-context";
import { existingRepos } from "../../mocks/githubRepos";
import {
  importSteps,
  otherPlatforms,
  parseGithubRepo,
  projectNameFromSlug,
  type ImportSource,
  type ImportStep,
  type OtherPlatform,
} from "../../mocks/importFlow";
import { importPrompt, summarizeImport, type ImportSummary } from "../../mocks/importSummaries";
import { useGitHubAccount } from "../github/githubStore";
import ImportProgress from "./ImportProgress";
import ImportSummaryView from "./ImportSummaryView";

const MAX_ZIP_BYTES = 50 * 1024 * 1024;

const sources: { id: ImportSource; label: string; icon: typeof GitBranch }[] = [
  { id: "github", label: "GitHub repository", icon: GitBranch },
  { id: "zip", label: "Zip file", icon: FileArchive },
  { id: "platform", label: "Another platform", icon: Layers },
];

type Analysis = { sourceLabel: string; steps: ImportStep[]; summary: ImportSummary; suggestedName: string };

function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Import in three stages: choose a source, watch Architect read it, then check what it understood. */
export default function ImportProjectModal({ onClose }: { onClose: () => void }) {
  const [source, setSource] = useState<ImportSource>("github");
  const [repoUrl, setRepoUrl] = useState("");
  const [repoError, setRepoError] = useState<string>();
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipError, setZipError] = useState<string>();
  const [platform, setPlatform] = useState<OtherPlatform>("Lovable");
  const [exportUrl, setExportUrl] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");

  const githubAccount = useGitHubAccount();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const navigate = useNavigate();
  const toast = useToast();

  const analysing = analysis !== null && currentStep < analysis.steps.length;
  const importing = createProject.isPending || updateProject.isPending;
  const failure = createProject.error ?? updateProject.error;

  // Walk through the scripted analysis steps, then show the summary.
  useEffect(() => {
    if (!analysis || currentStep >= analysis.steps.length) return;
    const timer = window.setTimeout(() => setCurrentStep((step) => step + 1), analysis.steps[currentStep].durationMs);
    return () => window.clearTimeout(timer);
  }, [analysis, currentStep]);

  function handleZipChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setZipError(undefined);
    if (file && !file.name.toLowerCase().endsWith(".zip")) {
      setZipError("Choose a .zip file.");
      setZipFile(null);
      return;
    }
    if (file && file.size > MAX_ZIP_BYTES) {
      setZipError("This file is larger than 50 MB. Remove build folders like node_modules and try again.");
      setZipFile(null);
      return;
    }
    setZipFile(file);
  }

  function analyse(): Analysis | null {
    if (source === "github") {
      const repo = parseGithubRepo(repoUrl);
      if (!repo) {
        setRepoError("Paste a repository link like github.com/your-team/your-app.");
        return null;
      }
      const label = `github.com/${repo}`;
      return { sourceLabel: label, steps: importSteps("github", label), summary: summarizeImport("github", repo), suggestedName: projectNameFromSlug(repo.split("/")[1]) };
    }
    if (source === "zip") {
      if (!zipFile) {
        setZipError("Choose a .zip file to import.");
        return null;
      }
      return { sourceLabel: zipFile.name, steps: importSteps("zip", zipFile.name), summary: summarizeImport("zip", zipFile.name), suggestedName: projectNameFromSlug(zipFile.name) };
    }
    const label = exportUrl.trim() ? `${platform} (${exportUrl.trim()})` : platform;
    return { sourceLabel: label, steps: importSteps("platform", platform), summary: summarizeImport("platform", platform, exportUrl), suggestedName: `${platform} import` };
  }

  function start(event: FormEvent) {
    event.preventDefault();
    const next = analyse();
    if (!next) return;
    setName(next.suggestedName);
    setCurrentStep(0);
    setAnalysis(next);
  }

  function finishImport() {
    if (!analysis || !name.trim()) return;
    const projectName = name.trim();
    createProject.mutate(importPrompt(projectName, analysis.sourceLabel, analysis.summary), {
      onSuccess: (project) =>
        updateProject.mutate(
          { id: project.id, changes: { name: projectName } },
          {
            onSuccess: () => {
              toast("Project imported");
              navigate(`/project/${project.id}`);
            },
          },
        ),
    });
  }

  function startOver() {
    createProject.reset();
    updateProject.reset();
    setAnalysis(null);
    setCurrentStep(0);
  }

  if (analysis && analysing) {
    return (
      <Modal title={`Reading ${analysis.suggestedName}`} description={`Architect is going through ${analysis.sourceLabel} so it can pick up from here.`} onClose={onClose} dismissible={false}>
        <ImportProgress steps={analysis.steps} current={currentStep} />
      </Modal>
    );
  }

  if (analysis) {
    return (
      <Modal
        title="Here's what I understood"
        description={`From ${analysis.sourceLabel}. Check it looks right, then import.`}
        onClose={onClose}
        dismissible={!importing}
        footer={
          <>
            <Button variant="secondary" onClick={startOver} disabled={importing}>
              Start over
            </Button>
            <Button onClick={finishImport} loading={importing} disabled={!name.trim()}>
              {importing ? "Importing project" : "Import project"}
            </Button>
          </>
        }
      >
        {failure && (
          <div className="mb-4">
            <Alert>The project wasn't imported. {failure.message}</Alert>
          </div>
        )}
        <ImportSummaryView
          summary={analysis.summary}
          name={name}
          onNameChange={setName}
          nameError={name.trim() ? undefined : "Give the project a name."}
        />
      </Modal>
    );
  }

  const repos = githubAccount ? existingRepos(githubAccount.username) : [];

  return (
    <Modal
      title="Import a project"
      description="Bring in an app you've already started. Architect reads it and picks up where you left off."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="import-form">
            Continue
          </Button>
        </>
      }
    >
      <form id="import-form" onSubmit={start} noValidate>
        <div role="radiogroup" aria-label="Import from" className="grid grid-cols-3 gap-2">
          {sources.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={source === id}
              onClick={() => setSource(id)}
              className={`flex flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center text-xs font-medium transition-colors sm:text-sm ${
                source === id ? "border-accent bg-accent/5 text-accent" : "border-line text-muted hover:text-ink"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {source === "github" && (
            <div className="space-y-4">
              {repos.length > 0 && (
                <fieldset>
                  <legend className="text-sm font-medium">Your repositories</legend>
                  <ul className="mt-1.5 max-h-44 divide-y divide-line overflow-y-auto rounded-md border border-line">
                    {repos.map((repo) => {
                      const link = `github.com/${repo.owner}/${repo.name}`;
                      return (
                        <li key={link}>
                          <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-surface has-[:checked]:bg-accent/5">
                            <input
                              type="radio"
                              name="repo"
                              checked={repoUrl === link}
                              onChange={() => {
                                setRepoUrl(link);
                                setRepoError(undefined);
                              }}
                              className="accent-[rgb(var(--accent-rgb))]"
                            />
                            <span className="min-w-0 flex-1 truncate font-mono text-xs">
                              {repo.owner}/{repo.name}
                            </span>
                            {repo.private && <Lock className="h-3 w-3 text-muted" aria-label="Private" />}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              )}
              <TextField
                label={repos.length ? "Or paste a repository link" : "Repository link"}
                placeholder="github.com/your-team/your-app"
                value={repoUrl}
                data-autofocus
                onChange={(event) => {
                  setRepoUrl(event.target.value);
                  setRepoError(undefined);
                }}
                error={repoError}
                hint={
                  githubAccount
                    ? `Connected as ${githubAccount.username}.`
                    : "Public repositories work straight away. For private ones, connect GitHub from any project first."
                }
              />
            </div>
          )}

          {source === "zip" && (
            <div>
              <input type="file" accept=".zip,application/zip" className="sr-only" id="zip-input" onChange={handleZipChange} />
              <label
                htmlFor="zip-input"
                className={`flex cursor-pointer flex-col items-center rounded-lg border border-dashed px-4 py-8 text-center transition-colors hover:border-accent/60 hover:bg-accent/5 ${
                  zipError ? "border-danger" : "border-line"
                }`}
              >
                <UploadCloud className="h-6 w-6 text-muted" aria-hidden />
                {zipFile ? (
                  <>
                    <span className="mt-2 font-mono text-sm">{zipFile.name}</span>
                    <span className="mt-0.5 text-xs text-muted">{formatBytes(zipFile.size)}. Click to choose a different file.</span>
                  </>
                ) : (
                  <>
                    <span className="mt-2 text-sm font-medium">Choose a .zip file</span>
                    <span className="mt-0.5 text-xs text-muted">Up to 50 MB</span>
                  </>
                )}
              </label>
              {zipError && <p className="mt-1.5 text-xs text-danger">{zipError}</p>}
            </div>
          )}

          {source === "platform" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="platform" className="block text-sm font-medium">
                  Platform
                </label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(event) => setPlatform(event.target.value as OtherPlatform)}
                  className="mt-1.5 block w-full rounded-md border border-line bg-panel px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  {otherPlatforms.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
              <TextField
                label="Export or share link (optional)"
                placeholder={`Paste the link ${platform} gave you`}
                value={exportUrl}
                onChange={(event) => setExportUrl(event.target.value)}
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
