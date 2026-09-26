import { useMemo, useState } from "react";
import { slug } from "../../mocks/generatedFiles";
import type { AgentConfig } from "./agentStore";
import { layoutCanvas, NODE_H, NODE_W } from "./canvasLayout";
import CanvasNodeCard from "./CanvasNodeCard";

type AgentCanvasProps = {
  agents: AgentConfig[];
  integrations: string[];
  selectedId: string | null;
  onSelect: (agentId: string) => void;
  developer: boolean;
};

/** A read-at-a-glance map of how the app's agents work: what starts them, what they use, where work goes. */
export default function AgentCanvas({ agents, integrations, selectedId, onSelect, developer }: AgentCanvasProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const layout = useMemo(() => layoutCanvas(agents, integrations), [agents, integrations]);
  const byId = useMemo(() => new Map(layout.nodes.map((node) => [node.id, node])), [layout]);
  const focus = hovered ?? selectedId;

  function sublabel(nodeId: string, kind: string, agentId?: string): string | undefined {
    if (kind === "trigger") return developer ? "POST /api/events" : "Starts the agents";
    if (kind === "agent") {
      const agent = agents.find((a) => a.id === agentId);
      if (!agent) return undefined;
      const count = agent.tools.filter((tool) => tool.enabled).length;
      return developer ? `${agent.model === "default" ? "gpt-4o-mini" : agent.model} · ${count} tools` : `${count} ${count === 1 ? "tool" : "tools"}`;
    }
    if (kind === "integration") return developer ? "connector" : "Connected service";
    if (kind === "handoff") return "When an agent is unsure";
    return nodeId.includes(":tool:") && developer ? "tool" : undefined;
  }

  return (
    <div
      className="relative"
      style={{
        width: layout.width,
        height: layout.height,
        backgroundImage: "radial-gradient(rgb(var(--line-rgb)) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    >
      <svg width={layout.width} height={layout.height} className="absolute inset-0" aria-hidden>
        {layout.edges.map((edge) => {
          const from = byId.get(edge.from);
          const to = byId.get(edge.to);
          if (!from || !to) return null;
          const x1 = from.x + NODE_W;
          const y1 = from.y + NODE_H / 2;
          const x2 = to.x;
          const y2 = to.y + NODE_H / 2;
          const mid = (x1 + x2) / 2;
          const active = focus === edge.agentId;
          return (
            <path
              key={`${edge.from}-${edge.to}`}
              d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke={active ? "var(--accent)" : "var(--line)"}
              strokeWidth={active ? 2 : 1.5}
              strokeDasharray={edge.style === "dashed" ? "4 4" : undefined}
              opacity={focus && !active ? 0.5 : 1}
              className="transition-[stroke,opacity]"
            />
          );
        })}
      </svg>
      {layout.nodes.map((node) => {
        const selectable = node.kind === "agent" || node.kind === "tool";
        const label = node.kind === "tool" && developer ? `${slug(node.label, "_")}()` : node.label;
        return (
          <CanvasNodeCard
            key={node.id}
            node={{ ...node, label }}
            sublabel={sublabel(node.id, node.kind, node.agentId)}
            selected={node.kind === "agent" && node.id === selectedId}
            dimmed={Boolean(focus && node.agentId && node.agentId !== focus)}
            mono={developer}
            onSelect={selectable && node.agentId ? () => onSelect(node.agentId as string) : undefined}
            onHover={setHovered}
          />
        );
      })}
    </div>
  );
}
