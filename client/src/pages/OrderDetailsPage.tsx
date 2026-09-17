import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { cancelMyOrder, getMyOrder } from "../api/orders";
import { AccountNav } from "../components/account/AccountNav";
import { OrderDetailsView } from "../components/orders/OrderDetailsView";
import type { Order } from "../types/orders";
import { formatApiError } from "../utils/format";
export function OrderDetailsPage() {
  const { id = "" } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      setOrder(await getMyOrder(id));
      setError("");
    } catch (reason) {
      setError(formatApiError(reason));
    }
  }, [id]);
  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);
  async function cancel() {
    setBusy(true);
    try {
      setOrder(await cancelMyOrder(id));
    } catch (reason) {
      setError(formatApiError(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="bg-slate-50 px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <AccountNav />
        {error && (
          <p className="mb-5 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>
        )}
        {order ? (
          <OrderDetailsView
            actions={
              order.orderStatus === "Pending" ? (
                <button
                  className="basis-full text-left text-sm font-bold text-red-600 disabled:opacity-50"
                  disabled={busy}
                  onClick={() => void cancel()}
                  type="button"
                >
                  {busy ? "Cancelling…" : "Cancel order"}
                </button>
              ) : undefined
            }
            order={order}
          />
        ) : (
          !error && (
            <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
          )
        )}
      </div>
    </main>
  );
}
