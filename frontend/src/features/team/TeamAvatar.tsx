import { initials } from "./teamStore";

/** A person's initials; dashed while their invite is still pending. */
export default function TeamAvatar({ name, muted = false }: { name: string; muted?: boolean }) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
        muted ? "border border-dashed border-line text-muted" : "bg-ink text-panel"
      }`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
