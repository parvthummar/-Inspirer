export type ImportSource = "github" | "zip" | "platform";

export const otherPlatforms = ["Lovable", "Bolt", "Replit", "v0"] as const;
export type OtherPlatform = (typeof otherPlatforms)[number];

export type ImportStep = { label: string; durationMs: number };

/** Scripted analysis steps shown while an import "runs". Timings stay within 300 ms to 2 s per step. */
export function importSteps(source: ImportSource, label: string): ImportStep[] {
  const first: Record<ImportSource, ImportStep> = {
    github: { label: `Connecting to ${label}`, durationMs: 900 },
    zip: { label: `Unpacking ${label}`, durationMs: 700 },
    platform: { label: `Opening the ${label} export`, durationMs: 800 },
  };
  return [
    first[source],
    { label: "Reading 146 files", durationMs: 1400 },
    { label: "Detecting the framework: React and FastAPI", durationMs: 1100 },
    { label: "Finding 2 agents and 5 pages", durationMs: 1300 },
    { label: "Writing a summary of what the app does", durationMs: 1700 },
  ];
}

const GITHUB_URL = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i;

/** Returns "owner/repo" for a GitHub URL, or null if the URL isn't a repository link. */
export function parseGithubRepo(url: string): string | null {
  const match = GITHUB_URL.exec(url.trim());
  return match ? `${match[1]}/${match[2]}` : null;
}

/** "acme/leave-tracker" -> "Leave tracker" */
export function projectNameFromSlug(slug: string): string {
  const words = slug
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_.]+/g, " ")
    .trim();
  return words ? words[0].toUpperCase() + words.slice(1) : "Imported project";
}
