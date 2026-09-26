import { Code2, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { projectKeys, useUpdateProject, type Project, type ViewMode } from "../../api/projects";
import { useToast } from "../../components/toast-context";

const options: { value: ViewMode; label: string; icon: typeof Code2; description: string }[] = [
  { value: "simple", label: "Simple", icon: Sparkles, description: "Plain language, no code" },
  { value: "developer", label: "Developer", icon: Code2, description: "Files, code, diffs and logs" },
];

/** Switches this project between Simple and Developer view. Saved per project. */
export default function ViewModeToggle({ project }: { project: Project }) {
  const updateProject = useUpdateProject();
  const queryClient = useQueryClient();
  const toast = useToast();

  function select(viewMode: ViewMode) {
    if (viewMode === project.view_mode) return;
    const key = projectKeys.detail(project.id);
    const previous = queryClient.getQueryData<Project>(key);
    // Switch instantly; roll back if saving fails.
    queryClient.setQueryData<Project>(key, (current) => current && { ...current, view_mode: viewMode });
    updateProject.mutate(
      { id: project.id, changes: { view_mode: viewMode } },
      {
        onError: () => {
          queryClient.setQueryData(key, previous);
          toast("Couldn't switch views. Please try again.");
        },
      },
    );
  }

  return (
    <div role="radiogroup" aria-label="View" className="flex rounded-lg bg-surface p-0.5">
      {options.map(({ value, label, icon: Icon, description }) => {
        const active = project.view_mode === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            title={description}
            onClick={() => select(value)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              active ? "bg-panel text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
