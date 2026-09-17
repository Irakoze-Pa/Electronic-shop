import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { listAddresses } from "../api/addresses";
import { listMyOrders } from "../api/orders";
import { useAuth } from "../auth/useAuth";
import { useCart } from "../cart/useCart";
import { useWishlist } from "../wishlist/useWishlist";
import { AccountNav } from "../components/account/AccountNav";
import { OrderStatusBadge } from "../components/orders/OrderStatusBadge";
import { CartIcon, HeartIcon, TruckIcon } from "../components/ui/Icons";
import type { Address, Order } from "../types/orders";
import { currencyFormatter, formatApiError } from "../utils/format";

export function AccountPage() {
  const { user } = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const [orders, setOrders] = useState<Order[]>();
  const [addresses, setAddresses] = useState<Address[]>();
  const [errors, setErrors] = useState<{ orders?: string; addresses?: string }>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const [orderResult, addressResult] = await Promise.allSettled([
      listMyOrders(),
      listAddresses(),
    ]);
    if (orderResult.status === "fulfilled")
      setOrders(
        [...orderResult.value].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    if (addressResult.status === "fulfilled") setAddresses(addressResult.value);
    setErrors({
      orders:
        orderResult.status === "rejected"
          ? formatApiError(orderResult.reason)
          : undefined,
      addresses:
        addressResult.status === "rejected"
          ? formatApiError(addressResult.reason)
          : undefined,
    });
    setLoading(false);
  }, []);
  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);
  if (!user) return null;
  const active = orders?.filter(
    (order) => !["Delivered", "Cancelled"].includes(order.orderStatus),
  );
  const defaultAddress = addresses?.find((address) => address.isDefault);
  return (
    <main className="bg-slate-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">My account</p>
            <h1 className="mt-1 break-words text-2xl font-bold text-slate-950">
              Hi, {user.firstName}
            </h1>
          </div>
          <Link
            className="inline-flex min-h-11 shrink-0 items-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            to="/shop"
          >
            Shop →
          </Link>
        </header>
        <AccountNav />
        <section
          aria-label="Account summary"
          className="grid grid-cols-3 gap-2 sm:gap-4"
        >
          <Summary
            icon={<TruckIcon className="size-5" />}
            label="Active orders"
            value={loading && !orders ? "…" : (active?.length ?? "—")}
            to="/account/orders"
          />
          <Summary
            icon={<HeartIcon className="size-5" />}
            label="Saved"
            value={
              wishlist.loading
                ? "…"
                : wishlist.error
                  ? "—"
                  : wishlist.wishlistCount
            }
            to="/wishlist"
          />
          <Summary
            icon={<CartIcon className="size-5" />}
            label="Cart"
            value={cart.loading ? "…" : cart.error ? "—" : cart.cartCount}
            to="/cart"
          />
        </section>
        {(errors.orders ||
          errors.addresses ||
          cart.error ||
          wishlist.error) && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {errors.orders && <p>Orders unavailable.</p>}
            {errors.addresses && <p>Addresses unavailable.</p>}
            {cart.error && (
              <Link className="block min-h-11 py-3 underline" to="/cart">
                Reload cart
              </Link>
            )}
            {wishlist.error && (
              <Link className="block min-h-11 py-3 underline" to="/wishlist">
                Reload saved products
              </Link>
            )}
          </div>
        )}
        <Panel title="Recent orders" action="View all" to="/account/orders">
          {!orders ? (
            <LoadingOrUnavailable loading={loading} />
          ) : orders.length ? (
            <div className="divide-y divide-slate-100">
              {orders.slice(0, 3).map((order) => (
                <Link
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-4 hover:bg-slate-50"
                  key={order._id}
                  to={`/account/orders/${order._id}`}
                >
                  <strong className="min-w-0 break-all text-sm">
                    {order.orderNumber}
                  </strong>
                  <OrderStatusBadge value={order.orderStatus} />
                  <span className="text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-right text-sm font-semibold">
                    {currencyFormatter.format(order.total)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm text-slate-500">No orders yet.</p>
              <Link
                className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-orange-700"
                to="/shop"
              >
                Start shopping →
              </Link>
            </div>
          )}
        </Panel>
        <div className="grid gap-5 sm:grid-cols-2">
          <Panel title="Delivery address" action="Edit" to="/account/addresses">
            {!addresses ? (
              <LoadingOrUnavailable loading={loading} />
            ) : defaultAddress ? (
              <address className="break-words text-sm not-italic leading-6 text-slate-600">
                <strong className="text-slate-900">
                  {defaultAddress.fullName}
                </strong>
                <br />
                {defaultAddress.addressLine}
                <br />
                {[
                  defaultAddress.sector,
                  defaultAddress.district,
                  defaultAddress.city,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </address>
            ) : (
              <Link
                className="inline-flex min-h-11 items-center text-sm font-semibold text-orange-700"
                to="/account/addresses"
              >
                {addresses.length ? "Choose default address" : "Add address"} →
              </Link>
            )}
          </Panel>
          <Panel title="Profile">
            <p className="break-words text-sm font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-2 break-all text-sm text-slate-600">
              {user.email}
            </p>
            {user.phone && (
              <p className="mt-2 text-sm text-slate-600">{user.phone}</p>
            )}
            {user.role === "Admin" && (
              <Link
                className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-orange-700"
                to="/admin"
              >
                Admin dashboard →
              </Link>
            )}
          </Panel>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 pb-16">
          <Link
            className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-700 hover:text-orange-700"
            to="/contact"
          >
            Contact support →
          </Link>
          <button
            className="min-h-11 px-3 text-sm font-semibold text-orange-700 disabled:opacity-50"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              void load();
            }}
            type="button"
          >
            {loading ? "Loading…" : "Refresh ↻"}
          </button>
        </footer>
      </div>
    </main>
  );
}

function Summary({
  icon,
  label,
  value,
  to,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  to: string;
}) {
  return (
    <Link
      className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-4 hover:border-orange-300 sm:px-5"
      to={to}
    >
      <span aria-hidden="true" className="block text-orange-600">
        {icon}
      </span>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">
        {label}
      </p>
    </Link>
  );
}
function Panel({
  title,
  children,
  action,
  to,
}: {
  title: string;
  children: ReactNode;
  action?: string;
  to?: string;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
      <header className="mb-2 flex min-h-11 items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {action && to && (
          <Link
            className="inline-flex min-h-11 items-center px-1 text-sm font-semibold text-orange-700"
            to={to}
          >
            {action} →
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}
function LoadingOrUnavailable({ loading }: { loading: boolean }) {
  return loading ? (
    <div
      aria-busy="true"
      aria-label="Loading"
      className="my-3 h-16 animate-pulse rounded-lg bg-slate-100"
    />
  ) : (
    <p className="py-3 text-sm text-slate-500">Unavailable</p>
  );
}
