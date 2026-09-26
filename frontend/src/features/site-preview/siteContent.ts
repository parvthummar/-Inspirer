/**
 * Helpers for the generated website preview: a brand colour per project, a layout per page,
 * and believable example content built from the page's own name.
 */

const BRAND_COLOURS = ["51 85 255", "109 76 255", "13 148 136", "234 88 12", "219 39 119", "2 132 199", "22 163 74"];

export function hash(text: string): number {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

/** A stable brand colour for the app, as "r g b" channels for the accent token. */
export function brandColour(appName: string): string {
  return BRAND_COLOURS[hash(appName) % BRAND_COLOURS.length];
}

export type PageLayout = "dashboard" | "list" | "form" | "chat" | "calendar" | "auth" | "content";

const LAYOUT_WORDS: [PageLayout, RegExp][] = [
  ["auth", /\b(log ?in|sign ?in|sign ?up|register|reset password|new account)\b/i],
  ["chat", /\b(chat|assistant|support|conversation|ask|help ?desk|inbox)\b/i],
  ["calendar", /\b(calendar|schedule|booking|appointment|availability|roster)\b/i],
  ["form", /\b(settings?|profile|preferences|account|configuration|new|create|submit|request form|upload)\b/i],
  ["dashboard", /\b(dashboard|overview|home|analytics|reports?|insights|summary|stats)\b/i],
  ["list", /\b(list|log|history|records?|requests?|leads?|items?|tasks?|orders?|tickets?|messages?|contacts?|customers?|users?|documents?|files?|notes?|drafts?|invoices?|approvals?|queue|pipeline|products?|team|members?|projects?|admin)\b/i],
];

/** Picks a layout that suits the page, from its name first and then its purpose. */
export function layoutFor(name: string, purpose: string): PageLayout {
  for (const text of [name, purpose]) {
    const found = LAYOUT_WORDS.find(([, pattern]) => pattern.test(text));
    if (found) return found[0];
  }
  return "content";
}

export const PEOPLE = ["Priya Shah", "Marcus Lee", "Sofia Lindqvist", "Kwame Mensah", "Hannah Okafor", "Tom Fischer", "Aisha Bello", "Diego Ramírez"];
export const COMPANIES = ["Acme Corp", "Brightline", "Northwind", "Mintleaf", "Harbor & Co", "Clearwater", "Petal & Stem", "Summit Labs"];

/** "Call log" -> "Call", "Leads" -> "Lead", used to name example rows. */
export function singular(pageName: string): string {
  const word = pageName.replace(/\b(log|list|history|page|view|overview|queue)\b/gi, "").trim().split(/\s+/)[0] || pageName;
  const base = word.replace(/ies$/i, "y").replace(/(s)$/i, (s) => (/ss$/i.test(word) ? s : ""));
  return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** The first sentence of the plan summary, used as the headline's supporting line. */
export function firstSentence(text: string): string {
  const match = text.match(/^.*?[.!?](\s|$)/);
  return (match ? match[0] : text).trim();
}
