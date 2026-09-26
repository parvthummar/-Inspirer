import { useState } from "react";

export type BarDatum = { label: string; value: number };

type MiniBarChartProps = {
  title: string;
  data: BarDatum[];
  formatValue?: (value: number) => string;
  height?: number;
};

/**
 * Single-series bar chart: one hue (the app accent), no legend (the title names the series),
 * 4px rounded tops anchored to the baseline, 2px gaps, hover tooltip per bar and a table for screen readers.
 */
export default function MiniBarChart({ title, data, formatValue = String, height = 120 }: MiniBarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <figure className="relative rounded-lg border border-line bg-panel p-4">
      <figcaption className="text-xs font-semibold">{title}</figcaption>
      <div className="relative mt-3 flex items-end gap-[2px] border-b border-line" style={{ height }} aria-hidden>
        {data.map((d, index) => (
          <div
            key={d.label}
            className="relative flex h-full flex-1 items-end"
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className={`w-full rounded-t transition-opacity ${hovered === null || hovered === index ? "bg-accent" : "bg-accent opacity-40"}`}
              style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
            />
            {hovered === index && (
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[11px] text-panel shadow">
                {d.label}: <span className="font-semibold">{formatValue(d.value)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-[2px]" aria-hidden>
        {data.map((d) => (
          <span key={d.label} className="flex-1 truncate text-center text-[10px] text-muted">
            {d.label}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{formatValue(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
