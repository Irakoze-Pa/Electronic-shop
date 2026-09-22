import { useEffect, useRef, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CloseIcon, ShieldIcon } from "../ui/Icons";

export function AuthShell({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const background = (location.state as { backgroundLocation?: { pathname: string; search?: string; hash?: string } } | null)?.backgroundLocation;
  function close() {
    navigate(background ? `${background.pathname}${background.search || ""}${background.hash || ""}` : "/", { replace: true });
  }
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previous = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = previous; };
  }, []);

  return (
    <dialog ref={dialogRef} aria-labelledby="auth-title" aria-describedby="auth-description" onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === event.currentTarget) close(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-2xl border border-sky-100 bg-white p-0 text-slate-900 shadow-2xl shadow-sky-950/20 backdrop:bg-slate-950/70 backdrop:backdrop-blur-sm">
      <div className="grid md:grid-cols-[0.8fr_1.2fr]">
        <aside className="relative hidden overflow-hidden bg-slate-950 p-9 text-white md:block">
          <div aria-hidden="true" className="absolute -right-24 -top-20 size-72 rounded-full bg-sky-500/20 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-24 -left-20 size-64 rounded-full bg-orange-500/10 blur-3xl" />
          <span className="relative inline-flex size-12 items-center justify-center rounded-xl bg-sky-500 text-sm font-black tracking-wider shadow-lg shadow-sky-950/40">BBG</span>
          <p className="relative mt-12 text-xs font-bold uppercase tracking-[0.2em] text-sky-400">BBG ELECTRONICS</p>
          <h2 className="relative mt-4 text-3xl font-black leading-tight">Technology made easier for you.</h2>
          <p className="relative mt-5 text-sm leading-7 text-slate-300">Shop trusted electronics and manage your orders, saved products, addresses, and account securely in one place.</p>
          <div className="relative mt-10 space-y-3 text-xs font-semibold text-slate-300"><p className="flex items-center gap-3"><span className="grid size-5 place-items-center rounded-full bg-sky-500/20 text-sky-300">✓</span>Secure customer account</p><p className="flex items-center gap-3"><span className="grid size-5 place-items-center rounded-full bg-sky-500/20 text-sky-300">✓</span>Simple order tracking</p><p className="flex items-center gap-3"><span className="grid size-5 place-items-center rounded-full bg-sky-500/20 text-sky-300">✓</span>Responsive customer support</p></div>
          <div className="relative mt-10 flex items-center gap-3 border-t border-white/10 pt-6 text-xs text-slate-400"><ShieldIcon aria-hidden="true" className="size-5 text-sky-400" />Protected account access</div>
        </aside>
        <section className="relative p-6 sm:p-9">
          <button aria-label="Close account dialog" className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-slate-500 hover:bg-sky-50 hover:text-sky-700 focus-visible:outline-sky-500" onClick={close} type="button"><CloseIcon className="size-5" /></button>
          <Link className="inline-flex items-center gap-2 pr-8 text-xs font-black tracking-[0.12em] text-sky-600" onClick={(event) => { event.preventDefault(); close(); }} to="/">BBG ELECTRONICS<span className="size-1.5 rounded-full bg-orange-500" /></Link>
          <h1 className="mt-7 text-3xl font-black tracking-tight" id="auth-title">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500" id="auth-description">{description}</p>
          {children}
        </section>
      </div>
    </dialog>
  );
}

export const authFieldClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 hover:border-sky-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-100";
