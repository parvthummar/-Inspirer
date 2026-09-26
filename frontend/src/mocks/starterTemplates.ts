import type { LucideIcon } from "lucide-react";
import { CalendarCheck, FileText, Headset, Target } from "lucide-react";

export type StarterTemplate = {
  id: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  prompt: string;
};

export const starterTemplates: StarterTemplate[] = [
  {
    id: "support-agent",
    title: "Customer support agent",
    summary: "Answers questions from your help docs and hands off to a person when unsure.",
    icon: Headset,
    prompt:
      "Build a customer support assistant for our website. It answers questions using our help center articles, " +
      "asks for an order number when someone asks about a delivery, and hands the conversation to a human " +
      "on our team when it isn't confident. Add a simple page where our team can see past conversations.",
  },
  {
    id: "leave-tracker",
    title: "Leave request tracker",
    summary: "Employees request time off, managers approve, everyone sees the team calendar.",
    icon: CalendarCheck,
    prompt:
      "Build a leave request tracker for a 40-person company. Employees submit time-off requests with dates " +
      "and a reason, their manager gets notified and approves or declines, and everyone can see a shared " +
      "team calendar. Show each person how many leave days they have left this year.",
  },
  {
    id: "lead-qualifier",
    title: "Sales lead qualifier",
    summary: "Scores new leads, researches the company and drafts a first email.",
    icon: Target,
    prompt:
      "Build a sales lead qualifier. When a new lead fills in our contact form, an agent looks up the company, " +
      "scores the lead from 1 to 10 based on size and industry, and drafts a personalised first email for " +
      "our sales rep to review. Show all leads in a list sorted by score.",
  },
  {
    id: "meeting-notes",
    title: "Meeting notes summariser",
    summary: "Turns meeting transcripts into decisions, action items and owners.",
    icon: FileText,
    prompt:
      "Build an app where I upload a meeting transcript and an agent writes a short summary, lists the decisions " +
      "made, and pulls out action items with an owner and due date for each. Keep a searchable history of " +
      "past meetings.",
  },
];
