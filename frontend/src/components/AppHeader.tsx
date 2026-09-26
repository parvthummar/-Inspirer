import { Link } from "react-router-dom";
import { useMe } from "../api/auth";
import AccountMenu from "./AccountMenu";
import CreditsMeter from "./CreditsMeter";
import Logo from "./Logo";

export default function AppHeader() {
  const me = useMe();
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-panel/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="rounded-md">
          <Logo />
        </Link>
        {me.data && (
          <div className="flex items-center gap-3">
            <CreditsMeter />
            <AccountMenu user={me.data} />
          </div>
        )}
      </div>
    </header>
  );
}
