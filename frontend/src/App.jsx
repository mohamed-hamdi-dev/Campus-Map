import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import AdminApp from "./admin/AdminApp";
import MappingApp from "./mapping/MappingApp";

const navLinkClass = ({ isActive }) =>
  [
    "rounded-full px-4 py-2 text-sm font-black transition",
    isActive
      ? "bg-sky-600 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  ].join(" ");

function Shell({ children }) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const isMapping = pathname.startsWith("/mapping");

  return (
    <div
      className={[
        "min-h-screen text-slate-950",
        isMapping
          ? "bg-[#f1f7fb]"
          : "bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef6fb_100%)]",
      ].join(" ")}
    >
      <header className={[
        "sticky top-0 z-[1000] border-b border-white/70 bg-white/70 backdrop-blur-xl",
        isMapping ? "hidden md:block" : "",
      ].join(" ")}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 md:flex-nowrap md:py-4 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-600 text-xs font-black text-white shadow-glow md:h-10 md:w-10 md:text-sm">
              CM
            </span>
            <div>
              <p className="text-sm font-black tracking-wide text-slate-950">
                Campus Map
              </p>
              <p className="text-xs font-bold text-slate-500">
                Admin Dashboard + Mapping
              </p>
            </div>
          </NavLink>

          <nav className="flex max-w-full items-center gap-2 overflow-x-auto pb-1 md:overflow-visible md:pb-0">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
            <NavLink to="/mapping" className={navLinkClass}>
              Mapping
            </NavLink>
          </nav>
        </div>
      </header>

      <main
        className={[
          "relative z-0 mx-auto",
          isMapping ? "w-full p-0 md:px-4 md:py-8 lg:px-8" : "px-4 py-8 sm:px-6 lg:px-8",
          isAdmin ? "w-full max-w-[1600px]" : "",
          !isAdmin && !isMapping ? "max-w-6xl" : "",
        ].join(" ")}
      >
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/mapping/*" element={<MappingApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  );
}
