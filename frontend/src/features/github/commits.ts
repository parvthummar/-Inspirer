import type { Build } from "../../api/build";
import type { LinkedRepo } from "./githubStore";

export type Commit = { sha: string; message: string; author: string; at: string; files: number };

function sha(seed: string): string {
  let value = 2166136261;
  for (const char of seed) value = Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0;
  return (value.toString(16) + (value * 7).toString(16)).padEnd(12, "0").slice(0, 7);
}

/** Commit history: Architect's commits come from the real build steps; pulled commits come from GitHub. */
export function commitHistory(projectName: string, repo: LinkedRepo, build: Build | undefined): Commit[] {
  const commits: Commit[] = [
    {
      sha: sha(repo.linkedAt + projectName),
      message: repo.mode === "created" ? `Initial commit: ${projectName}` : `Connect ${projectName} to Architect`,
      author: "architect-bot",
      at: repo.linkedAt,
      files: 3,
    },
  ];

  const linkedAt = new Date(repo.linkedAt).getTime();
  const buildEnd = build ? new Date(build.started_at).getTime() + build.total_ms : 0;

  if (build && buildEnd <= linkedAt) {
    // Built before the repository was connected: everything went up in one push.
    commits.push({
      sha: sha("push" + build.started_at),
      message: "Add app built by Architect",
      author: "architect-bot",
      at: new Date(linkedAt + 1000).toISOString(),
      files: 14 + build.steps.length * 2,
    });
  } else if (build) {
    const start = new Date(build.started_at).getTime();
    let offset = 0;
    const groups: { key: string; message: string; steps: number; at: number }[] = [];
    for (const step of build.steps) {
      offset += step.duration_ms;
      const key = step.id.split("-")[0];
      const existing = groups.find((group) => group.key === key);
      if (existing) {
        existing.steps += 1;
        existing.at = start + offset;
      } else {
        groups.push({ key, message: step.dev_label, steps: 1, at: start + offset });
      }
    }
    const describe: Record<string, (message: string, count: number) => string> = {
      setup: () => "Scaffold frontend and backend",
      database: () => "Add database schema and seed data",
      page: (_, count) => `Add ${count} ${count === 1 ? "page" : "pages"}`,
      agent: (_, count) => `Add ${count} ${count === 1 ? "agent" : "agents"} with tools`,
      integration: (_, count) => `Configure ${count} ${count === 1 ? "connector" : "connectors"}`,
      tests: (message) => message.replace("Running", "Add").replace(/tests$/, "tests"),
      publish: () => "Deploy preview",
    };
    for (const group of groups) {
      const at = new Date(Math.max(group.at, linkedAt + 1000)).toISOString();
      commits.push({
        sha: sha(group.key + build.started_at),
        message: (describe[group.key] ?? ((m: string) => m))(group.message, group.steps),
        author: "architect-bot",
        at,
        files: 2 + group.steps * 2,
      });
    }
  }

  for (const pulled of repo.pulled) commits.push({ ...pulled, files: 1 });
  return commits.sort((a, b) => b.at.localeCompare(a.at));
}
