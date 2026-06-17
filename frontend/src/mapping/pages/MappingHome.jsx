import { Link } from "react-router-dom";

export default function MappingHome() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-sky-700">
          Mapping home
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Campus map starter
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          A starter page for the map that can later connect to buildings,
          paths, and points of interest.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-sky-50 p-5">
          <p className="font-bold text-sky-800">Buildings</p>
          <p className="mt-2 text-sm leading-6 text-sky-700">
            Show the list of available buildings and halls.
          </p>
        </div>
        <div className="rounded-2xl bg-cyan-50 p-5">
          <p className="font-bold text-cyan-800">Navigation</p>
          <p className="mt-2 text-sm leading-6 text-cyan-700">
            Internal navigation between locations with ease.
          </p>
        </div>
      </div>

      <Link
        to="/mapping/explorer"
        className="inline-flex rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
      >
        Open Map Explorer
      </Link>
    </div>
  );
}
