import { FileText } from "lucide-react";

export default function PageContent({ name, purpose, compact }: { name: string; purpose: string; compact: boolean }) {
  const sections = ["Getting started", "How it works", "Frequently asked questions"];
  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm leading-relaxed text-muted">
        {purpose || `Everything about ${name.toLowerCase()} in one place.`} Keep this page up to date so everyone on the team
        knows where to look.
      </p>
      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-3"}`}>
        {sections.map((section) => (
          <article key={section} className="rounded-lg border border-line bg-panel p-4">
            <FileText className="h-4 w-4 text-accent" aria-hidden />
            <h2 className="mt-2 text-sm font-semibold">{section}</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">A short guide your team can read in under two minutes.</p>
          </article>
        ))}
      </div>
    </div>
  );
}
