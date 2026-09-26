import { useState } from "react";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import WelcomeIllustration from "./WelcomeIllustration";

const STEPS = [
  {
    title: "Pick the view that suits you",
    body: "Every project has two views of the same app. Simple view shows just your app and speaks in plain words. Developer view adds the code, logs, diffs and framework choices. Switch with the toggle at the top of any project, whenever you like.",
  },
  {
    title: "Describe your app in plain words",
    body: "Say what it should do and who uses it. No technical terms needed. You can also start from a template or import an app you already have.",
  },
  {
    title: "Check the plan before anything is built",
    body: "Architect replies with a short plan: the agents that do the work, the pages people use and the services it connects to. Approve it, edit it, or ask for changes.",
  },
  {
    title: "Watch it come together",
    body: "Your app appears in the preview as it's built. Click anything in it to change it, or just tell Architect what you'd like different.",
  },
];

type WelcomeDialogProps = {
  firstName: string;
  onFinish: () => void;
};

/** First-run tour: four short steps, then straight into the prompt box. */
export default function WelcomeDialog({ firstName, onFinish }: WelcomeDialogProps) {
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;

  return (
    <Modal
      title={`Welcome to Architect, ${firstName}`}
      description="Here's how building works. It takes about a minute to read."
      width="sm"
      onClose={onFinish}
      footer={
        <>
          <button type="button" onClick={onFinish} className="mr-auto rounded px-1 text-sm text-muted hover:text-ink">
            Skip the tour
          </button>
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button onClick={() => (last ? onFinish() : setStep(step + 1))} data-autofocus>
            {last ? "Start building" : "Next"}
          </Button>
        </>
      }
    >
      <WelcomeIllustration step={step} />
      <p className="mt-4 text-xs font-medium text-accent">
        Step {step + 1} of {STEPS.length}
      </p>
      <h3 className="mt-1 text-base font-semibold">{STEPS[step].title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{STEPS[step].body}</p>
      <div className="mt-4 flex gap-1.5" aria-hidden>
        {STEPS.map((_, index) => (
          <span key={index} className={`h-1.5 rounded-full transition-all ${index === step ? "w-5 bg-accent" : "w-1.5 bg-line"}`} />
        ))}
      </div>
    </Modal>
  );
}
