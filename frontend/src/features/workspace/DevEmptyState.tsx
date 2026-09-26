import type { LucideIcon } from "lucide-react";

type DevEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  body: string;
};

export default function DevEmptyState({ icon: Icon, title, body }: DevEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-panel p-6 text-center">
      <Icon className="h-6 w-6 text-muted" aria-hidden />
      <p className="mt-3 text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>
    </div>
  );
}
