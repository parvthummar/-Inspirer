import { useNavigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import StarterTemplates from "./StarterTemplates";

/** Starter templates, opened from the sidebar. Picking one fills in the prompt on the home page. */
export default function TemplatesPage() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-2 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <p className="mt-1 text-sm text-muted">
          Pick one to fill in the prompt with a ready-made description, then change anything you like before planning.
        </p>
        <div className="mt-6">
          <StarterTemplates onPick={(template) => navigate("/", { state: { prefill: template.prompt } })} />
        </div>
      </main>
    </AppShell>
  );
}
