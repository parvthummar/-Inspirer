import { useState } from "react";
import { Gauge } from "lucide-react";
import { useUsage } from "../api/usage";
import CreditsBar from "./CreditsBar";
import UsageDialog from "./UsageDialog";

/** Compact credits indicator for the header. Opens the usage dialog. */
export default function CreditsMeter() {
  const usage = useUsage();
  const [open, setOpen] = useState(false);
  if (!usage.data) return null;

  const { credits_used: used, credits_total: total } = usage.data;
  const low = used / total >= 0.8;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Usage and credits"
        className={`flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-surface ${
          low ? "text-danger" : "text-ink"
        }`}
      >
        <Gauge className={`h-4 w-4 ${low ? "" : "text-muted"}`} aria-hidden />
        <span className="whitespace-nowrap">
          {Math.max(0, total - used)} <span className="text-muted">credits left</span>
        </span>
        <CreditsBar used={used} total={total} className="hidden w-14 sm:block" />
      </button>
      {open && <UsageDialog onClose={() => setOpen(false)} />}
    </>
  );
}
