import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import Button from "../../components/Button";
import ProjectList from "./ProjectList";

/** Every project, opened from the sidebar. New projects start on the home page's prompt box. */
export default function ProjectsPage() {
  const navigate = useNavigate();
  const startNew = () => navigate("/", { state: { focusPrompt: Date.now() } });

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-2 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="mt-1 text-sm text-muted">Everything you've built or started. Open one to keep going.</p>
          </div>
          <Button onClick={startNew}>
            <Plus className="h-4 w-4" aria-hidden />
            New project
          </Button>
        </div>
        <div className="mt-6">
          <ProjectList onStartNew={startNew} />
        </div>
      </main>
    </AppShell>
  );
}
