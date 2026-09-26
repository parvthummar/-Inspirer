import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Bot } from "lucide-react";

type PageChatProps = {
  purpose: string;
  agent: { name: string; role: string } | undefined;
};

type Line = { from: "person" | "agent"; text: string };

/** A chat with the app's first agent. Replies are canned: this is a preview, not the running app. */
export default function PageChat({ purpose, agent }: PageChatProps) {
  const agentName = agent?.name ?? "Assistant";
  const [lines, setLines] = useState<Line[]>([
    { from: "agent", text: `Hi, I'm the ${agentName}. ${agent?.role ?? purpose}` },
    { from: "person", text: "Can you help me with something today?" },
    { from: "agent", text: "Of course. Tell me what you need and I'll take care of it, or pass it to the right person on the team." },
  ]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ block: "nearest" }), [lines]);

  function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setLines((current) => [...current, { from: "person", text }]);
    setDraft("");
    window.setTimeout(
      () => setLines((current) => [...current, { from: "agent", text: "Thanks! I'm on it and will update you here as soon as it's done." }]),
      700,
    );
  }

  return (
    <div className="flex h-[420px] max-w-2xl flex-col overflow-hidden rounded-lg border border-line bg-panel">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-on-accent">
          <Bot className="h-4 w-4" aria-hidden />
        </span>
        <p className="text-sm font-semibold">{agentName}</p>
        <span className="ml-auto flex items-center gap-1 text-xs text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
          Online
        </span>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
        {lines.map((line, i) => (
          <p
            key={i}
            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${line.from === "agent" ? "bg-surface" : "ml-auto bg-accent text-on-accent"}`}
          >
            {line.text}
          </p>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
        <label className="sr-only" htmlFor="site-chat">
          Message
        </label>
        <input id="site-chat" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message" className="flex-1 rounded-md border border-line bg-panel px-3 py-2 text-sm focus:border-accent focus:outline-none" />
        <button type="submit" aria-label="Send" className="rounded-md bg-accent px-3 text-on-accent">
          <ArrowUp className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
