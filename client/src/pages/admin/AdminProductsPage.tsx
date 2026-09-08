import { useCallback, useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "../../api/catalog";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { ProductForm } from "../../components/admin/ProductForm";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { EmptyState, ErrorState } from "../../components/ui/AsyncState";
import { useCatalogOptions } from "../../hooks/useCatalogOptions";
import type { CatalogStatus, Product, ProductInput } from "../../types/catalog";
import { currencyFormatter, formatApiError } from "../../utils/format";

export function AdminProductsPage() {
  const options = useCatalogOptions();
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState<"" | CatalogStatus>("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listProducts({
        search: search || undefined,
        category: category || undefined,
        brand: brand || undefined,
        status: status || undefined,
        page,
        limit: 10,
      });
      setProducts(result.data);
      setPagination({
        page: result.pagination.page,
        pages: result.pagination.pages,
        total: result.pagination.total,
      });
      setError("");
    } catch (reason: unknown) {
      setError(formatApiError(reason));
    } finally {
      setLoading(false);
    }
  }, [brand, category, page, search, status]);
  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);
  async function save(input: ProductInput) {
    setSaving(true);
    try {
      if (editing) await updateProduct(editing._id, input);
      else await createProduct(input);
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (reason: unknown) {
      setError(formatApiError(reason));
    } finally {
      setSaving(false);
    }
  }
  async function remove(product: Product) {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    try {
      await deleteProduct(product._id);
      await load();
    } catch (reason: unknown) {
      setError(formatApiError(reason));
    }
  }
  return (
    <main className="p-5 sm:p-8">
      <AdminPageHeader
        action={
          <button
            className="rounded-xl bg-[#1F88C9] px-5 py-3 text-sm font-bold text-white"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            type="button"
          >
            Create product
          </button>
        }
        description="Create, edit, filter, and maintain your product catalog."
        title="Products"
      />
      {(error || options.error) && (
        <div className="mt-6">
          <ErrorState
            message={error || options.error}
            onRetry={() => {
              void load();
              void options.retry();
            }}
          />
        </div>
      )}
      {showForm && (
        <ProductForm
          brands={options.brands}
          categories={options.categories}
          initial={editing}
          key={editing?._id ?? "new-product"}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={save}
          saving={saving}
        />
      )}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search products…"
            value={search}
          />
          <FilterSelect
            label="All categories"
            onChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
            options={options.categories.map((item) => ({
              label: item.name,
              value: item._id,
            }))}
            value={category}
          />
          <FilterSelect
            label="All brands"
            onChange={(value) => {
              setBrand(value);
              setPage(1);
            }}
            options={options.brands.map((item) => ({
              label: item.name,
              value: item._id,
            }))}
            value={brand}
          />
          <FilterSelect
            label="All statuses"
            onChange={(value) => {
              setStatus(value as "" | CatalogStatus);
              setPage(1);
            }}
            options={[
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ]}
            value={status}
          />
        </div>
      </section>
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-4xl text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Product</th>
                <th>Code</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {product.images[0] ? (
                        <img
                          alt=""
                          className="size-11 rounded-lg object-cover"
                          src={product.images[0]}
                        />
                      ) : (
                        <span className="grid size-11 place-items-center rounded-lg bg-slate-100 text-xs font-black text-[#1F88C9]">
                          BBG
                        </span>
                      )}
                      <strong>{product.name}</strong>
                    </div>
                  </td>
                  <td>{product.code}</td>
                  <td>{product.category.name}</td>
                  <td className="font-semibold">
                    {currencyFormatter.format(product.price)}
                  </td>
                  <td>
                    {product.stock} {product.unit}
                  </td>
                  <td>
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-5 text-right">
                    <button
                      className="mr-4 font-bold text-[#1F88C9]"
                      onClick={() => {
                        setEditing(product);
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="font-bold text-red-600"
                      onClick={() => void remove(product)}
                      type="button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="p-5 text-center text-sm text-slate-500">
            Loading products…
          </div>
        )}
        {!loading && !products.length && (
          <div className="p-5">
            <EmptyState message="No products match your filters." />
          </div>
        )}
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm">
          <span>{pagination.total} products</span>
          <div className="flex items-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
              type="button"
            >
              Previous
            </button>
            <span>
              {pagination.page}/{Math.max(pagination.pages, 1)}
            </span>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((value) => value + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <select
      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm"
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
