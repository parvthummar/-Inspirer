import { useLocalState } from "../../lib/localStore";

/** Sharing is a dummy flow: members and invites are kept per project in the browser. */

export type Role = "editor" | "viewer";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "invited" | "joined";
  invitedAt: string;
};

export type Team = { members: Member[]; linkSharing: boolean };

export const ROLES: { id: Role; label: string; description: string }[] = [
  { id: "editor", label: "Editor", description: "Can chat with Architect, approve plans and build" },
  { id: "viewer", label: "Viewer", description: "Can try the preview and leave comments" },
];

const EMPTY: Team = { members: [], linkSharing: false };

export function useTeam(projectId: string) {
  const [team, setTeam] = useLocalState<Team>(`architect.team.${projectId}`);
  return { team: team ?? EMPTY, setTeam };
}

/** "priya.shah@acme.com" -> "Priya Shah" */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
