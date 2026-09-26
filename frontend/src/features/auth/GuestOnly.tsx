import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useMe } from "../../api/auth";
import FullPageLoader from "../../components/FullPageLoader";

/** Login and signup pages: a user who is already logged in goes straight to the dashboard. */
export default function GuestOnly({ children }: { children: ReactNode }) {
  const me = useMe();
  if (me.isPending) return <FullPageLoader label="Loading" />;
  if (me.data) return <Navigate to="/" replace />;
  return <>{children}</>;
}
