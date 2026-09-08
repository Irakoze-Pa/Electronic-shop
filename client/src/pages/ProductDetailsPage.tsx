import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useCart } from "../cart/useCart";
import { useWishlist } from "../wishlist/useWishlist";
import { getProduct, listProducts } from "../api/catalog";
import { ProductCard } from "../components/catalog/ProductCard";
import { EmptyState, ErrorState } from "../components/ui/AsyncState";
import { CartIcon, HeartIcon } from "../components/ui/Icons";
import type { Product } from "../types/catalog";
import { currencyFormatter, formatApiError } from "../utils/format";

export function ProductDetailsPage() {
  const { id = "" } = useParams();
  const auth = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const load = useCallback(async () => {
    try { const item = await getProduct(id); setProduct(item); const result = await listProducts({ category: item.category._id, status: "Active", limit: 5 }); setRelated(result.data.filter((entry) => entry._id !== item._id).slice(0, 4)); setError(""); }
    catch (reason: unknown) { setError(formatApiError(reason)); }
  }, [id]);
  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);
  if (error) return <main className="mx-auto min-h-[60vh] max-w-7xl px-5 py-16"><ErrorState message={error} onRetry={() => void load()} /></main>;
  if (!product) return <main className="mx-auto min-h-[60vh] max-w-7xl px-5 py-16"><div className="h-96 animate-pulse rounded-3xl bg-slate-200" /></main>;
  const productId = product._id;
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const saved = wishlist.isWishlisted(product._id);
  function requireLogin() {
    if (auth.user) return false;
    navigate("/login", { state: { from: location.pathname } });
    return true;
  }
  async function addToCart() {
    if (requireLogin()) return;
    try { await cart.addToCart(productId, quantity); setActionMessage("Added to cart."); }
    catch (reason: unknown) { setActionMessage(formatApiError(reason)); void load(); }
  }
  async function toggleWishlist() {
    if (requireLogin()) return;
    try { await wishlist.toggleWishlist(productId); setActionMessage(saved ? "Removed from wishlist." : "Saved to wishlist."); }
    catch (reason: unknown) { setActionMessage(formatApiError(reason)); }
  }
  return <main className="bg-white px-5 py-10 lg:px-8"><div className="mx-auto max-w-7xl"><nav className="text-sm text-slate-500"><Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {product.name}</nav><div className="mt-8 grid gap-12 lg:grid-cols-2"><section><div className="aspect-square overflow-hidden rounded-3xl bg-slate-100">{product.images[selectedImage] ? <img alt={product.name} className="h-full w-full object-cover" src={product.images[selectedImage]} /> : <div className="grid h-full place-items-center text-7xl font-black text-[#1F88C9]/20">BBG</div>}</div><div className="mt-4 flex gap-3">{product.images.map((url, index) => <button aria-label={`View image ${index + 1}`} className={`size-20 overflow-hidden rounded-xl border-2 ${index === selectedImage ? "border-[#1F88C9]" : "border-transparent"}`} key={url} onClick={() => setSelectedImage(index)} type="button"><img alt="" className="h-full w-full object-cover" src={url} /></button>)}</div></section><section className="self-center"><p className="text-sm font-bold uppercase tracking-wider text-[#CA7209]">{product.brand.name}</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{product.name}</h1><p className="mt-3 text-sm text-slate-500">Code: {product.code} · {product.category.name}</p><div className="mt-7 flex flex-wrap items-center gap-3"><span className="text-3xl font-black text-[#1F88C9]">{currencyFormatter.format(product.price)}</span>{product.oldPrice && <span className="text-lg text-slate-400 line-through">{currencyFormatter.format(product.oldPrice)}</span>}{discount > 0 && <span className="rounded-full bg-[#CA7209]/10 px-3 py-1 text-sm font-bold text-[#CA7209]">Save {discount}%</span>}</div><p className={`mt-5 text-sm font-bold ${product.stock ? "text-emerald-600" : "text-red-600"}`}>{product.stock ? `${product.stock} ${product.unit} available` : "Out of stock"}</p><p className="mt-6 leading-7 text-slate-600">{product.description || product.shortDescription}</p><div className="mt-8 flex flex-wrap gap-3"><div className="flex items-center rounded-xl border border-slate-300"><button aria-label="Decrease quantity" className="size-12 text-xl disabled:text-slate-300" disabled={quantity <= 1 || !product.stock} onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button">−</button><span className="w-10 text-center font-bold">{quantity}</span><button aria-label="Increase quantity" className="size-12 text-xl disabled:text-slate-300" disabled={!product.stock || quantity >= product.stock} onClick={() => setQuantity((value) => Math.min(product.stock || 1, value + 1))} type="button">+</button></div><button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1F88C9] px-6 py-3 font-bold text-white disabled:bg-slate-300" disabled={!product.stock || cart.busyProductId === product._id} onClick={() => void addToCart()} type="button"><CartIcon className="size-5" /> {cart.busyProductId === product._id ? "Adding…" : "Add to cart"}</button><button aria-label={saved ? "Remove from wishlist" : "Add to wishlist"} className={`grid size-12 place-items-center rounded-xl border border-slate-300 ${saved ? "text-[#CA7209]" : ""}`} disabled={wishlist.busyProductId === product._id} onClick={() => void toggleWishlist()} type="button"><HeartIcon className={`size-5 ${saved ? "fill-current" : ""}`} /></button></div>{actionMessage && <p aria-live="polite" className="mt-3 text-sm font-semibold text-slate-600">{actionMessage}</p>}<div className="mt-9 border-t border-slate-200 pt-7"><h2 className="font-black">Specifications</h2>{Object.keys(product.specifications).length ? <dl className="mt-4 divide-y divide-slate-100">{Object.entries(product.specifications).map(([label, value]) => <div className="grid grid-cols-2 gap-4 py-3 text-sm" key={label}><dt className="text-slate-500">{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl> : <p className="mt-3 text-sm text-slate-500">No specifications provided.</p>}</div></section></div><section className="mt-20 border-t border-slate-200 pt-14"><h2 className="text-3xl font-black">Related products</h2><div className="mt-8">{related.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((item) => <ProductCard key={item._id} product={item} />)}</div> : <EmptyState message="No related products yet." />}</div></section></div></main>;
}
