import { useState } from "react";
import { Eye, EyeOff, Lock, Trash2 } from "lucide-react";
import Button from "../../components/Button";
import type { EnvVar } from "./useDeploy";

type EnvVarRowProps = {
  variable: EnvVar;
  developer: boolean;
  onSave: (value: string) => void;
  onDelete: () => void;
};

const field =
  "w-full rounded-md border border-line bg-panel px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export default function EnvVarRow({ variable, developer, onSave, onDelete }: EnvVarRowProps) {
  const [value, setValue] = useState(variable.value);
  const [revealed, setRevealed] = useState(false);
  const dirty = value !== variable.value;
  const missing = variable.required && !variable.value.trim();

  return (
    <li className="py-3">
      <div className="flex items-center gap-2">
        <span className={`min-w-0 flex-1 truncate text-sm font-medium ${developer ? "font-mono text-xs" : ""}`}>
          {developer ? variable.key : variable.label}
        </span>
        {variable.managed ? (
          <span className="flex items-center gap-1 text-[11px] text-muted">
            <Lock className="h-3 w-3" aria-hidden />
            Managed by Architect
          </span>
        ) : missing ? (
          <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-medium text-danger">Needed</span>
        ) : null}
        {!variable.managed && !variable.required && (
          <button type="button" onClick={onDelete} aria-label={`Delete ${variable.key}`} className="rounded p-1 text-muted hover:text-danger">
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>
      {!variable.managed && (
        <div className="mt-1.5 flex gap-2">
          <div className="relative flex-1">
            <input
              aria-label={`Value for ${variable.key}`}
              type={variable.secret && !revealed ? "password" : "text"}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={variable.secret ? "Paste the key" : "Value"}
              autoComplete="off"
              className={`${field} font-mono text-xs ${variable.secret ? "pr-9" : ""}`}
            />
            {variable.secret && (
              <button
                type="button"
                onClick={() => setRevealed((r) => !r)}
                aria-label={revealed ? "Hide value" : "Show value"}
                className="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-muted hover:text-ink"
              >
                {revealed ? <EyeOff className="h-3.5 w-3.5" aria-hidden /> : <Eye className="h-3.5 w-3.5" aria-hidden />}
              </button>
            )}
          </div>
          <Button variant="secondary" onClick={() => onSave(value.trim())} disabled={!dirty} className="px-3 py-1.5 text-xs">
            Save
          </Button>
        </div>
      )}
    </li>
  );
}
