/** Finding, naming and re-finding elements the user clicks in the preview. */

const MEANINGFUL = 'button, a, input, select, textarea, label, [role="switch"], h1, h2, h3, h4, p, li, td, th, img';

/** The element worth editing under the pointer: a whole button rather than the icon inside it. */
export function editableTarget(target: Element, root: Element): HTMLElement | null {
  const control = target.closest('button, a, [role="switch"], input, select, textarea');
  const picked = control ?? target.closest(MEANINGFUL) ?? target;
  if (!(picked instanceof HTMLElement) || picked === root || !root.contains(picked)) return null;
  return picked;
}

function ownText(element: Element): string {
  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
}

const KIND: [string, string][] = [
  ["button", "Button"],
  ["a", "Link"],
  ["input", "Field"],
  ["select", "Menu"],
  ["textarea", "Text box"],
  ["h1", "Heading"],
  ["h2", "Heading"],
  ["h3", "Heading"],
  ["h4", "Heading"],
  ["img", "Image"],
  ["li", "List item"],
  ["td", "Table cell"],
  ["th", "Column header"],
  ["label", "Label"],
];

/** A human-readable name, e.g. Button "Send request". */
export function describeElement(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  const kind = element.getAttribute("role") === "switch" ? "Switch" : (KIND.find(([t]) => t === tag)?.[1] ?? "Text");
  const text = ownText(element) || element.getAttribute("aria-label") || element.getAttribute("placeholder") || "";
  const short = text.length > 32 ? `${text.slice(0, 30)}…` : text;
  return short ? `${kind} "${short}"` : kind;
}

/** Position of the element inside the app, as child indexes from the root. */
export function elementPath(element: Element, root: Element): number[] {
  const path: number[] = [];
  let node: Element | null = element;
  while (node && node !== root) {
    const parent: Element | null = node.parentElement;
    if (!parent) break;
    path.unshift(Array.prototype.indexOf.call(parent.children, node));
    node = parent;
  }
  return path;
}

export function elementAt(path: number[], root: Element): HTMLElement | null {
  let node: Element | undefined = root;
  for (const index of path) {
    node = node?.children[index];
    if (!node) return null;
  }
  return node instanceof HTMLElement ? node : null;
}

/** Identifies an element well enough to avoid applying an edit to a different one after navigation. */
export function elementSignature(element: HTMLElement): string {
  return `${element.tagName}:${ownText(element).slice(0, 60)}`;
}

/** The name of the page currently shown in the app, from its heading. */
export function pageNameFor(root: Element): string {
  return root.querySelector("main h1")?.textContent?.trim() || "home";
}

/** The file the element most likely lives in, from the page heading, e.g. frontend/src/pages/Approvals.tsx. */
export function fileFor(element: HTMLElement, root: Element): string {
  const component = pageNameFor(root)
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("");
  return element.closest("aside, nav") ? "frontend/src/components/SampleShell.tsx" : `frontend/src/pages/${component || "App"}.tsx`;
}
