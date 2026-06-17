import { Outlet, Route, Routes } from "react-router-dom";
import AdminCampusPlacesPage from "./pages/AdminCampusPlacesPage";

function AdminLayout() {
  return (
    <div className="min-h-[calc(100vh-8rem)] w-full text-slate-950">
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.10)] sm:p-6 lg:p-8">
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function AdminApp() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminCampusPlacesPage />} />
      </Route>
    </Routes>
  );
}
