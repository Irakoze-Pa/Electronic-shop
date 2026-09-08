import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AuthShell, authFieldClass } from "../components/auth/AuthShell";
import { PasswordField } from "../components/auth/PasswordField";
import { useAuth } from "../auth/useAuth";
import { formatApiError } from "../utils/format";

export function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (!auth.loading && auth.user) return <Navigate replace to="/account" />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== String(data.get("confirmPassword"))) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await auth.register({
        firstName: String(data.get("firstName")),
        lastName: String(data.get("lastName")),
        email: String(data.get("email")),
        phone: String(data.get("phone")),
        password,
      });
      navigate("/account", { replace: true });
    } catch (reason: unknown) {
      setError(formatApiError(reason));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      description="Create a customer account for a faster shopping experience."
      title="Create account"
    >
      <form className="mt-7 space-y-5" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold">
            First name
            <input
              autoComplete="given-name"
              className={authFieldClass}
              maxLength={80}
              name="firstName"
              required
            />
          </label>
          <label className="block text-sm font-bold">
            Last name
            <input
              autoComplete="family-name"
              className={authFieldClass}
              maxLength={80}
              name="lastName"
              required
            />
          </label>
        </div>
        <label className="block text-sm font-bold">
          Email
          <input
            autoComplete="email"
            className={authFieldClass}
            maxLength={254}
            name="email"
            required
            type="email"
          />
        </label>
        <label className="block text-sm font-bold">
          Phone <span className="font-normal text-slate-400">(optional)</span>
          <input
            autoComplete="tel"
            className={authFieldClass}
            maxLength={30}
            name="phone"
            type="tel"
          />
        </label>
        <PasswordField
          autoComplete="new-password"
          label="Password"
          name="password"
        />
        <p className="-mt-3 text-xs text-slate-500">
          At least 8 characters with uppercase, lowercase, and a number.
        </p>
        <PasswordField
          autoComplete="new-password"
          label="Confirm password"
          name="confirmPassword"
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
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link className="font-bold text-[#1F88C9]" to="/login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
