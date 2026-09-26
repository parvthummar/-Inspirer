import type { ReactNode } from "react";

type PlanSectionProps = {
  title: string;
  count?: number;
  children: ReactNode;
};

export default function PlanSection({ title, count, children }: PlanSectionProps) {
  return (
    <section className="border-t border-line px-4 py-3">
      <h4 className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        {title}
        {count !== undefined && <span className="font-normal">{count}</span>}
      </h4>
      <div className="mt-2">{children}</div>
    </section>
  );
}
