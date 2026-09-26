import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalState } from "../../lib/localStore";
import { slug } from "../../mocks/generatedFiles";
import { deploySteps, totalMs, type DeployStep } from "./deployScript";

/** Deploys are a dummy flow; their state lives in the browser, per project. */

export type EnvVar = {
  key: string;
  value: string;
  /** Friendly name for Simple view. */
  label: string;
  secret: boolean;
  required: boolean;
  /** Managed by Architect: shown but not editable. */
  managed: boolean;
};

export type Deployment = {
  id: string;
  version: number;
  kind: "deploy" | "rollback";
  /** The build this release was made from. */
  buildStartedAt: string;
  at: string;
  durationMs: number;
  status: "live" | "previous";
  logs: string[];
};

export type Domain = { name: string; status: "waiting_for_dns" | "active"; checks: number; addedAt: string };

export type ActiveDeploy = {
  kind: "deploy" | "rollback";
  version: number;
  buildStartedAt: string;
  startedAt: number;
  steps: DeployStep[];
};

type DeployState = {
  envVars: EnvVar[];
  deployments: Deployment[];
  domain: Domain | null;
  active: ActiveDeploy | null;
};

function defaultEnvVars(integrations: string[]): EnvVar[] {
  return [
    { key: "DATABASE_URL", value: "postgres://managed", label: "Database", secret: true, required: true, managed: true },
    { key: "ARCHITECT_AGENT_KEY", value: "managed", label: "Agent service key", secret: true, required: true, managed: true },
    { key: "APP_ENV", value: "production", label: "App mode", secret: false, required: false, managed: false },
    ...integrations.map((name) => ({
      key: `${slug(name, "_").toUpperCase()}_TOKEN`,
      value: "",
      label: `${name} access key`,
      secret: true,
      required: true,
      managed: false,
    })),
  ];
}

const TICK_MS = 150;

export function useDeploy(projectId: string, integrations: string[], host: string) {
  const [stored, setStored] = useLocalState<DeployState>(`architect.deploy.${projectId}`);
  const integrationsKey = integrations.join("|");
  const state = useMemo<DeployState>(
    () => stored ?? { envVars: defaultEnvVars(integrationsKey ? integrationsKey.split("|") : []), deployments: [], domain: null, active: null },
    [stored, integrationsKey],
  );
  const [now, setNow] = useState(() => Date.now());

  const update = useCallback((change: (current: DeployState) => DeployState) => setStored(change(state)), [setStored, state]);

  const active = state.active;
  const elapsed = active ? now - active.startedAt : 0;

  // Tick while a deploy runs; when its scripted time is up, record it as the live release.
  useEffect(() => {
    if (!active) return;
    if (elapsed >= totalMs(active.steps)) {
      const logs = active.steps.flatMap((step) => [`▸ ${step.devLabel}`, ...step.logs]);
      setStored({
        ...state,
        active: null,
        deployments: [
          {
            id: `d${active.startedAt}`,
            version: active.version,
            kind: active.kind,
            buildStartedAt: active.buildStartedAt,
            at: new Date(active.startedAt + totalMs(active.steps)).toISOString(),
            durationMs: totalMs(active.steps),
            status: "live",
            logs,
          },
          ...state.deployments.map((d) => ({ ...d, status: "previous" as const })),
        ],
      });
      return;
    }
    const timer = window.setTimeout(() => setNow(Date.now()), TICK_MS);
    return () => window.clearTimeout(timer);
  }, [active, elapsed, state, setStored]);

  const live = state.deployments.find((d) => d.status === "live") ?? null;
  const missing = state.envVars.filter((v) => v.required && !v.value.trim());

  const deploy = useCallback(
    (buildStartedAt: string) => {
      const version = Math.max(0, ...state.deployments.map((d) => d.version)) + 1;
      setNow(Date.now());
      update((current) => ({
        ...current,
        active: { kind: "deploy", version, buildStartedAt, startedAt: Date.now(), steps: deploySteps("deploy", version, host) },
      }));
    },
    [state.deployments, update, host],
  );

  const rollback = useCallback(
    (target: Deployment) => {
      setNow(Date.now());
      update((current) => ({
        ...current,
        active: {
          kind: "rollback",
          version: target.version,
          buildStartedAt: target.buildStartedAt,
          startedAt: Date.now(),
          steps: deploySteps("rollback", target.version, host),
        },
      }));
    },
    [update, host],
  );

  return { state, update, live, missing, active, elapsed, deploy, rollback };
}

/** Everything the deploy drawer needs. Created once by the header's Deploy button and passed down. */
export type DeployController = ReturnType<typeof useDeploy>;
