import type { ReactNode } from "react";

type SettingsFieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

/** A labelled group of controls; the legend names whatever is inside for screen readers. */
export default function SettingsField({ label, hint, children }: SettingsFieldProps) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-semibold">{label}</legend>
      {children}
      {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
    </fieldset>
  );
}
