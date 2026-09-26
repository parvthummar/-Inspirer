import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRequestPlan } from "../../api/plans";
import Alert from "../../components/Alert";
import Button from "../../components/Button";

type PlanChangeRequestProps = {
  projectId: string;
  onCancel: () => void;
};

const suggestions = ["Add a page for admins", "Make it simpler", "Also send updates to Slack"];

/** "Ask for changes": the user describes what to change and Architect revises the plan. */
export default function PlanChangeRequest({ projectId, onCancel }: PlanChangeRequestProps) {
  const [feedback, setFeedback] = useState("");
  const requestPlan = useRequestPlan(projectId);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const trimmed = feedback.trim();
    if (trimmed) requestPlan.mutate(trimmed);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) submit();
    if (event.key === "Escape") onCancel();
  }

  return (
    <form onSubmit={submit} className="border-t border-line bg-surface/60 px-4 py-3">
      <label htmlFor="plan-feedback" className="text-xs font-semibold">
        What should change?
      </label>
      <textarea
        id="plan-feedback"
        autoFocus
        rows={3}
        maxLength={2000}
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="For example: managers should also be able to approve from Slack"
        className="mt-1.5 w-full resize-none rounded-md border border-line bg-panel px-2.5 py-2 text-sm leading-relaxed placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
      <div className="mt-1 flex flex-wrap gap-1.5">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setFeedback(suggestion)}
            className="rounded-full border border-line bg-panel px-2 py-0.5 text-[11px] text-muted hover:border-accent/50 hover:text-ink"
          >
            {suggestion}
          </button>
        ))}
      </div>
      {requestPlan.isError && (
        <div className="mt-2">
          <Alert>{requestPlan.error.message}</Alert>
        </div>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={requestPlan.isPending} className="px-3 py-1.5">
          Cancel
        </Button>
        <Button type="submit" disabled={!feedback.trim()} loading={requestPlan.isPending} className="px-3 py-1.5">
          {requestPlan.isPending ? "Sending changes" : "Send changes"}
        </Button>
      </div>
    </form>
  );
}
