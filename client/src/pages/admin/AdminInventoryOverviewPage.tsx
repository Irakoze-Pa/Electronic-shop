import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { stockStatus } from "../../api/admin";
import { listProducts } from "../../api/catalog";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import type { Product } from "../../types/catalog";
import { formatApiError } from "../../utils/format";

export function AdminInventoryOverviewPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<"all" | "low-stock" | "out-of-stock">("all");
  const [error, setError] = useState("");
  useEffect(() => {
    const timeout = window.setTimeout(() => void listProducts({ limit: 100, sort: "name-asc" }).then((result) => setProducts(result.data)).catch((reason: unknown) => setError(formatApiError(reason))), 0);
    return () => window.clearTimeout(timeout);
  }, []);
  const units = products.reduce((sum, item) => sum + item.stock, 0);
  const low = products.filter((item) => item.stock > 0 && item.stock <= item.lowStockThreshold).length;
  const out = products.filter((item) => item.stock === 0).length;
  const visibleProducts = products.filter((item) => filter === "all" || (filter === "out-of-stock" ? item.stock === 0 : item.stock > 0 && item.stock <= item.lowStockThreshold));
  return <main className="p-5 sm:p-8"><AdminPageHeader action={<Link className="rounded-xl bg-[#0ea5e9] px-5 py-3 font-bold text-white" to="/admin/inventory/purchase-orders">Purchase orders</Link>} description="Current product balances and stock availability." eyebrow="Inventory" title="Stock overview" />
    {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
    <section className="mt-6 grid gap-4 sm:grid-cols-3"><Summary label="Units on hand" value={units} /><Summary label="Low-stock products" tone="text-amber-700" value={low} /><Summary label="Out-of-stock products" tone="text-red-700" value={out} /></section>
    <div className="mt-6 flex flex-wrap gap-2">{([['all', 'All stock'], ['low-stock', 'Low stock'], ['out-of-stock', 'Out of stock']] as const).map(([value, label]) => <button className={`rounded-full border px-4 py-2 text-sm font-bold ${filter === value ? "border-[#0ea5e9] bg-sky-50 text-[#0ea5e9]" : "bg-white"}`} key={value} onClick={() => setFilter(value)} type="button">{label}</button>)}</div>
    <div className="mt-5 overflow-x-auto rounded-2xl bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50"><tr>{["Product", "SKU", "On hand", "Threshold", "Status", "Actions"].map((heading) => <th className="px-4 py-3" key={heading}>{heading}</th>)}</tr></thead><tbody>{visibleProducts.map((item) => <tr className="border-t" key={item._id}><td className="px-4 py-4 font-bold">{item.name}</td><td className="px-4 py-4">{item.code}</td><td className="px-4 py-4 font-bold">{item.stock} {item.unit}</td><td className="px-4 py-4">{item.lowStockThreshold}</td><td className={`px-4 py-4 font-bold ${item.stock === 0 ? "text-red-700" : item.stock <= item.lowStockThreshold ? "text-amber-700" : "text-emerald-700"}`}>{stockStatus(item)}</td><td className="px-4 py-4"><Link className="mr-4 font-bold text-[#0ea5e9]" to="/admin/inventory/purchase-orders">Order</Link><Link className="font-bold text-slate-600" to={`/admin/inventory/movements?product=${item._id}`}>History</Link></td></tr>)}</tbody></table></div>
  </main>;
}
function Summary({ label, value, tone = "text-slate-900" }: { label: string; value: number; tone?: string }) { return <article className="rounded-2xl bg-white p-5"><p className="text-sm text-slate-500">{label}</p><strong className={`mt-2 block text-2xl ${tone}`}>{value}</strong></article>; }
