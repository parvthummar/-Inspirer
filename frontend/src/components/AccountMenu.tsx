import { useEffect, useRef, useState } from "react";
import { Gauge, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLogout, type User } from "../api/auth";
import UsageDialog from "./UsageDialog";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AccountMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const logout = useLogout();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-panel"
      >
        {initials(user.name)}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-60 rounded-lg border border-line bg-panel p-1 shadow-[0_8px_24px_rgba(22,32,42,0.12)]"
        >
          <div className="border-b border-line px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setUsageOpen(true);
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ink hover:bg-surface"
          >
            <Gauge className="h-4 w-4 text-muted" aria-hidden />
            Usage and credits
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate("/settings");
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ink hover:bg-surface"
          >
            <Settings className="h-4 w-4 text-muted" aria-hidden />
            Settings
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={logout.isPending}
            onClick={() => logout.mutate(undefined, { onSuccess: () => navigate("/login", { replace: true }) })}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ink hover:bg-surface"
          >
            <LogOut className="h-4 w-4 text-muted" aria-hidden />
            {logout.isPending ? "Logging out" : "Log out"}
          </button>
          {logout.isError && <p className="px-3 pb-2 text-xs text-danger">{logout.error.message}</p>}
        </div>
      )}
      {usageOpen && <UsageDialog onClose={() => setUsageOpen(false)} />}
    </div>
  );
}
