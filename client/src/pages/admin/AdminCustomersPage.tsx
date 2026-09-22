import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { createCustomer, listCustomers } from "../../api/admin";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { Modal } from "../../components/ui/Modal";
import type { Customer, Paginated } from "../../types/admin";
import { currencyFormatter, formatApiError } from "../../utils/format";

const emptyPagination = { page: 1, limit: 20, total: 0, pages: 0 };

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Paginated<Customer>["pagination"]>(emptyPagination);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async (nextPage = page, nextSearch = search, nextStatus = status) => {
    setLoading(true);
    try {
      const result = await listCustomers({ search: nextSearch || undefined, status: nextStatus || undefined, page: nextPage });
      setCustomers(result.data); setPagination(result.pagination); setError("");
    } catch (reason) { setError(formatApiError(reason)); }
    finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  function submit(event: FormEvent) { event.preventDefault(); setPage(1); void load(1); }

  return <main className="admin-page">
    <AdminPageHeader title="Customers" description="Create customer accounts and review customer value, contact details, addresses, and orders." action={<button className="button-primary" onClick={() => setModalOpen(true)} type="button">+ Add customer</button>} />
    <section className="mt-6 grid gap-4 sm:grid-cols-3">
      <Summary label="Customers found" value={pagination.total.toLocaleString()} />
      <Summary label="Active on this page" value={customers.filter((customer) => customer.status === "Active").length.toLocaleString()} />
      <Summary label="Page value" value={currencyFormatter.format(customers.reduce((sum, customer) => sum + (customer.totalSpent ?? 0), 0))} />
    </section>
    <form className="admin-card mt-6 flex flex-wrap gap-3 p-4" onSubmit={submit}><input className="form-control min-w-64 flex-1" onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or phone" value={search} /><select className="form-control w-auto min-w-44" onChange={(event) => setStatus(event.target.value)} value={status}><option value="">All statuses</option><option>Active</option><option>Inactive</option></select><button className="button-primary" type="submit">Search</button></form>
    {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}
    <section className="admin-card mt-6 overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["Customer", "Contact", "Status", "Orders", "Total spent", "Joined", ""].map((heading) => <th className="px-5 py-3" key={heading}>{heading}</th>)}</tr></thead><tbody>
      {customers.map((customer) => <tr className="border-t border-slate-100 hover:bg-slate-50/70" key={customer._id}><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-sky-50 text-xs font-black text-sky-700">{customer.firstName[0]}{customer.lastName[0]}</span><strong>{customer.firstName} {customer.lastName}</strong></div></td><td className="px-5 py-4">{customer.email}<br /><small className="text-slate-500">{customer.phone || "No phone"}</small></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${customer.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{customer.status}</span></td><td className="px-5 py-4">{customer.totalOrders ?? 0}</td><td className="px-5 py-4 font-bold">{currencyFormatter.format(customer.totalSpent ?? 0)}</td><td className="px-5 py-4 text-slate-500">{new Date(customer.createdAt).toLocaleDateString()}</td><td className="px-5 py-4"><Link className="font-bold text-sky-600 hover:underline" to={`/admin/customers/${customer._id}`}>View profile</Link></td></tr>)}
      {!loading && !customers.length && <tr><td className="px-5 py-14 text-center text-slate-500" colSpan={7}>No customers match these filters.</td></tr>}
      {loading && <tr><td className="px-5 py-14 text-center text-slate-500" colSpan={7}>Loading customers…</td></tr>}
    </tbody></table></div><footer className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm"><span>Page {pagination.page} of {Math.max(1, pagination.pages)} · {pagination.total} customers</span><div className="flex gap-2"><button className="button-secondary px-3 py-2" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} type="button">Previous</button><button className="button-secondary px-3 py-2" disabled={page >= pagination.pages || loading} onClick={() => setPage((value) => value + 1)} type="button">Next</button></div></footer></section>
    <CreateCustomerModal onClose={() => setModalOpen(false)} onCreated={(customer) => { setModalOpen(false); setSearch(""); setStatus(""); setPage(1); void load(1, "", ""); setCustomers((current) => [customer, ...current].slice(0, 20)); }} open={modalOpen} />
  </main>;
}

function CreateCustomerModal({ onClose, onCreated, open }: { onClose: () => void; onCreated: (customer: Customer) => void; open: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    try { onCreated(await createCustomer({ firstName: String(data.get("firstName")), lastName: String(data.get("lastName")), email: String(data.get("email")), phone: String(data.get("phone")), temporaryPassword: String(data.get("temporaryPassword")) })); }
    catch (reason) { setError(formatApiError(reason)); }
    finally { setBusy(false); }
  }
  return <Modal description="Create an active customer account that can be selected during a shop sale." onClose={onClose} open={open} size="md" title="Add customer"><form className="p-6" onSubmit={submit}>{error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}<div className="grid gap-4 sm:grid-cols-2"><Field label="First name" name="firstName" /><Field label="Last name" name="lastName" /><Field label="Email address" name="email" type="email" /><Field label="Phone number" name="phone" required={false} /><label className="text-sm font-bold sm:col-span-2">Temporary password<input className="form-control mt-1" minLength={8} name="temporaryPassword" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}" required type="password" /><span className="mt-1 block text-xs font-normal text-slate-500">At least 8 characters with uppercase, lowercase, and a number.</span></label></div><p className="mt-4 text-xs leading-5 text-slate-500">Share the temporary password securely with the customer. Do not send it together with other sensitive account details.</p><div className="mt-6 flex justify-end gap-3"><button className="button-secondary" disabled={busy} onClick={onClose} type="button">Cancel</button><button className="button-primary" disabled={busy} type="submit">{busy ? "Creating…" : "Create customer"}</button></div></form></Modal>;
}

function Field({ label, name, required = true, type = "text" }: { label: string; name: string; required?: boolean; type?: string }) { return <label className="text-sm font-bold">{label}<input className="form-control mt-1" maxLength={type === "email" ? 254 : 80} name={name} required={required} type={type} /></label>; }
function Summary({ label, value }: { label: string; value: string }) { return <article className="admin-card p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><strong className="mt-2 block text-2xl">{value}</strong></article>; }
