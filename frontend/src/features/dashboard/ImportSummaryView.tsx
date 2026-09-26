import { useState } from "react";
import { Bot, ChevronDown, CircleAlert, Info, Link2, PanelsTopLeft } from "lucide-react";
import TextField from "../../components/TextField";
import type { ImportSummary } from "../../mocks/importSummaries";

type ImportSummaryViewProps = {
  summary: ImportSummary;
  name: string;
  onNameChange: (name: string) => void;
  nameError?: string;
};

/** "Here's what I understood": the imported app in plain words, with technical details on request. */
export default function ImportSummaryView({ summary, name, onNameChange, nameError }: ImportSummaryViewProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        This looks like <span className="font-medium">{summary.description}</span>.
      </p>

      <TextField label="Project name" value={name} onChange={(event) => onNameChange(event.target.value)} error={nameError} maxLength={120} />

      <div className="grid gap-3 sm:grid-cols-3">
        <section className="rounded-lg border border-line p-3">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <PanelsTopLeft className="h-3.5 w-3.5" aria-hidden />
            Pages
          </h3>
          <ul className="mt-2 space-y-1 text-sm">
            {summary.pages.map((page) => (
              <li key={page}>{page}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-line p-3">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <Bot className="h-3.5 w-3.5" aria-hidden />
            Agents
          </h3>
          {summary.agents.length ? (
            <ul className="mt-2 space-y-1.5 text-sm">
              {summary.agents.map((agent) => (
                <li key={agent.name}>
                  <span className="block">{agent.name}</span>
                  <span className="block text-xs text-muted">{agent.role}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">None yet</p>
          )}
        </section>
        <section className="rounded-lg border border-line p-3">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <Link2 className="h-3.5 w-3.5" aria-hidden />
            Connects to
          </h3>
          <ul className="mt-2 space-y-1 text-sm">
            {summary.integrations.map((integration) => (
              <li key={integration}>{integration}</li>
            ))}
          </ul>
        </section>
      </div>

      {summary.notes.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-muted">Things to know</h3>
          <ul className="mt-2 space-y-1.5">
            {summary.notes.map((note) => (
              <li key={note.text} className={`flex gap-2 rounded-md px-3 py-2 text-xs ${note.tone === "warn" ? "bg-danger/5 text-ink" : "bg-surface"}`}>
                {note.tone === "warn" ? (
                  <CircleAlert className="mt-px h-3.5 w-3.5 shrink-0 text-danger" aria-hidden />
                ) : (
                  <Info className="mt-px h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
                )}
                {note.text}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-lg border border-line">
        <button
          type="button"
          onClick={() => setShowDetails((open) => !open)}
          aria-expanded={showDetails}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-muted hover:text-ink"
        >
          Technical details
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDetails ? "rotate-180" : ""}`} aria-hidden />
        </button>
        {showDetails && (
          <div className="space-y-3 border-t border-line px-3 py-3 text-xs">
            <div>
              <p className="text-muted">Stack</p>
              <ul className="mt-1 space-y-0.5 font-mono">
                {summary.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-muted">{summary.files} files</p>
              <div className="mt-1.5 flex h-2 overflow-hidden rounded-full" aria-hidden>
                {summary.languages.map((language, index) => (
                  <span
                    key={language.name}
                    className={index === 0 ? "bg-accent" : index === 1 ? "bg-accent/50" : "bg-accent/20"}
                    style={{ width: `${language.share}%` }}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-muted">
                {summary.languages.map((language) => `${language.name} ${language.share}%`).join(" · ")}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
