import { useEffect, useState } from "react";
import { LoaderCircle, Upload } from "lucide-react";

const STEPS = ["Reading the transcript", "Finding decisions", "Pulling out action items"];

/** Simulated upload: shows the agent working through the transcript, then hands back a new meeting. */
export default function UploadTranscript({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    if (step === null) return;
    if (step >= STEPS.length) {
      onDone();
      setStep(null);
      return;
    }
    const timer = window.setTimeout(() => setStep(step + 1), 900);
    return () => window.clearTimeout(timer);
  }, [step, onDone]);

  if (step !== null && step < STEPS.length) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/5 px-4 py-3 text-sm" role="status">
        <LoaderCircle className="h-4 w-4 animate-spin text-accent" aria-hidden />
        {STEPS[step]}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setStep(0)}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-panel px-4 py-3 text-sm text-muted hover:border-accent/50 hover:text-ink"
    >
      <Upload className="h-4 w-4" aria-hidden />
      Upload a transcript (hiring-sync.txt)
    </button>
  );
}
