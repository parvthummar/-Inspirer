import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CircleCheck } from "lucide-react";
import { ToastContext } from "./toast-context";

const VISIBLE_MS = 3200;

type Toast = { id: number; message: string };

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const show = useCallback((message: string) => setToast({ id: Date.now(), message }), []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
        {toast && (
          <div
            key={toast.id}
            role="status"
            className="flex animate-toast-in items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm text-panel shadow-[0_8px_24px_rgba(22,32,42,0.24)]"
          >
            <CircleCheck className="h-4 w-4 text-success" aria-hidden />
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
