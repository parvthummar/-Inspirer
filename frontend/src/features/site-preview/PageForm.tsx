import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";

const field = "mt-1 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm focus:border-accent focus:outline-none";

export default function PageForm({ name, compact }: { name: string; compact: boolean }) {
  const [saved, setSaved] = useState(false);

  function save(event: FormEvent) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <form onSubmit={save} className="max-w-xl space-y-4 rounded-lg border border-line bg-panel p-5" onChange={() => setSaved(false)}>
      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-2"}`}>
        <label className="block text-sm font-medium">
          Name
          <input defaultValue="Priya Shah" className={field} />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input type="email" defaultValue="priya@acme.com" className={field} />
        </label>
      </div>
      <label className="block text-sm font-medium">
        {name.toLowerCase().includes("setting") ? "Notifications" : "Category"}
        <select className={field} defaultValue="all">
          <option value="all">All updates</option>
          <option value="important">Only important updates</option>
          <option value="none">Nothing</option>
        </select>
      </label>
      <label className="block text-sm font-medium">
        Notes
        <textarea rows={3} placeholder="Anything we should know?" className={`${field} resize-none`} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" defaultChecked className="h-4 w-4 accent-[rgb(var(--accent-rgb))]" />
        Email me a weekly summary
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent">
          Save
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-success" role="status">
            <Check className="h-4 w-4" aria-hidden />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
