import { useRef, type KeyboardEvent, type PointerEvent } from "react";

type PanelResizerProps = {
  width: number;
  min: number;
  max: number;
  onChange: (width: number) => void;
  /** Double-clicking the handle calls this, e.g. to go back to the default width. */
  onReset?: () => void;
  /** Dragging below this width (past the minimum) collapses the panel instead of stopping at the minimum. */
  collapseBelow?: number;
  onCollapse?: () => void;
  label?: string;
};

const KEYBOARD_STEP = 24;

/** Drag handle between two side-by-side panels. Also works with the arrow keys; double-click resets. */
export default function PanelResizer({
  width,
  min,
  max,
  onChange,
  onReset,
  collapseBelow,
  onCollapse,
  label = "Resize chat panel",
}: PanelResizerProps) {
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
    const wanted = start.current.width + event.clientX - start.current.x;
    if (onCollapse && collapseBelow !== undefined && wanted < collapseBelow) {
      // Squeezed well past the minimum: hide the panel, keeping the width it had before the drag.
      onChange(clamp(start.current.width));
      handlePointerUp();
      onCollapse();
      return;
    }
    onChange(clamp(wanted));
  }

  function handlePointerUp() {
    start.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // At the minimum, one more step left collapses the panel (when it can collapse).
    if (event.key === "ArrowLeft" && onCollapse && width <= min) onCollapse();
    else if (event.key === "ArrowLeft") onChange(clamp(width - KEYBOARD_STEP));
    if (event.key === "ArrowRight") onChange(clamp(width + KEYBOARD_STEP));
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      title={onReset ? "Drag to resize. Double-click to reset." : "Drag to resize"}
      onDoubleClick={onReset}
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
