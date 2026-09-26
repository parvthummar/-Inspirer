import type { ReactNode } from "react";

type SettingsCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function SettingsCard({ title, description, children, footer }: SettingsCardProps) {
  return (
    <section className="rounded-xl border border-line bg-panel">
      <div className="px-5 py-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        <div className="mt-4">{children}</div>
      </div>
      {footer && <div className="flex justify-end gap-2 border-t border-line bg-surface/50 px-5 py-3">{footer}</div>}
    </section>
  );
}
