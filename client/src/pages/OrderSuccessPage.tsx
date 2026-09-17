import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getMyOrder } from "../api/orders";
import type { Order } from "../types/orders";
import { currencyFormatter } from "../utils/format";
export function OrderSuccessPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const passed = (location.state as { order?: Order } | null)?.order;
  const [order, setOrder] = useState<Order | null>(passed ?? null);
  useEffect(() => {
    if (!order) void getMyOrder(id).then(setOrder);
  }, [id, order]);
  if (!order)
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <p>Loading your order…</p>
      </main>
    );
  return (
    <main className="mx-auto grid min-h-[65vh] max-w-2xl place-items-center px-5 py-16 text-center">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
          ✓
        </div>
        <h1 className="mt-5 text-3xl font-black">Order placed successfully</h1>
        <p className="mt-3 text-slate-500">
          We received order <strong>{order.orderNumber}</strong>.
        </p>
        <dl className="mx-auto mt-7 max-w-sm space-y-3 text-sm">
          <div className="flex justify-between">
            <dt>Total</dt>
            <dd className="font-black">
              {currencyFormatter.format(order.total)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Payment</dt>
            <dd>
              {order.paymentMethod === "CashOnDelivery"
                ? "Cash on delivery"
                : "Bank transfer"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Status</dt>
            <dd>{order.orderStatus}</dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-slate-600">
          Deliver to {order.shippingAddress.fullName},{" "}
          {order.shippingAddress.addressLine}, {order.shippingAddress.city}.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            className="rounded-xl bg-[#0ea5e9] px-5 py-3 font-bold text-white"
            to={`/account/orders/${order._id}`}
          >
            View order
          </Link>
          <Link
            className="rounded-xl border border-slate-300 px-5 py-3 font-bold"
            to="/shop"
          >
            Continue shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
