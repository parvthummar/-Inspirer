type StatCardProps = {
  label: string;
  value: string;
  note?: string;
};

export default function StatCard({ label, value, note }: StatCardProps) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {note && <p className="mt-0.5 text-[11px] text-muted">{note}</p>}
    </div>
  );
}
