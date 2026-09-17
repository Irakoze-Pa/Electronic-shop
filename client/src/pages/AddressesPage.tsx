import { useCallback, useEffect, useState } from "react";
import * as addressApi from "../api/addresses";
import { AccountNav } from "../components/account/AccountNav";
import { AddressForm } from "../components/account/AddressForm";
import type { Address, AddressInput } from "../types/orders";
import { formatApiError } from "../utils/format";
export function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Address | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      setAddresses(await addressApi.listAddresses());
      setError("");
    } catch (reason) {
      setError(formatApiError(reason));
    }
  }, []);
  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);
  async function save(input: AddressInput) {
    try {
      if (editing) await addressApi.updateAddress(editing._id, input);
      else await addressApi.createAddress(input);
      setEditing(null);
      setAdding(false);
      await load();
    } catch (reason) {
      setError(formatApiError(reason));
    }
  }
  return (
    <main className="bg-slate-50 px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <AccountNav />
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#f97316]">
              Your account
            </p>
            <h1 className="mt-2 text-3xl font-black">Delivery addresses</h1>
          </div>
          <button
            className="rounded-xl bg-[#0ea5e9] px-4 py-2.5 text-sm font-bold text-white"
            onClick={() => {
              setAdding(true);
              setEditing(null);
            }}
            type="button"
          >
            Add address
          </button>
        </div>
        {error && (
          <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {(adding || editing) && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
            <AddressForm
              address={editing ?? undefined}
              onCancel={() => {
                setAdding(false);
                setEditing(null);
              }}
              onSave={save}
            />
          </section>
        )}
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article
              className="rounded-2xl border border-slate-200 bg-white p-6"
              key={address._id}
            >
              <div className="flex justify-between gap-3">
                <h2 className="font-black">{address.fullName}</h2>
                {address.isDefault && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    Default
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {address.addressLine}
                <br />
                {[address.sector, address.district, address.city]
                  .filter(Boolean)
                  .join(", ")}
                <br />
                {address.country} · {address.phone}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold">
                <button
                  onClick={() => {
                    setEditing(address);
                    setAdding(false);
                  }}
                  type="button"
                >
                  Edit
                </button>
                {!address.isDefault && (
                  <button
                    className="text-[#0ea5e9]"
                    onClick={() =>
                      void addressApi
                        .setDefaultAddress(address._id)
                        .then(load)
                        .catch((e) => setError(formatApiError(e)))
                    }
                    type="button"
                  >
                    Set default
                  </button>
                )}
                <button
                  className="text-red-600"
                  onClick={() =>
                    void addressApi
                      .deleteAddress(address._id)
                      .then(load)
                      .catch((e) => setError(formatApiError(e)))
                  }
                  type="button"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
          {!addresses.length && !adding && (
            <p className="rounded-2xl bg-white p-8 text-center text-slate-500 md:col-span-2">
              No delivery addresses yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
