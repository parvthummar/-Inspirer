import type { ReactNode } from "react";

type PreviewPlaceholderProps = {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
};

/** A faint outline of an app with a message on top: what the preview shows before there is an app. */
export default function PreviewPlaceholder({ icon, title, body, action }: PreviewPlaceholderProps) {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 flex opacity-60" aria-hidden>
        <div className="hidden w-44 shrink-0 space-y-3 border-r border-line p-4 sm:block">
          <div className="h-4 w-20 rounded bg-surface" />
          <div className="h-3 w-28 rounded bg-surface" />
          <div className="h-3 w-24 rounded bg-surface" />
          <div className="h-3 w-28 rounded bg-surface" />
        </div>
        <div className="flex-1 space-y-4 p-6">
          <div className="h-5 w-1/3 rounded bg-surface" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 rounded-lg bg-surface" />
            <div className="h-20 rounded-lg bg-surface" />
            <div className="h-20 rounded-lg bg-surface" />
          </div>
          <div className="h-40 rounded-lg bg-surface" />
        </div>
      </div>
      <div className="relative mx-6 max-w-sm rounded-xl border border-line bg-panel px-6 py-6 text-center shadow-[0_8px_24px_rgba(22,32,42,0.08)]">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">{icon}</div>
        <h2 className="mt-3 text-sm font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
