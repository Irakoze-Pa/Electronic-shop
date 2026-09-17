import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCatalogOptions } from "../../hooks/useCatalogOptions";
import { useAuth } from "../../auth/useAuth";
import { useCart } from "../../cart/useCart";
import { useWishlist } from "../../wishlist/useWishlist";
import {
  CartIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "../ui/Icons";

const companyLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About us" },
  { to: "/delivery", label: "Delivery" },
  { to: "/returns", label: "Returns" },
  { to: "/warranty", label: "Warranty" },
  { to: "/contact", label: "Contact" },
];

export function StorefrontHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const menuRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = menuRef.current;
    if (!isMenuOpen || !dialog) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
  }, [isMenuOpen]);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const cart = useCart();
  const wishlist = useWishlist();
  const { categories } = useCatalogOptions();

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    navigate(
      `/shop${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""}`,
    );
  }

  const iconLink =
    "relative grid size-10 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:text-[#0ea5e9]";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="bg-slate-950 px-5 py-2.5 text-[11px] text-slate-300 lg:px-8"><div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4"><span>Technology for work, home, and everyday life</span><div className="flex gap-5"><Link className="hidden hover:text-white sm:block" to="/account/orders">Track your order</Link><Link className="font-semibold text-white hover:text-sky-300" to="/contact">Customer support</Link></div></div></div>
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-5 py-4 lg:px-8">
        <button
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          className={`${iconLink} lg:hidden`}
          onClick={() => setIsMenuOpen(true)}
          type="button"
        >
          <MenuIcon className="size-6" />
        </button>
        <Link className="flex shrink-0 items-center gap-2" to="/">
          <span className="grid size-11 place-items-center rounded-xl bg-sky-500 text-sm font-black text-white shadow-sm ring-4 ring-orange-50">
            BBG
          </span>
          <span className="hidden text-base font-black leading-tight tracking-tight text-slate-950 sm:block">
            BUZIMA BOOSTER
            <br />
            <span className="text-[10px] tracking-[0.22em] text-slate-500">
              GROUP · KIGALI, RWANDA
            </span>
          </span>
        </Link>
        <form
          className="mx-auto hidden max-w-2xl flex-1 md:flex"
          onSubmit={submitSearch}
          role="search"
        >
          <label className="sr-only" htmlFor="header-search">
            Search products
          </label>
          <input
            className="min-w-0 flex-1 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 px-5 py-3 text-sm outline-none transition focus:border-sky-500 focus:bg-white"
            id="header-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search phones, laptops, accessories…"
            value={search}
          />
          <button
            aria-label="Submit search"
            className="rounded-r-xl bg-sky-500 px-5 text-white transition hover:bg-sky-600"
            type="submit"
          >
            <SearchIcon className="size-5" />
          </button>
        </form>
        <div className="ml-auto flex items-center gap-1">
          {auth.user?.role === "Admin" && (
            <Link
              className="hidden rounded-full px-3 py-2 text-xs font-bold text-[#0ea5e9] hover:bg-slate-100 lg:block"
              to="/admin/products"
            >
              Admin
            </Link>
          )}
          <Link
            aria-label={
              auth.user ? `Account for ${auth.user.firstName}` : "Log in"
            }
            className={iconLink}
            state={!auth.user ? { backgroundLocation: location } : undefined}
            to={auth.user ? "/account" : "/login"}
          >
            <UserIcon className="size-5" />
          </Link>
          {auth.user && (
            <button
              className="hidden px-2 text-xs font-bold text-slate-600 hover:text-[#f97316] sm:block"
              onClick={() => void auth.logout()}
              type="button"
            >
              Log out
            </button>
          )}
          <Link aria-label="Wishlist" className={iconLink} to="/wishlist">
            <HeartIcon className="size-5" />
            {wishlist.wishlistCount > 0 && <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-[#0ea5e9] text-[10px] font-bold text-white">{wishlist.wishlistCount > 99 ? "99+" : wishlist.wishlistCount}</span>}
          </Link>
          <Link
            aria-label={`Shopping cart, ${cart.cartCount} items`}
            className={iconLink}
            to="/cart"
          >
            <CartIcon className="size-5" />
            {cart.cartCount > 0 && <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-[#f97316] text-[10px] font-bold text-white">{cart.cartCount > 99 ? "99+" : cart.cartCount}</span>}
          </Link>
        </div>
      </div>
      <form
        className="flex px-5 pb-4 md:hidden"
        onSubmit={submitSearch}
        role="search"
      >
        <input
          aria-label="Search products"
          className="min-w-0 flex-1 rounded-l-full border border-r-0 border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products…"
          value={search}
        />
        <button
          aria-label="Submit search"
          className="rounded-r-full bg-[#0ea5e9] px-4 text-white"
          type="submit"
        >
          <SearchIcon className="size-5" />
        </button>
      </form>
      <nav aria-label="Main navigation" className="hidden border-t border-slate-100 lg:block">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-8">
          <details className="group relative mr-5 shrink-0">
            <summary className="cursor-pointer list-none border-r border-slate-200 py-4 pr-6 text-sm font-bold text-slate-900 focus-visible:outline-sky-500">Browse categories <span aria-hidden="true" className="ml-3 text-sky-600">⌄</span></summary>
            <div className="absolute left-0 top-full z-50 max-h-[60vh] w-72 overflow-y-auto rounded-b-2xl border border-slate-200 bg-white p-3 shadow-xl">
              <Link className="block rounded-lg px-4 py-3 text-sm font-bold text-sky-600 hover:bg-sky-50" to="/shop" onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>All products →</Link>
              {categories.filter((category) => category.status === "Active").map((category) => <NavLink className={({ isActive }) => `block rounded-lg px-4 py-3 text-sm ${isActive ? "bg-sky-50 font-bold text-sky-700" : "text-slate-600 hover:bg-slate-50"}`} key={category._id} to={`/categories/${category.slug}`} onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>{category.name}</NavLink>)}
            </div>
          </details>
          {companyLinks.map(({ to, label }) => <NavLink className={({ isActive }) => `border-b-2 px-3 py-4 text-sm font-semibold transition ${isActive ? "border-orange-400 text-slate-950" : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950"}`} end key={to} to={to}>{label}</NavLink>)}
          <Link className="ml-auto rounded-lg bg-orange-50 px-4 py-2 text-xs font-bold text-orange-800 hover:bg-orange-100" to="/contact?topic=Business%20enquiry">Business enquiries →</Link>
        </div>
      </nav>
      <dialog id="mobile-navigation" ref={menuRef} aria-labelledby="mobile-menu-title" onClose={() => setIsMenuOpen(false)} onCancel={() => setIsMenuOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setIsMenuOpen(false); }} className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-slate-900 backdrop:bg-slate-950/60">
        <nav aria-label="Mobile navigation" className="flex h-full w-[88%] max-w-sm flex-col overflow-y-auto bg-white p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5"><strong id="mobile-menu-title">BUZIMA BOOSTER GROUP</strong><button aria-label="Close menu" className={iconLink} onClick={() => setIsMenuOpen(false)} type="button"><CloseIcon className="size-6" /></button></div>
          <div className="mt-4 flex flex-col">{companyLinks.map(({ to, label }) => <NavLink className={({ isActive }) => `rounded-lg px-3 py-3 text-sm font-semibold ${isActive ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-50"}`} end key={to} onClick={() => setIsMenuOpen(false)} to={to}>{label}</NavLink>)}</div>
          <p className="mb-3 mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Product categories</p>
          {categories.filter((category) => category.status === "Active").map((category) => <NavLink className="rounded-lg px-3 py-3 text-sm text-slate-600 hover:bg-slate-50" key={category._id} onClick={() => setIsMenuOpen(false)} to={`/categories/${category.slug}`}>{category.name}</NavLink>)}
          <div className="mt-6 border-t border-slate-100 pt-5"><Link className="block rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white" onClick={() => setIsMenuOpen(false)} to="/contact?topic=Business%20enquiry">Business enquiries</Link>{auth.user?.role === "Admin" && <Link className="mt-4 block text-sm font-bold text-sky-600" onClick={() => setIsMenuOpen(false)} to="/admin">Admin dashboard</Link>}{auth.user && <button className="mt-4 text-sm font-semibold text-slate-600" onClick={() => { setIsMenuOpen(false); void auth.logout(); }} type="button">Log out</button>}</div>
        </nav>
      </dialog>
    </header>
  );
}
