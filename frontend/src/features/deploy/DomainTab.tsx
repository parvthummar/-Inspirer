import { useState, type FormEvent } from "react";
import { CircleCheck, Clock, Copy, ShieldCheck, Trash2 } from "lucide-react";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import { useToast } from "../../components/toast-context";
import type { DeployController } from "./useDeploy";

type DomainTabProps = {
  deploy: DeployController;
  defaultHost: string;
  developer: boolean;
};

const DOMAIN = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/;
const CHECK_MS = 1400;

export default function DomainTab({ deploy, defaultHost, developer }: DomainTabProps) {
  const { state, update } = deploy;
  const domain = state.domain;
  const [input, setInput] = useState("");
  const [error, setError] = useState<string>();
  const [checking, setChecking] = useState(false);
  const [lastCheckFailed, setLastCheckFailed] = useState(false);
  const toast = useToast();

  function add(event: FormEvent) {
    event.preventDefault();
    const name = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (!DOMAIN.test(name)) return setError("Enter a domain like app.yourcompany.com.");
    update((current) => ({ ...current, domain: { name, status: "waiting_for_dns", checks: 0, addedAt: new Date().toISOString() } }));
    setInput("");
    setError(undefined);
  }

  function check() {
    if (!domain) return;
    setChecking(true);
    window.setTimeout(() => {
      setChecking(false);
      // The first check never finds the record (DNS takes time); the next one does.
      const found = domain.checks >= 1;
      setLastCheckFailed(!found);
      update((current) =>
        current.domain ? { ...current, domain: { ...current.domain, checks: current.domain.checks + 1, status: found ? "active" : "waiting_for_dns" } } : current,
      );
      if (found) toast("Domain connected");
    }, CHECK_MS);
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied");
    } catch {
      // Clipboard can be blocked; the value is still selectable.
    }
  }

  const records = domain
    ? domain.name.split(".").length > 2
      ? [{ type: "CNAME", name: domain.name.split(".")[0], value: "cname.architect.app" }]
      : [
          { type: "A", name: "@", value: "76.76.21.21" },
          { type: "CNAME", name: "www", value: "cname.architect.app" },
        ]
    : [];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-line p-4">
        <p className="text-xs text-muted">Default address</p>
        <p className="mt-1 font-mono text-sm">{defaultHost}</p>
        <p className="mt-1 text-xs text-muted">Always works, even after you add your own domain.</p>
      </div>

      {!domain ? (
        <form onSubmit={add} noValidate className="rounded-lg border border-line p-4">
          <p className="text-sm font-semibold">Use your own domain</p>
          <p className="mt-0.5 text-xs text-muted">
            {developer ? "Point a domain or subdomain at this app. TLS certificates are issued automatically." : "Let people reach your app at your company's web address."}
          </p>
          <div className="mt-3 flex items-start gap-2">
            <TextField label="Domain" value={input} onChange={(e) => setInput(e.target.value)} placeholder="app.yourcompany.com" error={error} className="flex-1" />
            <Button type="submit" disabled={!input.trim()} className="mt-[26px] shrink-0">
              Add domain
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border border-line p-4">
          <div className="flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate font-mono text-sm font-medium">{domain.name}</p>
            {domain.status === "active" ? (
              <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                <CircleCheck className="h-3 w-3" aria-hidden />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                <Clock className="h-3 w-3" aria-hidden />
                Waiting for DNS
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                update((current) => ({ ...current, domain: null }));
                setLastCheckFailed(false);
                toast("Domain removed");
              }}
              aria-label="Remove domain"
              className="rounded p-1 text-muted hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          {domain.status === "active" ? (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden />
              Secure connection (HTTPS) is on. Certificate renews automatically.
            </p>
          ) : (
            <>
              <p className="mt-3 text-xs text-muted">
                Add {records.length === 1 ? "this record" : "these records"} where you manage your domain (for example GoDaddy, Cloudflare or
                Namecheap), then check again.
              </p>
              <table className="mt-2 w-full text-left text-xs">
                <thead className="text-muted">
                  <tr>
                    <th className="py-1 font-medium">Type</th>
                    <th className="py-1 font-medium">Name</th>
                    <th className="py-1 font-medium">Value</th>
                    <th className="sr-only">Copy</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {records.map((record) => (
                    <tr key={record.type + record.name} className="border-t border-line">
                      <td className="py-2">{record.type}</td>
                      <td className="py-2">{record.name}</td>
                      <td className="py-2">{record.value}</td>
                      <td className="py-2 text-right">
                        <button type="button" onClick={() => copy(record.value)} aria-label={`Copy ${record.value}`} className="rounded p-1 text-muted hover:text-ink">
                          <Copy className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lastCheckFailed && !checking && (
                <p className="mt-2 text-xs text-danger">
                  We couldn't find the record yet. DNS changes can take up to an hour to show up. Check again in a few minutes.
                </p>
              )}
              <Button variant="secondary" onClick={check} loading={checking} className="mt-3 px-3 py-1.5 text-xs">
                {checking ? "Checking DNS" : "Check DNS"}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
