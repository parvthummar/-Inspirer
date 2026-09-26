import { useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { useUsage } from "../api/usage";
import Alert from "./Alert";
import Button from "./Button";
import CreditsBar from "./CreditsBar";
import DemoBadge from "./DemoBadge";
import { useToast } from "./toast-context";

const kindLabels = { plans: "Plans written", replies: "Chat replies", builds: "Builds" } as const;
const kindCost = { plans: 5, replies: 1, builds: 10 } as const;

const plans = [
  { id: "starter", name: "Starter", credits: 500, price: "Free" },
  { id: "pro", name: "Pro", credits: 2000, price: "$29 / month" },
  { id: "team", name: "Team", credits: 10000, price: "$99 / month" },
];

const dateFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "long" });

/** Credits used this month, what used them, and the option to ask for a bigger plan. */
export default function UsageSummary() {
  const usage = useUsage();
  const toast = useToast();
  const [requested, setRequested] = useState<string | null>(null);

  return (
    <div>
      {usage.isPending && (
        <p className="flex items-center gap-2 text-sm text-muted" role="status">
          <LoaderCircle className="h-4 w-4 animate-spin text-accent" aria-hidden />
          Adding up this month's usage
        </p>
      )}
      {usage.isError && (
        <div className="space-y-3">
          <Alert>We couldn't load your usage. {usage.error.message}</Alert>
          <Button variant="secondary" onClick={() => usage.refetch()}>
            Try again
          </Button>
        </div>
      )}
      {usage.data && (
        <div className="space-y-6">
          <section>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-semibold tracking-tight">
                {usage.data.credits_used}
                <span className="text-sm font-normal text-muted"> of {usage.data.credits_total} credits used</span>
              </p>
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium">{usage.data.plan_name} plan</span>
            </div>
            <CreditsBar used={usage.data.credits_used} total={usage.data.credits_total} className="mt-2" />
            <p className="mt-1.5 text-xs text-muted">
              {Math.max(0, usage.data.credits_total - usage.data.credits_used)} left · resets on {dateFormat.format(new Date(usage.data.resets_at))}
            </p>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-muted">What used them</h3>
            <table className="mt-2 w-full text-sm">
              <tbody className="divide-y divide-line">
                {usage.data.breakdown.map((line) => (
                  <tr key={line.kind}>
                    <td className="py-2">{kindLabels[line.kind]}</td>
                    <td className="py-2 text-right text-muted">
                      {line.count} × {kindCost[line.kind]}
                    </td>
                    <td className="w-20 py-2 text-right font-medium">{line.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {usage.data.by_project.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-muted">By project</h3>
              <ul className="mt-2 space-y-2">
                {usage.data.by_project.slice(0, 5).map((project) => (
                  <li key={project.project_id} className="text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="truncate">{project.name}</span>
                      <span className="shrink-0 text-muted">{project.credits}</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-surface">
                      <div
                        className="h-1 rounded-full bg-accent"
                        style={{ width: `${(project.credits / usage.data.by_project[0].credits) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="flex items-center gap-2 text-xs font-semibold text-muted">
              Plans
              <DemoBadge explanation="Credit use is counted from your real activity. Plans and upgrade requests are examples in this prototype; no request is sent." />
            </h3>
            <ul className="mt-2 grid grid-cols-3 gap-2">
              {plans.map((plan) => {
                const current = plan.name === usage.data.plan_name;
                return (
                  <li key={plan.id} className={`rounded-lg border p-3 ${current ? "border-accent bg-accent/5" : "border-line"}`}>
                    <p className="text-sm font-semibold">{plan.name}</p>
                    <p className="text-xs text-muted">{plan.credits.toLocaleString()} credits</p>
                    <p className="mt-1 text-xs">{plan.price}</p>
                    {current ? (
                      <p className="mt-2 text-[11px] font-medium text-accent">Current plan</p>
                    ) : requested === plan.id ? (
                      <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-success">
                        <Check className="h-3 w-3" aria-hidden />
                        Request sent
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setRequested(plan.id);
                          toast(`Upgrade to ${plan.name} requested`);
                        }}
                        className="mt-2 text-[11px] font-medium text-accent hover:underline"
                      >
                        Request {plan.name}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            {requested && (
              <p className="mt-2 text-xs text-muted">
                Request noted. In the real product, our team would email you to set up the new plan.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
