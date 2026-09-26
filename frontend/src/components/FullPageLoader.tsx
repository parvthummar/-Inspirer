import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

const SLOW_AFTER_MS = 5000;

/** Spinner with a label. If it takes a while (the hosted backend sleeps when idle), it says why. */
export default function FullPageLoader({ label }: { label: string }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5 p-4 text-center" role="status">
      <p className="flex items-center gap-2 text-sm text-muted">
        <LoaderCircle className="h-4 w-4 animate-spin text-accent" aria-hidden />
        {label}
      </p>
      {slow && <p className="max-w-xs text-xs text-muted">Waking up the server after a quiet spell. This can take up to a minute.</p>}
    </div>
  );
}
