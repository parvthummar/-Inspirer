import { useEffect, useState } from "react";
import { Check, LoaderCircle, ShieldCheck } from "lucide-react";
import Button from "../../components/Button";
import GitHubMark from "./GitHubMark";

type ConnectAccountStepProps = {
  username: string;
  onConnected: (username: string) => void;
  onCancel: () => void;
};

const PERMISSIONS = ["Create repositories", "Read and write code in repositories you choose", "Read your username and email"];
const AUTHORISE_MS = 1600;

/** Simulated GitHub authorisation: explains the permissions, then "waits" for GitHub. */
export default function ConnectAccountStep({ username, onConnected, onCancel }: ConnectAccountStepProps) {
  const [authorising, setAuthorising] = useState(false);

  useEffect(() => {
    if (!authorising) return;
    const timer = window.setTimeout(() => onConnected(username), AUTHORISE_MS);
    return () => window.clearTimeout(timer);
  }, [authorising, onConnected, username]);

  if (authorising) {
    return (
      <div className="flex flex-col items-center py-6 text-center" role="status">
        <LoaderCircle className="h-6 w-6 animate-spin text-accent" aria-hidden />
        <p className="mt-3 text-sm font-medium">Waiting for GitHub</p>
        <p className="mt-1 text-sm text-muted">Approve Architect in the GitHub window to finish connecting.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-panel">
          <GitHubMark className="h-5 w-5" />
        </span>
        <p className="text-sm text-muted">Architect will ask GitHub for permission to:</p>
      </div>
      <ul className="mt-4 space-y-2">
        {PERMISSIONS.map((permission) => (
          <li key={permission} className="flex gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            {permission}
          </li>
        ))}
      </ul>
      <p className="mt-4 flex gap-2 rounded-md bg-surface p-3 text-xs text-muted">
        <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
        You can remove access at any time from your GitHub settings. Architect never sees your GitHub password.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => setAuthorising(true)} className="bg-ink hover:bg-ink/90">
          <GitHubMark />
          Connect GitHub
        </Button>
      </div>
    </div>
  );
}
