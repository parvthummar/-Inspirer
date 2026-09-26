import type { RunOutcome } from "../../mocks/monitorData";

const styles: Record<RunOutcome, { label: string; className: string }> = {
  resolved: { label: "Handled", className: "bg-success/10 text-success" },
  handed_off: { label: "Handed off", className: "bg-accent/10 text-accent" },
  failed: { label: "Failed", className: "bg-danger/10 text-danger" },
};

export default function RunOutcomePill({ outcome, fixed = false }: { outcome: RunOutcome; fixed?: boolean }) {
  const style = fixed ? { label: "Fixed", className: "bg-success/10 text-success" } : styles[outcome];
  return <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${style.className}`}>{style.label}</span>;
}
