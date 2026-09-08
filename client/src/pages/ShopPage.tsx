import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { listProducts } from "../api/catalog";
import { ProductCard } from "../components/catalog/ProductCard";
import {
  EmptyState,
  ErrorState,
  LoadingGrid,
} from "../components/ui/AsyncState";
import { useCatalogOptions } from "../hooks/useCatalogOptions";
import type { CatalogStatus, Product, ProductFilters } from "../types/catalog";
import { formatApiError } from "../utils/format";

export function ShopPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const options = useCatalogOptions();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState<ProductFilters["sort"]>("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const slugCategory = options.categories.find(
    (item) => item.slug === slug,
  )?._id;

  const load = useCallback(async () => {
    if (slug && options.loading) return;
    if (slug && !slugCategory) {
      setProducts([]);
      setPagination({ page: 1, pages: 0, total: 0 });
      setError("");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await listProducts({
        search: search || undefined,
        category: slugCategory ?? (category || undefined),
        brand: brand || undefined,
        status: "Active" as CatalogStatus,
        sort,
        page,
        limit: 9,
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
  }, [
    brand,
    category,
    options.loading,
    page,
    search,
    slug,
    slugCategory,
    sort,
  ]);
  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const filterPanel = (
    <div className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-bold">Category</span>
        <select
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
          disabled={Boolean(slug)}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
          value={slugCategory ?? category}
        >
          <option value="">All categories</option>
          {options.categories
            .filter((item) => item.status === "Active")
            .map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold">Brand</span>
        <select
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
          onChange={(event) => {
            setBrand(event.target.value);
            setPage(1);
          }}
          value={brand}
        >
          <option value="">All brands</option>
          {options.brands
            .filter((item) => item.status === "Active")
            .map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
        </select>
      </label>
      <button
        className="text-sm font-bold text-[#CA7209]"
        onClick={() => {
          setCategory("");
          setBrand("");
          setPage(1);
        }}
        type="button"
      >
        Clear filters
      </button>
    </div>
  );

  return (
    <main className="bg-slate-50 px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#CA7209]">
          Curated technology
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          {slug
            ? (options.categories.find((item) => item.slug === slug)?.name ??
              "Category")
            : "Shop all products"}
        </h1>
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
          <input
            aria-label="Search catalog"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1F88C9]"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search products or SKU…"
            type="search"
            value={search}
          />
          <select
            aria-label="Sort products"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
            onChange={(event) => {
              setSort(event.target.value as ProductFilters["sort"]);
              setPage(1);
            }}
            value={sort}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name-asc">Name</option>
          </select>
          <button
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold lg:hidden"
            onClick={() => setShowFilters((value) => !value)}
            type="button"
          >
            Filters
          </button>
        </div>
        {showFilters && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 lg:hidden">
            {filterPanel}
          </div>
        )}
        <div className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr]">
          <aside className="hidden self-start rounded-2xl border border-slate-200 bg-white p-5 lg:block">
            {filterPanel}
          </aside>
          <section>
            <p className="mb-5 text-sm text-slate-500">
              {pagination.total} products
            </p>
            {loading ? (
              <LoadingGrid count={6} />
            ) : error ? (
              <ErrorState message={error} onRetry={() => void load()} />
            ) : products.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState message="No products match these filters." />
            )}
            {pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                  type="button"
                >
                  Previous
                </button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold disabled:opacity-40"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((value) => value + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
