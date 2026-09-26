import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useMe } from "../../api/auth";
import { useProjects } from "../../api/projects";
import AppShell from "../../components/AppShell";
import { useOnboarding } from "../onboarding/useOnboarding";
import WelcomeDialog from "../onboarding/WelcomeDialog";
import ImportProjectModal from "./ImportProjectModal";
import PromptComposer, { type PromptComposerHandle } from "./PromptComposer";

export default function DashboardPage() {
  const me = useMe();
  const composerRef = useRef<PromptComposerHandle>(null);
  const [importOpen, setImportOpen] = useState(false);
  const firstName = me.data?.name.split(" ")[0];
  const projects = useProjects();
  const onboarding = useOnboarding(me.data?.id ?? "anonymous");
  // The tour is for people who haven't built anything yet.
  const showWelcome = !onboarding.welcomeSeen && projects.data?.length === 0;

  // "New project" lands here to focus the prompt; a picked template lands here to fill it in.
  const location = useLocation();
  const navState = location.state as { focusPrompt?: number; prefill?: string } | null;
  useEffect(() => {
    if (navState?.prefill) composerRef.current?.fill(navState.prefill);
    else if (navState?.focusPrompt) composerRef.current?.fill("");
  }, [navState]);

  return (
    <AppShell>
      <main className="mx-auto flex min-h-full max-w-5xl flex-col justify-center gap-8 px-4 pb-16 sm:px-6">
        <section className="mx-auto w-full max-w-3xl" aria-labelledby="dashboard-heading">
          {firstName && <p className="text-sm text-muted">Hi {firstName},</p>}
          <h1 id="dashboard-heading" className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
            Describe the app you want to build
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Say what it should do and who uses it. Architect replies with a plan you can check before anything is built.
          </p>
          <div className="mt-6">
            <PromptComposer ref={composerRef} onImport={() => setImportOpen(true)} />
          </div>
        </section>

      </main>

      {importOpen && <ImportProjectModal onClose={() => setImportOpen(false)} />}
      {showWelcome && (
        <WelcomeDialog
          firstName={firstName ?? "there"}
          onFinish={() => {
            onboarding.markWelcomeSeen();
            composerRef.current?.fill("");
          }}
        />
      )}
    </AppShell>
  );
}
