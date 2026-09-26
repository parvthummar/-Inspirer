/** Lead score out of 10. High scores use the app accent; the number is always shown, never color alone. */
export default function ScoreBadge({ score }: { score: number }) {
  const tone = score >= 8 ? "bg-accent text-on-accent" : score >= 5 ? "bg-accent/15 text-accent" : "bg-surface text-muted";
  return (
    <span className={`inline-flex h-6 w-8 items-center justify-center rounded-md text-xs font-semibold ${tone}`} title={`Score ${score} of 10`}>
      {score}
    </span>
  );
}
