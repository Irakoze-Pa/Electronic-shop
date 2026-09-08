import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useCart } from "../../cart/useCart";
import { useWishlist } from "../../wishlist/useWishlist";
import type { Product } from "../../types/catalog";
import { currencyFormatter } from "../../utils/format";
import { CartIcon, HeartIcon } from "../ui/Icons";

export function ProductCard({ product }: { product: Product }) {
  const auth = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [feedback, setFeedback] = useState("");
  const saved = wishlist.isWishlisted(product._id);
  function requireLogin() {
    if (auth.user) return false;
    navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
    return true;
  }
  async function add() {
    if (requireLogin()) return;
    try { await cart.addToCart(product._id); setFeedback("Added to cart"); }
    catch { setFeedback("Could not add"); }
  }
  async function toggle() {
    if (requireLogin()) return;
    try { await wishlist.toggleWishlist(product._id); setFeedback(saved ? "Removed from wishlist" : "Saved to wishlist"); }
    catch { setFeedback("Could not update wishlist"); }
  }
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  return <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"><div className="relative aspect-square overflow-hidden bg-slate-100"><Link aria-label={`View ${product.name}`} to={`/products/${product._id}`}>{product.images[0] ? <img alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" src={product.images[0]} /> : <div className="grid h-full place-items-center text-4xl font-black text-[#1F88C9]/25">BBG</div>}</Link>{discount > 0 && <span className="absolute left-3 top-3 rounded-full bg-[#CA7209] px-2.5 py-1 text-xs font-bold text-white">-{discount}%</span>}<button aria-label={`${saved ? "Remove" : "Add"} ${product.name} ${saved ? "from" : "to"} wishlist`} className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white shadow-sm hover:text-[#CA7209] ${saved ? "text-[#CA7209]" : "text-slate-600"}`} disabled={wishlist.busyProductId === product._id} onClick={() => void toggle()} type="button"><HeartIcon className={`size-5 ${saved ? "fill-current" : ""}`} /></button></div><div className="flex flex-1 flex-col p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#1F88C9]">{product.brand.name} · {product.category.name}</p><Link className="mt-2 line-clamp-2 font-bold leading-6 text-slate-950 hover:text-[#1F88C9]" to={`/products/${product._id}`}>{product.name}</Link>{product.shortDescription && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{product.shortDescription}</p>}<p className={`mt-3 text-xs font-semibold ${product.stock ? "text-emerald-600" : "text-red-600"}`}>{product.stock ? `${product.stock} ${product.unit} in stock` : "Out of stock"}</p>{feedback && <p aria-live="polite" className="mt-2 text-xs font-semibold text-slate-500">{feedback}</p>}<div className="mt-auto flex items-end justify-between gap-3 pt-4"><div><p className="text-lg font-black">{currencyFormatter.format(product.price)}</p>{product.oldPrice && <p className="text-xs text-slate-400 line-through">{currencyFormatter.format(product.oldPrice)}</p>}</div><button aria-label={`Add ${product.name} to cart`} className="grid size-10 place-items-center rounded-xl bg-[#1F88C9] text-white disabled:bg-slate-300" disabled={!product.stock || cart.busyProductId === product._id} onClick={() => void add()} type="button"><CartIcon className="size-5" /></button></div></div></article>;
}
