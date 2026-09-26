import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import Button from "../../components/Button";
import { useToast } from "../../components/toast-context";
import EnvVarRow from "./EnvVarRow";
import type { DeployController } from "./useDeploy";

type EnvVarsTabProps = {
  deploy: DeployController;
  developer: boolean;
};

const KEY_PATTERN = /^[A-Z][A-Z0-9_]*$/;
const field =
  "w-full rounded-md border border-line bg-panel px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export default function EnvVarsTab({ deploy, developer }: EnvVarsTabProps) {
  const { state, update } = deploy;
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [error, setError] = useState<string>();
  const toast = useToast();

  function setValue(key: string, value: string) {
    update((current) => ({ ...current, envVars: current.envVars.map((v) => (v.key === key ? { ...v, value } : v)) }));
    toast("Key saved");
  }

  function add(event: FormEvent) {
    event.preventDefault();
    const key = newKey.trim().toUpperCase();
    if (!KEY_PATTERN.test(key)) return setError("Use capital letters, numbers and underscores, starting with a letter.");
    if (state.envVars.some((v) => v.key === key)) return setError(`${key} already exists.`);
    update((current) => ({
      ...current,
      envVars: [...current.envVars, { key, value: newValue, label: key, secret: true, required: false, managed: false }],
    }));
    setNewKey("");
    setNewValue("");
    setError(undefined);
    toast("Variable added");
  }

  return (
    <div>
      <p className="text-sm text-muted">
        {developer
          ? "Environment variables for production. Values are encrypted and only exposed to your backend."
          : "Keys let your app sign in to the services it uses. They're stored securely and never shown to your users."}
      </p>
      <ul className="mt-2 divide-y divide-line">
        {state.envVars.map((variable) => (
          <EnvVarRow
            key={variable.key + variable.value}
            variable={variable}
            developer={developer}
            onSave={(value) => setValue(variable.key, value)}
            onDelete={() => {
              update((current) => ({ ...current, envVars: current.envVars.filter((v) => v.key !== variable.key) }));
              toast("Variable deleted");
            }}
          />
        ))}
      </ul>
      {developer && (
        <form onSubmit={add} className="mt-4 rounded-lg border border-dashed border-line p-3" noValidate>
          <p className="text-xs font-semibold">Add a variable</p>
          <div className="mt-2 flex gap-2">
            <input aria-label="Variable name" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="STRIPE_SECRET_KEY" className={`${field} font-mono text-xs`} />
            <input aria-label="Variable value" type="password" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Value" autoComplete="off" className={`${field} font-mono text-xs`} />
            <Button type="submit" disabled={!newKey.trim()} className="shrink-0 px-3 py-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add
            </Button>
          </div>
          {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
        </form>
      )}
    </div>
  );
}
