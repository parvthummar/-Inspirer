import { useState, type FormEvent, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { useUpdatePlan, type PlanAgent, type PlanContent, type PlanPage } from "../../api/plans";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import { useToast } from "../../components/toast-context";
import PlanAddButton from "./PlanAddButton";
import PlanRemoveButton from "./PlanRemoveButton";
import PlanSection from "./PlanSection";

type PlanEditorProps = {
  projectId: string;
  content: PlanContent;
  onDone: () => void;
};

const input =
  "w-full rounded-md border border-line bg-panel px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

/** Edit a proposed plan in place: summary, agents, pages and integrations. */
export default function PlanEditor({ projectId, content, onDone }: PlanEditorProps) {
  const [summary, setSummary] = useState(content.summary);
  const [agents, setAgents] = useState<PlanAgent[]>(content.agents);
  const [toolDrafts, setToolDrafts] = useState(content.agents.map((agent) => agent.tools.join(", ")));
  const [pages, setPages] = useState<PlanPage[]>(content.pages);
  const [integrations, setIntegrations] = useState(content.integrations);
  const [newIntegration, setNewIntegration] = useState("");
  const [validationError, setValidationError] = useState<string>();
  const updatePlan = useUpdatePlan(projectId);
  const toast = useToast();

  function updateAgent(index: number, changes: Partial<PlanAgent>) {
    setAgents((current) => current.map((agent, i) => (i === index ? { ...agent, ...changes } : agent)));
  }

  function updatePage(index: number, changes: Partial<PlanPage>) {
    setPages((current) => current.map((page, i) => (i === index ? { ...page, ...changes } : page)));
  }

  function addIntegration() {
    const name = newIntegration.trim();
    if (name && !integrations.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
      setIntegrations((current) => [...current, name]);
    }
    setNewIntegration("");
  }

  function handleIntegrationKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addIntegration();
    }
  }

  function save(event: FormEvent) {
    event.preventDefault();
    const cleanAgents = agents
      .map((agent, index) => ({
        name: agent.name.trim(),
        role: agent.role.trim(),
        tools: toolDrafts[index]
          .split(",")
          .map((tool) => tool.trim())
          .filter(Boolean),
      }))
      .filter((agent) => agent.name);
    const cleanPages = pages
      .map((page) => ({ name: page.name.trim(), purpose: page.purpose.trim() }))
      .filter((page) => page.name);

    if (cleanAgents.length === 0) return setValidationError("Keep at least one agent so your app has something doing the work.");
    if (cleanPages.length === 0) return setValidationError("Keep at least one page so people have somewhere to use your app.");
    setValidationError(undefined);

    updatePlan.mutate(
      { ...content, summary: summary.trim(), agents: cleanAgents, pages: cleanPages, integrations },
      {
        onSuccess: () => {
          toast("Plan updated");
          onDone();
        },
      },
    );
  }

  return (
    <form onSubmit={save} noValidate>
      <div className="px-4 pb-3">
        <label htmlFor="plan-summary" className="text-xs font-semibold text-muted">
          Summary
        </label>
        <textarea
          id="plan-summary"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={3}
          maxLength={1000}
          className={`${input} mt-1.5 resize-none leading-relaxed`}
        />
      </div>

      <PlanSection title="Agents" count={agents.length}>
        <ul className="space-y-3">
          {agents.map((agent, index) => (
            <li key={index} className="flex gap-2 rounded-lg bg-surface/70 p-2.5">
              <div className="min-w-0 flex-1 space-y-1.5">
                <input
                  aria-label={`Agent ${index + 1} name`}
                  placeholder="Agent name"
                  value={agent.name}
                  maxLength={80}
                  onChange={(event) => updateAgent(index, { name: event.target.value })}
                  className={`${input} font-medium`}
                />
                <input
                  aria-label={`Agent ${index + 1} role`}
                  placeholder="What it does"
                  value={agent.role}
                  maxLength={400}
                  onChange={(event) => updateAgent(index, { role: event.target.value })}
                  className={input}
                />
                <input
                  aria-label={`Agent ${index + 1} tools, separated by commas`}
                  placeholder="What it can do, separated by commas"
                  value={toolDrafts[index] ?? ""}
                  onChange={(event) =>
                    setToolDrafts((current) => current.map((draft, i) => (i === index ? event.target.value : draft)))
                  }
                  className={`${input} text-xs`}
                />
              </div>
              <PlanRemoveButton
                label={`Remove ${agent.name || "agent"}`}
                onClick={() => {
                  setAgents((current) => current.filter((_, i) => i !== index));
                  setToolDrafts((current) => current.filter((_, i) => i !== index));
                }}
              />
            </li>
          ))}
        </ul>
        {agents.length < 6 && (
          <PlanAddButton
            onClick={() => {
              setAgents((current) => [...current, { name: "", role: "", tools: [] }]);
              setToolDrafts((current) => [...current, ""]);
            }}
          >
            Add agent
          </PlanAddButton>
        )}
      </PlanSection>

      <PlanSection title="Pages" count={pages.length}>
        <ul className="space-y-2">
          {pages.map((page, index) => (
            <li key={index} className="flex gap-2">
              <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-1.5">
                <input
                  aria-label={`Page ${index + 1} name`}
                  placeholder="Page name"
                  value={page.name}
                  maxLength={80}
                  onChange={(event) => updatePage(index, { name: event.target.value })}
                  className={`${input} font-medium`}
                />
                <input
                  aria-label={`Page ${index + 1} purpose`}
                  placeholder="What it's for"
                  value={page.purpose}
                  maxLength={400}
                  onChange={(event) => updatePage(index, { purpose: event.target.value })}
                  className={input}
                />
              </div>
              <PlanRemoveButton
                label={`Remove ${page.name || "page"}`}
                onClick={() => setPages((current) => current.filter((_, i) => i !== index))}
              />
            </li>
          ))}
        </ul>
        {pages.length < 10 && (
          <PlanAddButton onClick={() => setPages((current) => [...current, { name: "", purpose: "" }])}>Add page</PlanAddButton>
        )}
      </PlanSection>

      <PlanSection title="Connects to">
        <div className="flex flex-wrap items-center gap-1.5">
          {integrations.map((integration) => (
            <span key={integration} className="inline-flex items-center gap-1 rounded-full border border-line py-0.5 pl-2 pr-1 text-xs">
              {integration}
              <button
                type="button"
                onClick={() => setIntegrations((current) => current.filter((item) => item !== integration))}
                aria-label={`Remove ${integration}`}
                className="rounded-full p-0.5 text-muted hover:bg-danger/5 hover:text-danger"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </span>
          ))}
          {integrations.length < 10 && (
            <input
              aria-label="Add a service"
              placeholder="Add a service, e.g. Slack"
              value={newIntegration}
              onChange={(event) => setNewIntegration(event.target.value)}
              onKeyDown={handleIntegrationKey}
              onBlur={addIntegration}
              className="min-w-[160px] flex-1 rounded-md px-1.5 py-0.5 text-xs placeholder:text-muted/70 focus:bg-surface focus:outline-none"
            />
          )}
        </div>
      </PlanSection>

      {(validationError || updatePlan.isError) && (
        <div className="px-4 pb-3">
          <Alert>{validationError ?? updatePlan.error?.message}</Alert>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-line bg-surface/60 px-4 py-3">
        <Button type="button" variant="secondary" onClick={onDone} disabled={updatePlan.isPending} className="px-3 py-1.5">
          Cancel
        </Button>
        <Button type="submit" loading={updatePlan.isPending} className="px-3 py-1.5">
          {updatePlan.isPending ? "Saving changes" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
