import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../../api/admin";
import { SalesBars } from "../../components/admin/SalesBars";
import { ErrorState } from "../../components/ui/AsyncState";
import type { DashboardData } from "../../types/admin";
import { currencyFormatter, formatApiError } from "../../utils/format";

const statusColors: Record<string, string> = {
  Pending: "bg-orange-50 text-orange-700",
  Confirmed: "bg-sky-50 text-sky-700",
  Processing: "bg-indigo-50 text-indigo-700",
  Ready: "bg-cyan-50 text-cyan-700",
  Shipped: "bg-blue-50 text-blue-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-slate-100 text-slate-500",
};

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>();
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date>();
  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setData(await getDashboard());
      setError("");
      setUpdatedAt(new Date());
    } catch (reason: unknown) {
      setError(formatApiError(reason));
    } finally {
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    getDashboard()
      .then((value) => {
        if (!active) return;
        setData(value);
        setError("");
        setUpdatedAt(new Date());
      })
      .catch((reason: unknown) => {
        if (active) setError(formatApiError(reason));
      })
      .finally(() => {
        if (active) setRefreshing(false);
      });
    return () => {
      active = false;
    };
  }, []);
  if (!data && error)
    return (
      <main className="admin-page">
        <ErrorState message={error} onRetry={() => void load()} />
      </main>
    );
  if (!data)
    return (
      <main
        aria-busy="true"
        aria-label="Loading dashboard"
        className="admin-page animate-pulse"
      >
        <div className="h-52 rounded-2xl bg-slate-200" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((x) => (
            <div className="h-36 rounded-2xl bg-slate-200" key={x} />
          ))}
        </div>
      </main>
    );
  const m = data.metrics;
  const alerts = m.lowStockProducts + m.outOfStockProducts;
  const periodSales = data.salesTrend.reduce(
    (sum, item) => sum + item.sales,
    0,
  );
  const periodOrders = data.salesTrend.reduce(
    (sum, item) => sum + item.orders,
    0,
  );
  const deliveryRate = m.totalOrders
    ? Math.round((m.deliveredOrders / m.totalOrders) * 100)
    : 0;

  return (
    <main className="admin-page">
      <header className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-32 size-80 rounded-full border-[45px] border-orange-400/10"
        />
        <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-orange-400">
              Management overview
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Your business at a glance.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
              Monitor sales, prioritize customer orders, and keep your inventory
              ready.
            </p>
            <p className="mt-4 text-xs text-slate-400">
              {updatedAt
                ? `Updated ${updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Loading latest data"}{" "}
              · Overall metrics are all-time
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white hover:bg-sky-600"
              to="/admin/pos"
            >
              + New shop sale
            </Link>
            <button
              className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-bold hover:bg-slate-800 disabled:opacity-50"
              disabled={refreshing}
              onClick={() => void load()}
              type="button"
            >
              {refreshing ? "Refreshing…" : "Refresh data"}
            </button>
            <Link
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold hover:bg-orange-600"
              to="/admin/reports"
            >
              View sales report →
            </Link>
          </div>
        </div>
      </header>
      {error && (
        <div
          className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <span>Refresh failed: {error}. Showing the last loaded data.</span>
          <button
            className="font-bold underline disabled:opacity-50"
            disabled={refreshing}
            onClick={() => void load()}
            type="button"
          >
            Retry
          </button>
        </div>
      )}
      <section
        aria-label="Key business metrics"
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Kpi
          label="Delivered revenue"
          value={currencyFormatter.format(m.totalSalesValue)}
          meta={`${m.deliveredOrders} delivered orders · all-time`}
        />
        <Kpi
          label="Total orders"
          value={m.totalOrders.toLocaleString()}
          meta={`${m.pendingOrders} pending orders`}
        />
        <Kpi
          label="Customers"
          value={m.totalCustomers.toLocaleString()}
          meta="Registered customer accounts"
        />
        <Kpi
          label="Inventory alerts"
          value={alerts.toLocaleString()}
          meta={`${m.lowStockProducts} low stock · ${m.outOfStockProducts} out of stock`}
          alert={alerts > 0}
        />
      </section>
      <section
        aria-label="Priorities and shortcuts"
        className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <Link
          className="group rounded-2xl border border-sky-200 bg-sky-50 p-5 transition hover:border-sky-400 hover:bg-sky-100"
          to="/admin/pos"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-sky-500 text-xl font-black text-white">+</span>
          <h2 className="mt-4 font-black text-slate-950">Record a shop sale</h2>
          <p className="mt-2 text-xs leading-5 text-slate-600">Select products, customer, and payment, then print a receipt.</p>
          <span className="mt-4 inline-block text-xs font-bold text-sky-700 group-hover:underline">Open point of sale →</span>
        </Link>
        <Shortcut
          count={m.pendingOrders}
          title="Review pending orders"
          text="Check new orders and coordinate fulfillment."
          to="/admin/orders"
        />
        <Shortcut
          count={alerts}
          title="Review inventory"
          text="Plan replenishment for low and unavailable stock."
          to="/admin/inventory"
        />
        <Shortcut
          count={m.activeProducts}
          title="Manage your catalog"
          text={`${m.activeProducts} active of ${m.totalProducts} total products.`}
          to="/admin/products"
        />
      </section>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
        <Panel
          action="Full report"
          href="/admin/reports"
          subtitle="Delivered orders placed in the last 30 days"
          title="Sales performance"
        >
          <div className="mb-5 grid gap-5 border-b border-slate-100 pb-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Revenue in period</p>
              <p className="mt-2 text-2xl font-black tracking-tight">
                {currencyFormatter.format(periodSales)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">
                Average delivered order value
              </p>
              <p className="mt-2 text-2xl font-black tracking-tight">
                {currencyFormatter.format(
                  periodOrders ? periodSales / periodOrders : 0,
                )}
              </p>
            </div>
          </div>
          <SalesBars data={data.salesTrend} />
          <p className="mt-4 text-xs text-slate-400">
            Revenue includes delivered orders only.
          </p>
        </Panel>
        <Panel subtitle="All orders by current status" title="Order pipeline">
          <div className="mb-6 flex items-center justify-between rounded-xl bg-slate-50 p-4">
            <span className="text-sm text-slate-600">Delivered share</span>
            <strong className="text-xl text-slate-950">{deliveryRate}%</strong>
          </div>
          {data.orderStatusSummary.length ? (
            <div className="space-y-4">
              {data.orderStatusSummary.map((item) => (
                <div key={item.status}>
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-slate-600">{item.status}</span>
                    <strong>{item.count.toLocaleString()}</strong>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.status === "Delivered" ? "bg-emerald-500" : item.status === "Pending" ? "bg-orange-400" : "bg-slate-400"}`}
                      style={{
                        width: `${(item.count / Math.max(m.totalOrders, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Your order pipeline will appear when customers place orders." />
          )}
        </Panel>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel
          action="All orders"
          href="/admin/orders"
          subtitle="Latest customer purchases"
          title="Recent orders"
        >
          {data.recentOrders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] text-left text-sm">
                <thead className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="pb-3 font-semibold">Order / Customer</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="py-4 pr-3">
                        <Link
                          className="font-bold text-slate-900 hover:text-orange-700"
                          to={`/admin/orders/${order._id}`}
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">
                          {order.customerName}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="pr-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusColors[order.orderStatus] || "bg-slate-100 text-slate-600"}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="text-right text-xs font-bold">
                        {currencyFormatter.format(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty text="No orders yet. New customer purchases will appear here." />
          )}
        </Panel>
        <Panel
          action="Manage stock"
          href="/admin/inventory"
          subtitle="Products approaching their replenishment threshold"
          title="Low-stock products"
        >
          {m.outOfStockProducts > 0 && (
            <Link
              className="mb-2 block rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 hover:bg-red-100"
              to="/admin/inventory"
            >
              {m.outOfStockProducts} products are out of stock. Review inventory
              →
            </Link>
          )}
          {data.lowStockProducts.length ? (
            <div className="divide-y divide-slate-100">
              {data.lowStockProducts.map((product) => (
                <div
                  className="flex items-center justify-between gap-4 py-4"
                  key={product._id}
                >
                  <span className="min-w-0">
                    <strong className="block truncate text-sm">
                      {product.name}
                    </strong>
                    <small className="mt-1 block text-slate-400">
                      {product.code} · threshold {product.lowStockThreshold}
                    </small>
                  </span>
                  <span className="shrink-0 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
                    {product.stock} {product.unit} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="No low-stock products to review." />
          )}
        </Panel>
        <Panel
          subtitle="Units sold across non-cancelled orders · all-time"
          title="Top products"
        >
          {data.topSellingProducts.length ? (
            <div className="divide-y divide-slate-100">
              {data.topSellingProducts.map((product, index) => (
                <div className="flex items-center gap-4 py-4" key={product._id}>
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl text-xs font-black ${index === 0 ? "bg-orange-50 text-orange-700" : "bg-slate-50 text-slate-500"}`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm">
                      {product.name}
                    </strong>
                    <small className="text-slate-400">{product.sku}</small>
                  </span>
                  <span className="shrink-0 text-right">
                    <strong className="block text-xs">
                      {product.quantity} sold
                    </strong>
                    <small className="text-[10px] text-slate-400">
                      {currencyFormatter.format(product.sales)}
                    </small>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Product rankings will appear as orders come in." />
          )}
        </Panel>
        <Panel
          action="All customers"
          href="/admin/customers"
          subtitle="Recently registered customer accounts"
          title="New customers"
        >
          {data.recentCustomers.length ? (
            <div className="divide-y divide-slate-100">
              {data.recentCustomers.map((customer) => (
                <Link
                  className="flex items-center gap-3 rounded-lg py-4 hover:bg-slate-50"
                  key={customer._id}
                  to={`/admin/customers/${customer._id}`}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
                    {customer.firstName[0]}
                    {customer.lastName[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm">
                      {customer.firstName} {customer.lastName}
                    </strong>
                    <small className="block truncate text-slate-400">
                      {customer.email}
                    </small>
                  </span>
                  <span className="hidden text-[10px] text-slate-400 sm:block">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <Empty text="New customer accounts will appear here." />
          )}
        </Panel>
      </div>
    </main>
  );
}

function Kpi({
  label,
  meta,
  value,
  alert = false,
}: {
  label: string;
  meta: string;
  value: string | number;
  alert?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border bg-white p-5 shadow-sm ${alert ? "border-orange-200" : "border-slate-200"}`}
    >
      <div
        className={`mb-4 h-1 w-8 rounded-full ${alert ? "bg-orange-400" : "bg-slate-800"}`}
      />
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-3 break-words text-2xl font-black tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-3 text-xs leading-5 text-slate-500">{meta}</p>
    </article>
  );
}
function Shortcut({
  count,
  title,
  text,
  to,
}: {
  count: number;
  title: string;
  text: string;
  to: string;
}) {
  return (
    <Link
      className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-orange-300 hover:shadow-sm"
      to={to}
    >
      <span className="grid min-w-10 shrink-0 place-items-center rounded-xl bg-orange-50 px-2 py-2 text-sm font-black text-orange-700">
        {count}
      </span>
      <span>
        <strong className="text-sm text-slate-900">{title} →</strong>
        <span className="mt-2 block text-xs leading-5 text-slate-500">
          {text}
        </span>
      </span>
    </Link>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl bg-slate-50 px-5 py-8 text-center text-sm leading-6 text-slate-500">
      {text}
    </p>
  );
}
function Panel({
  action,
  children,
  href,
  subtitle,
  title,
}: {
  action?: string;
  children: ReactNode;
  href?: string;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-slate-950">{title}</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">{subtitle}</p>
        </div>
        {action && href && (
          <Link
            className="shrink-0 text-xs font-bold text-orange-700 hover:underline"
            to={href}
          >
            {action} →
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}
