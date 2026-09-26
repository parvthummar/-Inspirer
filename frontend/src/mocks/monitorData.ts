/**
 * Simulated agent activity for the Monitor tab, generated from the approved plan so it matches the app.
 * The same plan always gives the same history; new runs are added while the tab is open.
 */
import type { PlanContent } from "../api/plans";
import { slug } from "./generatedFiles";

export type RunOutcome = "resolved" | "handed_off" | "failed";

export type RunStep = {
  label: string;
  call: string;
  result: string;
  durationMs: number;
  tokens: number;
  failed?: boolean;
};

export type RunFailure = { plain: string; technical: string; fix: string };

export type AgentRun = {
  id: string;
  agent: string;
  customer: string;
  at: number;
  outcome: RunOutcome;
  conversation: { from: "person" | "agent"; text: string }[];
  steps: RunStep[];
  failure?: RunFailure;
};

const CUSTOMERS = [
  "Hannah Okafor", "Diego Ramírez", "Sofia Lindqvist", "Kwame Mensah", "Priya Shah", "Tom Fischer",
  "Aisha Bello", "Marcus Lee", "Chloe Martin", "Raj Patel", "Grace Kim", "Liam O'Brien", "Elena Novak", "Yuki Tanaka",
];

const REQUESTS: Record<string, { ask: string; answer: string }[]> = {
  support_desk: [
    { ask: "Where is my order #48213?", answer: "It left our warehouse on Tuesday and arrives tomorrow before 6 pm." },
    { ask: "Can I change my delivery address?", answer: "Yes, it hasn't shipped yet. I've updated the address for you." },
    { ask: "Do you ship to Norway?", answer: "We do. Delivery to Norway takes 4 to 6 working days." },
    { ask: "The lamp I got is broken, I want a refund", answer: "I'm sorry about that. I've passed this to a teammate who handles refunds." },
  ],
  leave_tracker: [
    { ask: "I'd like 12 to 16 October off", answer: "Request sent to your manager. You'll have 9 days left after this." },
    { ask: "How many holiday days do I have left?", answer: "You have 14 days of annual leave left this year." },
    { ask: "Can I cancel my leave next Friday?", answer: "Done. The day is back in your balance and your manager has been told." },
  ],
  sales_crm: [
    { ask: "New lead from the contact form: Brightline Logistics", answer: "Scored 9/10 and drafted a first email for Jordan to review." },
    { ask: "Research Mintleaf Health before my call", answer: "Summary added to the lead: Series A in June, asked about data residency." },
    { ask: "Lead from a student asking for a discount", answer: "Scored 2/10. Replied with details of the free plan." },
  ],
  meeting_notes: [
    { ask: "Summarise the Q4 launch planning transcript", answer: "Summary, 3 decisions and 3 action items are ready." },
    { ask: "What did we decide about pricing last week?", answer: "The launch moves to 14 October and the free plan stays the same." },
    { ask: "Pull action items from the hiring sync", answer: "2 action items added, with owners and due dates." },
  ],
  ops_dashboard: [
    { ask: "Reconcile September supplier invoices", answer: "42 invoices matched. 2 need a person to check the amounts." },
    { ask: "Send the weekly inventory report", answer: "Report sent to the store managers." },
    { ask: "Flag late deliveries from Northline Freight", answer: "3 late deliveries flagged and the supplier has been emailed." },
  ],
};

function seeded(seed: number) {
  let value = seed || 1;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
}

function hash(text: string): number {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

function failureFor(plan: PlanContent, random: () => number): RunFailure {
  const integration = plan.integrations[Math.floor(random() * Math.max(1, plan.integrations.length))];
  const options: RunFailure[] = [
    {
      plain: "The agent couldn't reach an outside service in time, so it stopped instead of guessing.",
      technical: "tool call timed out after 30000ms (no response from upstream)",
      fix: "Added an automatic retry with a longer wait for slow responses.",
    },
    {
      plain: "The message didn't include the details the agent needed, and it couldn't find them anywhere else.",
      technical: "ValidationError: required field 'reference' missing from input",
      fix: "Taught the agent to ask the person for the missing details instead of stopping.",
    },
  ];
  if (integration) {
    options.push({
      plain: `The connection to ${integration} needs to be renewed, so the agent couldn't finish the task.`,
      technical: `${slug(integration, "_")}.request -> 401 invalid_grant (token expired)`,
      fix: `Renewed the ${integration} connection and added a check that warns you before it expires.`,
    });
  }
  return options[Math.floor(random() * options.length)];
}

export function generateRun(plan: PlanContent, seed: number, at: number): AgentRun {
  const random = seeded(seed);
  const agents = plan.agents.length ? plan.agents : [{ name: "Assistant agent", role: "", tools: ["Look up a record", "Send a reply"] }];
  const agent = agents[Math.floor(random() * agents.length)];
  const requests = REQUESTS[plan.template_key] ?? REQUESTS.ops_dashboard;
  const request = requests[Math.floor(random() * requests.length)];
  const roll = random();
  const sensitive = /refund|broken|check the amounts/i.test(request.ask + request.answer);
  const outcome: RunOutcome = roll < 0.1 ? "failed" : sensitive || roll > 0.88 ? "handed_off" : "resolved";

  const steps: RunStep[] = [
    { label: "Read the message", call: `parse_input(text="${request.ask.slice(0, 32)}…")`, result: "Intent understood", durationMs: 120 + Math.floor(random() * 160), tokens: 180 + Math.floor(random() * 80) },
  ];
  agent.tools.slice(0, 2).forEach((tool, index) => {
    const fails = outcome === "failed" && index === Math.min(1, agent.tools.length - 1);
    steps.push({
      label: `Used "${tool}"`,
      call: `${slug(tool, "_")}(query="${request.ask.slice(0, 24)}…")`,
      result: fails ? "Error" : index === 0 ? "Found 1 matching record" : "Done",
      durationMs: fails ? 30000 : 300 + Math.floor(random() * 900),
      tokens: 90 + Math.floor(random() * 140),
      failed: fails,
    });
  });

  const conversation: AgentRun["conversation"] = [{ from: "person", text: request.ask }];
  let failure: RunFailure | undefined;
  if (outcome === "failed") {
    failure = failureFor(plan, random);
    conversation.push({ from: "agent", text: "Sorry, something went wrong on my side. A teammate will follow up with you shortly." });
  } else if (outcome === "handed_off") {
    steps.push({ label: "Handed off to a teammate", call: 'handoff(reason="needs a person")', result: "Assigned to the team inbox", durationMs: 80, tokens: 40 });
    conversation.push({ from: "agent", text: sensitive ? request.answer : "This needs a person to look at, so I've passed it to a teammate." });
  } else {
    steps.push({ label: "Wrote the reply", call: "compose_reply()", result: "Sent", durationMs: 500 + Math.floor(random() * 500), tokens: 220 + Math.floor(random() * 100) });
    conversation.push({ from: "agent", text: request.answer });
  }

  return {
    id: `run-${seed}`,
    agent: agent.name,
    customer: CUSTOMERS[Math.floor(random() * CUSTOMERS.length)],
    at,
    outcome,
    conversation,
    steps,
    failure,
  };
}

/** Recent history: runs spread over the last `hours`, newest first. */
export function generateHistory(plan: PlanContent, projectId: string, now: number, hours: number): AgentRun[] {
  const base = hash(projectId);
  const count = Math.round(hours * 1.6) + 6;
  const runs: AgentRun[] = [];
  for (let i = 0; i < count; i += 1) {
    const random = seeded(base + i * 7919);
    const at = now - random() * hours * 3_600_000;
    runs.push(generateRun(plan, base + i * 7919, at));
  }
  return runs.sort((a, b) => b.at - a.at);
}
