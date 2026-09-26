import { GOOGLE_CLIENT_ID } from "../../lib/googleIdentity";

/** "or" line between Google sign-in and the email form. Hidden when Google sign-in is off. */
export default function OrDivider() {
  if (!GOOGLE_CLIENT_ID) return null;
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted" aria-hidden>
      <span className="h-px flex-1 bg-line" />
      or use your email
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
