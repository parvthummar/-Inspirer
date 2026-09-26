type CreditsBarProps = {
  used: number;
  total: number;
  className?: string;
};

/** Credits used this month. Turns red from 80%, so running low never comes as a surprise. */
export default function CreditsBar({ used, total, className = "" }: CreditsBarProps) {
  const fraction = Math.min(1, used / total);
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={used}
      aria-label="Credits used this month"
      className={`h-1.5 overflow-hidden rounded-full bg-line ${className}`}
    >
      <div className={`h-full rounded-full ${fraction >= 0.8 ? "bg-danger" : "bg-accent"}`} style={{ width: `${Math.max(fraction * 100, used ? 2 : 0)}%` }} />
    </div>
  );
}
