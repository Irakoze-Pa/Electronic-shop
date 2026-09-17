import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listMyOrders } from "../api/orders";
import { AccountNav } from "../components/account/AccountNav";
import { OrderStatusBadge } from "../components/orders/OrderStatusBadge";
import type { Order } from "../types/orders";
import { currencyFormatter, formatApiError } from "../utils/format";
export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await listMyOrders());
      setError("");
    } catch (reason) {
      setError(formatApiError(reason));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);
  return (
    <main className="bg-slate-50 px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AccountNav />
        <h1 className="text-3xl font-black">Order history</h1>
        {error && (
          <p className="mt-5 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>
        )}
        {loading ? (
          <div className="mt-7 h-64 animate-pulse rounded-2xl bg-slate-200" />
        ) : !orders.length ? (
          <div className="mt-7 rounded-2xl bg-white p-12 text-center">
            <h2 className="text-xl font-black">No orders yet</h2>
            <Link
              className="mt-5 inline-block font-bold text-[#0ea5e9]"
              to="/shop"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {[
                    "Order",
                    "Date",
                    "Items",
                    "Total",
                    "Payment",
                    "Status",
                    "",
                  ].map((h) => (
                    <th className="px-5 py-4" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr className="border-t border-slate-100" key={order._id}>
                    <td className="px-5 py-4 font-black">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold">
                      {currencyFormatter.format(order.total)}
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusBadge value={order.paymentStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusBadge value={order.orderStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        className="font-bold text-[#0ea5e9]"
                        to={`/account/orders/${order._id}`}
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
