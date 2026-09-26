import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { FileArchive, GitBranch, Layers, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateProject, useUpdateProject } from "../../api/projects";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import TextField from "../../components/TextField";
import { useToast } from "../../components/toast-context";
import {
  importSteps,
  otherPlatforms,
  parseGithubRepo,
  projectNameFromSlug,
  type ImportSource,
  type ImportStep,
  type OtherPlatform,
} from "../../mocks/importFlow";
import ImportProgress from "./ImportProgress";

const MAX_ZIP_BYTES = 50 * 1024 * 1024;

const sources: { id: ImportSource; label: string; icon: typeof GitBranch }[] = [
  { id: "github", label: "GitHub repository", icon: GitBranch },
  { id: "zip", label: "Zip file", icon: FileArchive },
  { id: "platform", label: "Another platform", icon: Layers },
];

type ImportPlan = { name: string; sourceLabel: string; steps: ImportStep[]; prompt: string };

function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function ImportProjectModal({ onClose }: { onClose: () => void }) {
  const [source, setSource] = useState<ImportSource>("github");
  const [repoUrl, setRepoUrl] = useState("");
  const [repoError, setRepoError] = useState<string>();
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [zipError, setZipError] = useState<string>();
  const [platform, setPlatform] = useState<OtherPlatform>("Lovable");
  const [exportUrl, setExportUrl] = useState("");
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const navigate = useNavigate();
  const toast = useToast();

  const running = plan !== null && !createProject.isError && !updateProject.isError;

  // Walk through the scripted steps, then create the project for real.
  useEffect(() => {
    if (!plan) return;
    if (currentStep < plan.steps.length) {
      const timer = window.setTimeout(() => setCurrentStep((step) => step + 1), plan.steps[currentStep].durationMs);
      return () => window.clearTimeout(timer);
    }
    createProject.mutate(plan.prompt, {
      onSuccess: (project) =>
        updateProject.mutate(
          { id: project.id, changes: { name: plan.name } },
          {
            onSuccess: () => {
              toast("Project imported");
              navigate(`/project/${project.id}`);
            },
          },
        ),
    });
    // Mutations are stable; this should run once per step change only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, currentStep]);

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

  function buildPlan(): ImportPlan | null {
    if (source === "github") {
      const repo = parseGithubRepo(repoUrl);
      if (!repo) {
        setRepoError("Paste a repository link like github.com/your-team/your-app.");
        return null;
      }
      return {
        name: projectNameFromSlug(repo.split("/")[1]),
        sourceLabel: `github.com/${repo}`,
        steps: importSteps("github", `github.com/${repo}`),
        prompt: `Continue building the app imported from the GitHub repository github.com/${repo}.`,
      };
    }
    if (source === "zip") {
      if (!zipFile) {
        setZipError("Choose a .zip file to import.");
        return null;
      }
      return {
        name: projectNameFromSlug(zipFile.name),
        sourceLabel: zipFile.name,
        steps: importSteps("zip", zipFile.name),
        prompt: `Continue building the app imported from the uploaded file ${zipFile.name}.`,
      };
    }
    return {
      name: `${platform} export`,
      sourceLabel: platform,
      steps: importSteps("platform", platform),
      prompt: `Continue building the app exported from ${platform}${exportUrl.trim() ? ` (${exportUrl.trim()})` : ""}.`,
    };
  }

  function startImport(event: FormEvent) {
    event.preventDefault();
    const nextPlan = buildPlan();
    if (!nextPlan) return;
    setCurrentStep(0);
    setPlan(nextPlan);
  }

  function retry() {
    createProject.reset();
    updateProject.reset();
    setCurrentStep(0);
    setPlan(null);
  }

  const failure = createProject.error ?? updateProject.error;

  if (plan) {
    return (
      <Modal
        title={failure ? "Import didn't finish" : `Importing ${plan.name}`}
        description={failure ? undefined : `Architect is reading ${plan.sourceLabel} so it can keep building from here.`}
        onClose={onClose}
        dismissible={!running}
        footer={
          failure ? (
            <>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button onClick={retry}>Try again</Button>
            </>
          ) : undefined
        }
      >
        {failure ? (
          <Alert>{failure.message}</Alert>
        ) : (
          <ImportProgress steps={plan.steps} current={currentStep} />
        )}
      </Modal>
    );
  }

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
            Import project
          </Button>
        </>
      }
    >
      <form id="import-form" onSubmit={startImport} noValidate>
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
            <TextField
              label="Repository link"
              placeholder="github.com/your-team/your-app"
              value={repoUrl}
              data-autofocus
              onChange={(event) => {
                setRepoUrl(event.target.value);
                setRepoError(undefined);
              }}
              error={repoError}
              hint="Public repositories work straight away. For private ones, Architect asks for access first."
            />
          )}

          {source === "zip" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,application/zip"
                className="sr-only"
                id="zip-input"
                onChange={handleZipChange}
              />
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
                  {otherPlatforms.map((name) => (
                    <option key={name}>{name}</option>
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
