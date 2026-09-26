import { LoaderCircle } from "lucide-react";

export default function FullPageLoader({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center gap-2 text-sm text-muted" role="status">
      <LoaderCircle className="h-4 w-4 animate-spin text-accent" aria-hidden />
      {label}
    </div>
  );
}
