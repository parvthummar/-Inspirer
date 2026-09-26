export type LeadStage = "New" | "Contacted" | "Meeting booked" | "Won";

export type Lead = {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  employees: string;
  score: number;
  source: string;
  stage: LeadStage;
  research: string;
  draft: string;
};

export const STAGES: LeadStage[] = ["New", "Contacted", "Meeting booked", "Won"];

export const leads: Lead[] = [
  {
    id: "l1", name: "Elena Novak", title: "Head of Operations", company: "Brightline Logistics", industry: "Logistics", employees: "450",
    score: 9, source: "Contact form", stage: "New",
    research: "Brightline opened two new warehouses this year and is hiring 30 dispatchers. Their careers page mentions manual scheduling as a pain point.",
    draft: "Hi Elena,\n\nCongratulations on the two new Brightline warehouses. Teams growing that fast often find scheduling eats hours each week. We help operations teams like yours cut that to minutes.\n\nWould a 20-minute call next Tuesday or Wednesday work?\n\nBest,\nJordan",
  },
  {
    id: "l2", name: "Raj Patel", title: "CTO", company: "Mintleaf Health", industry: "Healthcare", employees: "120",
    score: 8, source: "Webinar", stage: "New",
    research: "Mintleaf raised a Series A in June. Raj asked a question about data residency during our webinar.",
    draft: "Hi Raj,\n\nThanks for joining our webinar and for the question about data residency. All customer data can stay in the EU region, and I'd be glad to walk you through how.\n\nAre you free for a short call this week?\n\nBest,\nJordan",
  },
  {
    id: "l3", name: "Chloe Martin", title: "Founder", company: "Petal & Stem", industry: "Retail", employees: "12",
    score: 5, source: "Contact form", stage: "Contacted",
    research: "Small online florist, 3 years old. Busy seasons around Valentine's Day and Mother's Day.",
    draft: "Hi Chloe,\n\nFollowing up on my note last week. Happy to share how other small shops handle their busy seasons.\n\nBest,\nJordan",
  },
  {
    id: "l4", name: "Tomás Silva", title: "VP Sales", company: "Northwind Energy", industry: "Energy", employees: "2,100",
    score: 7, source: "Referral", stage: "Meeting booked",
    research: "Referred by Anna at Clearwater. Northwind is replacing its CRM next quarter.",
    draft: "Hi Tomás,\n\nLooking forward to our call on Thursday. I'll bring a short demo tailored to energy sales teams.\n\nBest,\nJordan",
  },
  {
    id: "l5", name: "Grace Kim", title: "Operations Manager", company: "Harbor Dental Group", industry: "Healthcare", employees: "85",
    score: 6, source: "LinkedIn", stage: "Won",
    research: "Signed a 12-month plan on 18 Sept.",
    draft: "",
  },
  {
    id: "l6", name: "Liam O'Brien", title: "Student", company: "Personal", industry: "Other", employees: "1",
    score: 2, source: "Contact form", stage: "New",
    research: "Personal email, asked for a student discount. Not a fit for sales outreach.",
    draft: "Hi Liam,\n\nThanks for reaching out. We don't offer student plans right now, but our free tier covers most personal projects.\n\nBest,\nJordan",
  },
];
