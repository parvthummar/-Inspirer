import { useEffect, useRef, useState } from "react";
import { ArrowUp, ChevronDown, FlaskConical, RotateCcw, UserRound, X } from "lucide-react";
import type { AgentConfig } from "./agentStore";
import { simulateRun, suggestedPrompts, type SimulatedRun } from "./playgroundScript";
import TraceList from "./TraceList";

type AgentPlaygroundProps = {
  agents: AgentConfig[];
  initialAgentId: string;
  developer: boolean;
  onClose: () => void;
};

type Turn = { id: number; message: string; run: SimulatedRun; shownSteps: number; done: boolean };

const outcomeLabel = {
  answered: null,
  handed_off: "Handed off to a teammate",
  flagged: "Flagged for review",
  stopped: "Stopped and asked for help",
} as const;

/** Try an agent with test messages. Runs are simulated: they show what the agent would do, step by step. */
export default function AgentPlayground({ agents, initialAgentId, developer, onClose }: AgentPlaygroundProps) {
  const [agentId, setAgentId] = useState(initialAgentId);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const agent = agents.find((a) => a.id === agentId) ?? agents[0];
  const running = turns.some((turn) => !turn.done);

  // Reveal each step of the running turn after its (simulated) duration.
  useEffect(() => {
    const turn = turns.find((t) => !t.done);
    if (!turn) return;
    const next = turn.run.steps[turn.shownSteps];
    const timer = window.setTimeout(
      () =>
        setTurns((current) =>
          current.map((t) =>
            t.id !== turn.id ? t : next ? { ...t, shownSteps: t.shownSteps + 1 } : { ...t, done: true },
          ),
        ),
      next ? Math.min(next.durationMs, 1200) : 400,
    );
    return () => window.clearTimeout(timer);
  }, [turns]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  function send(message: string, event?: { preventDefault: () => void }) {
    event?.preventDefault();
    const text = message.trim();
    if (!text || running || !agent) return;
    setTurns((current) => [...current, { id: Date.now(), message: text, run: simulateRun(agent, text), shownSteps: 0, done: false }]);
    setDraft("");
  }

  return (
    <aside aria-label="Test playground" className="flex h-full w-[380px] shrink-0 flex-col border-l border-line bg-panel">
      <header className="border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-accent" aria-hidden />
          <h2 className="flex-1 text-sm font-semibold">Test playground</h2>
          <button
            type="button"
            onClick={() => setTurns([])}
            disabled={turns.length === 0 || running}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-muted hover:bg-surface hover:text-ink disabled:opacity-40"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            Reset
          </button>
          <button type="button" onClick={onClose} aria-label="Close playground" className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <label className="mt-2 flex items-center gap-2 text-xs text-muted">
          Testing
          <span className="relative flex-1">
            <select
              value={agent?.id}
              onChange={(event) => {
                setAgentId(event.target.value);
                setTurns([]);
              }}
              disabled={running}
              className="w-full appearance-none rounded-md border border-line bg-panel py-1 pl-2 pr-7 text-xs font-medium text-ink focus:border-accent focus:outline-none"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2" aria-hidden />
          </span>
        </label>
        <p className="mt-2 text-[11px] text-muted">Test runs are simulated and don't contact real customers or services.</p>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
        {turns.length === 0 && agent && (
          <div>
            <p className="text-sm text-muted">Send a test message to see how {agent.name} handles it. Try one of these:</p>
            <div className="mt-3 space-y-1.5">
              {suggestedPrompts(agent).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  className="block w-full rounded-md border border-line px-3 py-2 text-left text-xs hover:border-accent/50 hover:bg-accent/5"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {turns.map((turn) => (
          <div key={turn.id} className="space-y-2">
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-ink/[0.06] px-3 py-2 text-sm">{turn.message}</p>
            <TraceList steps={turn.run.steps.slice(0, turn.shownSteps)} running={!turn.done} developer={developer} />
            {turn.done && (
              <div className="rounded-lg border border-line p-3">
                <p className="text-[11px] font-semibold text-accent">{agent?.name}</p>
                <p className="mt-1 text-sm leading-relaxed">{turn.run.reply}</p>
                {outcomeLabel[turn.run.outcome] && (
                  <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-muted">
                    <UserRound className="h-3 w-3" aria-hidden />
                    {outcomeLabel[turn.run.outcome]}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={(event) => send(draft, event)} className="border-t border-line p-3">
        <div className="flex items-end gap-2 rounded-xl border border-line px-3 py-2 focus-within:border-accent/60">
          <label htmlFor="playground-input" className="sr-only">
            Test message
          </label>
          <textarea
            id="playground-input"
            rows={1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) send(draft, event);
            }}
            placeholder="Write a test message"
            className="max-h-32 flex-1 resize-none bg-transparent py-1 text-sm placeholder:text-muted/70 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button
            type="submit"
            disabled={!draft.trim() || running}
            aria-label="Send test message"
            className="mb-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-panel disabled:bg-line disabled:text-muted"
          >
            <ArrowUp className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </form>
    </aside>
  );
}
