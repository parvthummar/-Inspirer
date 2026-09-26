import { useCallback, useMemo } from "react";
import { useLocalState } from "../../lib/localStore";
import type { PlanAgent } from "../../api/plans";
import type { Framework, Memory, Tone, WhenUnsure } from "../../mocks/agentCatalog";

/**
 * Agent settings are a dummy flow: they're kept per project in the browser, not on the server.
 * The shared local store lets the Agents and Code tabs see the same data.
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

type PlanSource = { id: string; agents: PlanAgent[] } | null;

/** The project's agents, created from the plan the first time and edited from then on. */
export function useAgentWorkspace(projectId: string, plan: PlanSource) {
  const [stored, setStored] = useLocalState<AgentWorkspace>(STORAGE_PREFIX + projectId);

  const planId = plan?.id;
  const planAgents = plan?.agents;
  const workspace = useMemo<AgentWorkspace | null>(() => {
    if (!planId || !planAgents) return null;
    if (stored && stored.planId === planId) return stored;
    return { planId, agents: planAgents.map(agentFromPlan), framework: stored?.framework ?? "lyzr" };
  }, [stored, planId, planAgents]);

  const update = useCallback(
    (change: (current: AgentWorkspace) => AgentWorkspace) => {
      if (workspace) setStored(change(workspace));
    },
    [setStored, workspace],
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
