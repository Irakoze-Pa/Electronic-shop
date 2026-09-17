import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as addressApi from "../api/addresses";
import * as orderApi from "../api/orders";
import { useCart } from "../cart/useCart";
import { AddressForm } from "../components/account/AddressForm";
import type {
  Address,
  AddressInput,
  CheckoutSummary,
  PaymentMethod,
} from "../types/orders";
import { currencyFormatter, formatApiError } from "../utils/format";
export function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [selected, setSelected] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CashOnDelivery");
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, totals] = await Promise.all([
        addressApi.listAddresses(),
        orderApi.getCheckoutSummary(),
      ]);
      setAddresses(list);
      setSummary(totals);
      setSelected((current) =>
        list.some((address) => address._id === current) ? current : "",
      );
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
  async function saveAddress(input: AddressInput) {
    try {
      const created = await addressApi.createAddress(input);
      setAdding(false);
      await load();
      setSelected(created._id);
    } catch (reason) {
      setError(formatApiError(reason));
    }
  }
  async function place() {
    if (submitting) return;
    if (!selected) {
      setError("Please add or select a delivery address before placing your order.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const order = await orderApi.createOrder({
        addressId: selected,
        paymentMethod,
        customerNote: note,
      });
      await cart.refreshCart();
      navigate(`/order-success/${order._id}`, { state: { order } });
    } catch (reason) {
      const message = formatApiError(reason);
      await load();
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }
  if (loading)
    return (
      <main className="mx-auto min-h-[60vh] max-w-7xl px-5 py-12">
        <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
      </main>
    );
  if (!summary?.items.length)
    return (
      <main className="mx-auto grid min-h-[60vh] place-items-center px-5 text-center">
        <div>
          <h1 className="text-3xl font-black">Your cart is empty</h1>
          <Link
            className="mt-6 inline-block rounded-xl bg-[#0ea5e9] px-5 py-3 font-bold text-white"
            to="/shop"
          >
            Shop products
          </Link>
        </div>
      </main>
    );
  return (
    <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <h1 className="text-4xl font-black">Checkout</h1>
      {error && (
        <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-7">
          <section className="rounded-2xl border border-slate-200 p-6">
            <div className="flex justify-between">
              <h2 className="text-xl font-black">Delivery address</h2>
              <button
                className="text-sm font-bold text-[#0ea5e9]"
                onClick={() => setAdding(!adding)}
                type="button"
              >
                {adding ? "Close" : "Add new"}
              </button>
            </div>
            {adding && (
              <div className="mt-5 border-t pt-5">
                <AddressForm
                  onCancel={() => setAdding(false)}
                  onSave={saveAddress}
                />
              </div>
            )}
            <div className="mt-5 grid gap-3">
              {addresses.map((address) => (
                <label
                  className={`cursor-pointer rounded-xl border p-4 ${selected === address._id ? "border-[#0ea5e9] bg-sky-50" : "border-slate-200"}`}
                  key={address._id}
                >
                  <input
                    checked={selected === address._id}
                    className="mr-3"
                    name="address"
                    onChange={() => setSelected(address._id)}
                    type="radio"
                  />
                  <strong>{address.fullName}</strong>
                  {address.isDefault && (
                    <span className="ml-2 text-xs text-emerald-700">
                      Default
                    </span>
                  )}
                  <p className="ml-6 mt-1 text-sm text-slate-600">
                    {address.addressLine}, {address.city} · {address.phone}
                  </p>
                </label>
              ))}
              {!addresses.length && !adding && (
                <p className="text-sm text-slate-500">
                  Add a delivery address to continue.
                </p>
              )}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-black">Payment method</h2>
            <div className="mt-4 space-y-3">
              {(["CashOnDelivery", "BankTransfer"] as PaymentMethod[]).map(
                (method) => (
                  <label
                    className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-4"
                    key={method}
                  >
                    <input
                      checked={paymentMethod === method}
                      name="payment"
                      onChange={() => setPaymentMethod(method)}
                      type="radio"
                    />
                    <span>
                      <strong>
                        {method === "CashOnDelivery"
                          ? "Cash on delivery"
                          : "Bank transfer"}
                      </strong>
                      <p className="text-sm text-slate-500">
                        {method === "CashOnDelivery"
                          ? "Pay when your order arrives."
                          : "Transfer instructions will be provided manually."}
                      </p>
                    </span>
                  </label>
                ),
              )}
            </div>
            <label className="mt-5 block text-sm font-bold">
              Order note
              <textarea
                className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 p-3 font-normal"
                maxLength={1000}
                onChange={(e) => setNote(e.target.value)}
                value={note}
              />
            </label>
          </section>
        </div>
        <aside className="h-fit rounded-2xl bg-sky-600 p-6 text-white lg:sticky lg:top-36">
          <h2 className="text-xl font-black">Order summary</h2>
          <div className="mt-5 space-y-4">
            {summary.items.map((item) => (
              <div className="flex gap-3" key={item.product._id}>
                {item.product.images[0] && (
                  <img
                    alt=""
                    className="size-14 rounded-lg object-cover"
                    src={item.product.images[0]}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-slate-400">Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-bold">
                  {currencyFormatter.format(item.lineSubtotal)}
                </span>
              </div>
            ))}
          </div>
          <dl className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{currencyFormatter.format(summary.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{currencyFormatter.format(summary.shippingFee)}</dd>
            </div>
            <div className="flex justify-between text-lg font-black">
              <dt>Total</dt>
              <dd>{currencyFormatter.format(summary.total)}</dd>
            </div>
          </dl>
          <button
            className="mt-6 w-full rounded-xl bg-[#f97316] px-5 py-3 font-bold disabled:opacity-50"
            disabled={!selected || submitting}
            onClick={() => void place()}
            type="button"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </aside>
      </div>
    </main>
  );
}
