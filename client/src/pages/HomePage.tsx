import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCategories, listProducts } from "../api/catalog";
import { ProductSection } from "../components/catalog/ProductSection";
import { CategoryImage } from "../components/catalog/CategoryImage";
import { ErrorState, LoadingGrid } from "../components/ui/AsyncState";
import { HeadsetIcon, ShieldIcon, TruckIcon } from "../components/ui/Icons";
import type { Category, Product } from "../types/catalog";
import { formatApiError } from "../utils/format";

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [categoryData, featuredData, newData, bestData] = await Promise.all([
        listCategories(),
        listProducts({ status: "Active", featured: true, limit: 4 }),
        listProducts({ status: "Active", newArrival: true, limit: 4 }),
        listProducts({ status: "Active", bestSeller: true, limit: 4 }),
      ]);
      setCategories(categoryData.filter((item) => item.status === "Active"));
      setFeatured(featuredData.data);
      setNewArrivals(newData.data);
      setBestSellers(bestData.data);
      setError("");
    } catch (reason: unknown) { setError(formatApiError(reason)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);
  const laptopCategory = categories.find((category) => /laptop|notebook/i.test(`${category.name} ${category.slug}`));
  return (
    <main>
      <section className="border-b border-slate-200 bg-slate-50 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-[1440px] items-center gap-7 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600"><span aria-hidden="true" className="size-2 rounded-full bg-orange-500" /> BUZIMA BOOSTER GROUP</p>
            <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Better tech.<br /><span className="text-slate-500">Every day.</span></h1>
            <p className="mt-4 max-w-md text-base leading-7 text-slate-600">Electronics for work, home, and everything in between.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:flex">
              <Link className="inline-flex min-h-12 items-center justify-center gap-5 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 sm:px-7" to="/shop">Shop products <span aria-hidden="true">→</span></Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-orange-400 hover:text-orange-700" to="/contact">Contact us</Link>
            </div>
            {categories.length > 0 && <nav aria-label="Popular categories" className="mt-6 flex flex-wrap gap-2">
              {categories.slice(0, 4).map((category) => <Link className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-600 transition hover:bg-white hover:text-orange-700" key={category._id} to={`/categories/${category.slug}`}>{category.name} <span aria-hidden="true" className="ml-2 text-orange-600">↗</span></Link>)}
            </nav>}
          </div>
          <Link aria-label="Explore laptops" className="group block min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500" to={laptopCategory ? `/categories/${laptopCategory.slug}` : "/shop?search=laptop"}>
            <img alt="Laptop on a clean desk" className="h-48 w-full object-cover sm:h-72 lg:h-[360px]" width={800} height={533} fetchPriority="high" src="/images/products/laptop.jpg" />
            <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"><div><p className="text-xs font-medium text-slate-500">Work essentials</p><p className="mt-1 text-base font-semibold text-slate-950">Find your next laptop</p></div><span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-orange-50 text-xl text-orange-700 transition group-hover:bg-orange-100">↗</span></div>
          </Link>
        </div>
      </section>

      <section className="bg-white px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f97316]">
                Find your fit
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Featured categories
              </h2>
            </div>
            <Link
              className="text-sm font-bold text-[#0ea5e9] hover:underline"
              to="/shop"
            >
              Browse all →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <Link
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm"
                key={category._id}
                to={`/categories/${category.slug}`}
              >
                <CategoryImage
                  category={category}
                  className="h-full w-full object-cover opacity-65 transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h3 className="font-black">{category.name}</h3>
                  <p className="mt-1 hidden text-xs text-white/70 sm:block">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {error ? <section className="mx-auto max-w-7xl px-5 py-16"><ErrorState message={error} onRetry={() => void load()} /></section> : loading ? <section className="mx-auto max-w-7xl px-5 py-16"><LoadingGrid /></section> : <><div className="bg-slate-50"><ProductSection eyebrow="Chosen for you" products={featured} title="Featured products" /></div><ProductSection eyebrow="Just arrived" products={newArrivals} title="New arrivals" /></>}

      <section className="px-5 py-8 lg:px-8">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl bg-[#0ea5e9] text-white lg:grid-cols-2">
          <div className="p-8 sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">
              Work smarter
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight">
              Build a setup that works as hard as you do.
            </h2>
            <p className="mt-4 leading-7 text-white/80">
              Save on selected laptops and accessories, available while stocks
              last.
            </p>
            <Link
              className="mt-7 inline-flex rounded-full bg-[#f97316] px-6 py-3 text-sm font-bold"
              to="/categories/laptops"
            >
              Shop the offer
            </Link>
          </div>
          <img
            alt="Modern computer workspace"
            className="h-full min-h-72 w-full object-cover"
            loading="lazy"
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85"
          />
        </div>
      </section>

      {!loading && !error && <div className="bg-white"><ProductSection eyebrow="Customer favorites" products={bestSellers} title="Best sellers" /></div>}

      <section className="bg-slate-50 px-5 py-16 lg:px-8" id="benefits">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f97316]">
              Shop with confidence
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Why choose BUZIMA BOOSTER GROUP?
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Benefit
              icon={<TruckIcon className="size-7" />}
              title="Reliable delivery"
            >
              Fast, careful delivery across Kigali and convenient options
              nationwide.
            </Benefit>
            <Benefit
              icon={<ShieldIcon className="size-7" />}
              title="Genuine products"
            >
              Quality electronics selected from brands and suppliers you can
              trust.
            </Benefit>
            <Benefit
              icon={<HeadsetIcon className="size-7" />}
              title="Local support"
            >
              Helpful guidance before and after your purchase from a team that
              listens.
            </Benefit>
          </div>
        </div>
      </section>

      <section className="bg-sky-600 px-5 py-16 text-white lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/75">
            Stay in the loop
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">
            New tech. Better deals. No noise.
          </h2>
          <p className="mt-3 max-w-xl text-white/80">
            Get useful product news and selected offers delivered to your inbox.
          </p>
          <form
            className="mt-7 flex w-full max-w-lg flex-col gap-3 sm:flex-row"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className="sr-only" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              className="min-w-0 flex-1 rounded-full bg-white px-5 py-3.5 text-sm text-slate-900 outline-none"
              id="newsletter-email"
              placeholder="you@example.com"
              required
              type="email"
            />
            <button
              className="rounded-full bg-sky-600 px-7 py-3.5 text-sm font-bold"
              type="submit"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Benefit({
  children,
  icon,
  title,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-7 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#0ea5e9]/10 text-[#0ea5e9]">
        {icon}
      </span>
      <h3 className="mt-5 text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
    </article>
  );
}
