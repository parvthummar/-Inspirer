import type { ImportSource } from "./importFlow";

/** What Architect "understood" from an imported project. Generated from the source name, so it looks specific. */
export type ImportSummary = {
  description: string;
  pages: string[];
  agents: { name: string; role: string }[];
  integrations: string[];
  stack: string[];
  files: number;
  languages: { name: string; share: number }[];
  notes: { tone: "info" | "warn"; text: string }[];
  /** Start of the README, for real GitHub imports. */
  readme_excerpt?: string;
};

type Kind = "support" | "sales" | "people" | "docs" | "general";

const KEYWORDS: [Kind, RegExp][] = [
  ["support", /support|help|desk|ticket|chat|bot/],
  ["sales", /sales|crm|lead|deal|customer-portal|pipeline/],
  ["people", /hr|leave|time-?off|holiday|staff|people|hiring/],
  ["docs", /note|meeting|doc|wiki|knowledge|summar/],
];

const CONTENT: Record<Kind, Pick<ImportSummary, "description" | "pages" | "agents" | "integrations">> = {
  support: {
    description: "a customer support app where an assistant answers questions and passes tricky ones to your team",
    pages: ["Inbox", "Conversation view", "Help articles", "Settings"],
    agents: [{ name: "Support assistant", role: "Answers questions from the help articles and hands off when unsure" }],
    integrations: ["Zendesk", "Slack"],
  },
  sales: {
    description: "a sales tool that keeps track of leads and helps reps decide who to contact next",
    pages: ["Leads", "Lead details", "Pipeline", "Reports"],
    agents: [{ name: "Lead scorer", role: "Scores new leads and drafts a first email" }],
    integrations: ["HubSpot", "Gmail"],
  },
  people: {
    description: "an internal HR tool where people send requests and managers approve them",
    pages: ["My requests", "Approvals", "Team calendar"],
    agents: [],
    integrations: ["Google Calendar", "Slack"],
  },
  docs: {
    description: "a notes app that stores documents and makes them easy to search",
    pages: ["Documents", "Document view", "Search"],
    agents: [{ name: "Summariser", role: "Writes a short summary for each new document" }],
    integrations: ["Google Drive"],
  },
  general: {
    description: "an internal tool with a dashboard, a list of records and a settings page",
    pages: ["Dashboard", "Records", "Settings"],
    agents: [],
    integrations: ["Email"],
  },
};

const STACKS: Record<string, { stack: string[]; languages: ImportSummary["languages"] }> = {
  github: {
    stack: ["React 18 + TypeScript (Vite)", "FastAPI (Python)", "PostgreSQL"],
    languages: [{ name: "TypeScript", share: 61 }, { name: "Python", share: 33 }, { name: "CSS", share: 6 }],
  },
  zip: {
    stack: ["Next.js 14", "Prisma", "SQLite"],
    languages: [{ name: "TypeScript", share: 88 }, { name: "CSS", share: 9 }, { name: "Other", share: 3 }],
  },
  Lovable: {
    stack: ["React + Vite", "Supabase (database and sign-in)", "Tailwind CSS"],
    languages: [{ name: "TypeScript", share: 90 }, { name: "SQL", share: 6 }, { name: "CSS", share: 4 }],
  },
  Bolt: {
    stack: ["React + Vite", "Node.js with Express", "SQLite"],
    languages: [{ name: "TypeScript", share: 72 }, { name: "JavaScript", share: 24 }, { name: "CSS", share: 4 }],
  },
  Replit: {
    stack: ["Flask (Python)", "Jinja templates", "SQLite"],
    languages: [{ name: "Python", share: 70 }, { name: "HTML", share: 22 }, { name: "CSS", share: 8 }],
  },
  v0: {
    stack: ["Next.js 14", "shadcn/ui", "No backend"],
    languages: [{ name: "TypeScript", share: 94 }, { name: "CSS", share: 6 }],
  },
};

const PLATFORM_NOTES: Record<string, ImportSummary["notes"][number]> = {
  Lovable: { tone: "info", text: "Your data lives in Supabase. Architect copies it into its own database; nothing is deleted in Supabase." },
  Bolt: { tone: "info", text: "The Express server will be moved to Architect's backend so agents can use it." },
  Replit: { tone: "info", text: "Secrets stored in Replit aren't included in exports. Add them again in Deploy settings." },
  v0: { tone: "info", text: "This export only has the screens. Architect will add a backend and agents when you ask for them." },
};

/** `hint` is extra text to read the app's purpose from, e.g. a platform's share link. */
export function summarizeImport(source: ImportSource, label: string, hint = ""): ImportSummary {
  const text = `${label} ${hint}`.toLowerCase();
  const kind = KEYWORDS.find(([, pattern]) => pattern.test(text))?.[0] ?? "general";
  const content = CONTENT[kind];
  const stackKey = source === "platform" ? label : source;
  const { stack, languages } = STACKS[stackKey] ?? STACKS.github;

  const notes: ImportSummary["notes"] = [];
  if (source === "platform" && PLATFORM_NOTES[label]) notes.push(PLATFORM_NOTES[label]);
  if (source === "zip") notes.push({ tone: "warn", text: "A .env file was found and left out for safety. Add those keys again in Deploy settings." });
  if (source === "github") notes.push({ tone: "warn", text: "2 tests were failing in the repository. Architect will look at them after the import." });
  if (content.agents.length === 0) notes.push({ tone: "info", text: "No AI agents yet. Architect can suggest where one would help." });

  return {
    ...content,
    stack,
    languages,
    files: 80 + (label.length * 13) % 140,
    notes,
  };
}

/** The first chat message for an imported project, so the plan continues the app instead of starting over. */
export function importPrompt(name: string, sourceLabel: string, summary: ImportSummary): string {
  const agents = summary.agents.length ? summary.agents.map((agent) => `${agent.name} (${agent.role})`).join("; ") : "none yet";
  return [
    `Continue building "${name}", imported from ${sourceLabel}.`,
    `It is ${summary.description}.`,
    `Existing pages: ${summary.pages.join(", ")}.`,
    `Existing agents: ${agents}.`,
    `It connects to: ${summary.integrations.join(", ") || "nothing yet"}.`,
    summary.stack.length ? `Built with: ${summary.stack.join(", ")}.` : "",
    summary.readme_excerpt ? `From its README: ${summary.readme_excerpt.replace(/\s+/g, " ").slice(0, 1500)}` : "",
    "Keep what already works and suggest the most useful next improvements.",
  ]
    .filter(Boolean)
    .join(" ");
}
