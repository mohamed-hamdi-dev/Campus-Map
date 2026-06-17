import { Link } from "react-router-dom";

const sections = [
  {
    title: "Admin Dashboard",
    path: "/admin",
    description:
      "Administration area for users, roles, settings, and content control.",
    accent: "from-slate-950 to-slate-700",
  },
  {
    title: "Mapping",
    path: "/mapping",
    description:
      "Campus map area for buildings, locations, and internal navigation.",
    accent: "from-sky-700 to-cyan-500",
  },
];

export default function Home() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div className="space-y-6">
        <span className="inline-flex rounded-full border border-sky-200 bg-white px-4 py-1 text-sm font-semibold text-sky-700 shadow-sm">
          Frontend split ready
        </span>
        <div className="space-y-4">
          <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Split the project into Admin Dashboard and Mapping.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            The home screen now highlights both sections clearly, and each one
            has its own layout and route tree so it can grow in a clean way.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {sections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className={`group rounded-3xl bg-gradient-to-br ${section.accent} p-[1px] shadow-[0_25px_80px_rgba(15,23,42,0.10)] transition hover:-translate-y-1`}
          >
            <div className="rounded-[23px] bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-700">
                Route
              </p>
              <h2 className="mt-3 text-2xl font-black text-slate-950">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {section.description}
              </p>
              <span className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition group-hover:bg-sky-600">
                Open {section.title}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
