import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Pencil } from "lucide-react";
import { useUpdateProject, type Project } from "../../api/projects";
import { useToast } from "../../components/toast-context";

const MAX_LENGTH = 120;

export default function ProjectNameEditor({ project }: { project: Project }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(project.name);
  const updateProject = useUpdateProject();
  const toast = useToast();

  function startEditing() {
    setDraft(project.name);
    updateProject.reset();
    setEditing(true);
  }

  function save(event?: FormEvent) {
    event?.preventDefault();
    const name = draft.trim();
    if (!name || name === project.name) {
      setEditing(false);
      return;
    }
    updateProject.mutate(
      { id: project.id, changes: { name } },
      {
        onSuccess: () => {
          setEditing(false);
          toast("Project renamed");
        },
      },
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setDraft(project.name);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={save} className="relative min-w-0 flex-1 sm:max-w-sm">
        <label htmlFor="project-name" className="sr-only">
          Project name
        </label>
        <input
          id="project-name"
          autoFocus
          value={draft}
          maxLength={MAX_LENGTH}
          disabled={updateProject.isPending}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => save()}
          onFocus={(event) => event.target.select()}
          className="w-full rounded-md border border-accent bg-panel px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        {updateProject.isError && (
          <p className="absolute left-0 top-full mt-1 whitespace-nowrap rounded-md bg-panel px-2 py-1 text-xs text-danger shadow">
            {updateProject.error.message}
          </p>
        )}
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      title="Rename project"
      className="group flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-left hover:bg-surface"
    >
      <h1 className="truncate text-sm font-semibold">{project.name}</h1>
      <Pencil className="h-3.5 w-3.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden />
      <span className="sr-only">Rename project</span>
    </button>
  );
}
