import { useState } from "react";
import { FileText, Search } from "lucide-react";
import PageHeader from "../shared/PageHeader";
import { articles } from "./data";

export default function ArticlesView() {
  const [query, setQuery] = useState("");
  const shown = articles.filter((article) => article.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <PageHeader title="Help articles" subtitle="The agent answers using these. Keep them up to date." />
      <label className="mb-3 flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2">
        <Search className="h-4 w-4 text-muted" aria-hidden />
        <span className="sr-only">Search articles</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search articles"
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
      </label>
      <ul className="divide-y divide-line rounded-lg border border-line bg-panel">
        {shown.map((article) => (
          <li key={article.title} className="flex items-center gap-3 px-4 py-3">
            <FileText className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{article.title}</p>
              <p className="text-xs text-muted">Updated {article.updated}</p>
            </div>
            <span className="shrink-0 text-xs text-muted">Used in {article.uses} answers</span>
          </li>
        ))}
        {shown.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">No articles match "{query}".</li>}
      </ul>
    </>
  );
}
