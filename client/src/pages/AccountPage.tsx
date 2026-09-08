import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function AccountPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const user = auth.user!;
  async function signOut() {
    await auth.logout();
    navigate("/", { replace: true });
  }
  return (
    <main className="bg-slate-50 px-5 py-14 lg:px-8">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#CA7209]">
          Your account
        </p>
        <h1 className="mt-3 text-3xl font-black">
          {user.firstName} {user.lastName}
        </h1>
        <dl className="mt-8 divide-y divide-slate-100">
          <AccountRow label="Email" value={user.email} />
          {user.phone && <AccountRow label="Phone" value={user.phone} />}
          <AccountRow label="Role" value={user.role} />
          <AccountRow label="Status" value={user.status} />
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          {user.role === "Admin" && (
            <Link
              className="rounded-xl bg-[#1F88C9] px-5 py-3 text-sm font-bold text-white"
              to="/admin/products"
            >
              Open admin dashboard
            </Link>
          )}
          <button
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold"
            onClick={() => void signOut()}
            type="button"
          >
            Log out
          </button>
        </div>
      </section>
    </main>
  );
}

function AccountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[140px_1fr]">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
