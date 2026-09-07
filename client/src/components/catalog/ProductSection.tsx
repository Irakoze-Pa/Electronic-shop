import { Link } from "react-router-dom";
import type { Product } from "../../types/catalog";
import { ProductCard } from "./ProductCard";

export function ProductSection({
  eyebrow,
  products,
  title,
}: {
  eyebrow: string;
  products: Product[];
  title: string;
}) {
  return (
    <section className="px-5 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#CA7209]">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              {title}
            </h2>
          </div>
          <Link
            className="shrink-0 text-sm font-bold text-[#1F88C9] hover:underline"
            to="/shop"
          >
            View all →
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
