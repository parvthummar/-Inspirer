import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateProject } from "../../api/projects";
import Alert from "../../components/Alert";
import Button from "../../components/Button";

const MAX_LENGTH = 4000;
const MIN_LENGTH = 3;
const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export type PromptComposerHandle = {
  /** Replace the prompt text and focus the box, e.g. when a starter template is picked. */
  fill: (text: string) => void;
};

const PromptComposer = forwardRef<PromptComposerHandle>(function PromptComposer(_, ref) {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createProject = useCreateProject();
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    fill(text: string) {
      setPrompt(text);
      const textarea = textareaRef.current;
      textarea?.focus();
      textarea?.scrollIntoView({ behavior: "smooth", block: "center" });
      requestAnimationFrame(() => textarea?.setSelectionRange(text.length, text.length));
    },
  }));

  // Grow with the text, up to a limit.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 320)}px`;
  }, [prompt]);

  const trimmed = prompt.trim();
  const canSubmit = trimmed.length >= MIN_LENGTH && !createProject.isPending;

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSubmit) return;
    createProject.mutate(trimmed, { onSuccess: (project) => navigate(`/project/${project.id}`) });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) submit();
  }

  return (
    <form onSubmit={submit}>
      <div className="rounded-xl border border-line bg-panel shadow-[0_1px_2px_rgba(22,32,42,0.04),0_12px_32px_rgba(22,32,42,0.07)] transition-shadow focus-within:border-accent/60 focus-within:shadow-[0_0_0_4px_rgba(51,85,255,0.10),0_12px_32px_rgba(22,32,42,0.07)]">
        <label htmlFor="prompt" className="sr-only">
          Describe the app you want to build
        </label>
        <textarea
          id="prompt"
          ref={textareaRef}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_LENGTH}
          rows={3}
          disabled={createProject.isPending}
          placeholder="For example: a tool where my team logs customer calls, and an agent writes a follow-up email for each one"
          className="block min-h-[104px] w-full resize-none rounded-t-xl bg-transparent px-5 pt-4 text-[15px] leading-relaxed text-ink placeholder:text-muted/70 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-3 px-3 pb-3 pl-5">
          <p className="hidden text-xs text-muted sm:block">
            {prompt.length > MAX_LENGTH * 0.8
              ? `${MAX_LENGTH - prompt.length} characters left`
              : `Press ${isMac ? "Cmd" : "Ctrl"} + Enter to start`}
          </p>
          <Button type="submit" disabled={!canSubmit} loading={createProject.isPending} className="ml-auto">
            {createProject.isPending ? "Starting your plan" : "Plan my app"}
            {!createProject.isPending && <ArrowRight className="h-4 w-4" aria-hidden />}
          </Button>
        </div>
      </div>
      {createProject.isError && (
        <div className="mt-3">
          <Alert>{createProject.error.message}</Alert>
        </div>
      )}
    </form>
  );
});

export default PromptComposer;
