import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useMe } from "../../api/auth";
import Button from "../../components/Button";
import FullPageLoader from "../../components/FullPageLoader";

/** Renders children only for a logged-in user; otherwise sends them to /login and back afterwards. */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const me = useMe();
  const location = useLocation();

  if (me.isPending) return <FullPageLoader label="Loading your workspace" />;
  if (me.isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-sm text-muted">
        <p>{me.error.message}</p>
        <Button variant="secondary" onClick={() => me.refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  if (!me.data) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
