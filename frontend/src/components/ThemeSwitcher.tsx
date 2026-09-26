import { Monitor, Moon, Sun } from "lucide-react";
import { useThemeChoice, type ThemeChoice } from "../lib/theme";

const OPTIONS: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/** Light, dark, or follow the operating system. `size="sm"` fits in menus. */
export default function ThemeSwitcher({ size = "md" }: { size?: "sm" | "md" }) {
  const [choice, setChoice] = useThemeChoice();
  const small = size === "sm";

  return (
    <div role="radiogroup" aria-label="Theme" className="flex rounded-lg bg-surface p-0.5">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={choice === value}
          onClick={() => setChoice(value)}
          title={small ? label : undefined}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md font-medium transition-colors ${
            small ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-sm"
          } ${choice === value ? "bg-panel text-ink shadow-sm" : "text-muted hover:text-ink"}`}
        >
          <Icon className={small ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
