import { FlaskConical } from "lucide-react";
import Tooltip from "./Tooltip";

type DemoBadgeProps = {
  /** Short label, e.g. "Sample data" or "Demo". */
  label?: string;
  /** What is simulated and what would happen in the real product. Shown on hover and focus. */
  explanation: string;
  align?: "center" | "end";
};

/** Marks something as simulated in this prototype, so nobody mistakes example data for their own. */
export default function DemoBadge({ label = "Demo", explanation, align = "center" }: DemoBadgeProps) {
  return (
    <Tooltip label={explanation} align={align}>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted">
        <FlaskConical className="h-3 w-3" aria-hidden />
        {label}
        <span className="sr-only">: {explanation}</span>
      </span>
    </Tooltip>
  );
}
