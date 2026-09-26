export type ConversationStatus = "Resolved by agent" | "Needs a person" | "With you";

export type ChatLine = { from: "customer" | "agent" | "teammate"; text: string; source?: string };

export type Conversation = {
  id: string;
  customer: string;
  topic: string;
  time: string;
  status: ConversationStatus;
  lines: ChatLine[];
};

export const conversations: Conversation[] = [
  {
    id: "c1",
    customer: "Hannah Okafor",
    topic: "Where is my order #48213?",
    time: "2 min ago",
    status: "Resolved by agent",
    lines: [
      { from: "customer", text: "Hi, my order #48213 was meant to arrive yesterday. Any update?" },
      { from: "agent", text: "Thanks Hannah. Order #48213 left our warehouse on Tuesday and is with the courier. It's due tomorrow before 6 pm. Here's the tracking link: track.example.com/48213", source: "Order lookup" },
      { from: "customer", text: "Perfect, thank you!" },
    ],
  },
  {
    id: "c2",
    customer: "Diego Ramírez",
    topic: "Refund for a damaged lamp",
    time: "9 min ago",
    status: "Needs a person",
    lines: [
      { from: "customer", text: "The lamp I got arrived with a cracked base. I'd like a refund, not a replacement." },
      { from: "agent", text: "I'm sorry about that, Diego. Refunds for damaged items over €100 need a teammate to approve, so I've passed this on with your photos. Someone will reply within 2 hours.", source: "Returns policy" },
    ],
  },
  {
    id: "c3",
    customer: "Sofia Lindqvist",
    topic: "Can I change my delivery address?",
    time: "24 min ago",
    status: "Resolved by agent",
    lines: [
      { from: "customer", text: "Can I still change the delivery address for my order?" },
      { from: "agent", text: "Yes, your order hasn't shipped yet. I've updated the address to Storgatan 12, Stockholm. You'll get a confirmation email shortly.", source: "Shipping policy" },
    ],
  },
  {
    id: "c4",
    customer: "Kwame Mensah",
    topic: "Bulk discount for 40 chairs",
    time: "1 hr ago",
    status: "Needs a person",
    lines: [
      { from: "customer", text: "We're furnishing an office and need 40 chairs. Do you offer bulk pricing?" },
      { from: "agent", text: "We do offer business pricing for large orders. I've asked our sales team to send you a quote today.", source: "Business accounts" },
    ],
  },
];

export const articles = [
  { title: "Shipping times and costs", uses: 128, updated: "3 days ago" },
  { title: "Returns and refunds policy", uses: 96, updated: "1 week ago" },
  { title: "Changing or cancelling an order", uses: 71, updated: "2 weeks ago" },
  { title: "Business accounts and bulk pricing", uses: 22, updated: "1 month ago" },
  { title: "Caring for wooden furniture", uses: 17, updated: "1 month ago" },
];

export const conversationsPerDay = [
  { label: "Mon", value: 142 },
  { label: "Tue", value: 168 },
  { label: "Wed", value: 155 },
  { label: "Thu", value: 191 },
  { label: "Fri", value: 176 },
  { label: "Sat", value: 88 },
  { label: "Sun", value: 64 },
];
