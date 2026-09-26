import type { ReactNode } from "react";

export type PillTone = "neutral" | "accent" | "success" | "danger";

const tones: Record<PillTone, string> = {
  neutral: "bg-surface text-muted",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
};

export default function Pill({ tone = "neutral", children }: { tone?: PillTone; children: ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
