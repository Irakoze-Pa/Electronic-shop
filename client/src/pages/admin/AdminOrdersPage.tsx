import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listAdminOrders } from "../../api/orders";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { OrderStatusBadge } from "../../components/orders/OrderStatusBadge";
import type { Order, Pagination } from "../../types/orders";
import { currencyFormatter, formatApiError } from "../../utils/format";
export function AdminOrdersPage() {
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [error, setError] = useState("");
  const [totals, setTotals] = useState({ orderValue: 0, deliveredRevenue: 0 });
  const load = useCallback(async () => {
    try {
      const result = await listAdminOrders({
        search: params.get("search") || undefined,
        orderStatus: params.get("orderStatus") || undefined,
        paymentStatus: params.get("paymentStatus") || undefined,
        page: Number(params.get("page")) || 1,
        from: params.get("from") || undefined,
        to: params.get("to") || undefined,
        sort: params.get("sort") || undefined,
      });
      setOrders(result.data);
      setPagination(result.pagination);
      setTotals(result.totals);
      setError("");
    } catch (reason) {
      setError(formatApiError(reason));
    }
  }, [params]);
  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next = new URLSearchParams();
    for (const key of ["search", "orderStatus", "paymentStatus", "from", "to", "sort"]) {
      const value = String(data.get(key) ?? "");
      if (value) next.set(key, value);
    }
    setParams(next);
  }
  return (
    <main className="p-5 sm:p-8">
      <AdminPageHeader
        description="Search orders and manage fulfillment progress."
        title="Orders"
      />
      <form
        className="mt-7 grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-3 xl:grid-cols-7"
        onSubmit={submit}
      >
        <input
          className="rounded-xl border border-slate-300 px-4 py-2.5"
          defaultValue={params.get("search") ?? ""}
          name="search"
          placeholder="Order, customer, email"
        />
        <select
          className="rounded-xl border border-slate-300 px-3"
          defaultValue={params.get("orderStatus") ?? ""}
          name="orderStatus"
        >
          <option value="">All order statuses</option>
          {[
            "Pending",
            "Confirmed",
            "Processing",
            "Ready",
            "Shipped",
            "Delivered",
            "Cancelled",
          ].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <input className="rounded-xl border border-slate-300 px-3" defaultValue={params.get("from") ?? ""} name="from" title="From date" type="date" />
        <input className="rounded-xl border border-slate-300 px-3" defaultValue={params.get("to") ?? ""} name="to" title="To date" type="date" />
        <select className="rounded-xl border border-slate-300 px-3" defaultValue={params.get("sort") ?? "newest"} name="sort"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="total-desc">Total: high to low</option><option value="total-asc">Total: low to high</option></select>
        <select
          className="rounded-xl border border-slate-300 px-3"
          defaultValue={params.get("paymentStatus") ?? ""}
          name="paymentStatus"
        >
          <option value="">All payments</option>
          {["Pending", "Paid", "Failed", "Refunded"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <button className="rounded-xl bg-[#0ea5e9] px-5 py-2.5 font-bold text-white">
          Filter
        </button>
      </form>
      {error && (
        <p className="mt-5 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>
      )}
      <div className="mt-5 flex flex-wrap gap-5 text-sm"><span>Filtered order value: <strong>{currencyFormatter.format(totals.orderValue)}</strong></span><span>Delivered revenue: <strong>{currencyFormatter.format(totals.deliveredRevenue)}</strong></span></div>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {[
                "Order",
                "Channel",
                "Customer",
                "Date",
                "Items",
                "Total",
                "Payment",
                "Status",
                "",
              ].map((h) => (
                <th className="px-4 py-3" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr className="border-t" key={o._id}>
                <td className="px-4 py-4 font-black">{o.orderNumber}</td>
                <td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{o.salesChannel === "PhysicalShop" ? "Shop" : "Online"}</span></td>
                <td className="px-4 py-4">
                  {o.customerName}
                  <br />
                  <span className="text-xs text-slate-500">
                    {o.customerEmail}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4">
                  {o.items.reduce((sum, item) => sum + item.quantity, 0)}
                </td>
                <td className="px-4 py-4 font-bold">
                  {currencyFormatter.format(o.total)}
                </td>
                <td className="px-4 py-4">
                  <OrderStatusBadge value={o.paymentStatus} />
                </td>
                <td className="px-4 py-4">
                  <OrderStatusBadge value={o.orderStatus} />
                </td>
                <td className="px-4 py-4">
                  <Link
                    className="font-bold text-[#0ea5e9]"
                    to={`/admin/orders/${o._id}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex items-center justify-between text-sm">
        <span>{pagination.total} orders</span>
        <div className="flex gap-2">
          <button
            className="rounded-lg border px-3 py-2 disabled:opacity-40"
            disabled={pagination.page <= 1}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.set("page", String(pagination.page - 1));
              setParams(next);
            }}
          >
            Previous
          </button>
          <button
            className="rounded-lg border px-3 py-2 disabled:opacity-40"
            disabled={pagination.page >= pagination.pages}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.set("page", String(pagination.page + 1));
              setParams(next);
            }}
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
