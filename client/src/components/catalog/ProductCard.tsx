import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useCart } from "../../cart/useCart";
import { useWishlist } from "../../wishlist/useWishlist";
import type { Product } from "../../types/catalog";
import { currencyFormatter } from "../../utils/format";
import { CartIcon, HeartIcon } from "../ui/Icons";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const auth = useAuth(); const cart = useCart(); const wishlist = useWishlist(); const navigate = useNavigate(); const location = useLocation();
  const [feedback, setFeedback] = useState(""); const saved = wishlist.isWishlisted(product._id);
  function requireLogin() { if (auth.user) return false; navigate("/login", { state: { from: `${location.pathname}${location.search}`, backgroundLocation: location } }); return true; }
  async function add() { if (requireLogin()) return; try { await cart.addToCart(product._id); setFeedback("Added to cart"); } catch { setFeedback("Could not add"); } }
  async function toggle() { if (requireLogin()) return; try { await wishlist.toggleWishlist(product._id); setFeedback(saved ? "Removed from wishlist" : "Saved to wishlist"); } catch { setFeedback("Could not update wishlist"); } }
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  return <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl">
    <div className="relative aspect-[1.08/1] overflow-hidden bg-slate-100"><Link aria-label={`View ${product.name}`} className="block h-full w-full" to={`/products/${product._id}`}><ProductImage className="h-full w-full object-cover transition duration-500 group-hover:scale-105" product={product} /></Link>{discount > 0 && <span className="absolute left-3 top-3 rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-white">Save {discount}%</span>}<button aria-label={`${saved ? "Remove" : "Add"} ${product.name} ${saved ? "from" : "to"} wishlist`} className={`absolute right-3 top-3 grid size-10 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:text-amber-600 ${saved ? "text-amber-600" : "text-slate-600"}`} disabled={wishlist.busyProductId === product._id} onClick={() => void toggle()} type="button"><HeartIcon className={`size-5 ${saved ? "fill-current" : ""}`} /></button></div>
    <div className="flex flex-1 flex-col p-5"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-500">{product.brand.name} · {product.category.name}</p><Link className="mt-2 line-clamp-2 font-bold leading-6 text-slate-950 transition hover:text-sky-500" to={`/products/${product._id}`}>{product.name}</Link>{product.shortDescription && <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{product.shortDescription}</p>}<p className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${product.stock ? "text-emerald-700" : "text-red-600"}`}><span className={`size-1.5 rounded-full ${product.stock ? "bg-emerald-500" : "bg-red-500"}`} />{product.stock ? "Available now" : "Out of stock"}</p>{feedback && <p aria-live="polite" className="mt-2 text-xs font-semibold text-slate-500">{feedback}</p>}<div className="mt-auto flex items-end justify-between gap-3 pt-5"><div><p className="text-lg font-black tracking-tight">{currencyFormatter.format(product.price)}</p>{product.oldPrice && <p className="text-xs text-slate-400 line-through">{currencyFormatter.format(product.oldPrice)}</p>}</div><button aria-label={`Add ${product.name} to cart`} className="grid size-11 place-items-center rounded-xl bg-sky-500 text-white shadow-sm transition hover:bg-sky-600 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-300" disabled={!product.stock || cart.busyProductId === product._id} onClick={() => void add()} type="button"><CartIcon className="size-5" /></button></div></div>
  </article>;
}
