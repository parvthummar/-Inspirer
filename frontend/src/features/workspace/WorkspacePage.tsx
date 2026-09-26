import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import { useProject } from "../../api/projects";
import Button from "../../components/Button";
import FullPageLoader from "../../components/FullPageLoader";
import ChatPanel from "./ChatPanel";
import PanelResizer from "./PanelResizer";
import { useBuildProgress } from "./useBuildProgress";
import WorkspaceHeader from "./WorkspaceHeader";
import WorkspaceRightPanel from "./WorkspaceRightPanel";

const CHAT_WIDTH = { min: 340, max: 600, default: 420 };
const CHAT_WIDTH_STORAGE_KEY = "architect.chatWidth";

function readSavedChatWidth(): number {
  try {
    const saved = Number(localStorage.getItem(CHAT_WIDTH_STORAGE_KEY));
    if (saved >= CHAT_WIDTH.min && saved <= CHAT_WIDTH.max) return saved;
  } catch {
    // Storage can be unavailable (private mode); fall back to the default.
  }
  return CHAT_WIDTH.default;
}

export default function WorkspacePage() {
  const { id = "" } = useParams();
  const project = useProject(id);
  const progress = useBuildProgress(project.data);
  const [chatWidth, setChatWidth] = useState(readSavedChatWidth);

  function changeChatWidth(width: number) {
    setChatWidth(width);
    try {
      localStorage.setItem(CHAT_WIDTH_STORAGE_KEY, String(width));
    } catch {
      // Not critical: the width just won't be remembered.
    }
  }

  if (project.isPending) return <FullPageLoader label="Opening your project" />;

  if (project.isError) {
    const notFound = project.error instanceof ApiError && project.error.status === 404;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm font-medium">{notFound ? "Project not found" : "We couldn't open this project"}</p>
        <p className="max-w-sm text-sm text-muted">{project.error.message}</p>
        <div className="mt-2 flex gap-2">
          {!notFound && (
            <Button variant="secondary" onClick={() => project.refetch()}>
              Try again
            </Button>
          )}
          <Link to="/" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-panel hover:bg-accent/90">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-[1024px] flex-col">
      <WorkspaceHeader project={project.data} />
      <div className="flex min-h-0 flex-1">
        <div style={{ width: chatWidth }} className="shrink-0">
          <ChatPanel project={project.data} progress={progress} />
        </div>
        <PanelResizer width={chatWidth} min={CHAT_WIDTH.min} max={CHAT_WIDTH.max} onChange={changeChatWidth} />
        <div className="min-w-0 flex-1">
          <WorkspaceRightPanel project={project.data} progress={progress} />
        </div>
      </div>
    </div>
  );
}
