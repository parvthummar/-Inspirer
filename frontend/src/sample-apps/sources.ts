import type { TemplateKey } from "./templateKeys";

/** The sample apps' own source, loaded as text on demand, so the Code tab shows real code. */
const rawSources = import.meta.glob("./**/*.{ts,tsx}", { query: "?raw", import: "default" }) as Record<
  string,
  () => Promise<string>
>;

const FOLDERS: Record<TemplateKey, string> = {
  support_desk: "support-desk",
  leave_tracker: "leave-tracker",
  sales_crm: "sales-crm",
  meeting_notes: "meeting-notes",
  ops_dashboard: "ops-dashboard",
};

export type SourceFile = {
  /** File name without folder, e.g. "InboxView.tsx". */
  name: string;
  kind: "app" | "data" | "view" | "shared";
  load: () => Promise<string>;
};

/** Source files for one sample app plus the shared building blocks it uses. */
export function sourceFilesFor(templateKey: TemplateKey): SourceFile[] {
  const folder = FOLDERS[templateKey];
  const files: SourceFile[] = [];
  for (const [path, load] of Object.entries(rawSources)) {
    const [, dir, name] = path.split("/");
    if (!name) continue;
    if (dir === folder) {
      const kind = name === "data.ts" ? "data" : name.endsWith("App.tsx") ? "app" : "view";
      files.push({ name, kind, load });
    } else if (dir === "shared") {
      files.push({ name, kind: "shared", load });
    }
  }
  return files.sort((a, b) => a.name.localeCompare(b.name));
}
