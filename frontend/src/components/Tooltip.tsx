import { useId, useState, type ReactNode } from "react";

type TooltipProps = {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  align?: "center" | "end";
};

/**
 * Shows a label on hover and on keyboard focus. The wrapper is focusable so that
 * tooltips also work on disabled buttons, which never receive focus themselves.
 */
export default function Tooltip({ label, children, side = "bottom", align = "center" }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  const position = side === "top" ? "bottom-full mb-2" : "top-full mt-2";
  const alignment = align === "end" ? "right-0" : "left-1/2 -translate-x-1/2";

  return (
    <span
      className="relative inline-flex rounded-md"
      tabIndex={0}
      aria-describedby={id}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute z-30 w-max max-w-[240px] rounded-md bg-ink px-2.5 py-1.5 text-xs leading-snug text-panel shadow-lg transition-opacity ${position} ${alignment} ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        {label}
      </span>
    </span>
  );
}
