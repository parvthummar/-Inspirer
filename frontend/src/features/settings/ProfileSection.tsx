import { useState, type FormEvent } from "react";
import { useChangePassword, useUpdateProfile, type User } from "../../api/auth";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import { useToast } from "../../components/toast-context";
import SettingsCard from "./SettingsCard";

const MIN_PASSWORD_LENGTH = 8;
const joined = new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" });

export default function ProfileSection({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const toast = useToast();

  const nameChanged = name.trim() !== user.name && name.trim().length > 0;
  const tooShort = next.length > 0 && next.length < MIN_PASSWORD_LENGTH;

  function saveName(event: FormEvent) {
    event.preventDefault();
    if (nameChanged) updateProfile.mutate(name.trim(), { onSuccess: () => toast("Profile saved") });
  }

  function savePassword(event: FormEvent) {
    event.preventDefault();
    if (!current || next.length < MIN_PASSWORD_LENGTH) return;
    changePassword.mutate(
      { current_password: current, password: next },
      {
        onSuccess: () => {
          setCurrent("");
          setNext("");
          toast("Password changed");
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={saveName}>
        <SettingsCard
          title="Profile"
          description={`Member since ${joined.format(new Date(user.created_at))}.`}
          footer={
            <Button type="submit" disabled={!nameChanged} loading={updateProfile.isPending}>
              Save profile
            </Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} autoComplete="name" />
            <TextField label="Email" value={user.email} disabled hint="Used to log in. Contact support to change it." />
          </div>
          {updateProfile.isError && (
            <div className="mt-3">
              <Alert>{updateProfile.error.message}</Alert>
            </div>
          )}
        </SettingsCard>
      </form>

      {!user.has_password ? (
        <SettingsCard title="Password" description="You sign in with Google, so there's no password to manage here.">
          <p className="text-sm text-muted">
            To change how you sign in, update your Google account's security settings. Signing in keeps working as long as you
            can sign in to Google.
          </p>
        </SettingsCard>
      ) : (
        <form onSubmit={savePassword}>
          <SettingsCard
            title="Password"
            description="Use at least 8 characters. You'll stay logged in on this device."
            footer={
              <Button type="submit" disabled={!current || next.length < MIN_PASSWORD_LENGTH} loading={changePassword.isPending}>
                Change password
              </Button>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Current password"
                type="password"
                value={current}
                onChange={(event) => setCurrent(event.target.value)}
                autoComplete="current-password"
              />
              <TextField
                label="New password"
                type="password"
                value={next}
                onChange={(event) => setNext(event.target.value)}
                autoComplete="new-password"
                error={tooShort ? `Use at least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
              />
            </div>
            {changePassword.isError && (
              <div className="mt-3">
                <Alert>{changePassword.error.message}</Alert>
              </div>
            )}
          </SettingsCard>
        </form>
      )}
    </div>
  );
}
