import type { Build } from "../../api/build";
import type { PlanContent } from "../../api/plans";
import { slug } from "../../mocks/generatedFiles";

export type LogLevel = "info" | "step" | "success" | "warn";
export type LogSource = "build" | "runtime";
export type LogLine = { id: string; at: number; source: LogSource; level: LogLevel; text: string };

/** Build log lines, each stamped with when it happens during the scripted build. */
export function buildLogLines(build: Build): LogLine[] {
  const startedAt = new Date(build.started_at).getTime();
  const lines: LogLine[] = [];
  let offset = 0;
  build.steps.forEach((step, stepIndex) => {
    lines.push({ id: `b${stepIndex}-start`, at: startedAt + offset, source: "build", level: "step", text: step.dev_label });
    step.logs.forEach((log, logIndex) => {
      const at = startedAt + offset + ((logIndex + 1) * step.duration_ms) / (step.logs.length + 1);
      lines.push({ id: `b${stepIndex}-${logIndex}`, at, source: "build", level: "info", text: log });
    });
    offset += step.duration_ms;
    lines.push({
      id: `b${stepIndex}-done`,
      at: startedAt + offset,
      source: "build",
      level: "success",
      text: `done in ${(step.duration_ms / 1000).toFixed(1)}s`,
    });
  });
  return lines;
}

/** Realistic runtime events for the running preview, based on the app's pages, agents and integrations. */
export function runtimeEvents(plan: PlanContent): Omit<LogLine, "id" | "at" | "source">[] {
  const events: Omit<LogLine, "id" | "at" | "source">[] = [];
  for (const page of plan.pages) {
    events.push({ level: "info", text: `GET /api/${slug(page.name)} 200 ${20 + (page.name.length * 7) % 60}ms` });
  }
  for (const agent of plan.agents) {
    const id = slug(agent.name, "_");
    for (const tool of agent.tools.slice(0, 2)) {
      events.push({ level: "info", text: `agent.${id} tool=${slug(tool, "_")} ok ${300 + (tool.length * 37) % 900}ms` });
    }
    events.push({ level: "success", text: `agent.${id} finished task, no handoff needed` });
  }
  for (const integration of plan.integrations) {
    events.push({ level: "info", text: `${slug(integration, "_")}: webhook received, 1 event queued` });
  }
  events.push({ level: "warn", text: `GET /api/${slug(plan.pages[0]?.name ?? "home")} slow response 1840ms (cold start)` });
  return events;
}
