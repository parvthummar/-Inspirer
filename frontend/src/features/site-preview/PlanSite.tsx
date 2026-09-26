import { useState, type CSSProperties } from "react";
import type { PlanContent } from "../../api/plans";
import SiteHome from "./SiteHome";
import SitePage from "./SitePage";
import { brandColour, initials } from "./siteContent";

type PlanSiteProps = {
  appName: string;
  /** The project's plan. Without one, a simple home page is shown from the description. */
  plan: PlanContent | null;
  description: string;
  compact: boolean;
};

const MAX_NAV_PAGES = 5;

/**
 * A website-style preview of the project, generated from its plan: navigation from its pages,
 * a landing page from its summary and agents, and a suitable layout for each page.
 * It doesn't run the project's code.
 */
export default function PlanSite({ appName, plan, description, compact }: PlanSiteProps) {
  const [pageIndex, setPageIndex] = useState<number | null>(null);
  const content: PlanContent = plan ?? { summary: description || `${appName}, built with Architect.`, agents: [], pages: [], integrations: [], template_key: "ops_dashboard" };
  const page = pageIndex !== null ? content.pages[pageIndex] : undefined;
  // Custom properties aren't part of CSSProperties' type, hence the cast.
  // Brand colours are saturated mid-tones, so text on them stays white in both themes.
  const brand = { "--accent-rgb": brandColour(appName), "--on-accent-rgb": "255 255 255" } as CSSProperties;

  function open(index: number) {
    setPageIndex(content.pages[index] ? index : null);
  }

  const navPages = content.pages.slice(0, MAX_NAV_PAGES);

  return (
    <div style={brand} className="flex h-full flex-col bg-surface text-ink">
      <header className="shrink-0 border-b border-line bg-panel">
        <div className={`mx-auto flex max-w-5xl items-center gap-4 ${compact ? "px-4 py-3" : "px-10 py-3.5"}`}>
          <button type="button" onClick={() => setPageIndex(null)} className="flex min-w-0 items-center gap-2 rounded-md">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-xs font-bold text-on-accent">
              {initials(appName)}
            </span>
            <span className="truncate text-sm font-semibold">{appName}</span>
          </button>
          {!compact && (
            <nav aria-label="Site" className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
              {navPages.map((p, index) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => open(index)}
                  aria-current={pageIndex === index ? "page" : undefined}
                  className={`truncate rounded-md px-2.5 py-1.5 text-sm ${pageIndex === index ? "bg-accent/10 font-medium text-accent" : "text-muted hover:text-ink"}`}
                >
                  {p.name}
                </button>
              ))}
            </nav>
          )}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {!compact && <button type="button" className="rounded-md px-3 py-1.5 text-sm text-muted hover:text-ink">Sign in</button>}
            <button type="button" onClick={() => open(0)} className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-on-accent">
              Get started
            </button>
          </div>
        </div>
        {compact && navPages.length > 0 && (
          <nav aria-label="Site" className="flex gap-1.5 overflow-x-auto border-t border-line px-4 py-2">
            {navPages.map((p, index) => (
              <button
                key={p.name}
                type="button"
                onClick={() => open(index)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${pageIndex === index ? "bg-accent text-on-accent" : "bg-surface text-muted"}`}
              >
                {p.name}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        {page ? (
          <SitePage page={page} appName={appName} agents={content.agents} compact={compact} />
        ) : (
          <SiteHome appName={appName} plan={content} compact={compact} onOpenPage={open} />
        )}
        <footer className="border-t border-line px-6 py-5 text-center text-xs text-muted">
          © 2026 {appName} · Built with Architect
        </footer>
      </main>
    </div>
  );
}
