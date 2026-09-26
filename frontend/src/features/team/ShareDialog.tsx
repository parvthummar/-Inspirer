import { useState, type FormEvent } from "react";
import { Check, Copy, Link2, X } from "lucide-react";
import type { User } from "../../api/auth";
import type { Project } from "../../api/projects";
import Button from "../../components/Button";
import DemoNotice from "../../components/DemoNotice";
import Modal from "../../components/Modal";
import { useToast } from "../../components/toast-context";
import { previewUrl } from "../../lib/previewUrl";
import { nameFromEmail, ROLES, useTeam, type Member, type Role } from "./teamStore";
import TeamAvatar from "./TeamAvatar";

type ShareDialogProps = {
  project: Project;
  me: User;
  onClose: () => void;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ShareDialog({ project, me, onClose }: ShareDialogProps) {
  const { team, setTeam } = useTeam(project.id);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [error, setError] = useState<string>();
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const link = `https://${previewUrl(project.name)}`;

  function invite(event: FormEvent) {
    event.preventDefault();
    const address = email.trim().toLowerCase();
    if (!EMAIL.test(address)) return setError("Enter a valid email address.");
    if (address === me.email || team.members.some((m) => m.email === address)) return setError(`${address} is already on this project.`);
    const member: Member = {
      id: `m${Date.now()}`,
      name: nameFromEmail(address),
      email: address,
      role,
      status: "invited",
      invitedAt: new Date().toISOString(),
    };
    setTeam({ ...team, members: [...team.members, member] });
    setEmail("");
    setError(undefined);
    toast(`Invite sent to ${address}`);
  }

  function update(id: string, changes: Partial<Member>) {
    setTeam({ ...team, members: team.members.map((m) => (m.id === id ? { ...m, ...changes } : m)) });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; the link is still visible to copy by hand.
    }
  }

  return (
    <Modal title={`Share ${project.name}`} description="Invite people to build with you or to try the app and leave comments." onClose={onClose}>
      <div className="mb-4">
        <DemoNotice>No emails are sent in this prototype. Invited people join on their own after a few seconds, so you can see how it works.</DemoNotice>
      </div>
      <form onSubmit={invite} noValidate>
        <div className="flex gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Email address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(undefined);
              }}
              placeholder="name@company.com"
              data-autofocus
              aria-invalid={error ? true : undefined}
              className={`w-full rounded-md border bg-panel px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 ${error ? "border-danger" : "border-line"}`}
            />
          </label>
          <label>
            <span className="sr-only">Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              className="h-full rounded-md border border-line bg-panel px-2 text-sm focus:border-accent focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={!email.trim()}>
            Send invite
          </Button>
        </div>
        <p className={`mt-1.5 text-xs ${error ? "text-danger" : "text-muted"}`}>
          {error ?? ROLES.find((r) => r.id === role)?.description}
        </p>
      </form>

      <ul className="mt-5 divide-y divide-line">
        <li className="flex items-center gap-3 py-2.5">
          <TeamAvatar name={me.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{me.name} (you)</p>
            <p className="truncate text-xs text-muted">{me.email}</p>
          </div>
          <span className="text-xs text-muted">Owner</span>
        </li>
        {team.members.map((member) => (
          <li key={member.id} className="flex items-center gap-3 py-2.5">
            <TeamAvatar name={member.name} muted={member.status === "invited"} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{member.name}</p>
              <p className="truncate text-xs text-muted">
                {member.email}
                {member.status === "invited" && " · invite sent"}
              </p>
            </div>
            {member.status === "invited" && (
              <button type="button" onClick={() => toast(`Invite sent again to ${member.email}`)} className="rounded px-1.5 text-xs text-accent hover:underline">
                Resend
              </button>
            )}
            <label>
              <span className="sr-only">Role for {member.name}</span>
              <select
                value={member.role}
                onChange={(event) => update(member.id, { role: event.target.value as Role })}
                className="rounded border border-line bg-panel px-1.5 py-1 text-xs"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                setTeam({ ...team, members: team.members.filter((m) => m.id !== member.id) });
                toast(`${member.name} removed`);
              }}
              aria-label={`Remove ${member.name}`}
              className="rounded p-1 text-muted hover:text-danger"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      <section className="mt-5 rounded-lg border border-line p-3">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={team.linkSharing}
            onChange={() => setTeam({ ...team, linkSharing: !team.linkSharing })}
            className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent-rgb))]"
          />
          <span>
            <span className="block text-sm font-medium">Anyone with the link can view the preview</span>
            <span className="block text-xs text-muted">They can try the app but can't see the chat, code or settings.</span>
          </span>
        </label>
        {team.linkSharing && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-surface px-2.5 py-1.5">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
            <span className="min-w-0 flex-1 truncate font-mono text-xs">{link}</span>
            <button type="button" onClick={copyLink} className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted hover:text-ink">
              {copied ? <Check className="h-3.5 w-3.5 text-success" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        )}
      </section>
    </Modal>
  );
}
