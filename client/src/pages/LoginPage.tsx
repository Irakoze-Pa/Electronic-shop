import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthShell, authFieldClass } from "../components/auth/AuthShell";
import { PasswordField } from "../components/auth/PasswordField";
import { useAuth } from "../auth/useAuth";
import { formatApiError } from "../utils/format";

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (!auth.loading && auth.user)
    return (
      <Navigate
        replace
        to={auth.user.role === "Admin" ? "/admin/products" : "/account"}
      />
    );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    setError("");
    try {
      const user = await auth.login({
        email: String(data.get("email")),
        password: String(data.get("password")),
      });
      const requested = (location.state as { from?: string } | null)?.from;
      navigate(
        user.role === "Admin" ? (requested ?? "/admin/products") : "/account",
        { replace: true },
      );
    } catch (reason: unknown) {
      setError(formatApiError(reason));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      description="Sign in to manage your account or catalog."
      title="Welcome back"
    >
      <form className="mt-7 space-y-5" onSubmit={submit}>
        <label className="block text-sm font-bold">
          Email
          <input
            autoComplete="email"
            className={authFieldClass}
            name="email"
            required
            type="email"
          />
        </label>
        <PasswordField
          autoComplete="current-password"
          label="Password"
          name="password"
        />
        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          className="w-full rounded-xl bg-[#1F88C9] px-5 py-3 font-bold text-white disabled:opacity-50"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        New customer?{" "}
        <Link className="font-bold text-[#1F88C9]" to="/register">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
