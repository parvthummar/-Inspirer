import type { Build } from "../../api/build";
import type { PlanAgent, PlanContent } from "../../api/plans";
import {
  agentPy,
  architectJson,
  integrationPy,
  mainPy,
  packageJson,
  readme,
  slug,
  testsPy,
  type AgentFramework,
} from "../../mocks/generatedFiles";
import { sourceFilesFor } from "../../sample-apps/sources";

export type LoadedFile = { content: string; notice?: string };

export type ProjectFile = {
  path: string;
  /** The build step that creates this file; it appears in the tree once that step is done. */
  stepId: string;
  /** The file's text, or text plus a note such as "only the first 400 KB is shown". */
  load: () => Promise<string | LoadedFile>;
};

const text = (content: string) => () => Promise.resolve(content);

/** Point the sample app's imports at the paths shown in the file tree. */
function rewriteImports(source: string): string {
  return source
    .replace(/from "\.\.\/shared\//g, 'from "../components/')
    .replace(/from "\.\/data"/g, 'from "../data/seed"')
    .replace(/from "\.\/(\w+)View"/g, 'from "./$1"');
}

/** Agent settings from the Agents tab, when the user has changed them; otherwise the plan's agents are used. */
export type AgentOverrides = { agents: PlanAgent[]; framework: AgentFramework };

/** The files Architect "generated" for this project: real sample-app source plus files built from the plan. */
export function projectFiles(
  projectName: string,
  plan: PlanContent,
  build: Build,
  overrides?: AgentOverrides,
): ProjectFile[] {
  const pageSteps = build.steps.filter((step) => step.id.startsWith("page-")).map((step) => step.id);
  const files: ProjectFile[] = [];

  let viewIndex = 0;
  for (const source of sourceFilesFor(plan.template_key)) {
    const load = () => source.load().then(rewriteImports);
    if (source.kind === "app") files.push({ path: "frontend/src/App.tsx", stepId: "setup", load });
    else if (source.kind === "data") files.push({ path: "frontend/src/data/seed.ts", stepId: "database", load });
    else if (source.kind === "shared") files.push({ path: `frontend/src/components/${source.name}`, stepId: "setup", load });
    else {
      const stepId = pageSteps.length ? pageSteps[viewIndex % pageSteps.length] : "setup";
      viewIndex += 1;
      files.push({ path: `frontend/src/pages/${source.name.replace("View.tsx", ".tsx")}`, stepId, load });
    }
  }

  files.push(
    { path: "README.md", stepId: "setup", load: text(readme(projectName, plan)) },
    { path: "architect.json", stepId: "setup", load: text(architectJson(projectName, plan)) },
    { path: "frontend/package.json", stepId: "setup", load: text(packageJson(projectName)) },
    { path: "backend/app/main.py", stepId: "database", load: text(mainPy(projectName, plan)) },
    { path: "backend/tests/test_app.py", stepId: "tests", load: text(testsPy(plan)) },
  );
  // Agent files appear with the build step for the planned agent; agents added later count as part of setup.
  const plannedSteps = new Set(plan.agents.map((agent) => `agent-${slug(agent.name)}`));
  for (const agent of overrides?.agents ?? plan.agents) {
    const stepId = `agent-${slug(agent.name)}`;
    files.push({
      path: `backend/agents/${slug(agent.name, "_")}.py`,
      stepId: plannedSteps.has(stepId) ? stepId : "setup",
      load: text(agentPy(agent, overrides?.framework)),
    });
  }
  for (const integration of plan.integrations) {
    files.push({
      path: `backend/integrations/${slug(integration, "_")}.py`,
      stepId: `integration-${slug(integration)}`,
      load: text(integrationPy(integration)),
    });
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}
