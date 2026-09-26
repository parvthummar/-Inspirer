import type { ReactNode } from "react";
import { FlaskConical } from "lucide-react";

/** A banner for areas that are entirely simulated in this prototype. */
export default function DemoNotice({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2 rounded-lg border border-dashed border-muted/40 bg-panel px-3 py-2 text-xs leading-relaxed text-muted">
      <FlaskConical className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
