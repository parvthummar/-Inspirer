import { useEffect, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { useToast } from "../../components/toast-context";
import { frameworks, type Framework } from "../../mocks/agentCatalog";

type FrameworkPickerProps = {
  current: Framework;
  agentCount: number;
  onChange: (framework: Framework) => void;
};

const REGENERATE_STEPS = ["Rewriting agent definitions", "Updating tool bindings", "Running agent tests"];
const STEP_MS = 700;

/** Developer view: choose the agent framework. Switching "regenerates" the agent code. */
export default function FrameworkPicker({ current, agentCount, onChange }: FrameworkPickerProps) {
  const [pending, setPending] = useState<Framework | null>(null);
  const [step, setStep] = useState<number | null>(null);
  const toast = useToast();
  const pendingName = frameworks.find((f) => f.id === pending)?.name;

  useEffect(() => {
    if (step === null || !pending) return;
    if (step >= REGENERATE_STEPS.length) {
      onChange(pending);
      toast(`Switched to ${pendingName}`);
      setPending(null);
      setStep(null);
      return;
    }
    const timer = window.setTimeout(() => setStep(step + 1), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [step, pending, pendingName, onChange, toast]);

  return (
    <>
      <label className="flex items-center gap-2 text-xs text-muted">
        Framework
        <select
          value={current}
          onChange={(event) => setPending(event.target.value as Framework)}
          className="rounded-md border border-line bg-panel px-2 py-1 font-mono text-[11px] text-ink focus:border-accent focus:outline-none"
        >
          {frameworks.map((framework) => (
            <option key={framework.id} value={framework.id}>
              {framework.name}
            </option>
          ))}
        </select>
      </label>

      {pending && (
        <Modal
          title={`Switch to ${pendingName}?`}
          description={frameworks.find((f) => f.id === pending)?.description}
          width="sm"
          dismissible={step === null}
          onClose={() => setPending(null)}
          footer={
            step === null ? (
              <>
                <Button variant="secondary" onClick={() => setPending(null)} data-autofocus>
                  Keep {frameworks.find((f) => f.id === current)?.name}
                </Button>
                <Button onClick={() => setStep(0)}>Switch framework</Button>
              </>
            ) : undefined
          }
        >
          {step === null ? (
            <p className="text-sm leading-relaxed text-muted">
              Architect will regenerate the code for {agentCount} {agentCount === 1 ? "agent" : "agents"} in{" "}
              <span className="font-mono text-xs text-ink">backend/agents/</span>. Their settings, tools and tests stay the same.
            </p>
          ) : (
            <ol className="space-y-2" aria-live="polite">
              {REGENERATE_STEPS.map((label, index) => (
                <li key={label} className={`flex items-center gap-2 text-sm ${index > step ? "text-muted" : ""}`}>
                  {index < step ? (
                    <Check className="h-4 w-4 text-success" aria-hidden />
                  ) : index === step ? (
                    <LoaderCircle className="h-4 w-4 animate-spin text-accent" aria-hidden />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-line" aria-hidden />
                  )}
                  {label}
                </li>
              ))}
            </ol>
          )}
        </Modal>
      )}
    </>
  );
}
