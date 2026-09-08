import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCategories, listProducts } from "../api/catalog";
import { ProductSection } from "../components/catalog/ProductSection";
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
  return (
    <main>
      <section className="overflow-hidden bg-slate-950 px-5 py-16 text-white sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex rounded-full bg-[#CA7209] px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Upgrade your everyday
            </span>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">
              Technology that keeps you moving.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Discover trusted electronics, fair prices, and expert support from
              Rwanda’s growing technology destination.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-[#1F88C9] px-7 py-3.5 text-sm font-bold hover:bg-[#1977ad]"
                to="/shop"
              >
                Shop now
              </Link>
              <Link
                className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-bold hover:bg-white/10"
                to="/categories/laptops"
              >
                Explore laptops
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-xl">
            <div className="absolute inset-10 rounded-full bg-[#1F88C9]/40 blur-3xl" />
            <img
              alt="Premium laptop and smartphone workspace"
              className="relative h-full w-full rounded-[2rem] object-cover shadow-2xl"
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=90"
            />
            <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white p-4 text-slate-950 shadow-xl">
              <p className="text-xs font-semibold text-slate-500">This week</p>
              <p className="mt-1 font-black text-[#CA7209]">Save up to 20%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#CA7209]">
                Find your fit
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Featured categories
              </h2>
            </div>
            <Link
              className="text-sm font-bold text-[#1F88C9] hover:underline"
              to="/shop"
            >
              Browse all →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <Link
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900"
                key={category._id}
                to={`/categories/${category.slug}`}
              >
                <img
                  alt=""
                  className="h-full w-full object-cover opacity-65 transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  src={category.image || "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80"}
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
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl bg-[#1F88C9] text-white lg:grid-cols-2">
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
              className="mt-7 inline-flex rounded-full bg-[#CA7209] px-6 py-3 text-sm font-bold"
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
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#CA7209]">
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

      <section className="bg-[#CA7209] px-5 py-16 text-white lg:px-8">
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
              className="rounded-full bg-slate-950 px-7 py-3.5 text-sm font-bold"
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
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#1F88C9]/10 text-[#1F88C9]">
        {icon}
      </span>
      <h3 className="mt-5 text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
    </article>
  );
}
