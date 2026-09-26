import { X } from "lucide-react";

export default function PlanRemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="mt-1 shrink-0 rounded-md p-1 text-muted hover:bg-danger/5 hover:text-danger"
    >
      <X className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}
