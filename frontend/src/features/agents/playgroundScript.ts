import { HANDOFF_WORDS } from "../../mocks/agentCatalog";
import { slug } from "../../mocks/generatedFiles";
import type { AgentConfig } from "./agentStore";

export type TraceStep = {
  label: string;
  /** Developer view: the call made, e.g. send_an_email({...}). */
  call: string;
  result: string;
  durationMs: number;
  tokens: number;
};

export type SimulatedRun = {
  steps: TraceStep[];
  reply: string;
  outcome: "answered" | "handed_off" | "flagged" | "stopped";
};

function hash(text: string): number {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

const greetings = { friendly: "Thanks for reaching out!", neutral: "Got it.", formal: "Thank you for your message." };

/** A believable, repeatable test run: same agent and message always give the same trace. */
export function simulateRun(agent: AgentConfig, message: string): SimulatedRun {
  const seed = hash(agent.id + message);
  const lower = message.toLowerCase();
  const tools = agent.tools.filter((tool) => tool.enabled);
  const sensitive = HANDOFF_WORDS.some((word) => lower.includes(word));
  const excerpt = message.length > 48 ? `${message.slice(0, 45)}...` : message;

  const steps: TraceStep[] = [
    {
      label: "Read the message",
      call: `parse_input(text="${excerpt}")`,
      result: sensitive ? "Intent: complaint or sensitive request" : "Intent: request for help",
      durationMs: 140 + (seed % 120),
      tokens: 180 + (seed % 90),
    },
  ];

  // Use the tools whose names share a word with the message, otherwise the first two.
  const relevant = tools.filter((tool) => tool.name.toLowerCase().split(/\W+/).some((word) => word.length > 3 && lower.includes(word)));
  const used = (relevant.length ? relevant : tools).slice(0, 2);
  used.forEach((tool, index) => {
    steps.push({
      label: `Used "${tool.name}"`,
      call: `${slug(tool.name, "_")}(query="${excerpt}")`,
      result: index === 0 ? "Found 3 matching records" : "Done, no errors",
      durationMs: 380 + ((seed >> (index + 2)) % 700),
      tokens: 90 + ((seed >> index) % 160),
    });
  });

  const greeting = greetings[agent.tone];
  const toolSummary = used.length ? `I ran ${used.map((tool) => `"${tool.name}"`).join(" and then ")}. ` : "";

  if (sensitive && agent.whenUnsure === "ask_teammate") {
    steps.push({ label: "Handed off to a teammate", call: "handoff(reason=\"sensitive request\")", result: "Assigned to the team inbox", durationMs: 90, tokens: 40 });
    return {
      steps,
      outcome: "handed_off",
      reply: `${greeting} ${toolSummary}This needs a person to look at, so I've passed it to a teammate. They'll get back to you shortly.`,
    };
  }
  if (sensitive && agent.whenUnsure === "stop") {
    return {
      steps,
      outcome: "stopped",
      reply: `${greeting} I can't safely handle this on my own. A teammate needs to review it before I continue.`,
    };
  }

  steps.push({
    label: "Wrote the reply",
    call: "compose_reply(tone=\"" + agent.tone + "\")",
    result: "112 words",
    durationMs: 520 + (seed % 400),
    tokens: 240 + (seed % 120),
  });
  return {
    steps,
    outcome: sensitive ? "flagged" : "answered",
    reply: `${greeting} ${toolSummary}Everything went through, and the result is saved for your team to review.${
      sensitive ? " I've flagged this reply for a teammate to double-check." : ""
    }`,
  };
}

export function suggestedPrompts(agent: AgentConfig): string[] {
  const firstTool = agent.tools.find((tool) => tool.enabled)?.name.toLowerCase();
  return [
    firstTool ? `Can you ${firstTool.replace(/^(a|an) /, "")} for me?` : "What can you help me with?",
    "Here's a normal request from a customer. How would you handle it?",
    "I want a refund and this is urgent.",
  ];
}
