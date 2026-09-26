export default function ArchitectAvatar() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ink" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-4 w-4">
        <rect x="3" y="13" width="8" height="8" rx="1.5" fill="var(--accent)" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" fill="var(--accent)" opacity="0.55" />
        <rect x="8" y="3" width="8" height="8" rx="1.5" fill="var(--panel)" />
      </svg>
    </span>
  );
}
