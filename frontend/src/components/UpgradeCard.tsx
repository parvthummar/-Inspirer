import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useUsage } from "../api/usage";
import CreditsBar from "./CreditsBar";
import UsageDialog from "./UsageDialog";

/** Bottom of the sidebar: current plan, credits left, and the way to a bigger plan. */
export default function UpgradeCard() {
  const usage = useUsage();
  const [open, setOpen] = useState(false);
  if (!usage.data) return null;

  const { plan_name, credits_used: used, credits_total: total } = usage.data;
  const low = used / total >= 0.8;

  return (
    <>
      <div className={`rounded-xl border p-3 ${low ? "border-danger/40 bg-danger/5" : "border-line bg-surface/60"}`}>
        <p className="flex items-center justify-between text-xs">
          <span className="font-semibold">{plan_name} plan</span>
          <span className={low ? "font-medium text-danger" : "text-muted"}>{Math.max(0, total - used)} left</span>
        </p>
        <CreditsBar used={used} total={total} className="mt-2" />
        <p className="mt-2 text-[11px] leading-snug text-muted">
          {low ? "You're running low on credits this month." : "Get more credits for bigger apps and more builds."}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-panel hover:bg-ink/90"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Upgrade to Pro
        </button>
      </div>
      {open && <UsageDialog onClose={() => setOpen(false)} />}
    </>
  );
}
