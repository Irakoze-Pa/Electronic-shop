import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
const links = [
  { to: "/account", label: "Account", end: true },
  { to: "/account/orders", label: "Orders" },
  { to: "/account/addresses", label: "Address" },
  { to: "/wishlist", label: "Saved" },
];
export function AccountNav() {
  const auth = useAuth();
  const navigate = useNavigate();
  return (
    <nav
      aria-label="Account navigation"
      className="mb-5 grid grid-cols-[repeat(4,minmax(0,1fr))_44px] gap-1 rounded-xl border border-slate-200 bg-white p-1 sm:gap-2"
    >
      {links.map((link) => (
        <NavLink
          className={({ isActive }) =>
            `flex min-h-11 min-w-0 items-center justify-center rounded-lg px-1 text-xs font-semibold transition sm:text-sm ${isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-orange-50 hover:text-orange-700"}`
          }
          end={link.end}
          key={link.to}
          to={link.to}
        >
          {link.label}
        </NavLink>
      ))}
      <button
        aria-label="Sign out"
        title="Sign out"
        className="grid min-h-11 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700"
        onClick={() => void auth.logout().then(() => navigate("/"))}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          viewBox="0 0 24 24"
        >
          <path d="M9 4H4v16h5M8 12h12m-4-4 4 4-4 4" />
        </svg>
      </button>
    </nav>
  );
}
