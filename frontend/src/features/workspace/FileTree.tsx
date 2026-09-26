import { useMemo, useState } from "react";
import { ChevronRight, FileCode2, FileJson, FileText, Folder, FolderOpen } from "lucide-react";
import type { ProjectFile } from "./projectFiles";

type FileTreeProps = {
  files: ProjectFile[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
  /** Files created by the step that's running right now get a highlight. */
  freshSteps: Set<string>;
};

type TreeNode = { name: string; path: string; children: TreeNode[]; file?: ProjectFile };

function buildTree(files: ProjectFile[]): TreeNode[] {
  const root: TreeNode = { name: "", path: "", children: [] };
  for (const file of files) {
    let node = root;
    const parts = file.path.split("/");
    parts.forEach((part, index) => {
      const path = parts.slice(0, index + 1).join("/");
      let child = node.children.find((c) => c.name === part);
      if (!child) {
        child = { name: part, path, children: [] };
        node.children.push(child);
      }
      if (index === parts.length - 1) child.file = file;
      node = child;
    });
  }
  // Folders first, then files, each alphabetically.
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => Number(Boolean(a.file)) - Number(Boolean(b.file)) || a.name.localeCompare(b.name));
    nodes.forEach((node) => sort(node.children));
  };
  sort(root.children);
  return root.children;
}

function iconFor(name: string) {
  if (name.endsWith(".json")) return FileJson;
  if (name.endsWith(".md")) return FileText;
  return FileCode2;
}

export default function FileTree({ files, selectedPath, onSelect, freshSteps }: FileTreeProps) {
  const tree = useMemo(() => buildTree(files), [files]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggle(path: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function render(nodes: TreeNode[], depth: number) {
    return nodes.map((node) => {
      const indent = { paddingLeft: 8 + depth * 12 };
      if (node.file) {
        const Icon = iconFor(node.name);
        const selected = node.path === selectedPath;
        const fresh = freshSteps.has(node.file.stepId);
        return (
          <li key={node.path}>
            <button
              type="button"
              onClick={() => onSelect(node.path)}
              aria-current={selected ? "true" : undefined}
              style={indent}
              className={`flex w-full items-center gap-1.5 py-1 pr-2 text-left font-mono text-xs ${
                selected ? "bg-accent/10 text-accent" : "text-ink hover:bg-surface"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
              <span className="truncate">{node.name}</span>
              {fresh && <span className="ml-auto shrink-0 text-[10px] font-semibold text-success">A</span>}
            </button>
          </li>
        );
      }
      const open = !collapsed.has(node.path);
      return (
        <li key={node.path}>
          <button
            type="button"
            onClick={() => toggle(node.path)}
            aria-expanded={open}
            style={indent}
            className="flex w-full items-center gap-1 py-1 pr-2 text-left font-mono text-xs text-ink hover:bg-surface"
          >
            <ChevronRight className={`h-3 w-3 shrink-0 text-muted transition-transform ${open ? "rotate-90" : ""}`} aria-hidden />
            {open ? (
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
            ) : (
              <Folder className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
            )}
            <span className="truncate">{node.name}</span>
          </button>
          {open && <ul>{render(node.children, depth + 1)}</ul>}
        </li>
      );
    });
  }

  return (
    <nav aria-label="Files" className="h-full overflow-y-auto py-2">
      <ul>{render(tree, 0)}</ul>
    </nav>
  );
}
