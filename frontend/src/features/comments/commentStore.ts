import { useLocalState } from "../../lib/localStore";

/** Preview comments are a dummy flow, kept per project in the browser. */

export type Reply = { id: string; author: string; text: string; at: string };

export type PreviewComment = {
  id: string;
  /** Position as a percentage of the preview, so pins stay put when the frame is resized. */
  x: number;
  y: number;
  /** The app page the comment was left on (its heading), so pins only show there. */
  page: string;
  author: string;
  mine: boolean;
  text: string;
  at: string;
  resolved: boolean;
  replies: Reply[];
};

export function useComments(projectId: string) {
  const [comments, setComments] = useLocalState<PreviewComment[]>(`architect.comments.${projectId}`);
  return { comments: comments ?? [], setComments };
}

/** Replies a teammate might leave, picked by the comment's wording. */
export function teammateReply(text: string): string {
  const lower = text.toLowerCase();
  if (/colou?r|green|red|blue|brand/.test(lower)) return "Agreed, the brand colour would work better here.";
  if (/text|label|wording|copy|say/.test(lower)) return "Good catch. Clearer wording would help new people a lot.";
  if (/big|small|size|space/.test(lower)) return "Yes, it feels a bit cramped on my laptop too.";
  if (/\?$/.test(lower.trim())) return "I think so, but let's check with the team on Friday.";
  return "Makes sense to me. Want me to ask Architect to change it?";
}
