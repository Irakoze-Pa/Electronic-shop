import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getAdminOrder,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
} from "../../api/orders";
import { OrderDetailsView } from "../../components/orders/OrderDetailsView";
import type { Order, OrderStatus, PaymentStatus } from "../../types/orders";
import { formatApiError } from "../../utils/format";
const transitions: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Processing", "Cancelled"],
  Processing: ["Ready", "Cancelled"],
  Ready: ["Shipped"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};
export function AdminOrderDetailsPage() {
  const { id = "" } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const result = await getAdminOrder(id);
      setOrder(result);
      setNote(result.adminNote ?? "");
      setError("");
    } catch (reason) {
      setError(formatApiError(reason));
    }
  }, [id]);
  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);
  async function status(value: OrderStatus) {
    setBusy(true);
    try {
      setOrder(await updateAdminOrderStatus(id, value, note));
    } catch (reason) {
      setError(formatApiError(reason));
    } finally {
      setBusy(false);
    }
  }
  async function payment(value: PaymentStatus) {
    setBusy(true);
    try {
      setOrder(await updateAdminPaymentStatus(id, value));
    } catch (reason) {
      setError(formatApiError(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="bg-slate-100 p-5 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm font-bold text-[#0ea5e9]" to="/admin/orders">
          ← All orders
        </Link>
        {error && (
          <p className="mt-5 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>
        )}
        {order ? (
          <>
            <section className="my-6 grid gap-4 rounded-2xl bg-white p-5 md:grid-cols-3">
              <label className="text-sm font-bold">
                Next order status
                <select
                  className="mt-2 w-full rounded-xl border p-3"
                  disabled={busy || !transitions[order.orderStatus].length}
                  onChange={(e) => void status(e.target.value as OrderStatus)}
                  value=""
                >
                  <option value="">Choose transition</option>
                  {transitions[order.orderStatus].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold">
                Payment status
                <select
                  className="mt-2 w-full rounded-xl border p-3"
                  disabled={busy}
                  onChange={(e) =>
                    void payment(e.target.value as PaymentStatus)
                  }
                  value={order.paymentStatus}
                >
                  {["Pending", "Paid", "Failed", "Refunded"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold">
                Admin note
                <textarea
                  className="mt-2 min-h-20 w-full rounded-xl border p-3 font-normal"
                  maxLength={1000}
                  onChange={(e) => setNote(e.target.value)}
                  value={note}
                />
              </label>
            </section>
            <OrderDetailsView order={order} />
          </>
        ) : (
          !error && (
            <div className="mt-6 h-80 animate-pulse rounded-2xl bg-slate-200" />
          )
        )}
      </div>
    </main>
  );
}
