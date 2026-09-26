import { useEffect, useState, type ReactNode } from "react";
import { Menu, PanelLeftOpen, X } from "lucide-react";
import { MOD_KEY } from "../lib/keyboard";
import CreditsMeter from "./CreditsMeter";
import PanelResizer from "./PanelResizer";
import Logo from "./Logo";
import Sidebar from "./Sidebar";
import ThemeToggleButton from "./ThemeToggleButton";

const SIDEBAR_WIDTH = { min: 200, max: 400, default: 256 };
const SIDEBAR_WIDTH_KEY = "architect.sidebarWidth";
const SIDEBAR_HIDDEN_KEY = "architect.sidebarHidden";
/** Dragging the edge to within about an inch (96 CSS px) of the window edge hides the sidebar. */
const COLLAPSE_BELOW = 96;

function savedSidebarWidth(): number {
  try {
    const saved = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY));
    if (saved >= SIDEBAR_WIDTH.min && saved <= SIDEBAR_WIDTH.max) return saved;
  } catch {
    // Storage can be unavailable (private mode); use the default.
  }
  return SIDEBAR_WIDTH.default;
}

function savedSidebarHidden(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_HIDDEN_KEY) === "true";
  } catch {
    return false;
  }
}


/**
 * Layout for the dashboard and settings: a sidebar on the left (a slide-in drawer on small screens)
 * and the page on the right (the sidebar can be resized), with the credits meter in the top-right corner.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(savedSidebarWidth);
  const [sidebarHidden, setSidebarHidden] = useState(savedSidebarHidden);

  function setHidden(hidden: boolean) {
    setSidebarHidden(hidden);
    try {
      localStorage.setItem(SIDEBAR_HIDDEN_KEY, String(hidden));
    } catch {
      // Not critical: the choice just won't be remembered.
    }
  }

  // Ctrl+B (Cmd+B on Mac) hides and shows the sidebar, as in most editors.
  useEffect(() => {
    function toggle(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setSidebarHidden((hidden) => {
          try {
            localStorage.setItem(SIDEBAR_HIDDEN_KEY, String(!hidden));
          } catch {
            // Not critical.
          }
          return !hidden;
        });
      }
    }
    document.addEventListener("keydown", toggle);
    return () => document.removeEventListener("keydown", toggle);
  }, []);

  function changeSidebarWidth(width: number) {
    setSidebarWidth(width);
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(width));
    } catch {
      // Not critical: the width just won't be remembered.
    }
  }

  // Close the drawer with Escape.
  useEffect(() => {
    if (!drawerOpen) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [drawerOpen]);

  return (
    <div className="flex h-full">
      {!sidebarHidden && (
        <>
          <aside className="hidden shrink-0 bg-panel lg:block" style={{ width: sidebarWidth }} aria-label="Sidebar">
            <Sidebar onNavigate={() => {}} onCollapse={() => setHidden(true)} />
          </aside>
          {/* Drag to resize; squeeze past the minimum to hide; double-click to reset. Desktop only. */}
          <div className="hidden lg:flex">
            <PanelResizer
              width={sidebarWidth}
              min={SIDEBAR_WIDTH.min}
              max={SIDEBAR_WIDTH.max}
              onChange={changeSidebarWidth}
              onReset={() => changeSidebarWidth(SIDEBAR_WIDTH.default)}
              collapseBelow={COLLAPSE_BELOW}
              onCollapse={() => setHidden(true)}
              label="Resize sidebar"
            />
          </div>
        </>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/30" aria-hidden onClick={() => setDrawerOpen(false)} />
          <aside className="relative h-full w-72 max-w-[85vw] animate-drawer-in bg-panel shadow-xl" aria-label="Sidebar">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="absolute right-2 top-2 rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="-ml-1.5 rounded-md p-1.5 text-muted hover:bg-panel hover:text-ink lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          {sidebarHidden && (
            <button
              type="button"
              onClick={() => setHidden(false)}
              aria-label="Show sidebar"
              title={`Show sidebar (${MOD_KEY}+B)`}
              className="-ml-1.5 hidden rounded-md p-1.5 text-muted hover:bg-panel hover:text-ink lg:block"
            >
              <PanelLeftOpen className="h-5 w-5" aria-hidden />
            </button>
          )}
          <span className={sidebarHidden ? "" : "lg:hidden"}>
            <Logo />
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggleButton />
            <CreditsMeter />
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
