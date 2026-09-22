import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { ChevronIcon, CloseIcon, MenuIcon } from "../components/ui/Icons";

type NavigationItem = { to: string; label: string; icon: ReactNode; end?: boolean };

const overview: NavigationItem[] = [
  { to: "/admin", label: "Executive overview", icon: <AdminIcon name="overview" />, end: true },
  { to: "/admin/pos", label: "Point of sale", icon: <AdminIcon name="pos" /> },
  { to: "/admin/orders", label: "Orders", icon: <AdminIcon name="orders" /> },
  { to: "/admin/customers", label: "Customers", icon: <AdminIcon name="customers" /> },
  { to: "/admin/reports", label: "Reports", icon: <AdminIcon name="reports" /> },
];
const catalog: NavigationItem[] = [
  { to: "/admin/products", label: "Products", icon: <AdminIcon name="products" /> },
  { to: "/admin/categories", label: "Categories", icon: <AdminIcon name="categories" /> },
  { to: "/admin/brands", label: "Brands", icon: <AdminIcon name="brands" /> },
];
const inventory: NavigationItem[] = [
  { to: "/admin/inventory", label: "Stock overview", icon: <AdminIcon name="inventory" />, end: true },
  { to: "/admin/inventory/purchase-orders", label: "Purchase orders", icon: <AdminIcon name="purchase" /> },
  { to: "/admin/inventory/receipts", label: "Goods receipts", icon: <AdminIcon name="receipts" /> },
  { to: "/admin/inventory/movements", label: "Stock movements", icon: <AdminIcon name="movements" /> },
];
const allNavigation = [...overview, ...catalog, ...inventory];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const current = useMemo(() => [...allNavigation].sort((a, b) => b.to.length - a.to.length).find((item) => item.end ? location.pathname === item.to : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)), [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = ""; };
  }, [menuOpen]);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try { await logout(); navigate("/login", { replace: true }); }
    finally { setSigningOut(false); }
  }

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Administrator";
  const initials = `${user?.firstName?.[0] ?? "A"}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  return <div className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
    {menuOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)} type="button" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[280px] -translate-x-full flex-col bg-slate-950 text-slate-200 shadow-2xl transition-transform duration-300 print:hidden lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${menuOpen ? "translate-x-0" : ""}`}>
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
        <Link className="flex min-w-0 items-center gap-3" to="/admin"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-sky-500 text-xs font-black tracking-wider text-white">BBG</span><span className="min-w-0"><strong className="block truncate text-sm tracking-[0.08em] text-white">BBG ELECTRONICS</strong><small className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Corporate operations</small></span></Link>
        <button aria-label="Close menu" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setMenuOpen(false)} type="button"><CloseIcon className="size-5" /></button>
      </div>
      <nav aria-label="Administration navigation" className="flex-1 overflow-y-auto px-4 py-5"><NavSection items={overview} label="Management" onNavigate={() => setMenuOpen(false)} /><NavSection items={catalog} label="Catalog" onNavigate={() => setMenuOpen(false)} /><NavSection items={inventory} label="Supply and inventory" onNavigate={() => setMenuOpen(false)} /></nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-sky-500/15 text-xs font-black text-sky-300 ring-1 ring-inset ring-sky-400/20">{initials}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{fullName}</p><p className="truncate text-xs text-slate-400">{user?.email}</p></div></div>
        <div className="mt-3 grid grid-cols-2 gap-2"><Link className="rounded-lg border border-white/10 px-3 py-2 text-center text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white" to="/">View store</Link><button className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-60" disabled={signingOut} onClick={() => void signOut()} type="button">{signingOut ? "Signing out…" : "Sign out"}</button></div>
      </div>
    </aside>
    <div className="min-w-0">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="flex h-16 items-center justify-between gap-4 px-5 lg:px-10"><div className="flex min-w-0 items-center gap-3"><button aria-label="Open navigation" aria-expanded={menuOpen} className="icon-button lg:hidden" onClick={() => setMenuOpen(true)} type="button"><MenuIcon className="size-5" /></button><div className="min-w-0"><div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400"><span>Administration</span><ChevronIcon className="size-3" /><span className="truncate">{current?.label ?? "Workspace"}</span></div><p className="mt-0.5 truncate text-base font-bold tracking-tight text-slate-950">{current?.label ?? "Administration"}</p></div></div><div className="hidden items-center gap-3 sm:flex"><span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200"><span className="size-1.5 rounded-full bg-emerald-500" /> System operational</span><span className="max-w-40 truncate text-sm font-semibold text-slate-700">{fullName}</span></div></div></header>
      <Outlet />
    </div>
  </div>;
}

function NavSection({ items, label, onNavigate }: { items: NavigationItem[]; label: string; onNavigate: () => void }) {
  return <section className="mb-7"><h2 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</h2><div className="space-y-1">{items.map((item) => <NavLink className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-sky-500 text-white shadow-lg shadow-sky-950/20" : "text-slate-400 hover:bg-white/[0.07] hover:text-white"}`} end={item.end} key={item.to} onClick={onNavigate} to={item.to}><span className="grid size-5 shrink-0 place-items-center">{item.icon}</span><span className="flex-1">{item.label}</span><ChevronIcon className="size-3.5 opacity-0 transition group-hover:opacity-60" /></NavLink>)}</div></section>;
}

function AdminIcon({ name }: { name: "overview" | "pos" | "orders" | "customers" | "reports" | "products" | "categories" | "brands" | "inventory" | "purchase" | "receipts" | "movements" }) {
  const paths: Record<typeof name, ReactNode> = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    pos: <><path d="M4 4h16v16H4zM4 9h16M8 14h3M16 13v4M14 15h4" /></>,
    orders: <><path d="M6 3h12v18H6z" /><path d="M9 8h6M9 12h6M9 16h4" /></>, customers: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 7a3 3 0 0 1 0 6M17 15a5 5 0 0 1 3.5 4" /></>, reports: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>, products: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="m4 7v10l8 4 8-4V7M12 11v10" /></>, categories: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>, brands: <><path d="M20 13 13 20l-9-9V4h7l9 9Z" /><circle cx="8" cy="8" r="1" /></>, inventory: <><path d="M4 6h16v14H4zM2 3h20v3H2zM9 10h6" /></>, purchase: <><path d="M5 4h14v17H5zM8 2v4M16 2v4M8 10h8M8 14h6" /></>, receipts: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></>, movements: <><path d="M4 7h14M14 3l4 4-4 4M20 17H6M10 13l-4 4 4 4" /></>,
  };
  return <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">{paths[name]}</svg>;
}
