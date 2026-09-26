import { useState, type FormEvent } from "react";
import { Globe, Lock, Search } from "lucide-react";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import { existingRepos, organisations } from "../../mocks/githubRepos";

export type RepoChoice = { mode: "created" | "linked"; owner: string; name: string; private: boolean };

type ChooseRepoStepProps = {
  username: string;
  defaultName: string;
  developer: boolean;
  onChoose: (choice: RepoChoice) => void;
  onCancel: () => void;
};

const REPO_NAME = /^[A-Za-z0-9._-]{1,100}$/;

export default function ChooseRepoStep({ username, defaultName, developer, onChoose, onCancel }: ChooseRepoStepProps) {
  const [mode, setMode] = useState<"create" | "link">("create");
  const [owner, setOwner] = useState(username);
  const [name, setName] = useState(defaultName);
  const [isPrivate, setIsPrivate] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const repos = existingRepos(username);
  const taken = repos.some((repo) => repo.owner === owner && repo.name.toLowerCase() === name.toLowerCase());
  const nameError = !REPO_NAME.test(name)
    ? "Use letters, numbers, dots, dashes or underscores."
    : taken
      ? `${owner}/${name} already exists. Pick another name or link it instead.`
      : undefined;
  const shown = repos.filter((repo) => `${repo.owner}/${repo.name}`.includes(query.toLowerCase()));

  function submit(event: FormEvent) {
    event.preventDefault();
    if (mode === "create") {
      if (!nameError) onChoose({ mode: "created", owner, name, private: isPrivate });
      return;
    }
    const repo = repos.find((r) => `${r.owner}/${r.name}` === selected);
    if (repo) onChoose({ mode: "linked", owner: repo.owner, name: repo.name, private: repo.private });
  }

  return (
    <form onSubmit={submit} noValidate>
      <div role="radiogroup" aria-label="Repository" className="grid grid-cols-2 gap-2">
        {(
          [
            ["create", "Create a new repository"],
            ["link", "Use an existing one"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={mode === id}
            onClick={() => setMode(id)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${mode === id ? "border-accent bg-accent/5 text-accent" : "border-line text-muted hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "create" ? (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start gap-2">
            <label className="block text-sm font-medium">
              Owner
              <select
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
                className="mt-1.5 block w-full rounded-md border border-line bg-panel px-3 py-2 text-sm font-normal focus:border-accent focus:outline-none"
              >
                {[username, ...organisations].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <TextField label="Repository name" value={name} onChange={(event) => setName(event.target.value.trim())} error={nameError} data-autofocus />
          </div>
          <fieldset className="space-y-2">
            <legend className="mb-1.5 text-sm font-medium">Who can see it</legend>
            {[
              { value: true, icon: Lock, label: "Private", hint: "Only you and people you invite." },
              { value: false, icon: Globe, label: "Public", hint: "Anyone on the internet can see the code." },
            ].map((option) => (
              <label key={option.label} className="flex cursor-pointer gap-2.5 rounded-md border border-line p-2.5 has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                <input type="radio" name="visibility" checked={isPrivate === option.value} onChange={() => setIsPrivate(option.value)} className="mt-0.5 accent-[rgb(var(--accent-rgb))]" />
                <option.icon className="mt-0.5 h-4 w-4 text-muted" aria-hidden />
                <span>
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="block text-xs text-muted">{option.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </div>
      ) : (
        <div className="mt-5">
          <label className="flex items-center gap-2 rounded-md border border-line px-3 py-2">
            <Search className="h-4 w-4 text-muted" aria-hidden />
            <span className="sr-only">Search repositories</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your repositories" className="flex-1 bg-transparent text-sm focus:outline-none" />
          </label>
          <ul className="mt-2 max-h-60 divide-y divide-line overflow-y-auto rounded-md border border-line">
            {shown.map((repo) => {
              const id = `${repo.owner}/${repo.name}`;
              return (
                <li key={id}>
                  <label className="flex cursor-pointer items-start gap-2.5 px-3 py-2.5 hover:bg-surface has-[:checked]:bg-accent/5">
                    <input type="radio" name="existing-repo" checked={selected === id} onChange={() => setSelected(id)} className="mt-1 accent-[rgb(var(--accent-rgb))]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-xs font-medium">{id}</span>
                      <span className="block truncate text-xs text-muted">{repo.description}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-muted">{repo.updated}</span>
                  </label>
                </li>
              );
            })}
            {shown.length === 0 && <li className="px-3 py-4 text-center text-sm text-muted">No repositories match "{query}".</li>}
          </ul>
          <p className="mt-2 text-xs text-muted">
            {developer
              ? "Architect commits to a new branch, architect/main, and never force-pushes."
              : "Architect adds its work alongside what's already there. Nothing is deleted."}
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={mode === "create" ? Boolean(nameError) : !selected}>
          {mode === "create" ? "Create repository" : "Link repository"}
        </Button>
      </div>
    </form>
  );
}
