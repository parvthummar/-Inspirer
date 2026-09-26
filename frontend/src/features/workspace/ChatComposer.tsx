import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

type ChatComposerProps = {
  onSend: (content: string) => void;
  sending: boolean;
  placeholder: string;
  /** Explains why the composer can't be used right now. */
  disabledReason?: string;
};

const MAX_LENGTH = 4000;

export default function ChatComposer({ onSend, sending, placeholder, disabledReason }: ChatComposerProps) {
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [draft]);

  const canSend = draft.trim().length > 0 && !sending && !disabledReason;

  function send(event?: FormEvent) {
    event?.preventDefault();
    if (!canSend) return;
    onSend(draft.trim());
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift + Enter adds a new line.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  }

  return (
    <form onSubmit={send} className="border-t border-line bg-surface p-3">
      <div className="flex items-end gap-2 rounded-xl border border-muted/40 bg-panel px-3 py-2.5 shadow-[0_1px_3px_rgba(22,32,42,0.08)] transition-[border-color,box-shadow] hover:border-muted/60 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/35">
        <label htmlFor="chat-input" className="sr-only">
          Message Architect
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          rows={1}
          value={draft}
          maxLength={MAX_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabledReason ?? placeholder}
          disabled={Boolean(disabledReason)}
          className="max-h-[200px] flex-1 resize-none bg-transparent py-1 text-sm leading-relaxed placeholder:text-muted focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-on-accent transition-colors hover:bg-accent/90 disabled:bg-line disabled:text-muted"
        >
          <ArrowUp className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}
