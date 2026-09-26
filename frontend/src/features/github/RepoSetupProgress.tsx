import { useEffect, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import type { RepoChoice } from "./ChooseRepoStep";

type RepoSetupProgressProps = {
  choice: RepoChoice;
  fileCount: number;
  onDone: () => void;
};

const STEP_MS = [900, 1500, 800];

export default function RepoSetupProgress({ choice, fileCount, onDone }: RepoSetupProgressProps) {
  const [step, setStep] = useState(0);
  const full = `${choice.owner}/${choice.name}`;
  const steps = [
    choice.mode === "created" ? `Creating ${full}` : `Opening ${full}`,
    fileCount ? `Pushing ${fileCount} files` : "Adding the README and project plan",
    "Turning on automatic sync",
  ];

  useEffect(() => {
    if (step >= steps.length) {
      onDone();
      return;
    }
    const timer = window.setTimeout(() => setStep(step + 1), STEP_MS[step]);
    return () => window.clearTimeout(timer);
  }, [step, steps.length, onDone]);

  return (
    <ol className="space-y-3 py-2" aria-live="polite">
      {steps.map((label, index) => (
        <li key={label} className={`flex items-center gap-3 text-sm ${index > step ? "text-muted" : ""}`}>
          {index < step ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10 text-success">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
            </span>
          ) : index === step ? (
            <LoaderCircle className="h-5 w-5 animate-spin text-accent" aria-hidden />
          ) : (
            <span className="h-5 w-5 rounded-full border border-line" aria-hidden />
          )}
          <span className={index === step ? "font-medium" : ""}>{label}</span>
        </li>
      ))}
    </ol>
  );
}
