const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const shortDate = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });
const shortDateWithYear = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" });

/** "Just now", "5 minutes ago", "Yesterday", "12 Mar". */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const elapsed = now.getTime() - date.getTime();

  if (elapsed < MINUTE) return "Just now";
  if (elapsed < HOUR) return relative.format(-Math.floor(elapsed / MINUTE), "minute");
  if (elapsed < DAY) return relative.format(-Math.floor(elapsed / HOUR), "hour");

  const days = Math.floor(elapsed / DAY);
  if (days < 7) {
    const text = relative.format(-days, "day");
    return text[0].toUpperCase() + text.slice(1);
  }
  return date.getFullYear() === now.getFullYear() ? shortDate.format(date) : shortDateWithYear.format(date);
}
