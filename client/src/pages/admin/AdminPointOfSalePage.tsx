import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { listCustomers } from "../../api/admin";
import { listProducts } from "../../api/catalog";
import { createPhysicalSale, listAdminOrders } from "../../api/orders";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import type { Customer } from "../../types/admin";
import type { Product } from "../../types/catalog";
import type { Order } from "../../types/orders";
import { currencyFormatter, formatApiError } from "../../utils/format";

type SaleLine = { product: Product; quantity: number };
type PosPaymentMethod = "Cash" | "MobileMoney" | "Card" | "BankTransfer";

export function AdminPointOfSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [recentSales, setRecentSales] = useState<Order[]>([]);
  const [cart, setCart] = useState<SaleLine[]>([]);
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("Walk-in customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PosPaymentMethod>("Cash");
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [productResult, customerResult, saleResult] = await Promise.all([
        listProducts({ status: "Active", limit: 100, sort: "name-asc" }),
        listCustomers({ status: "Active" }),
        listAdminOrders({ salesChannel: "PhysicalShop", sort: "newest" }),
      ]);
      setProducts(productResult.data);
      setCustomers(customerResult.data);
      setRecentSales(saleResult.data.slice(0, 8));
      setError("");
    } catch (reason) { setError(formatApiError(reason)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products.slice(0, 18);
    return products.filter((product) => product.name.toLowerCase().includes(query) || product.code.toLowerCase().includes(query)).slice(0, 18);
  }, [products, search]);
  const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const total = Math.max(0, subtotal - discount);
  const change = Math.max(0, amountPaid - total);

  function add(product: Product) {
    setCompleted(null);
    setCart((current) => {
      const existing = current.find((line) => line.product._id === product._id);
      if (existing) return current.map((line) => line.product._id === product._id ? { ...line, quantity: Math.min(product.stock, line.quantity + 1) } : line);
      return [...current, { product, quantity: 1 }];
    });
  }
  function quantity(productId: string, next: number) {
    setCart((current) => current.map((line) => line.product._id === productId ? { ...line, quantity: Math.max(1, Math.min(line.product.stock, next)) } : line));
  }
  function chooseCustomer(value: string) {
    setCustomerId(value);
    const customer = customers.find((item) => item._id === value);
    setCustomerName(customer ? `${customer.firstName} ${customer.lastName}` : "Walk-in customer");
    setCustomerPhone(customer?.phone ?? "");
  }
  async function completeSale(event: FormEvent) {
    event.preventDefault();
    if (!cart.length) return setError("Add at least one product to the sale");
    if (discount > subtotal) return setError("Discount cannot exceed the subtotal");
    if (amountPaid < total) return setError("Amount received cannot be less than the total");
    setSaving(true);
    try {
      const order = await createPhysicalSale({
        ...(customerId ? { customerId } : {}), customerName, customerPhone,
        paymentMethod, amountPaid, discount, note,
        items: cart.map((line) => ({ product: line.product._id, quantity: line.quantity })),
      });
      setCompleted(order);
      setRecentSales((current) => [order, ...current].slice(0, 8));
      setProducts((current) => current.map((product) => {
        const sold = cart.find((line) => line.product._id === product._id);
        return sold ? { ...product, stock: product.stock - sold.quantity } : product;
      }));
      setCart([]); setDiscount(0); setAmountPaid(0); setNote(""); setError("");
    } catch (reason) { setError(formatApiError(reason)); }
    finally { setSaving(false); }
  }

  return <main className="admin-page print:p-0">
    <div className="print:hidden"><AdminPageHeader description="Record counter sales, receive payment, update stock, and issue a receipt." title="Point of sale" /></div>
    {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 print:hidden" role="alert">{error}</p>}
    {completed && <Receipt order={completed} onClose={() => setCompleted(null)} />}
    <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,.8fr)] print:hidden">
      <section className="admin-card p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-lg font-black">Products</h2><p className="text-sm text-slate-500">Search by product name or SKU.</p></div><input className="form-control sm:max-w-xs" onChange={(event) => setSearch(event.target.value)} placeholder="Search products" value={search} /></div>
        {loading ? <div className="mt-5 h-72 animate-pulse rounded-xl bg-slate-100" /> : <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => <button className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-sky-400 hover:bg-sky-50 disabled:opacity-40" disabled={product.stock < 1} key={product._id} onClick={() => add(product)} type="button"><p className="truncate font-bold">{product.name}</p><p className="mt-1 text-xs text-slate-500">{product.code} · {product.stock} {product.unit}</p><p className="mt-3 font-black text-sky-700">{currencyFormatter.format(product.price)}</p></button>)}
          {!visibleProducts.length && <p className="col-span-full py-12 text-center text-sm text-slate-500">No available products found.</p>}
        </div>}
      </section>
      <form className="admin-card h-fit p-5 xl:sticky xl:top-24" onSubmit={completeSale}>
        <div className="flex items-center justify-between"><div><h2 className="text-lg font-black">Current sale</h2><p className="text-sm text-slate-500">{cart.reduce((sum, line) => sum + line.quantity, 0)} items</p></div>{cart.length > 0 && <button className="text-xs font-bold text-red-600" onClick={() => setCart([])} type="button">Clear</button>}</div>
        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">
          {cart.map((line) => <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3" key={line.product._id}><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{line.product.name}</p><p className="text-xs text-slate-500">{currencyFormatter.format(line.product.price)} each</p></div><input aria-label={`Quantity for ${line.product.name}`} className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-sm" max={line.product.stock} min="1" onChange={(event) => quantity(line.product._id, Number(event.target.value))} type="number" value={line.quantity} /><button aria-label={`Remove ${line.product.name}`} className="text-lg text-slate-400 hover:text-red-600" onClick={() => setCart((current) => current.filter((item) => item.product._id !== line.product._id))} type="button">×</button></div>)}
          {!cart.length && <p className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">Select products to begin.</p>}
        </div>
        <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
          <label className="block text-sm font-bold">Customer<select className="form-control mt-1" onChange={(event) => chooseCustomer(event.target.value)} value={customerId}><option value="">Walk-in customer</option>{customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.firstName} {customer.lastName} · {customer.phone || customer.email}</option>)}</select></label>
          {!customerId && <div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold">Customer name<input className="form-control mt-1" maxLength={160} onChange={(event) => setCustomerName(event.target.value)} value={customerName} /></label><label className="text-xs font-bold">Phone optional<input className="form-control mt-1" maxLength={30} onChange={(event) => setCustomerPhone(event.target.value)} value={customerPhone} /></label></div>}
          <div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold">Payment<select className="form-control mt-1" onChange={(event) => setPaymentMethod(event.target.value as PosPaymentMethod)} value={paymentMethod}><option value="Cash">Cash</option><option value="MobileMoney">Mobile Money</option><option value="Card">Card</option><option value="BankTransfer">Bank transfer</option></select></label><label className="text-xs font-bold">Discount<input className="form-control mt-1" min="0" onChange={(event) => setDiscount(Number(event.target.value))} type="number" value={discount} /></label></div>
          <label className="block text-xs font-bold">Amount received<input className="form-control mt-1" min="0" onChange={(event) => setAmountPaid(Number(event.target.value))} required type="number" value={amountPaid} /></label>
          <label className="block text-xs font-bold">Sale note optional<textarea className="form-control mt-1 min-h-16" maxLength={500} onChange={(event) => setNote(event.target.value)} value={note} /></label>
        </div>
        <dl className="mt-5 space-y-2 border-t border-slate-200 pt-4 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{currencyFormatter.format(subtotal)}</dd></div><div className="flex justify-between"><dt>Discount</dt><dd>− {currencyFormatter.format(discount)}</dd></div><div className="flex justify-between text-lg font-black"><dt>Total</dt><dd>{currencyFormatter.format(total)}</dd></div><div className="flex justify-between text-emerald-700"><dt>Change</dt><dd>{currencyFormatter.format(change)}</dd></div></dl>
        <button className="button-primary mt-5 w-full" disabled={saving || !cart.length || amountPaid < total} type="submit">{saving ? "Completing sale…" : "Complete sale"}</button>
      </form>
    </div>
    <section className="admin-card mt-6 overflow-hidden print:hidden"><div className="flex items-center justify-between p-5"><div><h2 className="text-lg font-black">Recent shop sales</h2><p className="text-sm text-slate-500">Latest completed counter transactions.</p></div><button className="text-sm font-bold text-sky-600" onClick={() => void load()} type="button">Refresh</button></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Receipt</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Payment</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Date</th></tr></thead><tbody>{recentSales.map((sale) => <tr className="border-t border-slate-100" key={sale._id}><td className="px-5 py-4 font-bold">{sale.orderNumber}</td><td className="px-5 py-4">{sale.customerName}</td><td className="px-5 py-4">{paymentLabel(sale.paymentMethod)}</td><td className="px-5 py-4 font-bold">{currencyFormatter.format(sale.total)}</td><td className="px-5 py-4 text-slate-500">{new Date(sale.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div></section>
  </main>;
}

function Receipt({ order, onClose }: { order: Order; onClose: () => void }) {
  return <section className="mx-auto mb-6 mt-5 max-w-xl rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm print:m-0 print:max-w-none print:border-0 print:shadow-none"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">BBG Electronics</p><h2 className="mt-1 text-2xl font-black">Sales receipt</h2><p className="text-sm text-slate-500">{order.orderNumber} · {new Date(order.createdAt).toLocaleString()}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 print:hidden">Sale complete</span></div><div className="mt-5 border-y border-slate-200 py-4"><p className="text-sm"><strong>Customer:</strong> {order.customerName}{order.customerPhone ? ` · ${order.customerPhone}` : ""}</p>{order.items.map((item) => <div className="mt-3 flex justify-between gap-4 text-sm" key={item.product}><span>{item.productName} × {item.quantity}</span><strong>{currencyFormatter.format(item.subtotal)}</strong></div>)}</div><dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{currencyFormatter.format(order.subtotal)}</dd></div>{order.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>− {currencyFormatter.format(order.discount)}</dd></div>}<div className="flex justify-between text-lg font-black"><dt>Total</dt><dd>{currencyFormatter.format(order.total)}</dd></div><div className="flex justify-between"><dt>{paymentLabel(order.paymentMethod)} received</dt><dd>{currencyFormatter.format(order.amountPaid)}</dd></div><div className="flex justify-between"><dt>Change</dt><dd>{currencyFormatter.format(order.changeReturned)}</dd></div></dl><p className="mt-6 text-center text-xs text-slate-500">Thank you for shopping with BBG Electronics.</p><div className="mt-5 flex gap-3 print:hidden"><button className="button-primary flex-1" onClick={() => window.print()} type="button">Print receipt</button><button className="button-secondary" onClick={onClose} type="button">New sale</button></div></section>;
}

function paymentLabel(method: Order["paymentMethod"]) {
  return ({ CashOnDelivery: "Cash on delivery", BankTransfer: "Bank transfer", Cash: "Cash", MobileMoney: "Mobile Money", Card: "Card" })[method];
}
