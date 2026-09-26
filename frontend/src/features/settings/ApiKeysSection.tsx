import { useState, type FormEvent } from "react";
import { Check, Copy, KeyRound, TriangleAlert } from "lucide-react";
import type { User } from "../../api/auth";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import TextField from "../../components/TextField";
import { useToast } from "../../components/toast-context";
import { formatRelativeTime } from "../../lib/time";
import { useLocalState } from "../../lib/localStore";
import SettingsCard from "./SettingsCard";

/** Keys are a dummy flow kept in the browser. Only the last characters are stored, like a real service. */
type ApiKey = { id: string; name: string; lastFour: string; createdAt: string };

function newSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return `ak_live_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export default function ApiKeysSection({ user }: { user: User }) {
  const [keys, setKeys] = useLocalState<ApiKey[]>(`architect.apikeys.${user.id}`);
  const [name, setName] = useState("");
  const [created, setCreated] = useState<{ name: string; secret: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);
  const toast = useToast();
  const list = keys ?? [];

  function create(event: FormEvent) {
    event.preventDefault();
    const label = name.trim();
    if (!label) return;
    const secret = newSecret();
    setKeys([{ id: `k${Date.now()}`, name: label, lastFour: secret.slice(-4), createdAt: new Date().toISOString() }, ...list]);
    setCreated({ name: label, secret });
    setName("");
    setCopied(false);
  }

  async function copy() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.secret);
      setCopied(true);
    } catch {
      // Clipboard can be blocked; the key is still selectable in the box.
    }
  }

  return (
    <SettingsCard
      title="API keys"
      description="Use a key to start builds, send messages and read logs from your own scripts or CI. Keys have the same access as your account."
    >
      <form onSubmit={create} className="flex items-end gap-2">
        <TextField label="Key name" placeholder="For example: CI pipeline" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className="flex-1" />
        <Button type="submit" disabled={!name.trim()}>
          Create key
        </Button>
      </form>

      {list.length === 0 ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-line px-4 py-6 text-sm text-muted">
          <KeyRound className="h-4 w-4" aria-hidden />
          No keys yet. Create one when you want to use Architect from code.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-lg border border-line">
          {list.map((key) => (
            <li key={key.id} className="flex items-center gap-3 px-4 py-3">
              <KeyRound className="h-4 w-4 shrink-0 text-muted" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{key.name}</p>
                <p className="font-mono text-xs text-muted">
                  ak_live_••••••••{key.lastFour} · created {formatRelativeTime(key.createdAt).toLowerCase()}
                </p>
              </div>
              <button type="button" onClick={() => setRevoking(key)} className="rounded px-2 py-1 text-xs text-danger hover:bg-danger/5">
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}

      {created && (
        <Modal
          title="Copy your new key"
          description={`"${created.name}" is ready. This is the only time you'll see the full key.`}
          width="sm"
          onClose={() => setCreated(null)}
          footer={<Button onClick={() => setCreated(null)}>Done</Button>}
        >
          <div className="flex items-center gap-2 rounded-md border border-line bg-surface p-2">
            <code className="min-w-0 flex-1 break-all font-mono text-xs">{created.secret}</code>
            <button type="button" onClick={copy} aria-label="Copy key" className="shrink-0 rounded p-1.5 text-muted hover:bg-panel hover:text-ink">
              {copied ? <Check className="h-4 w-4 text-success" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            </button>
          </div>
          <p className="mt-3 flex gap-2 text-xs text-muted">
            <TriangleAlert className="h-4 w-4 shrink-0 text-danger" aria-hidden />
            Store it somewhere safe, like your CI's secret settings. Never put it in code you share.
          </p>
        </Modal>
      )}

      {revoking && (
        <Modal
          title={`Revoke "${revoking.name}"?`}
          width="sm"
          onClose={() => setRevoking(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setRevoking(null)} data-autofocus>
                Keep key
              </Button>
              <Button
                onClick={() => {
                  setKeys(list.filter((k) => k.id !== revoking.id));
                  setRevoking(null);
                  toast("Key revoked");
                }}
                className="bg-danger hover:bg-danger/90"
              >
                Revoke key
              </Button>
            </>
          }
        >
          <p className="text-sm leading-relaxed text-muted">Anything using this key will stop working straight away. This can't be undone.</p>
        </Modal>
      )}
    </SettingsCard>
  );
}
