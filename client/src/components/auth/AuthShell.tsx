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
    <dialog ref={dialogRef} aria-labelledby="auth-title" aria-describedby="auth-description" onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === event.currentTarget) close(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/65 backdrop:backdrop-blur-sm">
      <div className="grid md:grid-cols-[0.8fr_1.2fr]">
        <aside className="relative hidden overflow-hidden bg-slate-950 p-9 text-white md:block">
          <span className="inline-flex rounded-xl bg-white/10 p-3 text-sm font-black">BBG<span className="ml-2 text-orange-400">.</span></span>
          <p className="mt-12 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">BUZIMA BOOSTER GROUP</p>
          <h2 className="mt-4 text-3xl font-black leading-tight">Your next step in technology.</h2>
          <p className="mt-5 text-sm leading-7 text-slate-300">Discover electronics for work and everyday life. Keep your orders, saved products, and delivery details in one place.</p>
          <div className="mt-12 flex items-center gap-3 border-t border-slate-800 pt-6 text-xs text-slate-400"><ShieldIcon aria-hidden="true" className="size-5 text-orange-400" />Account access · Customer support</div>
        </aside>
        <section className="relative p-6 sm:p-9">
          <button aria-label="Close account dialog" className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-slate-500 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-orange-500" onClick={close} type="button"><CloseIcon className="size-5" /></button>
          <Link className="inline-flex items-center gap-2 pr-8 text-xs font-bold tracking-wide text-slate-500" onClick={(event) => { event.preventDefault(); close(); }} to="/">BUZIMA BOOSTER GROUP<span className="size-1.5 rounded-full bg-orange-500" /></Link>
          <h1 className="mt-7 text-3xl font-black tracking-tight" id="auth-title">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500" id="auth-description">{description}</p>
          {children}
        </section>
      </div>
    </dialog>
  );
}

export const authFieldClass = "mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-50";
