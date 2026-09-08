import { useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCatalogOptions } from "../../hooks/useCatalogOptions";
import {
  CartIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "../ui/Icons";

export function StorefrontHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { categories } = useCatalogOptions();

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    navigate(
      `/shop${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""}`,
    );
  }

  const iconLink =
    "relative grid size-10 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:text-[#1F88C9]";

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="bg-[#1F88C9] px-4 py-2 text-center text-xs font-medium text-white">
        Free delivery in Kigali on orders over RWF 1,500,000
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4 lg:px-8">
        <button
          aria-label="Open menu"
          className={`${iconLink} md:hidden`}
          onClick={() => setIsMenuOpen(true)}
          type="button"
        >
          <MenuIcon className="size-6" />
        </button>
        <Link className="flex shrink-0 items-center gap-2" to="/">
          <span className="grid size-10 place-items-center rounded-xl bg-[#CA7209] text-sm font-black text-white">
            BBG
          </span>
          <span className="hidden text-base font-black leading-tight tracking-tight text-slate-950 sm:block">
            BUZIMA BOOSTER
            <br />
            <span className="text-xs tracking-[0.22em] text-[#1F88C9]">
              GROUP
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
            className="min-w-0 flex-1 rounded-l-full border border-r-0 border-slate-300 bg-slate-50 px-5 py-3 text-sm outline-none focus:border-[#1F88C9]"
            id="header-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search phones, laptops, accessories…"
            value={search}
          />
          <button
            aria-label="Submit search"
            className="rounded-r-full bg-[#1F88C9] px-5 text-white hover:bg-[#1977ad]"
            type="submit"
          >
            <SearchIcon className="size-5" />
          </button>
        </form>
        <div className="ml-auto flex items-center gap-1">
          <Link aria-label="Account" className={iconLink} to="/account">
            <UserIcon className="size-5" />
          </Link>
          <Link aria-label="Wishlist" className={iconLink} to="/wishlist">
            <HeartIcon className="size-5" />
          </Link>
          <Link
            aria-label="Shopping cart, 2 items"
            className={iconLink}
            to="/cart"
          >
            <CartIcon className="size-5" />
            <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-[#CA7209] text-[10px] font-bold text-white">
              2
            </span>
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
          className="rounded-r-full bg-[#1F88C9] px-4 text-white"
          type="submit"
        >
          <SearchIcon className="size-5" />
        </button>
      </form>
      <nav
        aria-label="Product categories"
        className="hidden border-t border-slate-100 md:block"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 overflow-x-auto px-8 py-3">
          <NavLink
            className="shrink-0 text-sm font-bold text-[#1F88C9]"
            to="/shop"
          >
            All products
          </NavLink>
          {categories
            .filter((category) => category.status === "Active")
            .map((category) => (
              <NavLink
                className="shrink-0 text-sm font-medium text-slate-600 hover:text-[#CA7209]"
                key={category._id}
                to={`/categories/${category.slug}`}
              >
                {category.name}
              </NavLink>
            ))}
        </div>
      </nav>
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
          role="presentation"
        >
          <nav
            aria-label="Mobile navigation"
            className="h-full w-[85%] max-w-sm overflow-y-auto bg-white p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <strong>Browse products</strong>
              <button
                aria-label="Close menu"
                className={iconLink}
                onClick={() => setIsMenuOpen(false)}
                type="button"
              >
                <CloseIcon className="size-6" />
              </button>
            </div>
            <div className="mt-6 flex flex-col">
              <NavLink
                className="border-b border-slate-100 py-3 font-semibold"
                onClick={() => setIsMenuOpen(false)}
                to="/shop"
              >
                All products
              </NavLink>
              {categories
                .filter((category) => category.status === "Active")
                .map((category) => (
                  <NavLink
                    className="border-b border-slate-100 py-3 text-slate-700"
                    key={category._id}
                    onClick={() => setIsMenuOpen(false)}
                    to={`/categories/${category.slug}`}
                  >
                    {category.name}
                  </NavLink>
                ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
