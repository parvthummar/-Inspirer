/** Fake catalogue data for the agent section: tools, models and frameworks. */
import type { AgentFramework } from "./generatedFiles";

export type Framework = AgentFramework;

export const frameworks: { id: Framework; name: string; description: string }[] = [
  { id: "lyzr", name: "Lyzr Agent Framework", description: "Managed agents with built-in memory, guardrails and handoffs. Recommended." },
  { id: "langgraph", name: "LangGraph", description: "Agents as a graph of steps. Good for complex, branching flows." },
  { id: "crewai", name: "CrewAI", description: "Role-based agents that work together as a crew." },
  { id: "openai_agents", name: "OpenAI Agents SDK", description: "Lightweight agents with tools and handoffs on OpenAI models." },
];

export const models = [
  { id: "default", name: "Architect default (gpt-4o-mini)" },
  { id: "gpt-4.1", name: "gpt-4.1" },
  { id: "claude-sonnet", name: "Claude Sonnet" },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B" },
];

/** Extra tools a user can add to an agent. */
export const toolCatalog = [
  "Search the web",
  "Send an email",
  "Post a message in Slack",
  "Read a Google Sheet",
  "Look up a customer",
  "Create a calendar event",
  "Summarise a document",
  "Update a record",
];

export type WhenUnsure = "ask_teammate" | "best_guess" | "stop";
export type Tone = "friendly" | "neutral" | "formal";
export type Memory = "none" | "conversation" | "long_term";

export const whenUnsureOptions: { id: WhenUnsure; label: string; hint: string }[] = [
  { id: "ask_teammate", label: "Ask a teammate", hint: "Hands the task to a person and waits." },
  { id: "best_guess", label: "Make its best guess", hint: "Carries on and flags the answer for review." },
  { id: "stop", label: "Stop and explain", hint: "Stops and says what it needs." },
];

export const toneOptions: { id: Tone; label: string }[] = [
  { id: "friendly", label: "Friendly" },
  { id: "neutral", label: "Neutral" },
  { id: "formal", label: "Formal" },
];

export const memoryOptions: { id: Memory; label: string }[] = [
  { id: "none", label: "None" },
  { id: "conversation", label: "This conversation" },
  { id: "long_term", label: "Long-term (per user)" },
];

/** Words that make a test message look like something a person should handle. */
export const HANDOFF_WORDS = ["refund", "complaint", "angry", "cancel", "urgent", "lawyer", "legal"];
