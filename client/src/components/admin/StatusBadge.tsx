import type { CatalogStatus } from "../../types/catalog";
export function StatusBadge({ status }: { status: CatalogStatus }) { return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{status}</span>; }
