import { useState, type FormEvent } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import Button from "../../components/Button";
import { formatRelativeTime } from "../../lib/time";
import type { PreviewComment } from "./commentStore";

type CommentThreadProps = {
  /** Undefined while writing a new comment. */
  comment?: PreviewComment;
  number?: number;
  position: { top: number; left: number };
  onSubmit: (text: string) => void;
  onToggleResolved?: () => void;
  onClose: () => void;
};

export const THREAD_WIDTH = 280;

export default function CommentThread({ comment, number, position, onSubmit, onToggleResolved, onClose }: CommentThreadProps) {
  const [draft, setDraft] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    onSubmit(draft.trim());
    setDraft("");
  }

  return (
    <div
      data-comment-ui
      style={{ top: position.top, left: position.left, width: THREAD_WIDTH }}
      className="absolute z-30 rounded-xl border border-line bg-panel shadow-[0_12px_32px_rgba(22,32,42,0.22)]"
      role="dialog"
      aria-label={comment ? `Comment ${number}` : "New comment"}
    >
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <p className="text-xs font-semibold">{comment ? `Comment ${number}` : "New comment"}</p>
        <div className="flex items-center gap-1">
          {comment && onToggleResolved && (
            <button
              type="button"
              onClick={onToggleResolved}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted hover:bg-surface hover:text-ink"
            >
              {comment.resolved ? <RotateCcw className="h-3 w-3" aria-hidden /> : <Check className="h-3 w-3" aria-hidden />}
              {comment.resolved ? "Reopen" : "Resolve"}
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-0.5 text-muted hover:text-ink">
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>

      {comment && (
        <ol className="max-h-56 space-y-3 overflow-y-auto px-3 py-2.5">
          {[{ id: comment.id, author: comment.author, text: comment.text, at: comment.at }, ...comment.replies].map((entry) => (
            <li key={entry.id}>
              <p className="text-[11px]">
                <span className="font-semibold">{entry.author}</span>
                <span className="text-muted"> · {formatRelativeTime(entry.at).toLowerCase()}</span>
              </p>
              <p className="mt-0.5 text-sm leading-relaxed">{entry.text}</p>
            </li>
          ))}
        </ol>
      )}

      {!comment?.resolved && (
        <form onSubmit={submit} className="border-t border-line p-2.5 first:border-t-0">
          <label htmlFor="comment-input" className="sr-only">
            {comment ? "Reply" : "Comment"}
          </label>
          <textarea
            id="comment-input"
            autoFocus
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) submit(event);
              if (event.key === "Escape") onClose();
            }}
            placeholder={comment ? "Reply" : "Leave a comment for your team"}
            className="w-full resize-none rounded-md border border-line px-2.5 py-1.5 text-sm placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <div className="mt-1.5 flex justify-end">
            <Button type="submit" disabled={!draft.trim()} className="px-2.5 py-1 text-xs">
              {comment ? "Reply" : "Post comment"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
