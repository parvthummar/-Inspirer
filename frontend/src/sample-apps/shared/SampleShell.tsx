import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type NavItem = { id: string; label: string; icon: LucideIcon; badge?: number };

type SampleShellProps = {
  appName: string;
  /** The generated app's own brand color, as "r g b" channels. */
  accentRgb: string;
  logo: LucideIcon;
  nav: NavItem[];
  active: string;
  onNavigate: (id: string) => void;
  compact: boolean;
  userName: string;
  children: ReactNode;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

/**
 * Layout shared by the sample apps. Each app overrides the accent token with its own brand color,
 * so generated apps look distinct from Architect while still using the design tokens.
 */
export default function SampleShell({
  appName,
  accentRgb,
  logo: Logo,
  nav,
  active,
  onNavigate,
  compact,
  userName,
  children,
}: SampleShellProps) {
  // Custom properties aren't part of CSSProperties' type, hence the cast.
  const brand = { "--accent-rgb": accentRgb } as CSSProperties;

  const navButtons = nav.map(({ id, label, icon: Icon, badge }) => {
    const selected = id === active;
    return (
      <button
        key={id}
        type="button"
        onClick={() => onNavigate(id)}
        aria-current={selected ? "page" : undefined}
        className={
          compact
            ? `flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                selected ? "bg-accent text-on-accent" : "bg-surface text-muted"
              }`
            : `flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] font-medium ${
                selected ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface hover:text-ink"
              }`
        }
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span
            className={`ml-auto rounded-full px-1.5 text-[10px] font-semibold ${
              selected && compact ? "bg-panel/20" : "bg-accent text-on-accent"
            }`}
          >
            {badge}
          </span>
        )}
      </button>
    );
  });

  const brandMark = (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-on-accent">
        <Logo className="h-4 w-4" aria-hidden />
      </span>
      <span className="truncate text-sm font-semibold">{appName}</span>
    </div>
  );

  if (compact) {
    return (
      <div style={brand} className="flex h-full flex-col bg-surface text-ink">
        <header className="flex items-center justify-between gap-2 border-b border-line bg-panel px-3 py-2.5">
          {brandMark}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-panel">
            {initials(userName)}
          </span>
        </header>
        <nav className="flex gap-1.5 overflow-x-auto border-b border-line bg-panel px-3 py-2">{navButtons}</nav>
        <main className="min-h-0 flex-1 overflow-y-auto p-3">{children}</main>
      </div>
    );
  }

  return (
    <div style={brand} className="flex h-full bg-surface text-ink">
      <aside className="flex w-48 shrink-0 flex-col border-r border-line bg-panel p-3">
        <div className="px-1 pb-4">{brandMark}</div>
        <nav className="space-y-0.5">{navButtons}</nav>
        <div className="mt-auto flex items-center gap-2 rounded-md px-1.5 pt-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-panel">
            {initials(userName)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-medium">{userName}</span>
            <span className="block text-[11px] text-muted">Admin</span>
          </span>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto p-5">{children}</main>
    </div>
  );
}
