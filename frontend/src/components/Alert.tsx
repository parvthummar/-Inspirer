import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

/** Inline error message for a form or panel. */
export default function Alert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex gap-2 rounded-md border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger">
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  );
}
