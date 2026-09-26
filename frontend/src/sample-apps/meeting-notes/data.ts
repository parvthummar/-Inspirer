export type ActionItem = { id: string; text: string; owner: string; due: string; done: boolean };

export type Meeting = {
  id: string;
  title: string;
  date: string;
  duration: string;
  attendees: string[];
  summary: string;
  decisions: string[];
  actions: ActionItem[];
};

export const meetings: Meeting[] = [
  {
    id: "m1",
    title: "Q4 launch planning",
    date: "25 Sep",
    duration: "48 min",
    attendees: ["Nadia", "Ben", "Yuki", "Oscar"],
    summary:
      "The team agreed to launch the new pricing page on 14 October, one week later than planned, so support has time to update the help center. Marketing will run a small email test before the full announcement.",
    decisions: ["Launch date moves to 14 October", "Email test goes to 5% of customers first", "No changes to the free plan this quarter"],
    actions: [
      { id: "a1", text: "Update help center articles on pricing", owner: "Yuki", due: "7 Oct", done: false },
      { id: "a2", text: "Draft the announcement email", owner: "Ben", due: "3 Oct", done: true },
      { id: "a3", text: "Set up the 5% email test", owner: "Oscar", due: "8 Oct", done: false },
    ],
  },
  {
    id: "m2",
    title: "Weekly design review",
    date: "23 Sep",
    duration: "31 min",
    attendees: ["Nadia", "Lea", "Ben"],
    summary: "Reviewed the new onboarding screens. The team liked the shorter flow but wants clearer copy on the last step.",
    decisions: ["Keep the 3-step onboarding", "Rewrite the final step's button text"],
    actions: [
      { id: "a4", text: "Rewrite onboarding step 3 copy", owner: "Lea", due: "30 Sep", done: false },
      { id: "a5", text: "Share updated prototype in #design", owner: "Nadia", due: "1 Oct", done: false },
    ],
  },
  {
    id: "m3",
    title: "Customer call: Clearwater",
    date: "19 Sep",
    duration: "26 min",
    attendees: ["Oscar", "Anna (Clearwater)"],
    summary: "Clearwater wants single sign-on before rolling out to their full team of 300. They're happy with the pilot otherwise.",
    decisions: ["Offer SSO as part of the annual plan"],
    actions: [{ id: "a6", text: "Send SSO setup guide to Anna", owner: "Oscar", due: "22 Sep", done: true }],
  },
];

/** The meeting that appears after the simulated upload. */
export const uploadedMeeting: Meeting = {
  id: "m4",
  title: "Hiring sync",
  date: "26 Sep",
  duration: "22 min",
  attendees: ["Nadia", "Oscar", "Priya"],
  summary: "Two final-round candidates for the support lead role. The panel preferred Maya for her experience scaling a team from 5 to 20.",
  decisions: ["Make an offer to Maya", "Keep the second candidate warm for the Q1 opening"],
  actions: [
    { id: "a7", text: "Send offer letter to Maya", owner: "Priya", due: "29 Sep", done: false },
    { id: "a8", text: "Email second candidate with feedback", owner: "Oscar", due: "30 Sep", done: false },
  ],
};
