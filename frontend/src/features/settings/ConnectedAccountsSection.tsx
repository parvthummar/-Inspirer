import { useState } from "react";
import { HardDrive, MessageSquare } from "lucide-react";
import type { User } from "../../api/auth";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { useToast } from "../../components/toast-context";
import { formatRelativeTime } from "../../lib/time";
import { useLocalState } from "../../lib/localStore";
import GitHubMark from "../github/GitHubMark";
import { GITHUB_ACCOUNT_KEY, usernameFrom, type GitHubAccount } from "../github/githubStore";
import SettingsCard from "./SettingsCard";

type Connection = { id: string; name: string; description: string; icon: typeof HardDrive | typeof GitHubMark };

const CONNECTIONS: Connection[] = [
  { id: "github", name: "GitHub", description: "Save your apps' code to repositories and keep them in sync.", icon: GitHubMark },
  { id: "slack", name: "Slack", description: "Let agents post updates and ask your team questions in Slack.", icon: MessageSquare },
  { id: "google-drive", name: "Google Drive", description: "Let agents read and save documents in your Drive.", icon: HardDrive },
];

const CONNECT_MS = 1400;

/** Accounts connected once and used by every project. GitHub shares its state with the workspace. */
export default function ConnectedAccountsSection({ user }: { user: User }) {
  const [github, setGitHub] = useLocalState<GitHubAccount>(GITHUB_ACCOUNT_KEY);
  const [others, setOthers] = useLocalState<Record<string, string>>(`architect.connections.${user.id}`);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<Connection | null>(null);
  const toast = useToast();

  const connectedAt = (id: string) => (id === "github" ? github?.connectedAt : others?.[id]);

  function connect(connection: Connection) {
    setConnecting(connection.id);
    window.setTimeout(() => {
      const now = new Date().toISOString();
      if (connection.id === "github") setGitHub({ username: usernameFrom(user.name), connectedAt: now });
      else setOthers({ ...(others ?? {}), [connection.id]: now });
      setConnecting(null);
      toast(`${connection.name} connected`);
    }, CONNECT_MS);
  }

  function disconnect(connection: Connection) {
    if (connection.id === "github") setGitHub(null);
    else {
      const rest = { ...(others ?? {}) };
      delete rest[connection.id];
      setOthers(rest);
    }
    setDisconnecting(null);
    toast(`${connection.name} disconnected`);
  }

  return (
    <SettingsCard title="Connected accounts" description="Connect a service once and every project can use it.">
      <ul className="divide-y divide-line">
        {CONNECTIONS.map((connection) => {
          const at = connectedAt(connection.id);
          const Icon = connection.icon;
          return (
            <li key={connection.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{connection.name}</p>
                <p className="text-xs text-muted">
                  {at
                    ? `Connected ${formatRelativeTime(at).toLowerCase()}${connection.id === "github" && github ? ` as ${github.username}` : ""}`
                    : connection.description}
                </p>
              </div>
              {at ? (
                <Button variant="secondary" onClick={() => setDisconnecting(connection)} className="px-3 py-1.5 text-xs">
                  Disconnect
                </Button>
              ) : (
                <Button onClick={() => connect(connection)} loading={connecting === connection.id} disabled={Boolean(connecting)} className="px-3 py-1.5 text-xs">
                  {connecting === connection.id ? "Connecting" : "Connect"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      {disconnecting && (
        <Modal
          title={`Disconnect ${disconnecting.name}?`}
          width="sm"
          onClose={() => setDisconnecting(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDisconnecting(null)} data-autofocus>
                Stay connected
              </Button>
              <Button onClick={() => disconnect(disconnecting)} className="bg-danger hover:bg-danger/90">
                Disconnect {disconnecting.name}
              </Button>
            </>
          }
        >
          <p className="text-sm leading-relaxed text-muted">
            Agents and projects that use {disconnecting.name} will stop being able to reach it until you connect again.
            Nothing is deleted from your {disconnecting.name} account.
          </p>
        </Modal>
      )}
    </SettingsCard>
  );
}
