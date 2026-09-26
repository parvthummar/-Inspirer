import { starterTemplates, type StarterTemplate } from "../../mocks/starterTemplates";

type StarterTemplatesProps = {
  onPick: (template: StarterTemplate) => void;
};

export default function StarterTemplates({ onPick }: StarterTemplatesProps) {
  return (
    <section aria-label="Starter templates">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {starterTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <li key={template.id}>
              <button
                type="button"
                onClick={() => onPick(template)}
                className="group flex h-full w-full flex-col rounded-lg border border-dashed border-line p-4 text-left transition-colors hover:border-accent/50 hover:bg-panel"
              >
                <Icon className="h-4 w-4 text-muted transition-colors group-hover:text-accent" aria-hidden />
                <span className="mt-3 text-sm font-medium">{template.title}</span>
                <span className="mt-1 text-xs leading-relaxed text-muted">{template.summary}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
