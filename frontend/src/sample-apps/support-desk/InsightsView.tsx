import MiniBarChart from "../shared/MiniBarChart";
import PageHeader from "../shared/PageHeader";
import StatCard from "../shared/StatCard";
import { articles, conversationsPerDay } from "./data";

export default function InsightsView({ compact }: { compact: boolean }) {
  return (
    <>
      <PageHeader title="Insights" subtitle="Last 7 days" />
      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-3"}`}>
        <StatCard label="Resolved by the agent" value="82%" note="Up from 76% last week" />
        <StatCard label="Average first reply" value="6 sec" note="Your team's average: 38 min" />
        <StatCard label="Handed to your team" value="14" note="All answered within 2 hours" />
      </div>
      <div className={`mt-4 grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
        <MiniBarChart title="Conversations per day" data={conversationsPerDay} />
        <div className="rounded-lg border border-line bg-panel p-4">
          <p className="text-xs font-semibold">Most used help articles</p>
          <ul className="mt-3 space-y-2">
            {articles.slice(0, 4).map((article) => (
              <li key={article.title} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{article.title}</span>
                <span className="shrink-0 text-xs text-muted">{article.uses} answers</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
