import { Link } from "react-router-dom";

export default function AdminOverview() {
  const cards = [
    { label: "Users", value: "24" },
    { label: "Requests", value: "08" },
    { label: "Alerts", value: "03" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-sky-700">
          Admin overview
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Dashboard home
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          This is the starting point for the admin section. You can expand it
          later with real pages.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-slate-100 p-5">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-black text-slate-950">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <Link
        to="/mapping"
        className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-600"
      >
        Go to Mapping
      </Link>
    </div>
  );
}
