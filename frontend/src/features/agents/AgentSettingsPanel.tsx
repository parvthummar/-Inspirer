import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { useToast } from "../../components/toast-context";
import { memoryOptions, models, toneOptions, toolCatalog, whenUnsureOptions } from "../../mocks/agentCatalog";
import { slug } from "../../mocks/generatedFiles";
import type { AgentConfig } from "./agentStore";
import SettingsField from "./SettingsField";

type AgentSettingsPanelProps = {
  agent: AgentConfig;
  developer: boolean;
  canDelete: boolean;
  onSave: (agent: AgentConfig) => void;
  onDelete: () => void;
  onClose: () => void;
};

const input =
  "w-full rounded-md border border-line bg-panel px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export default function AgentSettingsPanel({ agent, developer, canDelete, onSave, onDelete, onClose }: AgentSettingsPanelProps) {
  const [draft, setDraft] = useState(agent);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const toast = useToast();

  const dirty = JSON.stringify(draft) !== JSON.stringify(agent);
  const unusedTools = toolCatalog.filter((name) => !draft.tools.some((tool) => tool.name === name));

  function change(changes: Partial<AgentConfig>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function save() {
    if (!draft.name.trim()) return;
    onSave({ ...draft, name: draft.name.trim(), role: draft.role.trim() });
    toast("Agent saved");
  }

  return (
    <aside aria-label={`${agent.name} settings`} className="flex h-full w-[340px] shrink-0 flex-col border-l border-line bg-panel">
      <header className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{agent.name}</h2>
          <p className="text-[11px] text-muted">{dirty ? "Unsaved changes" : "Agent settings"}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close settings" className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink">
          <X className="h-4 w-4" aria-hidden />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <SettingsField label="Name">
          <input value={draft.name} maxLength={60} onChange={(event) => change({ name: event.target.value })} className={input} />
        </SettingsField>

        <SettingsField
          label={developer ? "System prompt" : "What it does"}
          hint={developer ? undefined : "Describe the job in plain words, like you would to a new colleague."}
        >
          <textarea
            value={draft.role}
            rows={developer ? 6 : 4}
            maxLength={2000}
            onChange={(event) => change({ role: event.target.value })}
            className={`${input} resize-none leading-relaxed ${developer ? "font-mono text-xs" : ""}`}
          />
        </SettingsField>

        <SettingsField label={developer ? "Tools" : "What it can use"}>
          <ul className="space-y-1">
            {draft.tools.map((tool, index) => (
              <li key={tool.name} className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-surface">
                <input
                  type="checkbox"
                  id={`tool-${index}`}
                  checked={tool.enabled}
                  onChange={() =>
                    change({ tools: draft.tools.map((t, i) => (i === index ? { ...t, enabled: !t.enabled } : t)) })
                  }
                  className="h-4 w-4 accent-[rgb(var(--accent-rgb))]"
                />
                <label htmlFor={`tool-${index}`} className={`min-w-0 flex-1 truncate text-sm ${developer ? "font-mono text-xs" : ""}`}>
                  {developer ? `${slug(tool.name, "_")}()` : tool.name}
                </label>
                <button
                  type="button"
                  onClick={() => change({ tools: draft.tools.filter((_, i) => i !== index) })}
                  aria-label={`Remove ${tool.name}`}
                  className="rounded p-0.5 text-muted hover:text-danger"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </li>
            ))}
            {draft.tools.length === 0 && <li className="px-1 text-xs text-muted">No tools yet. Add one below.</li>}
          </ul>
          {unusedTools.length > 0 && (
            <label className="mt-2 flex items-center gap-2">
              <Plus className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
              <span className="sr-only">Add a tool</span>
              <select
                value=""
                onChange={(event) =>
                  event.target.value && change({ tools: [...draft.tools, { name: event.target.value, enabled: true }] })
                }
                className="flex-1 rounded-md border border-dashed border-line bg-panel px-2 py-1 text-xs text-muted focus:border-accent focus:outline-none"
              >
                <option value="">Add a tool</option>
                {unusedTools.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </label>
          )}
        </SettingsField>

        <SettingsField label="When it's not sure">
          <div className="space-y-1.5">
            {whenUnsureOptions.map((option) => (
              <label key={option.id} className="flex cursor-pointer gap-2 rounded-md border border-line p-2 has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                <input
                  type="radio"
                  name="when-unsure"
                  checked={draft.whenUnsure === option.id}
                  onChange={() => change({ whenUnsure: option.id })}
                  className="mt-0.5 accent-[rgb(var(--accent-rgb))]"
                />
                <span>
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="block text-xs text-muted">{option.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </SettingsField>

        <SettingsField label="Tone">
          <div role="radiogroup" aria-label="Tone" className="flex rounded-lg bg-surface p-0.5">
            {toneOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={draft.tone === option.id}
                onClick={() => change({ tone: option.id })}
                className={`flex-1 rounded-md py-1 text-xs font-medium ${draft.tone === option.id ? "bg-panel shadow-sm" : "text-muted"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </SettingsField>

        {developer && (
          <div className="space-y-4 rounded-lg border border-line bg-surface/50 p-3">
            <p className="text-xs font-semibold">Advanced</p>
            <SettingsField label="Model">
              <select value={draft.model} onChange={(event) => change({ model: event.target.value })} className={`${input} text-xs`}>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </SettingsField>
            <SettingsField label={`Temperature: ${draft.temperature.toFixed(1)}`}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={draft.temperature}
                onChange={(event) => change({ temperature: Number(event.target.value) })}
                className="w-full accent-[rgb(var(--accent-rgb))]"
              />
            </SettingsField>
            <SettingsField label="Max steps per task">
              <input
                type="number"
                min={1}
                max={30}
                value={draft.maxSteps}
                onChange={(event) => change({ maxSteps: Math.min(30, Math.max(1, Number(event.target.value) || 1)) })}
                className={`${input} w-24 font-mono text-xs`}
              />
            </SettingsField>
            <SettingsField label="Memory">
              <select value={draft.memory} onChange={(event) => change({ memory: event.target.value as AgentConfig["memory"] })} className={`${input} text-xs`}>
                {memoryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </SettingsField>
          </div>
        )}
      </div>

      <footer className="flex items-center gap-2 border-t border-line px-4 py-3">
        {canDelete && (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-danger hover:bg-danger/5"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Delete agent
          </button>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={() => setDraft(agent)} disabled={!dirty} className="px-3 py-1.5">
            Discard
          </Button>
          <Button onClick={save} disabled={!dirty || !draft.name.trim()} className="px-3 py-1.5">
            Save agent
          </Button>
        </div>
      </footer>

      {confirmingDelete && (
        <Modal
          title={`Delete ${agent.name}?`}
          width="sm"
          onClose={() => setConfirmingDelete(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirmingDelete(false)} data-autofocus>
                Keep agent
              </Button>
              <Button
                onClick={() => {
                  setConfirmingDelete(false);
                  onDelete();
                  toast("Agent deleted");
                }}
                className="bg-danger hover:bg-danger/90"
              >
                Delete agent
              </Button>
            </>
          }
        >
          <p className="text-sm text-muted">Its tools and settings will be removed. Other agents keep working as before.</p>
        </Modal>
      )}
    </aside>
  );
}
