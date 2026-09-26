import { NavLink } from "react-router-dom";
import { useProjects, type ProjectStatus } from "../api/projects";

const MAX_RECENT = 8;

/** What each status means for the user right now, in a few words. */
const statusLine: Record<ProjectStatus, { text: string; className: string }> = {
  draft: { text: "Pick up where you left off", className: "text-muted" },
  planning: { text: "Drafting a plan…", className: "text-accent" },
  building: { text: "Building now…", className: "text-accent" },
  ready: { text: "Ready to try", className: "text-success" },
  error: { text: "Needs your attention", className: "text-danger" },
};

/** "now", "5m", "3h", "2d", or a short date for anything older than a week. */
function shortAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h`;
  if (minutes < 60 * 24 * 7) return `${Math.floor(minutes / (60 * 24))}d`;
  return new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short" });
}

export default function SidebarRecentProjects({ onNavigate }: { onNavigate: () => void }) {
  const projects = useProjects();

  return (
    <section aria-labelledby="recent-heading" className="min-h-0 flex-1 overflow-y-auto">
      <h2 id="recent-heading" className="px-2 text-[11px] font-semibold text-muted">
        Recent projects
      </h2>
      {projects.isPending && (
        <div className="mt-2 space-y-1.5 px-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded bg-surface" />
          ))}
        </div>
      )}
      {projects.isError && <p className="mt-2 px-2 text-xs text-muted">Couldn't load your projects.</p>}
      {projects.data?.length === 0 && <p className="mt-2 px-2 text-xs text-muted">Your projects will show up here.</p>}
      {projects.data && projects.data.length > 0 && (
        <ul className="mt-1.5 space-y-px">
          {projects.data.slice(0, MAX_RECENT).map((project) => {
            const line = statusLine[project.status];
            return (
              <li key={project.id}>
                <NavLink
                  to={`/project/${project.id}`}
                  onClick={onNavigate}
                  title={`${project.name} · ${line.text}`}
                  className="block rounded-md px-2 py-1.5 hover:bg-surface"
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm text-ink">{project.name}</span>
                    <time dateTime={project.updated_at} className="shrink-0 text-[10px] text-muted">
                      {shortAgo(project.updated_at)}
                    </time>
                  </span>
                  <span className={`block truncate text-[11px] ${line.className}`}>{line.text}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
