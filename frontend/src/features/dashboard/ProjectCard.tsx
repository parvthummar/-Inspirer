import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, MoreHorizontal, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { Project } from "../../api/projects";
import StatusBadge from "../../components/StatusBadge";
import { formatRelativeTime } from "../../lib/time";

type ProjectCardProps = {
  project: Project;
  onDelete: (project: Project) => void;
};

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const summary = project.description || project.initial_prompt;

  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-line bg-panel p-4 transition-shadow hover:shadow-[0_4px_16px_rgba(22,32,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-[15px] font-medium leading-snug">
          {/* The link covers the whole card; the menu sits above it. */}
          <Link to={`/project/${project.id}`} className="rounded-sm after:absolute after:inset-0 after:rounded-lg">
            <span className="line-clamp-2">{project.name}</span>
          </Link>
        </h3>
        <div ref={menuRef} className="relative z-10 -mr-1.5 -mt-1">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`More actions for ${project.name}`}
            className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink"
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-line bg-panel p-1 shadow-[0_8px_24px_rgba(22,32,42,0.12)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => navigate(`/project/${project.id}`)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-surface"
              >
                <ArrowUpRight className="h-4 w-4 text-muted" aria-hidden />
                Open project
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(project);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-danger hover:bg-danger/5"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Delete project
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{summary}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <StatusBadge status={project.status} />
        <time dateTime={project.updated_at} className="text-xs text-muted">
          Updated {formatRelativeTime(project.updated_at).toLowerCase()}
        </time>
      </div>
    </article>
  );
}
