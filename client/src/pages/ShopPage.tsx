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
import { Modal } from "../components/ui/Modal";

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
    <div className="space-y-6">
      <label className="block">
        <span className="mb-2 block text-sm font-bold">Category</span>
        <select
          className="form-control"
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
          className="form-control"
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
        className="text-sm font-bold text-[#f97316]"
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
    <main className="min-h-screen bg-slate-50 px-5 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-[1440px]">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f97316]">
          Curated technology
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          {slug
            ? (options.categories.find((item) => item.slug === slug)?.name ??
              "Category")
            : "Shop all products"}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">Explore business-ready technology, genuine accessories, and dependable everyday electronics.</p>
        <div className="admin-card mt-8 flex flex-col gap-3 p-4 sm:flex-row">
          <input
            aria-label="Search catalog"
            className="form-control min-w-0 flex-1"
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
            className="form-control sm:w-52"
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
            className="button-secondary lg:hidden"
            onClick={() => setShowFilters((value) => !value)}
            type="button"
          >
            Filters
          </button>
        </div>
        <Modal description="Refine the catalog by category and brand." onClose={() => setShowFilters(false)} open={showFilters} size="md" title="Filter products"><div className="p-6">{filterPanel}<button className="button-primary mt-7 w-full" onClick={() => setShowFilters(false)} type="button">Show {pagination.total} products</button></div></Modal>
        <div className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr]">
          <aside className="admin-card hidden self-start p-6 lg:block">
            {filterPanel}
          </aside>
          <section>
            <div className="mb-5 flex items-center justify-between"><p className="text-sm font-semibold text-slate-700">{pagination.total} products</p><p className="text-xs text-slate-400">Verified catalog</p></div>
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
                  className="button-secondary disabled:opacity-40"
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
                  className="button-secondary disabled:opacity-40"
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
