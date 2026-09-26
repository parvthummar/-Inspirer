import { ArrowRight, Bot, Check, Link2, PanelsTopLeft, Sparkles } from "lucide-react";
import type { PlanContent } from "../../api/plans";
import { COMPANIES, firstSentence, hash } from "./siteContent";

type SiteHomeProps = {
  appName: string;
  plan: PlanContent;
  compact: boolean;
  onOpenPage: (index: number) => void;
};

/** The app's landing page, written from its plan: what it does, its agents, its pages and what it connects to. */
export default function SiteHome({ appName, plan, compact, onOpenPage }: SiteHomeProps) {
  const seed = hash(appName);
  const lead = plan.agents[0]?.name ?? "Your assistant";

  return (
    <div>
      <section className={`border-b border-line ${compact ? "px-4 py-8" : "px-10 py-14"}`}>
        <div className={`mx-auto grid max-w-5xl items-center gap-8 ${compact ? "grid-cols-1" : "grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"}`}>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Powered by AI agents
            </span>
            <h1 className={`mt-4 font-semibold tracking-tight ${compact ? "text-2xl" : "text-4xl"}`}>{appName}</h1>
            <p className="mt-3 max-w-md text-base leading-relaxed text-muted">{firstSentence(plan.summary)}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" onClick={() => onOpenPage(0)} className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent">
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <button type="button" onClick={() => document.getElementById("site-how")?.scrollIntoView({ behavior: "smooth" })} className="rounded-md border border-line px-4 py-2 text-sm font-medium">
                See how it works
              </button>
            </div>
          </div>
          {/* A glimpse of the app at work. */}
          <div className="rounded-xl border border-line bg-panel p-4 shadow-[0_12px_32px_rgba(22,32,42,0.10)]">
            <p className="flex items-center gap-2 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
              {lead} · live
            </p>
            <ul className="mt-3 space-y-2">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg bg-surface px-3 py-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate">{plan.agents[i % Math.max(1, plan.agents.length)]?.tools[i % 2] ?? "Handled a request"}</span>
                    <span className="block text-xs text-muted">for {COMPANIES[(seed + i) % COMPANIES.length]} · {[2, 9, 26][i]} min ago</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {plan.agents.length > 0 && (
        <section id="site-how" className={`border-b border-line ${compact ? "px-4 py-8" : "px-10 py-12"}`}>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-semibold tracking-tight">What it does for you</h2>
            <div className={`mt-5 grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-3"}`}>
              {plan.agents.map((agent) => (
                <article key={agent.name} className="rounded-xl border border-line bg-panel p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Bot className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold">{agent.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{agent.role}</p>
                  <ul className="mt-3 space-y-1">
                    {agent.tools.slice(0, 3).map((tool) => (
                      <li key={tool} className="flex items-center gap-1.5 text-xs text-muted">
                        <Check className="h-3.5 w-3.5 text-success" aria-hidden />
                        {tool}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {plan.pages.length > 0 && (
        <section className={`border-b border-line ${compact ? "px-4 py-8" : "px-10 py-12"}`}>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-semibold tracking-tight">Everything in one place</h2>
            <div className={`mt-5 grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
              {plan.pages.map((page, index) => (
                <button
                  key={page.name}
                  type="button"
                  onClick={() => onOpenPage(index)}
                  className="group flex items-start gap-3 rounded-xl border border-line bg-panel p-4 text-left hover:border-accent/50"
                >
                  <PanelsTopLeft className="mt-0.5 h-5 w-5 shrink-0 text-muted group-hover:text-accent" aria-hidden />
                  <span>
                    <span className="block text-sm font-semibold">{page.name}</span>
                    <span className="mt-0.5 block text-sm text-muted">{page.purpose}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {plan.integrations.length > 0 && (
        <section className={`border-b border-line ${compact ? "px-4 py-6" : "px-10 py-8"}`}>
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
            <span className="mr-2 text-sm text-muted">Works with</span>
            {plan.integrations.map((integration) => (
              <span key={integration} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1 text-sm">
                <Link2 className="h-3.5 w-3.5 text-muted" aria-hidden />
                {integration}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className={`${compact ? "px-4 py-8" : "px-10 py-12"}`}>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 rounded-2xl bg-accent px-6 py-6 text-on-accent">
          <div>
            <p className="text-lg font-semibold">Ready to try {appName}?</p>
            <p className="text-sm opacity-90">Set up takes a couple of minutes.</p>
          </div>
          <button type="button" onClick={() => onOpenPage(0)} className="rounded-md bg-on-accent px-4 py-2 text-sm font-semibold text-accent">
            Get started
          </button>
        </div>
      </section>
    </div>
  );
}
