import { useState } from "react";
import { BarChart3, BookOpen, Headset, Inbox } from "lucide-react";
import PageHeader from "../shared/PageHeader";
import SampleShell from "../shared/SampleShell";
import type { SampleAppProps } from "../types";
import ArticlesView from "./ArticlesView";
import { conversations as initialConversations } from "./data";
import InboxView from "./InboxView";
import InsightsView from "./InsightsView";

export default function SupportDeskApp({ appName, compact }: SampleAppProps) {
  const [page, setPage] = useState("inbox");
  const [conversations, setConversations] = useState(initialConversations);
  const needsPerson = conversations.filter((conversation) => conversation.status === "Needs a person").length;

  function takeOver(id: string) {
    setConversations((current) =>
      current.map((conversation) => (conversation.id === id ? { ...conversation, status: "With you" } : conversation)),
    );
  }

  return (
    <SampleShell
      appName={appName}
      accentRgb="13 148 136"
      logo={Headset}
      userName="Sam Carter"
      compact={compact}
      active={page}
      onNavigate={setPage}
      nav={[
        { id: "inbox", label: "Inbox", icon: Inbox, badge: needsPerson },
        { id: "articles", label: "Help articles", icon: BookOpen },
        { id: "insights", label: "Insights", icon: BarChart3 },
      ]}
    >
      {page === "inbox" && (
        <div className="flex h-full flex-col">
          <PageHeader title="Inbox" subtitle={`${needsPerson} conversations need a person`} />
          <div className="min-h-0 flex-1">
            <InboxView conversations={conversations} onTakeOver={takeOver} compact={compact} />
          </div>
        </div>
      )}
      {page === "articles" && <ArticlesView />}
      {page === "insights" && <InsightsView compact={compact} />}
    </SampleShell>
  );
}
