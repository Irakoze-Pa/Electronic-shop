import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ProductCard } from "../components/catalog/ProductCard";
import { Rating } from "../components/catalog/Rating";
import { CartIcon, HeartIcon } from "../components/ui/Icons";
import { products } from "../data/catalog";
import { currencyFormatter } from "../utils/format";

export function ProductDetailsPage() {
  const { id } = useParams();
  const product = products.find((item) => item.id === id || item.slug === id);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) return <Navigate replace to="/not-found" />;

  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;
  const related = products
    .filter(
      (item) => item.category === product.category && item.id !== product.id,
    )
    .slice(0, 4);

  return (
    <main className="bg-white px-5 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <Link className="hover:text-[#1F88C9]" to="/">
            Home
          </Link>{" "}
          /{" "}
          <Link className="hover:text-[#1F88C9]" to="/shop">
            Shop
          </Link>{" "}
          / <span className="text-slate-800">{product.name}</span>
        </nav>
        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <section aria-label="Product gallery">
            <div className="aspect-square overflow-hidden rounded-3xl bg-slate-100">
              <img
                alt={product.name}
                className="h-full w-full object-cover"
                src={product.images[selectedImage]}
              />
            </div>
            <div className="mt-4 flex gap-3">
              {product.images.map((imageUrl, index) => (
                <button
                  aria-label={`View product image ${index + 1}`}
                  className={`size-20 overflow-hidden rounded-xl border-2 ${selectedImage === index ? "border-[#1F88C9]" : "border-transparent"}`}
                  key={imageUrl}
                  onClick={() => setSelectedImage(index)}
                  type="button"
                >
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    src={imageUrl}
                  />
                </button>
              ))}
            </div>
          </section>
          <section className="self-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#CA7209]">
              {product.brand}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              {product.name}
            </h1>
            <div className="mt-4">
              <Rating count={product.reviewCount} value={product.rating} />
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-black text-[#1F88C9]">
                {currencyFormatter.format(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-lg text-slate-400 line-through">
                  {currencyFormatter.format(product.oldPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="rounded-full bg-[#CA7209]/10 px-3 py-1 text-sm font-bold text-[#CA7209]">
                  Save {discount}%
                </span>
              )}
            </div>
            <p
              className={`mt-5 text-sm font-bold ${product.stock ? "text-emerald-600" : "text-red-600"}`}
            >
              {product.stock
                ? `In stock · ${product.stock} available`
                : "Out of stock"}
            </p>
            <p className="mt-6 leading-7 text-slate-600">
              {product.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex items-center rounded-xl border border-slate-300">
                <button
                  aria-label="Decrease quantity"
                  className="size-12 text-xl"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  type="button"
                >
                  −
                </button>
                <span aria-live="polite" className="w-10 text-center font-bold">
                  {quantity}
                </span>
                <button
                  aria-label="Increase quantity"
                  className="size-12 text-xl"
                  onClick={() =>
                    setQuantity((value) =>
                      Math.min(product.stock || 1, value + 1),
                    )
                  }
                  type="button"
                >
                  +
                </button>
              </div>
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1F88C9] px-6 py-3 font-bold text-white hover:bg-[#1977ad] disabled:bg-slate-300"
                disabled={!product.stock}
                type="button"
              >
                <CartIcon className="size-5" /> Add to cart
              </button>
              <button
                aria-label="Add to wishlist"
                className="grid size-12 place-items-center rounded-xl border border-slate-300 text-slate-700 hover:text-[#CA7209]"
                type="button"
              >
                <HeartIcon className="size-5" />
              </button>
            </div>
            <div className="mt-9 border-t border-slate-200 pt-7">
              <h2 className="font-black">Specifications</h2>
              <dl className="mt-4 divide-y divide-slate-100">
                {Object.entries(product.specifications).map(
                  ([label, value]) => (
                    <div
                      className="grid grid-cols-2 gap-4 py-3 text-sm"
                      key={label}
                    >
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="font-semibold text-slate-900">{value}</dd>
                    </div>
                  ),
                )}
              </dl>
            </div>
          </section>
        </div>
        {related.length > 0 && (
          <section className="mt-20 border-t border-slate-200 pt-14">
            <h2 className="text-3xl font-black tracking-tight">
              Related products
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
