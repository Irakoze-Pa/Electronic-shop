import type { Order } from "../../types/orders";
import { currencyFormatter } from "../../utils/format";
import { OrderStatusBadge } from "./OrderStatusBadge";
export function OrderDetailsView({
  order,
  actions,
}: {
  order: Order;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <p className="text-sm text-slate-500">Order</p>
          <h1 className="text-3xl font-black">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <OrderStatusBadge value={order.orderStatus} />
          <OrderStatusBadge value={order.paymentStatus} />
        </div>
        {actions}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-black">Items</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {order.items.map((item) => (
            <div
              className="flex items-center gap-4 py-4"
              key={`${item.product}-${item.sku}`}
            >
              {item.image ? (
                <img
                  alt={item.productName}
                  className="size-16 rounded-xl object-cover"
                  src={item.image}
                />
              ) : (
                <div className="size-16 rounded-xl bg-slate-100" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold">{item.productName}</p>
                <p className="text-sm text-slate-500">
                  {item.sku} · {currencyFormatter.format(item.unitPrice)} ×{" "}
                  {item.quantity}
                </p>
              </div>
              <p className="font-black">
                {currencyFormatter.format(item.subtotal)}
              </p>
            </div>
          ))}
        </div>
      </section>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-black">Shipping</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.addressLine}
            <br />
            {[
              order.shippingAddress.sector,
              order.shippingAddress.district,
              order.shippingAddress.city,
            ]
              .filter(Boolean)
              .join(", ")}
            <br />
            {order.shippingAddress.country} · {order.shippingAddress.phone}
          </p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-black">Payment and totals</h2>
          <p className="mt-2 text-sm text-slate-600">
            {order.paymentMethod === "CashOnDelivery"
              ? "Cash on delivery"
              : "Bank transfer"}
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{currencyFormatter.format(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{currencyFormatter.format(order.shippingFee)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2 font-black">
              <dt>Total</dt>
              <dd>{currencyFormatter.format(order.total)}</dd>
            </div>
          </dl>
        </section>
      </div>
      {order.customerNote && (
        <section className="rounded-2xl bg-white p-6">
          <h2 className="font-black">Customer note</h2>
          <p className="mt-2 text-sm text-slate-600">{order.customerNote}</p>
        </section>
      )}
      {order.adminNote && (
        <section className="rounded-2xl bg-white p-6">
          <h2 className="font-black">Admin note</h2>
          <p className="mt-2 text-sm text-slate-600">{order.adminNote}</p>
        </section>
      )}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-black">Status history</h2>
        <ol className="mt-4 space-y-4">
          {order.statusHistory.map((entry, index) => (
            <li
              className="border-l-2 border-[#0ea5e9] pl-4"
              key={`${entry.changedAt}-${index}`}
            >
              <OrderStatusBadge value={entry.status} />
              <p className="mt-1 text-xs text-slate-500">
                {new Date(entry.changedAt).toLocaleString()}{" "}
                {entry.note && `· ${entry.note}`}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
