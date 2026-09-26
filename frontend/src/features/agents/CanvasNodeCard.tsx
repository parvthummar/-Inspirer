import { Bot, Link2, UserRound, Wrench, Zap } from "lucide-react";
import { NODE_H, NODE_W, type CanvasNode } from "./canvasLayout";

type CanvasNodeCardProps = {
  node: CanvasNode;
  sublabel?: string;
  selected: boolean;
  dimmed: boolean;
  mono: boolean;
  onSelect?: () => void;
  onHover: (agentId: string | null) => void;
};

const icons = { trigger: Zap, agent: Bot, tool: Wrench, integration: Link2, handoff: UserRound };

const styles = {
  trigger: "border-ink bg-ink text-panel",
  agent: "border-accent/50 bg-panel shadow-[0_2px_8px_rgba(51,85,255,0.12)]",
  tool: "border-line bg-panel",
  integration: "border-dashed border-line bg-panel",
  handoff: "border-dashed border-line bg-surface",
};

export default function CanvasNodeCard({ node, sublabel, selected, dimmed, mono, onSelect, onHover }: CanvasNodeCardProps) {
  const Icon = icons[node.kind];
  const content = (
    <>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
          node.kind === "agent" ? "bg-accent text-panel" : node.kind === "trigger" ? "bg-panel/15" : "bg-surface text-muted"
        }`}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span className="min-w-0 text-left">
        <span className={`block truncate text-xs font-medium ${mono && node.kind === "tool" ? "font-mono text-[11px]" : ""}`}>
          {node.label}
        </span>
        {sublabel && (
          <span className={`block truncate text-[10px] ${node.kind === "trigger" ? "text-panel/60" : "text-muted"}`}>{sublabel}</span>
        )}
      </span>
    </>
  );

  const className = `absolute flex items-center gap-2 rounded-lg border px-2.5 transition-[opacity,box-shadow] ${styles[node.kind]} ${
    selected ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""
  } ${dimmed ? "opacity-35" : ""}`;
  const position = { left: node.x, top: node.y, width: NODE_W, height: NODE_H };

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={() => onHover(node.agentId ?? null)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(node.agentId ?? null)}
        onBlur={() => onHover(null)}
        aria-pressed={selected}
        className={`${className} hover:shadow-md`}
        style={position}
      >
        {content}
      </button>
    );
  }
  return (
    <div className={className} style={position}>
      {content}
    </div>
  );
}
