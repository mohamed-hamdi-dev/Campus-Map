import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="rounded-3xl border border-white/80 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-sky-700">
        404
      </p>
      <h2 className="mt-3 text-3xl font-black text-slate-950">
        Page not found
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-slate-600">
        The route you tried to open does not exist yet.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-sky-700"
      >
        Back home
      </Link>
    </section>
  );
}
