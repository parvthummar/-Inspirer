import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { GOOGLE_CLIENT_ID, loadGoogleIdentity } from "../../lib/googleIdentity";

type GoogleSignInButtonProps = {
  context: "signin" | "signup";
  onCredential: (credential: string) => void;
  busy: boolean;
};

const BUTTON_WIDTH = 336;

/** Google's own "Continue with Google" button. Renders nothing when Google sign-in isn't configured. */
export default function GoogleSignInButton({ context, onCredential, busy }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential;
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadGoogleIdentity()
      .then(() => {
        const container = containerRef.current;
        const google = window.google;
        if (cancelled || !container || !google) return;
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => callbackRef.current(response.credential),
          context,
          ux_mode: "popup",
        });
        google.accounts.id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "center",
          width: Math.min(BUTTON_WIDTH, container.clientWidth || BUTTON_WIDTH),
        });
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("unavailable"));
    return () => {
      cancelled = true;
    };
  }, [context]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="relative">
      <div ref={containerRef} className={`flex min-h-[44px] justify-center ${busy ? "pointer-events-none opacity-50" : ""}`} />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-md border border-line text-sm text-muted">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
          Loading Google sign-in
        </div>
      )}
      {status === "unavailable" && (
        <p className="rounded-md border border-line px-3 py-2.5 text-center text-xs text-muted">
          Google sign-in couldn't load. Check your connection or ad blocker, or use your email below.
        </p>
      )}
      {busy && (
        <p className="mt-2 flex items-center justify-center gap-2 text-xs text-muted" role="status">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
          Signing you in with Google
        </p>
      )}
    </div>
  );
}
