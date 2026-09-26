import { useState } from "react";
import { CircleAlert, CircleCheck, Wand2 } from "lucide-react";
import Button from "../../components/Button";
import { useToast } from "../../components/toast-context";
import { formatRelativeTime } from "../../lib/time";
import type { AgentRun } from "../../mocks/monitorData";
import TraceList from "../agents/TraceList";
import RunOutcomePill from "./RunOutcomePill";

type RunDetailProps = {
  run: AgentRun;
  fixed: boolean;
  developer: boolean;
  onFixed: () => void;
};

const FIX_MS = 1800;

/** One run: the conversation, what the agent did step by step, and what went wrong if it failed. */
export default function RunDetail({ run, fixed, developer, onFixed }: RunDetailProps) {
  const [fixing, setFixing] = useState(false);
  const toast = useToast();

  function fix() {
    setFixing(true);
    window.setTimeout(() => {
      setFixing(false);
      onFixed();
      toast("Fix applied");
    }, FIX_MS);
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{run.customer}</p>
          <p className="text-xs text-muted">
            {run.agent} · {formatRelativeTime(new Date(run.at).toISOString()).toLowerCase()}
            {developer && <span className="font-mono"> · {run.id}</span>}
          </p>
        </div>
        <RunOutcomePill outcome={run.outcome} fixed={fixed} />
      </div>

      {run.failure && (
        <section className={`rounded-lg border p-3 ${fixed ? "border-success/40 bg-success/5" : "border-danger/30 bg-danger/5"}`}>
          {fixed ? (
            <p className="flex gap-2 text-sm">
              <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              <span>
                <span className="font-medium">Fixed. </span>
                {run.failure.fix} Runs like this one will go through from now on.
              </span>
            </p>
          ) : (
            <>
              <p className="flex gap-2 text-sm">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
                <span>
                  <span className="font-medium">What went wrong: </span>
                  {run.failure.plain}
                </span>
              </p>
              {developer && <p className="ml-6 mt-1.5 font-mono text-[11px] text-danger">{run.failure.technical}</p>}
              <Button onClick={fix} loading={fixing} className="ml-6 mt-3 px-3 py-1.5 text-xs">
                {!fixing && <Wand2 className="h-3.5 w-3.5" aria-hidden />}
                {fixing ? "Fixing" : "Fix it for me"}
              </Button>
            </>
          )}
        </section>
      )}

      <section>
        <h3 className="text-xs font-semibold text-muted">Conversation</h3>
        <ol className="mt-2 space-y-2">
          {run.conversation.map((line, index) => (
            <li key={index} className={`flex ${line.from === "person" ? "justify-start" : "justify-end"}`}>
              <p className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${line.from === "person" ? "bg-surface" : "bg-accent/10"}`}>
                {line.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="text-xs font-semibold text-muted">{developer ? "Trace" : "What the agent did"}</h3>
        <div className="mt-2">
          <TraceList steps={run.steps} running={false} developer={developer} />
        </div>
      </section>
    </div>
  );
}
