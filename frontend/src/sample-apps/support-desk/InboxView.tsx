import { useState } from "react";
import { ArrowLeft, Bot, BookOpen } from "lucide-react";
import Pill from "../shared/Pill";
import type { Conversation } from "./data";

type InboxViewProps = {
  conversations: Conversation[];
  onTakeOver: (id: string) => void;
  compact: boolean;
};

const statusTone = { "Resolved by agent": "success", "Needs a person": "danger", "With you": "accent" } as const;

export default function InboxView({ conversations, onTakeOver, compact }: InboxViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(compact ? null : conversations[0].id);
  const selected = conversations.find((conversation) => conversation.id === selectedId);

  const list = (
    <ul className="divide-y divide-line">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <button
            type="button"
            onClick={() => setSelectedId(conversation.id)}
            className={`w-full px-3 py-3 text-left ${conversation.id === selectedId ? "bg-accent/5" : "hover:bg-surface"}`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{conversation.customer}</span>
              <span className="shrink-0 text-[11px] text-muted">{conversation.time}</span>
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted">{conversation.topic}</span>
            <span className="mt-1.5 block">
              <Pill tone={statusTone[conversation.status]}>{conversation.status}</Pill>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );

  const thread = selected && (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        {compact && (
          <button type="button" onClick={() => setSelectedId(null)} aria-label="Back to inbox" className="rounded p-1 text-muted">
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{selected.topic}</p>
          <p className="text-xs text-muted">{selected.customer}</p>
        </div>
        {selected.status === "Needs a person" && (
          <button
            type="button"
            onClick={() => onTakeOver(selected.id)}
            className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-on-accent"
          >
            Take over
          </button>
        )}
      </div>
      <ol className="flex-1 space-y-3 overflow-y-auto p-4">
        {selected.lines.map((line, index) => (
          <li key={index} className={`flex ${line.from === "customer" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${line.from === "customer" ? "bg-surface" : "bg-accent/10"}`}>
              {line.from !== "customer" && (
                <p className="mb-0.5 flex items-center gap-1 text-[11px] font-medium text-accent">
                  <Bot className="h-3 w-3" aria-hidden />
                  {line.from === "agent" ? "Support agent" : "You"}
                </p>
              )}
              {line.text}
              {line.source && (
                <p className="mt-1 flex items-center gap-1 text-[10px] text-muted">
                  <BookOpen className="h-3 w-3" aria-hidden />
                  Answered using: {line.source}
                </p>
              )}
            </div>
          </li>
        ))}
        {selected.status === "With you" && (
          <li className="text-center text-[11px] text-muted">You took over this conversation. The agent has stepped back.</li>
        )}
      </ol>
    </div>
  );

  if (compact) {
    return <div className="overflow-hidden rounded-lg border border-line bg-panel">{selected ? thread : list}</div>;
  }

  return (
    <div className="grid h-full min-h-[420px] grid-cols-[minmax(0,2fr)_minmax(0,3fr)] overflow-hidden rounded-lg border border-line bg-panel">
      <div className="overflow-y-auto border-r border-line">{list}</div>
      <div className="min-w-0">{thread}</div>
    </div>
  );
}
