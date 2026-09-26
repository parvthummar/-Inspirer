import { Bot, Check, ClipboardList, PanelsTopLeft } from "lucide-react";

/** Small drawings of each step, built from the same pieces as the real interface. */
export default function WelcomeIllustration({ step }: { step: number }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-lg bg-surface p-5" aria-hidden>
      {step === 0 && (
        <div className="w-full max-w-xs rounded-lg border border-line bg-panel p-3 shadow-sm">
          <p className="text-xs leading-relaxed">
            A tool where my team logs customer calls, and an agent writes a follow-up email for each one
            <span className="ml-0.5 inline-block h-3.5 w-px translate-y-0.5 animate-pulse bg-ink" />
          </p>
          <div className="mt-3 flex justify-end">
            <span className="rounded-md bg-accent px-2 py-1 text-[10px] font-medium text-panel">Plan my app</span>
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="w-full max-w-xs rounded-lg border border-line bg-panel p-3 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-semibold">
            <ClipboardList className="h-3.5 w-3.5 text-accent" />
            Plan
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-[11px]">
            <Bot className="h-3 w-3 text-accent" />
            Follow-up agent
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[11px]">
            <PanelsTopLeft className="h-3 w-3 text-muted" />
            Call log, Email drafts
          </p>
          <div className="mt-3 flex gap-1.5">
            <span className="rounded-md bg-accent px-2 py-1 text-[10px] font-medium text-panel">Approve plan</span>
            <span className="rounded-md border border-line px-2 py-1 text-[10px]">Edit plan</span>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="relative w-full max-w-xs overflow-hidden rounded-lg border border-line bg-panel shadow-sm">
          <div className="h-1 bg-accent/15">
            <div className="h-1 w-2/3 bg-accent" />
          </div>
          <div className="flex">
            <div className="w-16 space-y-1.5 border-r border-line p-2">
              <div className="h-2 rounded bg-accent/30" />
              <div className="h-2 rounded bg-surface" />
              <div className="h-2 rounded bg-surface" />
            </div>
            <div className="flex-1 space-y-1.5 p-2">
              <div className="h-3 w-2/3 rounded bg-surface" />
              <div className="grid grid-cols-3 gap-1">
                <div className="h-6 rounded bg-surface" />
                <div className="h-6 rounded bg-surface" />
                <div className="h-6 rounded bg-surface" />
              </div>
              <div className="h-6 rounded border border-dashed border-line" />
            </div>
          </div>
          <p className="flex items-center gap-1 border-t border-line px-2 py-1.5 text-[10px] text-muted">
            <Check className="h-3 w-3 text-success" />
            Building the Call log page
          </p>
        </div>
      )}
    </div>
  );
}
