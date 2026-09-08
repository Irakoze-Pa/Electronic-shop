import { NavLink, Outlet } from "react-router-dom";

const links = [{ to: "/admin/products", label: "Products" }, { to: "/admin/categories", label: "Categories" }, { to: "/admin/brands", label: "Brands" }];
export function AdminLayout() {
  return <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[240px_1fr]"><aside className="bg-slate-950 px-5 py-6 text-white"><div className="flex items-center justify-between"><NavLink className="font-black" to="/">BBG ADMIN</NavLink><NavLink className="text-xs text-white/60 hover:text-white" to="/">Storefront ↗</NavLink></div><nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col">{links.map((link) => <NavLink className={({ isActive }) => `rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? "bg-[#1F88C9] text-white" : "text-slate-300 hover:bg-white/10"}`} key={link.to} to={link.to}>{link.label}</NavLink>)}</nav></aside><div className="min-w-0"><Outlet /></div></div>;
}
