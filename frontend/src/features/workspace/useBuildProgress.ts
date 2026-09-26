import { useEffect, useState } from "react";
import { useBuild, type Build, type BuildStep } from "../../api/build";
import type { Project } from "../../api/projects";

export type StepState = "done" | "running" | "pending";

export type BuildProgress = {
  build: Build;
  elapsedMs: number;
  /** 0 to 1 */
  fraction: number;
  currentIndex: number;
  currentStep: BuildStep;
  stepStates: StepState[];
  finished: boolean;
};

const TICK_MS = 100;

function progressAt(build: Build, elapsedMs: number): BuildProgress {
  let offset = 0;
  let currentIndex = build.steps.length - 1;
  const stepStates: StepState[] = build.steps.map((step, index) => {
    const start = offset;
    offset += step.duration_ms;
    if (elapsedMs >= offset) return "done";
    if (elapsedMs >= start) {
      currentIndex = index;
      return "running";
    }
    return "pending";
  });
  const finished = elapsedMs >= build.total_ms;
  return {
    build,
    elapsedMs,
    fraction: Math.min(1, elapsedMs / build.total_ms),
    currentIndex,
    currentStep: build.steps[currentIndex],
    stepStates: finished ? stepStates.map(() => "done") : stepStates,
    finished,
  };
}

/**
 * Live progress of the project's current build, or null when there is no build to show
 * (or the project hasn't loaded yet).
 * The server says how far along the build is when fetched; from there the clock runs locally.
 */
export function useBuildProgress(project: Project | undefined): BuildProgress | null {
  const status = project?.status;
  const building = status === "building";
  const build = useBuild(project?.id ?? "", building || status === "ready" || status === "error");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!building) return;
    const timer = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(timer);
  }, [building]);

  if (!build.data) return null;
  const elapsedMs = building ? build.data.elapsed_ms + (now - build.dataUpdatedAt) : build.data.total_ms;
  return progressAt(build.data, Math.max(0, elapsedMs));
}
