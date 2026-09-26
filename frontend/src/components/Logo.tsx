/** Architect wordmark: a simple stacked-blocks mark plus the name. */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-ink ${className}`}>
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <rect x="3" y="13" width="8" height="8" rx="1.5" fill="var(--accent)" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" fill="var(--accent)" opacity="0.55" />
        <rect x="8" y="3" width="8" height="8" rx="1.5" fill="var(--ink)" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">Architect</span>
    </span>
  );
}
