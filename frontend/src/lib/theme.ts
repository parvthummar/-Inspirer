import { useEffect } from "react";
import { useLocalState } from "./localStore";

export type ThemeChoice = "light" | "dark" | "system";

/** Same key the inline script in index.html reads, so the page never flashes the wrong theme. */
export const THEME_KEY = "architect.theme";

const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

function apply(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "system" && darkQuery().matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

/** Dark until the person picks something else. Must match the default in index.html. */
export const DEFAULT_THEME: ThemeChoice = "dark";

export function useThemeChoice(): [ThemeChoice, (choice: ThemeChoice) => void] {
  const [stored, setStored] = useLocalState<ThemeChoice>(THEME_KEY);
  return [stored ?? DEFAULT_THEME, setStored];
}

/** Keeps <html data-theme> in step with the user's choice, and with the OS when they choose "System". */
export function useApplyTheme() {
  const [choice] = useThemeChoice();
  useEffect(() => {
    apply(choice);
    if (choice !== "system") return;
    const query = darkQuery();
    const follow = () => apply("system");
    query.addEventListener("change", follow);
    return () => query.removeEventListener("change", follow);
  }, [choice]);
}
