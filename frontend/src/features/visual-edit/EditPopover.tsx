import { useState, type FormEvent, type KeyboardEvent } from "react";
import { MousePointerClick, X } from "lucide-react";
import Button from "../../components/Button";
import { SUGGESTIONS } from "./interpretEdit";

type EditPopoverProps = {
  label: string;
  file: string;
  developer: boolean;
  position: { top: number; left: number };
  busy: boolean;
  error?: string;
  onApply: (instruction: string) => void;
  onCancel: () => void;
};

export const POPOVER_WIDTH = 300;

/** Asks what should change about the clicked element. */
export default function EditPopover({ label, file, developer, position, busy, error, onApply, onCancel }: EditPopoverProps) {
  const [instruction, setInstruction] = useState("");

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (instruction.trim() && !busy) onApply(instruction.trim());
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) submit(event);
    if (event.key === "Escape") onCancel();
  }

  function pickSuggestion(suggestion: string) {
    // Put the cursor inside the quotes for "Change the text to", otherwise apply straight away.
    if (suggestion.includes("…")) setInstruction('Change the text to ""');
    else onApply(suggestion);
  }

  return (
    <form
      onSubmit={submit}
      data-edit-ui
      style={{ top: position.top, left: position.left, width: POPOVER_WIDTH }}
      className="absolute z-30 rounded-xl border border-line bg-panel p-3 shadow-[0_12px_32px_rgba(22,32,42,0.22)]"
    >
      <div className="flex items-start gap-2">
        <MousePointerClick className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold">{label}</p>
          {developer && <p className="truncate font-mono text-[10px] text-muted">{file}</p>}
        </div>
        <button type="button" onClick={onCancel} aria-label="Cancel edit" className="rounded p-0.5 text-muted hover:text-ink">
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      <label htmlFor="edit-instruction" className="sr-only">
        What should change?
      </label>
      <textarea
        id="edit-instruction"
        autoFocus
        rows={2}
        value={instruction}
        onChange={(event) => setInstruction(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What should change?"
        className="mt-2 w-full resize-none rounded-md border border-line px-2.5 py-1.5 text-sm placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
      <div className="mt-1.5 flex flex-wrap gap-1">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => pickSuggestion(suggestion)}
            disabled={busy}
            className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted hover:border-accent/50 hover:text-ink"
          >
            {suggestion}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <div className="mt-2.5 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy} className="px-2.5 py-1 text-xs">
          Cancel
        </Button>
        <Button type="submit" disabled={!instruction.trim()} loading={busy} className="px-2.5 py-1 text-xs">
          {busy ? "Applying" : "Apply change"}
        </Button>
      </div>
    </form>
  );
}
