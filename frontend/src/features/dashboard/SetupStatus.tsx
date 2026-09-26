import { CircleCheck, CircleAlert, LoaderCircle } from "lucide-react";
import { useHealth } from "../../api/health";

/** Temporary landing screen for step 1: confirms frontend, backend and database are connected. */
export default function SetupStatus() {
  const health = useHealth();

  return (
    <main className="flex h-full items-center justify-center p-4">
      <section className="w-full max-w-md rounded-lg border border-line bg-panel p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Architect</h1>
        <p className="mt-1 text-sm text-muted">Checking that everything is connected.</p>

        <div className="mt-6 flex items-center gap-2 text-sm">
          {health.isPending && (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin text-accent" aria-hidden />
              Connecting to the server
            </>
          )}
          {health.isSuccess && (
            <>
              <CircleCheck className="h-4 w-4 text-success" aria-hidden />
              Server and database connected
            </>
          )}
          {health.isError && (
            <>
              <CircleAlert className="h-4 w-4 text-danger" aria-hidden />
              Could not reach the server. Is the backend running on port 8000?
            </>
          )}
        </div>

        {health.isError && (
          <button
            type="button"
            onClick={() => health.refetch()}
            className="mt-4 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-panel hover:opacity-90"
          >
            Try again
          </button>
        )}
      </section>
    </main>
  );
}
