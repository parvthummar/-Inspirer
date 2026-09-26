import { Bot } from "lucide-react";
import MiniBarChart from "../../components/MiniBarChart";
import { COMPANIES, hash, singular } from "./siteContent";

type PageDashboardProps = {
  name: string;
  agents: { name: string }[];
  compact: boolean;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function PageDashboard({ name, agents, compact }: PageDashboardProps) {
  const seed = hash(name);
  const noun = singular(name).toLowerCase();
  const tiles = [
    { label: "This week", value: String(40 + (seed % 60)) },
    { label: "Handled automatically", value: `${70 + (seed % 25)}%` },
    { label: "Waiting on your team", value: String(2 + (seed % 7)) },
  ];
  const agent = agents[0]?.name ?? "Your agent";

  return (
    <div className="space-y-4">
      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-3"}`}>
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-lg border border-line bg-panel p-4">
            <p className="text-xs text-muted">{tile.label}</p>
            <p className="mt-1 text-2xl font-semibold">{tile.value}</p>
          </div>
        ))}
      </div>
      <MiniBarChart title="Activity this week" data={DAYS.map((label, i) => ({ label, value: 8 + ((seed >> i) % 30) }))} height={96} />
      <section className="rounded-lg border border-line bg-panel">
        <h2 className="border-b border-line px-4 py-2.5 text-sm font-semibold">Recent activity</h2>
        <ul className="divide-y divide-line">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <Bot className="h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span className="min-w-0 flex-1 truncate">
                {agent} handled a {noun || "request"} for {COMPANIES[(seed + i) % COMPANIES.length]}
              </span>
              <span className="shrink-0 text-xs text-muted">{[4, 22, 47, 90][i]} min ago</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
