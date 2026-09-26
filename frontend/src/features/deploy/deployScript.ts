export type DeployStep = { label: string; devLabel: string; durationMs: number; logs: string[] };

/** Scripted production deploy (or rollback). Each step takes 0.5 to 2 seconds. */
export function deploySteps(kind: "deploy" | "rollback", version: number, host: string): DeployStep[] {
  if (kind === "rollback") {
    return [
      { label: "Finding the earlier version", devLabel: `Resolving build for v${version}`, durationMs: 700, logs: [`image architect/app:v${version} found in cache`] },
      { label: "Switching traffic", devLabel: `Routing ${host} to v${version}`, durationMs: 1300, logs: ["draining connections from current release", "health check passed (200 in 84ms)"] },
    ];
  }
  return [
    { label: "Building for production", devLabel: `Building release v${version}`, durationMs: 1800, logs: ["vite build --mode production", "bundle 212 kB (gzip 68 kB)", "python -m compileall backend"] },
    { label: "Running checks", devLabel: "Running pre-deploy checks", durationMs: 1400, logs: ["27 tests passed", "environment variables complete", "migrations up to date"] },
    { label: "Uploading your app", devLabel: "Pushing image to edge regions", durationMs: 1500, logs: ["push architect/app:v" + version, "replicated to fra1, iad1, sin1"] },
    { label: "Switching traffic", devLabel: `Routing ${host} to v${version}`, durationMs: 1000, logs: ["health check passed (200 in 91ms)", `live at https://${host}`] },
  ];
}

export function totalMs(steps: DeployStep[]): number {
  return steps.reduce((sum, step) => sum + step.durationMs, 0);
}
