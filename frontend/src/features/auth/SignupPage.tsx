import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignup } from "../../api/auth";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import AuthLayout from "./AuthLayout";

const MIN_PASSWORD_LENGTH = 8;

export default function SignupPage() {
  const navigate = useNavigate();
  const signup = useSignup();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordTooShort = password.length < MIN_PASSWORD_LENGTH;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordTouched(true);
    if (passwordTooShort) return;
    signup.mutate({ name, email, password }, { onSuccess: () => navigate("/", { replace: true }) });
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Describe an app in plain words and Architect builds it."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="rounded-sm font-medium text-accent hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {signup.isError && <Alert>{signup.error.message}</Alert>}
        <TextField
          label="Name"
          autoComplete="name"
          autoFocus
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() => setPasswordTouched(password.length > 0)}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          error={passwordTouched && passwordTooShort ? `Use at least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
        />
        <Button
          type="submit"
          loading={signup.isPending}
          disabled={!name.trim() || !email || !password}
          className="w-full"
        >
          {signup.isPending ? "Creating account" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
