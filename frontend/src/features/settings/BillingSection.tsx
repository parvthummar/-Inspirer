import { Receipt } from "lucide-react";
import UsageSummary from "../../components/UsageSummary";
import SettingsCard from "./SettingsCard";

export default function BillingSection() {
  return (
    <div className="space-y-6">
      <SettingsCard title="Plan and usage" description="Every plan, chat reply and build uses credits.">
        <UsageSummary />
      </SettingsCard>
      <SettingsCard title="Invoices">
        <p className="flex items-center gap-2 rounded-lg border border-dashed border-line px-4 py-6 text-sm text-muted">
          <Receipt className="h-4 w-4" aria-hidden />
          No invoices yet. You're on the free Starter plan, so there's nothing to pay.
        </p>
      </SettingsCard>
    </div>
  );
}
