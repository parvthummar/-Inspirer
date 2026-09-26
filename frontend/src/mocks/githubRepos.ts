/** Fake GitHub data for the dummy GitHub flow. */

export const organisations = ["acme-labs"];

export type ExistingRepo = { owner: string; name: string; description: string; updated: string; private: boolean };

export function existingRepos(username: string): ExistingRepo[] {
  return [
    { owner: username, name: "customer-portal", description: "Next.js portal for enterprise customers", updated: "2 days ago", private: true },
    { owner: username, name: "internal-tools", description: "Scripts and small apps for the ops team", updated: "1 week ago", private: true },
    { owner: "acme-labs", name: "support-bot", description: "First version of the support assistant", updated: "3 weeks ago", private: true },
    { owner: username, name: "landing-page", description: "Marketing site", updated: "1 month ago", private: false },
    { owner: "acme-labs", name: "data-pipelines", description: "Nightly ETL jobs", updated: "2 months ago", private: true },
  ];
}

/** A commit someone pushed on GitHub, shown after linking an existing repository. */
export const remoteCommit = { message: "Fix typo in README", author: "maria-dev", files: 1 };
