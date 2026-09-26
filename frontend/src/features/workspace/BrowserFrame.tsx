import type { ReactNode } from "react";
import { ExternalLink, Lock, Monitor, RotateCw, Smartphone, Tablet } from "lucide-react";

export type Device = "desktop" | "tablet" | "mobile";

const devices: { value: Device; label: string; icon: typeof Monitor; width: string }[] = [
  { value: "desktop", label: "Desktop", icon: Monitor, width: "100%" },
  { value: "tablet", label: "Tablet", icon: Tablet, width: "768px" },
  { value: "mobile", label: "Mobile", icon: Smartphone, width: "390px" },
];

type BrowserFrameProps = {
  url: string;
  device: Device;
  onDeviceChange: (device: Device) => void;
  /** Controls that only make sense once there is an app to look at. */
  live: boolean;
  onReload?: () => void;
  children: ReactNode;
};

export default function BrowserFrame({ url, device, onDeviceChange, live, onReload, children }: BrowserFrameProps) {
  const width = devices.find((d) => d.value === device)?.width ?? "100%";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line bg-panel px-3">
        <button
          type="button"
          onClick={onReload}
          disabled={!live}
          aria-label="Reload preview"
          title="Reload preview"
          className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <RotateCw className="h-3.5 w-3.5" aria-hidden />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-surface px-2.5 py-1 font-mono text-xs text-muted">
          <Lock className="h-3 w-3 shrink-0" aria-hidden />
          <span className="truncate">{url}</span>
        </div>
        <div role="radiogroup" aria-label="Preview size" className="flex rounded-md bg-surface p-0.5">
          {devices.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={device === value}
              aria-label={label}
              title={label}
              onClick={() => onDeviceChange(value)}
              className={`rounded p-1 ${device === value ? "bg-panel text-ink shadow-sm" : "text-muted hover:text-ink"}`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!live}
          aria-label="Open in a new tab"
          title={live ? "Open in a new tab" : "Available once your app is built"}
          className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-surface p-4">
        <div
          className="h-full min-h-[420px] overflow-hidden rounded-lg border border-line bg-panel shadow-[0_1px_2px_rgba(22,32,42,0.04),0_8px_24px_rgba(22,32,42,0.06)] transition-[width] duration-300 ease-out"
          style={{ width, maxWidth: "100%" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
