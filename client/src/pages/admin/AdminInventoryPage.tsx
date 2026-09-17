import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { adjustStock, listInventory } from "../../api/admin";
import { listProducts } from "../../api/catalog";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import type { InventoryTransaction, InventoryType } from "../../types/admin";
import type { Product } from "../../types/catalog";
import { formatApiError } from "../../utils/format";

const movementLabels: Record<InventoryType, string> = {
  Increase: "Goods received",
  Decrease: "Stock issued",
  Correction: "Stock correction",
};

export function AdminInventoryPage() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [product, setProduct] = useState(params.get("product") ?? "");
  const [type, setType] = useState<"" | InventoryType>("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<InventoryType>("Increase");
  const [showAdjust, setShowAdjust] = useState(Boolean(params.get("product")));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((item) => item._id === product),
    [product, products],
  );

  const load = useCallback(async () => {
    try {
      const [productResult, transactionResult] = await Promise.all([
        listProducts({ limit: 100, sort: "name-asc" }),
        listInventory({
          product: product || undefined,
          type: type || undefined,
          from: from || undefined,
          to: to || undefined,
        }),
      ]);
      setProducts(productResult.data);
      setTransactions(transactionResult.data);
      setError("");
    } catch (reason) {
      setError(formatApiError(reason));
    }
  }, [from, product, to, type]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await adjustStock({
        product: String(form.get("product")),
        type: adjustmentType,
        quantity: Number(form.get("quantity")),
        reason: String(form.get("reason")),
        note: String(form.get("note")),
      });
      setShowAdjust(false);
      await load();
    } catch (reason) {
      setError(formatApiError(reason));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="p-5 sm:p-8">
      <AdminPageHeader
        action={
          <button
            className="rounded-xl bg-[#0ea5e9] px-5 py-3 font-bold text-white"
            onClick={() => {
              setAdjustmentType("Increase");
              setShowAdjust(true);
            }}
            type="button"
          >
            Receive goods
          </button>
        }
        description="Receive goods, issue stock, correct balances, and review every movement."
        eyebrow="Stock operations"
        title="Inventory"
      />

      {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}

      {showAdjust && (
        <form className="mt-6 rounded-2xl bg-white p-5" onSubmit={submit}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black">Record stock movement</h2>
              <p className="mt-1 text-sm text-slate-500">
                The server validates the movement and records the administrator and balance change.
              </p>
            </div>
            <button className="text-sm font-bold text-slate-500" onClick={() => setShowAdjust(false)} type="button">Close</button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Movement type">
              <select onChange={(event) => setAdjustmentType(event.target.value as InventoryType)} value={adjustmentType}>
                <option value="Increase">Goods received</option>
                <option value="Decrease">Stock issued</option>
                <option value="Correction">Stock correction</option>
              </select>
            </Field>
            <Field label="Product">
              <select name="product" onChange={(event) => setProduct(event.target.value)} required value={product}>
                <option disabled value="">Select product</option>
                {products.map((item) => <option key={item._id} value={item._id}>{item.name} · {item.stock} {item.unit}</option>)}
              </select>
            </Field>
            <Field label={adjustmentType === "Correction" ? "Correct stock balance" : "Movement quantity"}>
              <input min={adjustmentType === "Correction" ? 0 : 1} name="quantity" required type="number" />
            </Field>
            <Field label="Reason">
              <input
                defaultValue={adjustmentType === "Increase" ? "Goods received" : ""}
                key={adjustmentType}
                maxLength={120}
                name="reason"
                placeholder={adjustmentType === "Decrease" ? "Damage, internal use, return…" : "Delivery, physical count…"}
                required
              />
            </Field>
            <Field label="Reference or notes">
              <textarea maxLength={500} name="note" placeholder="Supplier, delivery note, explanation…" rows={2} />
            </Field>
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <span className="text-slate-500">Current balance</span>
              <strong className="mt-1 block text-xl">{selectedProduct ? `${selectedProduct.stock} ${selectedProduct.unit}` : "Select a product"}</strong>
              {adjustmentType === "Correction" && <p className="mt-2 text-xs text-amber-700">Correction sets the stock to the entered balance; it does not add that quantity.</p>}
            </div>
          </div>
          <button className="mt-5 rounded-xl bg-[#0ea5e9] px-5 py-3 font-bold text-white disabled:opacity-50" disabled={saving || !product}>
            {saving ? "Recording…" : `Record ${movementLabels[adjustmentType].toLowerCase()}`}
          </button>
        </form>
      )}

      <section className="mt-6 rounded-2xl bg-white p-4">
        <h2 className="font-black">Stock movement history</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <select className="rounded-xl border px-3 py-2" onChange={(event) => setProduct(event.target.value)} value={product}>
            <option value="">All products</option>
            {products.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </select>
          <select className="rounded-xl border px-3 py-2" onChange={(event) => setType(event.target.value as "" | InventoryType)} value={type}>
            <option value="">All movements</option>
            <option value="Increase">Goods received</option>
            <option value="Decrease">Stock issued</option>
            <option value="Correction">Stock corrections</option>
          </select>
          <input className="rounded-xl border px-3 py-2" onChange={(event) => setFrom(event.target.value)} title="From date" type="date" value={from} />
          <input className="rounded-xl border px-3 py-2" onChange={(event) => setTo(event.target.value)} title="To date" type="date" value={to} />
        </div>
      </section>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50"><tr>{["Date", "Product", "Movement", "Change", "Previous", "New balance", "Reason / reference", "Recorded by"].map((heading) => <th className="px-4 py-3" key={heading}>{heading}</th>)}</tr></thead>
          <tbody>{transactions.map((transaction) => {
            const movement = transaction.newStock - transaction.previousStock;
            return <tr className="border-t" key={transaction._id}>
              <td className="px-4 py-3">{new Date(transaction.createdAt).toLocaleString()}</td>
              <td className="px-4 py-3"><strong>{transaction.product?.name}</strong><br /><small>{transaction.product?.code}</small></td>
              <td className="px-4 py-3 font-semibold">{movementLabels[transaction.type]}</td>
              <td className={`px-4 py-3 font-black ${movement > 0 ? "text-emerald-700" : movement < 0 ? "text-red-700" : "text-slate-500"}`}>{movement > 0 ? "+" : ""}{movement}</td>
              <td className="px-4 py-3">{transaction.previousStock}</td>
              <td className="px-4 py-3 font-bold">{transaction.newStock}</td>
              <td className="px-4 py-3">{transaction.reason}<br /><small className="text-slate-500">{transaction.note}</small></td>
              <td className="px-4 py-3">{transaction.createdBy?.firstName} {transaction.createdBy?.lastName}<br /><small>{transaction.createdBy?.email}</small></td>
            </tr>;
          })}</tbody>
        </table>
        {!transactions.length && <p className="p-8 text-center text-sm text-slate-500">No stock movements match these filters.</p>}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-sm font-bold">{label}</span><div className="[&>*]:w-full [&>*]:rounded-xl [&>*]:border [&>*]:px-3 [&>*]:py-2.5">{children}</div></label>;
}
