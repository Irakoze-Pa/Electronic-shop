import { Link } from "react-router-dom";

export function StorefrontFooter() {
  return (
    <footer className="bg-[#1F88C9] text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2">
          <Link className="text-lg font-black tracking-tight text-white" to="/">
            BUZIMA BOOSTER GROUP
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
            Trusted electronics for work, home, and everyday life—selected with
            care for customers across Rwanda.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Explore</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li>
              <Link className="hover:text-white" to="/shop">
                Shop
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" to="/#benefits">
                Why choose us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Support</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li>
              <a
                className="hover:text-white"
                href="mailto:hello@buzimabooster.rw"
              >
                Contact us
              </a>
            </li>
            <li>Delivery information</li>
            <li>Returns & warranty</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20 px-5 py-5 text-center text-xs text-white/60">
        © {new Date().getFullYear()} BUZIMA BOOSTER GROUP. All rights reserved.
      </div>
    </footer>
  );
}
