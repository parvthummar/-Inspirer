import Pill from "../shared/Pill";
import type { WorkRecord } from "./data";

type RecordsTableProps = {
  records: WorkRecord[];
  compact: boolean;
};

const tone = { Done: "success", "In progress": "accent", "Waiting on you": "danger" } as const;

export default function RecordsTable({ records, compact }: RecordsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-surface/60 text-[11px] text-muted">
          <tr>
            {!compact && <th className="px-3 py-2 font-medium">ID</th>}
            <th className="px-3 py-2 font-medium">Task</th>
            {!compact && <th className="px-3 py-2 font-medium">Handled by</th>}
            <th className="px-3 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {records.map((record) => (
            <tr key={record.id}>
              {!compact && <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-muted">{record.id}</td>}
              <td className="px-3 py-2.5">
                <span className="block">{record.title}</span>
                <span className="block text-[11px] text-muted">{record.updated}</span>
              </td>
              {!compact && <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted">{record.handledBy}</td>}
              <td className="px-3 py-2.5">
                <Pill tone={tone[record.status]}>{record.status}</Pill>
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-6 text-center text-sm text-muted">
                No tasks match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
