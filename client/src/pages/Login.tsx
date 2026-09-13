import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CircleAlert, LoaderCircle } from "lucide-react";
import { AuthLayout } from "../components/AuthLayout";
import { GoogleButton, OrDivider, googleEnabled } from "../components/GoogleButton";
import { PasswordInput } from "../components/PasswordInput";
import { errorMessage } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/pools";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const done = () => navigate(from, { replace: true });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      done();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see what everyone's been adding."
      footer={
        <>
          New to Afterglow?{" "}
          <Link to="/signup" state={location.state} className="text-sand-50 underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <GoogleButton onSuccess={done} onError={setError} />
      {googleEnabled && <OrDivider />}

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm text-sand-200">Email</span>
          <input className="field" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-sand-200">Password</span>
          <PasswordInput autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </label>

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2.5 text-sm text-rose-200">
            <CircleAlert className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full">
          {submitting ? <LoaderCircle className="size-4 animate-spin" /> : <>Log in <ArrowRight className="size-4" /></>}
        </button>
      </form>
    </AuthLayout>
  );
}
