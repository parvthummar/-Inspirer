const SCRIPT_URL = "https://accounts.google.com/gsi/client";

export const GOOGLE_CLIENT_ID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

let loading: Promise<void> | null = null;

/** Loads Google's sign-in script once. Rejects if it can't be reached (offline, blocked by an extension). */
export function loadGoogleIdentity(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Google sign-in couldn't load."));
    };
    document.head.appendChild(script);
  });
  return loading;
}
