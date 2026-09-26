import type { PlanAgent, PlanPage } from "../../api/plans";
import PageAuth from "./PageAuth";
import PageCalendar from "./PageCalendar";
import PageChat from "./PageChat";
import PageContent from "./PageContent";
import PageDashboard from "./PageDashboard";
import PageForm from "./PageForm";
import PageList from "./PageList";
import { layoutFor } from "./siteContent";

type SitePageProps = {
  page: PlanPage;
  appName: string;
  agents: PlanAgent[];
  compact: boolean;
};

/** One page of the app, laid out to suit what the plan says it's for. */
export default function SitePage({ page, appName, agents, compact }: SitePageProps) {
  const layout = layoutFor(page.name, page.purpose);

  return (
    <div className={compact ? "px-4 py-6" : "px-10 py-8"}>
      <div className="mx-auto max-w-5xl">
        {layout !== "auth" && (
          <header className="mb-5">
            <h1 className="text-2xl font-semibold tracking-tight">{page.name}</h1>
            {page.purpose && <p className="mt-1 text-sm text-muted">{page.purpose}</p>}
          </header>
        )}
        {layout === "list" && <PageList key={page.name} name={page.name} compact={compact} />}
        {layout === "dashboard" && <PageDashboard name={page.name} agents={agents} compact={compact} />}
        {layout === "form" && <PageForm key={page.name} name={page.name} compact={compact} />}
        {layout === "chat" && <PageChat key={page.name} purpose={page.purpose} agent={agents[0]} />}
        {layout === "calendar" && <PageCalendar name={page.name} compact={compact} />}
        {layout === "auth" && (
          <>
            <h1 className="sr-only">{page.name}</h1>
            <PageAuth name={page.name} appName={appName} />
          </>
        )}
        {layout === "content" && <PageContent name={page.name} purpose={page.purpose} compact={compact} />}
      </div>
    </div>
  );
}
