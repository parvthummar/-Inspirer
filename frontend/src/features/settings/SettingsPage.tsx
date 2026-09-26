import { CreditCard, KeyRound, Plug, UserRound } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useMe } from "../../api/auth";
import AppShell from "../../components/AppShell";
import ApiKeysSection from "./ApiKeysSection";
import BillingSection from "./BillingSection";
import ConnectedAccountsSection from "./ConnectedAccountsSection";
import ProfileSection from "./ProfileSection";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "connections", label: "Connected accounts", icon: Plug },
  { id: "api-keys", label: "API keys", icon: KeyRound },
  { id: "billing", label: "Billing and usage", icon: CreditCard },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function SettingsPage() {
  const { section = "profile" } = useParams();
  const navigate = useNavigate();
  const me = useMe();

  if (!SECTIONS.some((s) => s.id === section)) return <Navigate to="/settings/profile" replace />;
  if (!me.data) return null;
  const active = section as SectionId;

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 pb-10 pt-2 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <div className="mt-6 grid gap-6 md:grid-cols-[200px_minmax(0,1fr)]">
          {/* Phones get a menu; wider screens a side list. */}
          <label className="md:hidden">
            <span className="sr-only">Settings section</span>
            <select
              value={active}
              onChange={(event) => navigate(`/settings/${event.target.value}`)}
              className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm"
            >
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <nav aria-label="Settings" className="hidden md:block">
            <ul className="space-y-0.5">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <Link
                    to={`/settings/${id}`}
                    aria-current={active === id ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm ${
                      active === id ? "bg-panel font-medium text-ink shadow-sm ring-1 ring-line" : "text-muted hover:bg-panel hover:text-ink"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="min-w-0">
            {active === "profile" && <ProfileSection key={me.data.name} user={me.data} />}
            {active === "connections" && <ConnectedAccountsSection user={me.data} />}
            {active === "api-keys" && <ApiKeysSection user={me.data} />}
            {active === "billing" && <BillingSection />}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
