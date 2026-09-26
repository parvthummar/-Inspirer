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
        className={`hidden items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-surface sm:flex ${low ? "text-danger" : "text-muted"}`}
      >
        <Gauge className="h-4 w-4" aria-hidden />
        <span className="whitespace-nowrap">
          {total - used} credits left
        </span>
        <CreditsBar used={used} total={total} className="w-14" />
      </button>
      {open && <UsageDialog onClose={() => setOpen(false)} />}
    </>
  );
}
