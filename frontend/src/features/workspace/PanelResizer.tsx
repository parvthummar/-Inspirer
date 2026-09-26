import { useRef, type KeyboardEvent, type PointerEvent } from "react";

type PanelResizerProps = {
  width: number;
  min: number;
  max: number;
  onChange: (width: number) => void;
};

const KEYBOARD_STEP = 24;

/** Drag handle between the chat and preview panels. Also works with the arrow keys. */
export default function PanelResizer({ width, min, max, onChange }: PanelResizerProps) {
  const start = useRef<{ x: number; width: number } | null>(null);
  const clamp = (value: number) => Math.min(max, Math.max(min, value));

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    start.current = { x: event.clientX, width };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!start.current) return;
    onChange(clamp(start.current.width + event.clientX - start.current.x));
  }

  function handlePointerUp() {
    start.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") onChange(clamp(width - KEYBOARD_STEP));
    if (event.key === "ArrowRight") onChange(clamp(width + KEYBOARD_STEP));
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize chat panel"
      aria-valuenow={width}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      className="group relative w-px shrink-0 cursor-col-resize bg-line focus-visible:ring-offset-0"
    >
      {/* Wider invisible hit area, with a visible accent line while hovering or dragging. */}
      <span className="absolute inset-y-0 -left-1.5 -right-1.5" aria-hidden />
      <span className="absolute inset-y-0 -left-px w-[3px] bg-accent opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100" aria-hidden />
    </div>
  );
}
