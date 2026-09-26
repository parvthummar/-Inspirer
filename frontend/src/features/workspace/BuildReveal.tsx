import { useEffect, useRef } from "react";
import type { Project } from "../../api/projects";
import { sampleAppFor } from "../../sample-apps";
import type { BuildProgress } from "./useBuildProgress";

type BuildRevealProps = {
  project: Project;
  progress: BuildProgress;
  compact: boolean;
};

/**
 * The one bold moment in the product: the app assembles from top to bottom while the build runs.
 * Above the scan line is the real app; below it, a wireframe of what's still being built.
 */
export default function BuildReveal({ project, progress, compact }: BuildRevealProps) {
  const appRef = useRef<HTMLDivElement>(null);
  const App = sampleAppFor(project.template_key).component;
  const revealed = Math.round(progress.fraction * 100);
  const developer = project.view_mode === "developer";
  const step = progress.currentStep;

  // The app underneath can't be used until it's built. React 18 doesn't type `inert`, so set it directly.
  useEffect(() => {
    appRef.current?.setAttribute("inert", "");
  }, []);

  return (
    <div className="relative h-full overflow-hidden" aria-busy="true">
      <div ref={appRef} className="h-full" aria-hidden>
        <App appName={project.name} compact={compact} />
      </div>

      {/* Not-yet-built part: wireframe below the scan line. */}
      <div
        className="absolute inset-x-0 bottom-0 overflow-hidden bg-panel transition-[top] duration-300 ease-out"
        style={{ top: `${revealed}%` }}
        aria-hidden
      >
        <div className="space-y-4 p-6 opacity-70">
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 animate-pulse rounded-lg bg-surface" />
            <div className="h-20 animate-pulse rounded-lg bg-surface [animation-delay:150ms]" />
            <div className="h-20 animate-pulse rounded-lg bg-surface [animation-delay:300ms]" />
          </div>
          <div className="h-44 animate-pulse rounded-lg bg-surface" />
          <div className="h-24 animate-pulse rounded-lg bg-surface" />
        </div>
      </div>

      {/* Scan line with a soft glow. */}
      <div
        className="pointer-events-none absolute inset-x-0 h-px bg-accent transition-[top] duration-300 ease-out"
        style={{ top: `${revealed}%`, boxShadow: "0 0 24px 6px rgb(var(--accent-rgb) / 0.35)" }}
        aria-hidden
      />

      {/* Progress along the top edge. */}
      <div className="absolute inset-x-0 top-0 h-1 bg-accent/15" aria-hidden>
        <div className="h-1 bg-accent transition-[width] duration-300 ease-out" style={{ width: `${revealed}%` }} />
      </div>

      {/* What's happening right now. */}
      <div className="absolute inset-x-0 bottom-5 flex justify-center px-4">
        <div
          role="status"
          aria-live="polite"
          className="flex w-full max-w-sm items-center gap-3 rounded-xl bg-ink px-4 py-3 text-panel shadow-[0_12px_32px_rgba(22,32,42,0.35)]"
        >
          <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0 -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgb(255 255 255 / 0.15)" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${progress.fraction * 94.2} 94.2`}
              className="transition-[stroke-dasharray] duration-300"
            />
          </svg>
          <div className="min-w-0 flex-1">
            <p className={`truncate text-sm font-medium ${developer ? "font-mono text-[13px]" : ""}`}>
              {developer ? step.dev_label : step.label}
            </p>
            <p className="text-xs text-panel/60">
              Step {progress.currentIndex + 1} of {progress.build.steps.length} · {revealed}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
