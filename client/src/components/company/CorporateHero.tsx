import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function CorporateHero({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <header className="relative overflow-hidden bg-slate-950 px-5 py-14 text-white lg:px-8 lg:py-20"><div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 size-[500px] rounded-full border-[70px] border-orange-400/10" /><div className="relative mx-auto max-w-6xl"><nav aria-label="Breadcrumb" className="mb-9 text-xs text-slate-400"><Link className="hover:text-white" to="/">Home</Link><span className="mx-3">/</span>{eyebrow}</nav><p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-400">{eyebrow}</p><h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">{title}</h1><p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">{description}</p>{children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}</div></header>;
}
