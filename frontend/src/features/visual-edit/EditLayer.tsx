import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMessages, useSaveVisualEdit, useSendMessage } from "../../api/messages";
import type { Project } from "../../api/projects";
import { useToast } from "../../components/toast-context";
import EditPopover, { POPOVER_WIDTH } from "./EditPopover";
import { describeElement, editableTarget, elementPath, elementSignature, fileFor, pageNameFor } from "./elementInfo";
import { interpretEdit } from "./interpretEdit";
import { useApplyVisualEdits, useVisualEdits } from "./useVisualEdits";

type EditLayerProps = {
  project: Project;
  editing: boolean;
  children: ReactNode;
};

type Box = { top: number; left: number; width: number; height: number };
type Selection = { element: HTMLElement; label: string; file: string };

function boxOf(element: HTMLElement, container: HTMLElement): Box {
  const rect = element.getBoundingClientRect();
  const outer = container.getBoundingClientRect();
  return { top: rect.top - outer.top, left: rect.left - outer.left, width: rect.width, height: rect.height };
}

/**
 * Wraps the running app. In edit mode, hovering outlines elements and clicking one asks what should change.
 * Simple changes are applied straight away; anything else goes to Architect in the chat.
 */
export default function EditLayer({ project, editing, children }: EditLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<{ box: Box; label: string } | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [error, setError] = useState<string>();

  const messages = useMessages(project.id);
  const saveEdit = useSaveVisualEdit(project.id);
  const sendMessage = useSendMessage(project.id);
  const { edits, setEdits } = useVisualEdits(project.id);
  const toast = useToast();
  const liveMessageIds = useMemo(() => new Set((messages.data ?? []).map((m) => m.id)), [messages.data]);

  useApplyVisualEdits(appRef, edits, liveMessageIds);

  // Leaving edit mode clears the selection.
  useEffect(() => {
    if (!editing) {
      setHovered(null);
      setSelection(null);
    }
  }, [editing]);

  // While editing, clicks pick an element instead of using the app.
  useEffect(() => {
    const container = containerRef.current;
    const app = appRef.current;
    if (!editing || !container || !app) return;

    const isEditUi = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest("[data-edit-ui]"));

    function handleMove(event: MouseEvent) {
      if (isEditUi(event.target) || !(event.target instanceof Element) || !app) return;
      const element = editableTarget(event.target, app);
      setHovered(element && container ? { box: boxOf(element, container), label: describeElement(element) } : null);
    }
    function handleClick(event: MouseEvent) {
      if (isEditUi(event.target) || !(event.target instanceof Element) || !app) return;
      event.preventDefault();
      event.stopPropagation();
      const element = editableTarget(event.target, app);
      if (!element) return;
      setError(undefined);
      setSelection({ element, label: describeElement(element), file: fileFor(element, app) });
    }
    function block(event: Event) {
      if (!isEditUi(event.target)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    function handleLeave() {
      setHovered(null);
    }
    function handleScroll() {
      setHovered(null);
      setSelection((current) => current && { ...current });
    }

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", handleLeave);
    container.addEventListener("click", handleClick, true);
    container.addEventListener("submit", block, true);
    container.addEventListener("change", block, true);
    container.addEventListener("scroll", handleScroll, true);
    return () => {
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseleave", handleLeave);
      container.removeEventListener("click", handleClick, true);
      container.removeEventListener("submit", block, true);
      container.removeEventListener("change", block, true);
      container.removeEventListener("scroll", handleScroll, true);
    };
  }, [editing]);

  // Keep the selection outline on the element as the layout changes.
  useEffect(() => {
    const container = containerRef.current;
    setSelectedBox(selection && container ? boxOf(selection.element, container) : null);
  }, [selection]);

  function apply(instruction: string) {
    if (!selection || !appRef.current) return;
    const { element, label, file } = selection;
    const change = interpretEdit(instruction, element);

    if (!change) {
      // Needs Architect's judgement: ask in the chat, with the element as context.
      sendMessage.mutate(`${instruction} (on ${label} in the preview)`);
      toast("Sent to Architect in the chat");
      setSelection(null);
      return;
    }

    const path = elementPath(element, appRef.current);
    const signature = elementSignature(element);
    // Simple view talks about pages; Developer view names the file.
    const developer = project.view_mode === "developer";
    const where = developer ? file : `the ${pageNameFor(appRef.current)} page`;
    const target = label.charAt(0).toLowerCase() + label.slice(1);
    saveEdit.mutate(
      { element: label, instruction, change: `I ${change.summary} for the ${target} ${developer ? "in" : "on"} ${where}.`, file: where },
      {
        onSuccess: (saved) => {
          const reply = saved[saved.length - 1];
          setEdits([...edits, { id: `e${Date.now()}`, messageId: reply.id, path, signature, change }]);
          toast("Change applied");
          setSelection(null);
        },
        onError: (failure) => setError(failure.message),
      },
    );
  }

  const container = containerRef.current;
  const popoverPosition = selectedBox && container
    ? {
        top:
          selectedBox.top + selectedBox.height + 8 + 230 > container.clientHeight
            ? Math.max(8, selectedBox.top - 230 - 8)
            : selectedBox.top + selectedBox.height + 8,
        left: Math.min(Math.max(8, selectedBox.left), container.clientWidth - POPOVER_WIDTH - 8),
      }
    : null;

  return (
    <div ref={containerRef} className={`relative h-full ${editing ? "cursor-crosshair" : ""}`}>
      <div ref={appRef} className="h-full">
        {children}
      </div>

      {editing && hovered && !selection && (
        <div
          className="pointer-events-none absolute z-20 rounded-sm outline outline-2 outline-accent"
          style={{ top: hovered.box.top, left: hovered.box.left, width: hovered.box.width, height: hovered.box.height }}
          aria-hidden
        >
          <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-panel">
            {hovered.label}
          </span>
        </div>
      )}

      {editing && selection && selectedBox && (
        <div
          className="pointer-events-none absolute z-20 rounded-sm bg-accent/10 outline outline-2 outline-accent"
          style={{ top: selectedBox.top, left: selectedBox.left, width: selectedBox.width, height: selectedBox.height }}
          aria-hidden
        />
      )}

      {editing && selection && popoverPosition && (
        <EditPopover
          key={selection.label}
          label={selection.label}
          file={selection.file}
          developer={project.view_mode === "developer"}
          position={popoverPosition}
          busy={saveEdit.isPending}
          error={error}
          onApply={apply}
          onCancel={() => setSelection(null)}
        />
      )}
    </div>
  );
}
