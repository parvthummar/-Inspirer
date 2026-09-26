import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { PlanAgent } from "../../api/plans";
import type { Framework, Memory, Tone, WhenUnsure } from "../../mocks/agentCatalog";

/**
 * Agent settings are a dummy flow: they're kept per project in the browser, not on the server.
 * A small external store lets the Agents and Code tabs share the same data.
 */

export type AgentTool = { name: string; enabled: boolean };

export type AgentConfig = {
  id: string;
  name: string;
  role: string;
  tools: AgentTool[];
  whenUnsure: WhenUnsure;
  tone: Tone;
  model: string;
  temperature: number;
  maxSteps: number;
  memory: Memory;
};

export type AgentWorkspace = {
  /** Which plan the agents were created from; a new plan resets them. */
  planId: string;
  agents: AgentConfig[];
  framework: Framework;
};

const STORAGE_PREFIX = "architect.agents.";
const cache = new Map<string, AgentWorkspace>();
const listeners = new Set<() => void>();

function agentFromPlan(agent: PlanAgent, index: number): AgentConfig {
  return {
    id: `agent-${index + 1}`,
    name: agent.name,
    role: agent.role,
    tools: agent.tools.map((name) => ({ name, enabled: true })),
    whenUnsure: "ask_teammate",
    tone: "friendly",
    model: "default",
    temperature: 0.3,
    maxSteps: 8,
    memory: "conversation",
  };
}

function read(projectId: string): AgentWorkspace | null {
  if (cache.has(projectId)) return cache.get(projectId) ?? null;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + projectId);
    const parsed = raw ? (JSON.parse(raw) as AgentWorkspace) : null;
    if (parsed) cache.set(projectId, parsed);
    return parsed;
  } catch {
    return null;
  }
}

function write(projectId: string, workspace: AgentWorkspace) {
  cache.set(projectId, workspace);
  try {
    localStorage.setItem(STORAGE_PREFIX + projectId, JSON.stringify(workspace));
  } catch {
    // Storage may be unavailable; the settings still work for this session.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

type PlanSource = { id: string; agents: PlanAgent[] } | null;

/** The project's agents, created from the plan the first time and edited from then on. */
export function useAgentWorkspace(projectId: string, plan: PlanSource) {
  const stored = useSyncExternalStore(subscribe, () => read(projectId));

  const planId = plan?.id;
  const planAgents = plan?.agents;
  const workspace = useMemo<AgentWorkspace | null>(() => {
    if (!planId || !planAgents) return null;
    if (stored && stored.planId === planId) return stored;
    return { planId, agents: planAgents.map(agentFromPlan), framework: stored?.framework ?? "lyzr" };
  }, [stored, planId, planAgents]);

  const update = useCallback(
    (change: (current: AgentWorkspace) => AgentWorkspace) => {
      if (workspace) write(projectId, change(workspace));
    },
    [projectId, workspace],
  );

  return { workspace, update };
}

export function newAgent(existing: AgentConfig[]): AgentConfig {
  const next = existing.length + 1;
  return {
    id: `agent-${Date.now()}`,
    name: `New agent ${next}`,
    role: "Describe what this agent should do.",
    tools: [],
    whenUnsure: "ask_teammate",
    tone: "friendly",
    model: "default",
    temperature: 0.3,
    maxSteps: 8,
    memory: "conversation",
  };
}
