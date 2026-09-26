import ArchitectAvatar from "./ArchitectAvatar";

/** Shown in the chat while Architect is writing a reply. */
export default function ThinkingIndicator({ label }: { label: string }) {
  return (
    <li className="flex gap-3" role="status">
      <ArchitectAvatar />
      <div className="flex items-center gap-2 pt-1 text-sm text-muted">
        <span className="flex gap-1" aria-hidden>
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" />
        </span>
        {label}
      </div>
    </li>
  );
}
