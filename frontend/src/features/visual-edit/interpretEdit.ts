/**
 * Turns a plain-language instruction into a change the preview can apply straight away.
 * Returns null when the request needs Architect to think about it (it's then sent through the chat).
 */

export type EditChange = {
  text?: string;
  style?: Record<string, string>;
  hidden?: boolean;
  /** For the chat, e.g. 'changed the text to "Submit"'. */
  summary: string;
};

const COLORS: Record<string, string> = {
  red: "#d0342c",
  green: "#1f8a5b",
  blue: "#3355ff",
  purple: "#6d4cff",
  orange: "#ea580c",
  teal: "#0d9488",
  pink: "#db2777",
  black: "#16202a",
  gray: "#5b6875",
  grey: "#5b6875",
};

export const SUGGESTIONS = ['Change the text to "…"', "Make it green", "Make it bigger", "Make it bold", "Hide it"];

export function interpretEdit(instruction: string, element: HTMLElement): EditChange | null {
  const lower = instruction.toLowerCase().trim();
  const isControl = element.matches('button, [role="switch"], a');

  const quoted = instruction.match(/["“']([^"”']+)["”']/);
  const renamed = instruction.match(/(?:text to|rename (?:it )?to|say|reads?|label(?:led)? as|call it)\s+["“']?(.+?)["”']?\s*$/i);
  const text = quoted?.[1] ?? renamed?.[1];
  if (text && /\w/.test(text) && !text.includes("…")) return { text: text.trim(), summary: `changed the text to "${text.trim()}"` };

  if (/\b(remove|hide|delete|get rid of)\b/.test(lower)) return { hidden: true, summary: "hid it" };

  const color = Object.keys(COLORS).find((name) => new RegExp(`\\b${name}\\b`).test(lower));
  if (color) {
    const style: Record<string, string> = isControl
      ? { backgroundColor: COLORS[color], color: "#ffffff", borderColor: COLORS[color] }
      : { color: COLORS[color] };
    return { style, summary: `made it ${color}` };
  }

  if (/\b(bigger|larger|increase|more prominent)\b/.test(lower)) return { style: { fontSize: "1.15em", padding: isControl ? "0.55em 1.1em" : "" }, summary: "made it bigger" };
  if (/\b(smaller|reduce|less prominent)\b/.test(lower)) return { style: { fontSize: "0.9em" }, summary: "made it smaller" };
  if (/\bbold\b/.test(lower)) return { style: { fontWeight: "700" }, summary: "made it bold" };
  if (/\b(round|rounded)\b/.test(lower)) return { style: { borderRadius: "9999px" }, summary: "rounded the corners" };

  return null;
}
