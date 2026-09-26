import { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";

const VISIBLE_MS = 3500;

/** A short "your app is ready" moment right after a build finishes. */
export default function ReadyBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-4" role="status">
      <div className="flex animate-toast-in items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-panel shadow-[0_12px_32px_rgba(22,32,42,0.3)]">
        <PartyPopper className="h-4 w-4 text-success" aria-hidden />
        Your app is ready. Try it out.
      </div>
    </div>
  );
}
