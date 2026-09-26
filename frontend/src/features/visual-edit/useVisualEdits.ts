import { useEffect, type RefObject } from "react";
import { useLocalState } from "../../lib/localStore";
import { elementAt } from "./elementInfo";
import type { EditChange } from "./interpretEdit";

/** An applied click-to-edit change. It stays applied while its chat message exists (so restores undo it). */
export type VisualEdit = {
  id: string;
  messageId: string;
  path: number[];
  signature: string;
  change: EditChange;
};

export function useVisualEdits(projectId: string) {
  const [edits, setEdits] = useLocalState<VisualEdit[]>(`architect.edits.${projectId}`);
  return { edits: edits ?? [], setEdits };
}

function applyTo(element: HTMLElement, change: EditChange) {
  if (change.hidden) element.style.display = "none";
  if (change.style) Object.assign(element.style, change.style);
  if (change.text !== undefined) {
    // Replace the first bit of text, keeping icons and other elements inside.
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node && !node.textContent?.trim()) node = walker.nextNode();
    // Only write when different: every write is a DOM mutation, which would re-trigger the observer.
    if (node && node.textContent !== change.text) node.textContent = change.text;
    else if (!node) element.append(change.text);
  }
}

/** Re-applies edits to the rendered app, and again whenever the app re-renders that part of the page. */
export function useApplyVisualEdits(rootRef: RefObject<HTMLElement>, edits: VisualEdit[], liveMessageIds: Set<string>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const active = edits.filter((edit) => liveMessageIds.has(edit.messageId));
    if (active.length === 0) return;

    let applying = false;
    const apply = () => {
      applying = true;
      for (const edit of active) {
        const element = elementAt(edit.path, root);
        if (!element) continue;
        const tag = element.tagName;
        // Only touch the element the edit was made on (same tag, and its original or edited text).
        const text = (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
        const matches =
          edit.signature === `${tag}:${text}` || (edit.change.text !== undefined && text.startsWith(edit.change.text.slice(0, 60)));
        if (matches) applyTo(element, edit.change);
      }
      applying = false;
    };

    apply();
    const observer = new MutationObserver(() => {
      if (!applying) apply();
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [rootRef, edits, liveMessageIds]);
}
