import { FolderKanban, House, LayoutTemplate, PanelLeftClose, Plus, Settings } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useMe } from "../api/auth";
import { MOD_KEY } from "../lib/keyboard";
import AccountMenu from "./AccountMenu";
import Logo from "./Logo";
import SidebarRecentProjects from "./SidebarRecentProjects";
import UpgradeCard from "./UpgradeCard";

type SidebarProps = {
  /** Called after any navigation, so the mobile drawer can close. */
  onNavigate: () => void;
  /** Hides the sidebar (desktop). The mobile drawer has its own close button instead. */
  onCollapse?: () => void;
};

const navItem = (active: boolean) =>
  `flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm ${active ? "bg-surface font-medium text-ink" : "text-muted hover:bg-surface hover:text-ink"}`;

/** Main navigation: new project, pages, recent projects, plan and profile. */
export default function Sidebar({ onNavigate, onCollapse }: SidebarProps) {
  const me = useMe();
  const navigate = useNavigate();

  function newProject() {
    // The dashboard focuses its prompt box when it sees this state.
    navigate("/", { state: { focusPrompt: Date.now() } });
    onNavigate();
  }

  return (
    <div className="flex h-full flex-col gap-4 p-3">
      <div className="flex items-center justify-between gap-2 pt-1">
        <Link to="/" onClick={onNavigate} className="rounded-md px-2">
          <Logo />
        </Link>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Hide sidebar"
            title={`Hide sidebar (${MOD_KEY}+B)`}
            className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink"
          >
            <PanelLeftClose className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={newProject}
        className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-on-accent shadow-sm hover:bg-accent/90"
      >
        <Plus className="h-4 w-4" aria-hidden />
        New project
      </button>

      <nav aria-label="Main">
        <ul className="space-y-px">
          <li>
            <NavLink to="/" end onClick={onNavigate} className={({ isActive }) => navItem(isActive)}>
              <House className="h-4 w-4" aria-hidden />
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects" onClick={onNavigate} className={({ isActive }) => navItem(isActive)}>
              <FolderKanban className="h-4 w-4" aria-hidden />
              Projects
            </NavLink>
          </li>
          <li>
            <NavLink to="/templates" onClick={onNavigate} className={({ isActive }) => navItem(isActive)}>
              <LayoutTemplate className="h-4 w-4" aria-hidden />
              Templates
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" onClick={onNavigate} className={({ isActive }) => navItem(isActive)}>
              <Settings className="h-4 w-4" aria-hidden />
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>

      <SidebarRecentProjects onNavigate={onNavigate} />

      <div className="space-y-2">
        <UpgradeCard />
        {me.data && <AccountMenu user={me.data} variant="sidebar" />}
      </div>
    </div>
  );
}
