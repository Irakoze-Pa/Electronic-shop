import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

function AuthLoading() {
  return (
    <main className="grid min-h-[60vh] place-items-center text-sm text-slate-500">
      Restoring your session…
    </main>
  );
}

export function RequireAuth() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.loading) return <AuthLoading />;
  if (!auth.user)
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  return <Outlet />;
}

export function RequireAdmin() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.loading) return <AuthLoading />;
  if (!auth.user)
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  if (auth.user.role !== "Admin") return <Navigate replace to="/account" />;
  return <Outlet />;
}
