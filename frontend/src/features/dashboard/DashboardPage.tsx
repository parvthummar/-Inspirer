import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { useMe } from "../../api/auth";
import AppHeader from "../../components/AppHeader";
import Button from "../../components/Button";
import ImportProjectModal from "./ImportProjectModal";
import ProjectList from "./ProjectList";
import PromptComposer, { type PromptComposerHandle } from "./PromptComposer";
import StarterTemplates from "./StarterTemplates";

export default function DashboardPage() {
  const me = useMe();
  const composerRef = useRef<PromptComposerHandle>(null);
  const [importOpen, setImportOpen] = useState(false);
  const firstName = me.data?.name.split(" ")[0];

  return (
    <div className="min-h-full">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <section className="mx-auto max-w-3xl pb-12 pt-10 sm:pt-16" aria-labelledby="dashboard-heading">
          {firstName && <p className="text-sm text-muted">Hi {firstName},</p>}
          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h1 id="dashboard-heading" className="text-2xl font-semibold tracking-tight sm:text-[28px]">
              Describe the app you want to build
            </h1>
            <Button variant="ghost" onClick={() => setImportOpen(true)} className="-ml-2 self-start px-2 sm:ml-0 sm:self-auto">
              <Download className="h-4 w-4" aria-hidden />
              Import a project
            </Button>
          </div>
          <p className="mt-1.5 text-sm text-muted">
            Say what it should do and who uses it. Architect replies with a plan you can check before anything is built.
          </p>
          <div className="mt-6">
            <PromptComposer ref={composerRef} />
          </div>
        </section>

        <div className="space-y-12">
          <ProjectList onStartNew={() => composerRef.current?.fill("")} />
          <StarterTemplates onPick={(template) => composerRef.current?.fill(template.prompt)} />
        </div>
      </main>

      {importOpen && <ImportProjectModal onClose={() => setImportOpen(false)} />}
    </div>
  );
}
