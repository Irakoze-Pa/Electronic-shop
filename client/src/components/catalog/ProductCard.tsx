import { Link } from "react-router-dom";
import type { Product } from "../../types/catalog";
import { currencyFormatter } from "../../utils/format";
import { CartIcon, HeartIcon } from "../ui/Icons";
import { Rating } from "./Rating";

export function ProductCard({ product }: { product: Product }) {
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Link
          aria-label={`View ${product.name}`}
          to={`/products/${product.id}`}
        >
          <img
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            src={product.images[0]}
          />
        </Link>
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-[#CA7209] px-2.5 py-1 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
        <button
          aria-label={`Add ${product.name} to wishlist`}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white text-slate-600 shadow-sm transition hover:text-[#CA7209]"
          type="button"
        >
          <HeartIcon className="size-5" />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#1F88C9]">
          {product.brand} · {product.category}
        </p>
        <Link
          className="mt-2 line-clamp-2 font-bold leading-6 text-slate-950 hover:text-[#1F88C9]"
          to={`/products/${product.id}`}
        >
          {product.name}
        </Link>
        <div className="mt-3">
          <Rating count={product.reviewCount} value={product.rating} />
        </div>
        <p
          className={`mt-3 text-xs font-semibold ${product.stock ? "text-emerald-600" : "text-red-600"}`}
        >
          {product.stock ? `${product.stock} in stock` : "Out of stock"}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-lg font-black text-slate-950">
              {currencyFormatter.format(product.price)}
            </p>
            {product.oldPrice && (
              <p className="text-xs text-slate-400 line-through">
                {currencyFormatter.format(product.oldPrice)}
              </p>
            )}
          </div>
          <button
            aria-label={`Add ${product.name} to cart`}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#1F88C9] text-white transition hover:bg-[#1977ad] disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!product.stock}
            type="button"
          >
            <CartIcon className="size-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
