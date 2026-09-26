import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGoogleLogin, useLogin } from "../../api/auth";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import AuthLayout from "./AuthLayout";
import GoogleSignInButton from "./GoogleSignInButton";
import OrDivider from "./OrDivider";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const googleLogin = useGoogleLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    login.mutate({ email, password }, { onSuccess: () => navigate(redirectTo, { replace: true }) });
  }

  return (
    <AuthLayout
      title="Log in to Architect"
      subtitle="Pick up where you left off."
      footer={
        <>
          New to Architect?{" "}
          <Link to="/signup" className="rounded-sm font-medium text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {googleLogin.isError && (
        <div className="mb-4">
          <Alert>{googleLogin.error.message}</Alert>
        </div>
      )}
      <GoogleSignInButton
        context="signin"
        busy={googleLogin.isPending}
        onCredential={(credential) => googleLogin.mutate(credential, { onSuccess: () => navigate(redirectTo, { replace: true }) })}
      />
      <OrDivider />
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {login.isError && <Alert>{login.error.message}</Alert>}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" loading={login.isPending} disabled={!email || !password} className="w-full">
          {login.isPending ? "Logging in" : "Log in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
