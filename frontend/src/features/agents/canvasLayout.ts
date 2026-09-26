import type { AgentConfig } from "./agentStore";

export const NODE_W = 188;
export const NODE_H = 52;
const ROW_GAP = 12;
const BLOCK_GAP = 28;
const COL_GAP = 76;
const PAD = 32;

export type NodeKind = "trigger" | "agent" | "tool" | "integration" | "handoff";

export type CanvasNode = {
  id: string;
  kind: NodeKind;
  x: number;
  y: number;
  label: string;
  /** For agent and tool nodes: which agent they belong to. */
  agentId?: string;
};

export type CanvasEdge = { from: string; to: string; agentId: string; style: "solid" | "dashed" };

export type CanvasLayout = { nodes: CanvasNode[]; edges: CanvasEdge[]; width: number; height: number };

const column = (index: number) => PAD + index * (NODE_W + COL_GAP);

/** Left-to-right layout: trigger, agents, each agent's tools, then integrations and the handoff. */
export function layoutCanvas(agents: AgentConfig[], integrations: string[]): CanvasLayout {
  const nodes: CanvasNode[] = [];
  const edges: CanvasEdge[] = [];
  let cursor = PAD;

  for (const agent of agents) {
    const tools = agent.tools.filter((tool) => tool.enabled);
    const rows = Math.max(1, tools.length);
    const blockHeight = rows * NODE_H + (rows - 1) * ROW_GAP;
    nodes.push({ id: agent.id, kind: "agent", x: column(1), y: cursor + (blockHeight - NODE_H) / 2, label: agent.name, agentId: agent.id });
    tools.forEach((tool, index) => {
      const id = `${agent.id}:tool:${index}`;
      nodes.push({ id, kind: "tool", x: column(2), y: cursor + index * (NODE_H + ROW_GAP), label: tool.name, agentId: agent.id });
      edges.push({ from: agent.id, to: id, agentId: agent.id, style: "solid" });
    });
    cursor += blockHeight + BLOCK_GAP;
  }

  const contentHeight = Math.max(cursor - BLOCK_GAP - PAD, NODE_H);
  nodes.push({ id: "trigger", kind: "trigger", x: column(0), y: PAD + (contentHeight - NODE_H) / 2, label: "A new request comes in" });
  agents.forEach((agent) => edges.push({ from: "trigger", to: agent.id, agentId: agent.id, style: "solid" }));

  const handoffAgents = agents.filter((agent) => agent.whenUnsure === "ask_teammate");
  const rightColumn = [
    ...integrations.map((name, index) => ({ id: `integration:${index}`, kind: "integration" as const, label: name })),
    ...(handoffAgents.length ? [{ id: "handoff", kind: "handoff" as const, label: "Hand off to a teammate" }] : []),
  ];
  const rightHeight = rightColumn.length * NODE_H + Math.max(0, rightColumn.length - 1) * ROW_GAP * 2;
  const rightTop = PAD + Math.max(0, (contentHeight - rightHeight) / 2);
  rightColumn.forEach((node, index) => {
    nodes.push({ ...node, x: column(3), y: rightTop + index * (NODE_H + ROW_GAP * 2) });
  });
  for (const agent of agents) {
    integrations.forEach((_, index) => edges.push({ from: agent.id, to: `integration:${index}`, agentId: agent.id, style: "dashed" }));
  }
  handoffAgents.forEach((agent) => edges.push({ from: agent.id, to: "handoff", agentId: agent.id, style: "dashed" }));

  return {
    nodes,
    edges,
    width: column(3) + NODE_W + PAD,
    height: Math.max(PAD + contentHeight, rightTop + rightHeight) + PAD,
  };
}
