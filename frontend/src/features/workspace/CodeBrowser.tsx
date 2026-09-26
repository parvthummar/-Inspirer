import { useState, type ReactNode } from "react";
import PanelResizer from "../../components/PanelResizer";
import CodeViewer from "./CodeViewer";
import FileTree from "./FileTree";
import type { ProjectFile } from "./projectFiles";

type CodeBrowserProps = {
  files: ProjectFile[];
  /** Shown above the file list, e.g. the file count and where the code comes from. */
  header: ReactNode;
  /** Shown under the code. */
  footer: string;
  /** Opened first when nothing is selected yet. */
  preferredPath?: string;
  /** Files created by the build step that just finished get a highlight. */
  freshSteps?: Set<string>;
  /** Actions across the top, e.g. download and GitHub sync. */
  toolbar?: ReactNode;
};

const TREE_WIDTH = { min: 160, max: 480, default: 220 };
const TREE_WIDTH_KEY = "architect.codeTreeWidth";
const NO_FRESH_STEPS = new Set<string>();

function savedTreeWidth(): number {
  try {
    const saved = Number(localStorage.getItem(TREE_WIDTH_KEY));
    if (saved >= TREE_WIDTH.min && saved <= TREE_WIDTH.max) return saved;
  } catch {
    // Storage can be unavailable (private mode); use the default.
  }
  return TREE_WIDTH.default;
}

/** File list and read-only code side by side, with a draggable divider. Each side scrolls on its own. */
export default function CodeBrowser({ files, header, footer, preferredPath, freshSteps = NO_FRESH_STEPS, toolbar }: CodeBrowserProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [treeWidth, setTreeWidth] = useState(savedTreeWidth);

  function changeTreeWidth(width: number) {
    setTreeWidth(width);
    try {
      localStorage.setItem(TREE_WIDTH_KEY, String(width));
    } catch {
      // Not critical: the width just won't be remembered.
    }
  }

  const selected =
    files.find((file) => file.path === selectedPath) ?? files.find((file) => file.path === preferredPath) ?? files[0];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-panel">
      {toolbar && <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line px-3 py-2">{toolbar}</div>}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 shrink-0 flex-col" style={{ width: treeWidth }}>
          <div className="shrink-0 border-b border-line px-3 py-2 text-[11px] font-medium text-muted">{header}</div>
          <div className="min-h-0 flex-1">
            <FileTree files={files} selectedPath={selected?.path ?? null} onSelect={setSelectedPath} freshSteps={freshSteps} />
          </div>
        </div>
        {/* Drag to make the file list wider or narrower; double-click to reset. */}
        <PanelResizer
          width={treeWidth}
          min={TREE_WIDTH.min}
          max={TREE_WIDTH.max}
          onChange={changeTreeWidth}
          onReset={() => changeTreeWidth(TREE_WIDTH.default)}
          label="Resize file list"
        />
        <div className="min-h-0 min-w-0 flex-1">
          {selected ? (
            <CodeViewer file={selected} footer={footer} />
          ) : (
            <p className="p-4 text-sm text-muted">Pick a file to see its code.</p>
          )}
        </div>
      </div>
    </div>
  );
}
