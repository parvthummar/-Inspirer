import type { Message } from "../../api/messages";
import type { Project } from "../../api/projects";
import ArchitectAvatar from "./ArchitectAvatar";
import MessageSteps from "./MessageSteps";
import PlanCard from "./PlanCard";

const timeFormat = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" });

export default function ChatMessage({ message, project }: { message: Message; project: Project }) {
  const time = (
    <time
      dateTime={message.created_at}
      title={new Date(message.created_at).toLocaleString()}
      className="text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100"
    >
      {message.pending ? "Sending" : timeFormat.format(new Date(message.created_at))}
    </time>
  );

  if (message.role === "user") {
    return (
      <li className="group flex flex-col items-end gap-1">
        <div
          className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-ink/[0.06] px-3.5 py-2.5 text-sm leading-relaxed ${
            message.pending ? "opacity-70" : ""
          }`}
        >
          {message.content}
        </div>
        {time}
      </li>
    );
  }

  return (
    <li className="group flex gap-3">
      <ArchitectAvatar />
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold">Architect</span>
          {time}
        </div>
        <div className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</div>
        {message.steps.length > 0 && <MessageSteps steps={message.steps} />}
        {message.plan && <PlanCard plan={message.plan} project={project} />}
      </div>
    </li>
  );
}
