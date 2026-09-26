import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeChoice } from "../lib/theme";

function systemIsDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** One-click switch between light and dark, for the top bars. The full choice (incl. System) is in Settings. */
export default function ThemeToggleButton() {
  const [choice, setChoice] = useThemeChoice();
  const [systemDark, setSystemDark] = useState(systemIsDark);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const dark = choice === "dark" || (choice === "system" && systemDark);
  const label = dark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={() => setChoice(dark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-panel text-muted hover:bg-surface hover:text-ink"
    >
      {dark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  );
}
