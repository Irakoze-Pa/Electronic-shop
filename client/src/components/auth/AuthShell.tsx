import { Link } from "react-router-dom";

export function AuthShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <Link className="inline-flex items-center gap-2" to="/">
          <span className="grid size-10 place-items-center rounded-xl bg-[#CA7209] text-sm font-black text-white">
            BBG
          </span>
          <strong>BUZIMA BOOSTER GROUP</strong>
        </Link>
        <h1 className="mt-8 text-3xl font-black tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        {children}
      </section>
    </main>
  );
}

export const authFieldClass =
  "mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#1F88C9]";
