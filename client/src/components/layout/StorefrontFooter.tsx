import { Link } from "react-router-dom";

export function StorefrontFooter() {
  return (
    <footer className="border-t-4 border-orange-400 bg-white text-slate-600">
      <div className="border-b border-sky-100 bg-sky-50"><div className="mx-auto grid max-w-[1440px] gap-4 px-5 py-6 text-sm sm:grid-cols-3 lg:px-8"><p><strong className="block text-sky-700">Secure purchasing</strong><span className="text-xs text-slate-500">Careful handling from checkout to delivery</span></p><p><strong className="block text-sky-700">Business-ready support</strong><span className="text-xs text-slate-500">Guidance for teams and individuals</span></p><p><strong className="block text-sky-700">Quality you can trust</strong><span className="text-xs text-slate-500">Dependable products from known suppliers</span></p></div></div>
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2">
          <Link className="flex items-center gap-3 text-lg font-black tracking-tight text-slate-900" to="/">
            <span className="grid size-10 place-items-center rounded-xl bg-sky-500 text-xs text-white shadow-sm">BBG</span> BUZIMA BOOSTER GROUP
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
            Trusted electronics for work, home, and everyday life—selected with
            care for customers across Rwanda.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-orange-600">Explore</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li><Link className="hover:text-sky-600" to="/about">About our company</Link></li>
            <li><Link className="hover:text-sky-600" to="/contact?topic=Business%20enquiry">Business enquiries</Link></li>
            <li>
              <Link className="hover:text-sky-600" to="/shop">
                Shop
              </Link>
            </li>
            <li>
              <Link className="hover:text-sky-600" to="/#benefits">
                Why choose us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold text-orange-600">Support</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li>
              <Link
                className="hover:text-sky-600"
                to="/contact"
              >
                Contact us
              </Link>
            </li>
            <li><Link className="hover:text-sky-600" to="/delivery">Delivery information</Link></li>
            <li><Link className="hover:text-sky-600" to="/returns">Returns & exchanges</Link></li>
            <li><Link className="hover:text-sky-600" to="/warranty">Warranty support</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sky-100 bg-sky-50/60 px-5 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} BUZIMA BOOSTER GROUP · Kigali, Rwanda · All rights reserved.
      </div>
    </footer>
  );
}
