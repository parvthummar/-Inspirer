import { Plus } from "lucide-react";

export default function PlanAddButton({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-accent hover:bg-accent/5"
    >
      <Plus className="h-3.5 w-3.5" aria-hidden />
      {children}
    </button>
  );
}
