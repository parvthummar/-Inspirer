import { useState, type FormEvent } from "react";

export default function PageAuth({ name, appName }: { name: string; appName: string }) {
  const [sent, setSent] = useState(false);
  const signingUp = /up|register|new account/i.test(name);

  function submit(event: FormEvent) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-3 rounded-xl border border-line bg-panel p-6 shadow-sm">
      <p className="text-lg font-semibold">{signingUp ? `Create your ${appName} account` : `Welcome back to ${appName}`}</p>
      {signingUp && (
        <label className="block text-sm font-medium">
          Name
          <input className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm focus:border-accent focus:outline-none" placeholder="Your name" />
        </label>
      )}
      <label className="block text-sm font-medium">
        Email
        <input type="email" className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm focus:border-accent focus:outline-none" placeholder="you@company.com" />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input type="password" className="mt-1 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm focus:border-accent focus:outline-none" placeholder="At least 8 characters" />
      </label>
      <button type="submit" className="w-full rounded-md bg-accent py-2 text-sm font-medium text-on-accent">
        {signingUp ? "Create account" : "Sign in"}
      </button>
      {sent && <p className="text-center text-xs text-muted">This is a preview, so nothing is sent.</p>}
    </form>
  );
}
