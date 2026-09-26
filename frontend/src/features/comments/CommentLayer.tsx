import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMe } from "../../api/auth";
import type { Project } from "../../api/projects";
import { useToast } from "../../components/toast-context";
import { useTeam } from "../team/teamStore";
import CommentThread, { THREAD_WIDTH } from "./CommentThread";
import { teammateReply, useComments, type PreviewComment } from "./commentStore";

type CommentLayerProps = {
  project: Project;
  commenting: boolean;
  showResolved: boolean;
  children: ReactNode;
};

const REPLY_AFTER_MS = 7000;
const THREAD_HEIGHT = 260;

function currentPage(root: HTMLElement | null): string {
  return root?.querySelector("main h1")?.textContent?.trim() || "home";
}

/**
 * Pins comments onto the running app. In comment mode, a click drops a new pin; clicking a pin
 * opens its thread. Pins belong to the page they were left on.
 */
export default function CommentLayer({ project, commenting, showResolved, children }: CommentLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const me = useMe();
  const { comments, setComments } = useComments(project.id);
  const { team } = useTeam(project.id);
  const toast = useToast();
  const [page, setPage] = useState("home");
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  // Track which app page is showing, so the right pins appear.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const update = () => setPage(currentPage(root));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  // In comment mode, a click anywhere in the app starts a new comment there.
  useEffect(() => {
    const container = containerRef.current;
    if (!commenting || !container) return;
    function handleClick(event: MouseEvent) {
      if (!container || (event.target instanceof Element && event.target.closest("[data-comment-ui]"))) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = container.getBoundingClientRect();
      setOpenId(null);
      setDraft({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
    }
    container.addEventListener("click", handleClick, true);
    return () => container.removeEventListener("click", handleClick, true);
  }, [commenting]);

  useEffect(() => {
    if (!commenting) setDraft(null);
  }, [commenting]);

  // Simulated: a teammate who has joined replies to your newest unanswered comment.
  const teammates = useMemo(() => team.members.filter((member) => member.status === "joined"), [team.members]);
  const unanswered = comments.find((c) => c.mine && !c.resolved && c.replies.length === 0);
  useEffect(() => {
    if (!unanswered || teammates.length === 0) return;
    const teammate = teammates[unanswered.text.length % teammates.length];
    const wait = Math.max(0, new Date(unanswered.at).getTime() + REPLY_AFTER_MS - Date.now());
    const timer = window.setTimeout(() => {
      setComments(
        comments.map((c) =>
          c.id === unanswered.id
            ? { ...c, replies: [{ id: `r${Date.now()}`, author: teammate.name, text: teammateReply(c.text), at: new Date().toISOString() }] }
            : c,
        ),
      );
      toast(`${teammate.name} replied to your comment`);
    }, wait);
    return () => window.clearTimeout(timer);
  }, [unanswered, teammates, comments, setComments, toast]);

  const visible = comments
    .map((comment, index) => ({ comment, number: index + 1 }))
    .filter(({ comment }) => comment.page === page && (showResolved || !comment.resolved));

  function threadPosition(x: number, y: number) {
    const container = containerRef.current;
    const width = container?.clientWidth ?? 800;
    const height = container?.clientHeight ?? 600;
    const px = (x / 100) * width;
    const py = (y / 100) * height;
    return {
      left: Math.min(Math.max(8, px + 16), width - THREAD_WIDTH - 8),
      top: Math.min(Math.max(8, py - 16), Math.max(8, height - THREAD_HEIGHT)),
    };
  }

  function post(text: string) {
    if (!draft || !me.data) return;
    const comment: PreviewComment = {
      id: `c${Date.now()}`,
      x: draft.x,
      y: draft.y,
      page,
      author: me.data.name,
      mine: true,
      text,
      at: new Date().toISOString(),
      resolved: false,
      replies: [],
    };
    setComments([...comments, comment]);
    setDraft(null);
    setOpenId(comment.id);
    toast("Comment posted");
  }

  function update(id: string, change: (comment: PreviewComment) => PreviewComment) {
    setComments(comments.map((c) => (c.id === id ? change(c) : c)));
  }

  const open = comments.find((c) => c.id === openId);
  const openNumber = comments.findIndex((c) => c.id === openId) + 1;

  return (
    <div ref={containerRef} className={`relative h-full ${commenting ? "cursor-cell" : ""}`}>
      {children}

      {visible.map(({ comment, number }) => (
        <button
          key={comment.id}
          type="button"
          data-comment-ui
          onClick={() => {
            setDraft(null);
            setOpenId(openId === comment.id ? null : comment.id);
          }}
          aria-label={`Comment ${number} by ${comment.author}${comment.resolved ? ", resolved" : ""}`}
          style={{ left: `${comment.x}%`, top: `${comment.y}%` }}
          className={`absolute z-20 flex h-7 w-7 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full rounded-bl-none text-xs font-semibold shadow-md ring-2 ring-panel ${
            comment.resolved ? "bg-surface text-muted" : "bg-accent text-panel"
          }`}
        >
          {number}
        </button>
      ))}

      {draft && (
        <>
          <span
            data-comment-ui
            style={{ left: `${draft.x}%`, top: `${draft.y}%` }}
            className="absolute z-20 flex h-7 w-7 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full rounded-bl-none bg-accent text-xs font-semibold text-panel shadow-md ring-2 ring-panel"
            aria-hidden
          >
            +
          </span>
          <CommentThread position={threadPosition(draft.x, draft.y)} onSubmit={post} onClose={() => setDraft(null)} />
        </>
      )}

      {open && !draft && (
        <CommentThread
          key={open.id}
          comment={open}
          number={openNumber}
          position={threadPosition(open.x, open.y)}
          onSubmit={(text) =>
            update(open.id, (c) => ({
              ...c,
              replies: [...c.replies, { id: `r${Date.now()}`, author: me.data?.name ?? "You", text, at: new Date().toISOString() }],
            }))
          }
          onToggleResolved={() => {
            update(open.id, (c) => ({ ...c, resolved: !c.resolved }));
            toast(open.resolved ? "Comment reopened" : "Comment resolved");
            if (!open.resolved && !showResolved) setOpenId(null);
          }}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
