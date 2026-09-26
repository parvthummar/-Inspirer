import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { useMe } from "../../api/auth";
import type { Project } from "../../api/projects";
import { useToast } from "../../components/toast-context";
import ShareDialog from "./ShareDialog";
import { initials, useTeam } from "./teamStore";

const ACCEPT_AFTER_MS = 6000;

/** Header avatars of the people on the project, plus the Share button. */
export default function ShareButton({ project }: { project: Project }) {
  const me = useMe();
  const { team, setTeam } = useTeam(project.id);
  const [open, setOpen] = useState(false);
  const toast = useToast();

  // Simulated: invited people accept a few seconds after the invite.
  const pending = team.members.find((member) => member.status === "invited");
  useEffect(() => {
    if (!pending) return;
    const wait = Math.max(0, new Date(pending.invitedAt).getTime() + ACCEPT_AFTER_MS - Date.now());
    const timer = window.setTimeout(() => {
      setTeam({ ...team, members: team.members.map((m) => (m.id === pending.id ? { ...m, status: "joined" } : m)) });
      toast(`${pending.name} joined the project`);
    }, wait);
    return () => window.clearTimeout(timer);
  }, [pending, team, setTeam, toast]);

  if (!me.data) return null;
  const joined = team.members.filter((member) => member.status === "joined");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-2 rounded-md border border-line pl-1.5 pr-2.5 text-xs font-medium hover:bg-surface"
      >
        {joined.length > 0 ? (
          <span className="flex -space-x-1.5" aria-hidden>
            {joined.slice(0, 3).map((member) => (
              <span key={member.id} className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] font-semibold text-on-accent ring-2 ring-panel">
                {initials(member.name)}
              </span>
            ))}
            {joined.length > 3 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[9px] font-semibold ring-2 ring-panel">
                +{joined.length - 3}
              </span>
            )}
          </span>
        ) : (
          <UserPlus className="h-4 w-4" aria-hidden />
        )}
        Share
      </button>
      {open && <ShareDialog project={project} me={me.data} onClose={() => setOpen(false)} />}
    </>
  );
}
