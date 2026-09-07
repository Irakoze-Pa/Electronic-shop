import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/catalog/ProductCard";
import { categories, products, shopCategories } from "../data/catalog";

type SortOption = "featured" | "price-low" | "price-high" | "rating";

export function ShopPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    slug ? [categories.find((item) => item.slug === slug)?.name ?? ""] : [],
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(2500000);
  const [sort, setSort] = useState<SortOption>("featured");
  const [showFilters, setShowFilters] = useState(false);
  const brands = [...new Set(products.map((product) => product.brand))].sort();

  const visibleProducts = (() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products
      .filter(
        (product) =>
          !normalizedQuery ||
          `${product.name} ${product.brand} ${product.category} ${product.sku}`
            .toLowerCase()
            .includes(normalizedQuery),
      )
      .filter(
        (product) =>
          !selectedCategories.length ||
          selectedCategories.includes(product.category),
      )
      .filter(
        (product) =>
          !selectedBrands.length || selectedBrands.includes(product.brand),
      )
      .filter((product) => product.price <= maxPrice)
      .sort((a, b) =>
        sort === "price-low"
          ? a.price - b.price
          : sort === "price-high"
            ? b.price - a.price
            : sort === "rating"
              ? b.rating - a.rating
              : Number(b.isFeatured) - Number(a.isFeatured),
      );
  })();

  function toggle(
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  const filters = (
    <div className="space-y-8">
      <FilterGroup title="Categories">
        {shopCategories.map((category) => (
          <CheckFilter
            checked={selectedCategories.includes(category)}
            key={category}
            label={category}
            onChange={() => toggle(category, setSelectedCategories)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Brands">
        {brands.map((brand) => (
          <CheckFilter
            checked={selectedBrands.includes(brand)}
            key={brand}
            label={brand}
            onChange={() => toggle(brand, setSelectedBrands)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Maximum price">
        <input
          aria-label="Maximum price"
          className="w-full accent-[#1F88C9]"
          max="2500000"
          min="100000"
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          step="50000"
          type="range"
          value={maxPrice}
        />
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>RWF 100K</span>
          <span>RWF {(maxPrice / 1000000).toFixed(2)}M</span>
        </div>
      </FilterGroup>
      <button
        className="text-sm font-bold text-[#CA7209] hover:underline"
        onClick={() => {
          setSelectedCategories([]);
          setSelectedBrands([]);
          setMaxPrice(2500000);
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
            ? (categories.find((item) => item.slug === slug)?.name ??
              "Category")
            : "Shop all products"}
        </h1>
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
          <input
            aria-label="Search catalog"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1F88C9]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products…"
            type="search"
            value={query}
          />
          <select
            aria-label="Sort products"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
            onChange={(event) => setSort(event.target.value as SortOption)}
            value={sort}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
          <button
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold lg:hidden"
            onClick={() => setShowFilters((value) => !value)}
            type="button"
          >
            {showFilters ? "Hide filters" : "Show filters"}
          </button>
        </div>
        {showFilters && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 lg:hidden">
            {filters}
          </div>
        )}
        <div className="mt-8 grid gap-8 lg:grid-cols-[230px_1fr]">
          <aside
            aria-label="Product filters"
            className="hidden rounded-2xl border border-slate-200 bg-white p-5 lg:block"
          >
            {filters}
          </aside>
          <section>
            <p className="mb-5 text-sm text-slate-500">
              Showing{" "}
              <strong className="text-slate-900">
                {visibleProducts.length}
              </strong>{" "}
              products
            </p>
            {visibleProducts.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <h2 className="font-bold">No matching products</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Try clearing a filter or changing your search.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function FilterGroup({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <fieldset>
      <legend className="mb-3 font-bold text-slate-950">{title}</legend>
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}
function CheckFilter({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
      <input
        checked={checked}
        className="size-4 rounded accent-[#1F88C9]"
        onChange={onChange}
        type="checkbox"
      />
      {label}
    </label>
  );
}
