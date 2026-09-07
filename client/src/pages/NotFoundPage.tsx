import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="grid min-h-[65vh] place-items-center px-5 text-center">
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-[#CA7209]">
          404
        </p>
        <h1 className="mt-3 text-4xl font-black">Page not found</h1>
        <Link className="mt-6 inline-block font-bold text-[#1F88C9]" to="/">
          Return home
        </Link>
      </div>
    </main>
  );
}
