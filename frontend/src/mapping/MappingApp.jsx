import { useState } from "react";
import { Outlet, Route, Routes, Navigate } from "react-router-dom";
import MapExplorer from "./pages/MapExplorer";
import MappingNotFound from "./pages/MappingNotFound";

function MappingLayout() {
  const [previewMode, setPreviewMode] = useState("mobile");
  const isTabletPreview = previewMode === "tablet";

  return (
    <div className="min-h-[100dvh] bg-white md:flex md:min-h-[calc(100vh-6rem)] md:flex-col md:items-center md:gap-5 md:bg-[#f1f7fb] md:px-3 md:py-6">
      <div className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/92 p-1.5 shadow-[0_14px_34px_rgba(15,23,42,0.12)] backdrop-blur md:flex">
        {[
          { label: "موبايل", value: "mobile" },
          { label: "تابلت", value: "tablet" },
        ].map((option) => {
          const active = previewMode === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setPreviewMode(option.value)}
              className={[
                "h-9 rounded-full px-5 text-sm font-black transition",
                active
                  ? "bg-sky-600 text-white shadow-[0_10px_22px_rgba(2,132,199,0.22)]"
                  : "text-slate-600 hover:bg-sky-50 hover:text-sky-700",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Outer Aluminum Frame */}
      <div
        className={[
          "relative h-[100dvh] w-full bg-white md:mx-auto",
          isTabletPreview
            ? "md:h-[820px] md:max-w-[820px] md:rounded-[38px] md:bg-[#f3f4f6] md:p-[3px] md:shadow-[0_34px_80px_rgba(15,23,42,0.24),inset_0_0_4px_rgba(0,0,0,0.1)] md:ring-1 md:ring-slate-300"
            : "md:h-[852px] md:max-w-[430px] md:rounded-[46px] md:bg-black md:p-[7px] md:shadow-[0_34px_80px_rgba(15,23,42,0.24),inset_0_0_4px_rgba(255,255,255,0.24)] md:ring-1 md:ring-slate-300",
        ].join(" ")}
      >
        
        {/* Hardware Buttons - Metallic */}
        <div className="absolute -left-[3px] top-[120px] hidden h-[32px] w-[3px] rounded-l-md bg-[#d1d5db] shadow-[inset_-1px_0_1px_rgba(0,0,0,0.2)] md:block"></div>
        <div className="absolute -left-[3px] top-[170px] hidden h-[64px] w-[3px] rounded-l-md bg-[#d1d5db] shadow-[inset_-1px_0_1px_rgba(0,0,0,0.2)] md:block"></div>
        <div className="absolute -left-[3px] top-[245px] hidden h-[64px] w-[3px] rounded-l-md bg-[#d1d5db] shadow-[inset_-1px_0_1px_rgba(0,0,0,0.2)] md:block"></div>
        <div className="absolute -right-[3px] top-[200px] hidden h-[95px] w-[3px] rounded-r-md bg-[#d1d5db] shadow-[inset_1px_0_1px_rgba(0,0,0,0.2)] md:block"></div>

        {/* Black Glass Bezel */}
        <div
          className={[
            "relative h-full w-full overflow-hidden bg-white",
            isTabletPreview
              ? "md:rounded-[33px] md:border-[9px] md:border-black md:bg-black"
              : "md:rounded-[39px]",
          ].join(" ")}
        >
          
          {/* Screen Light Bleed / Inner shadow */}
          <div
            className={[
              "pointer-events-none absolute inset-0 z-50 hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]",
              isTabletPreview ? "rounded-[24px] md:block" : "",
            ].join(" ")}
          ></div>

          {/* Glare Reflection overlay */}
          <div
            className={[
              "pointer-events-none absolute inset-0 z-50 hidden bg-gradient-to-tr from-transparent via-white/5 to-transparent",
              isTabletPreview ? "rounded-[24px] md:block" : "",
            ].join(" ")}
          ></div>

          {/* Screen Content */}
          <div
            className={[
              "absolute inset-0 z-0 overflow-hidden bg-white",
              isTabletPreview ? "md:rounded-[24px]" : "md:rounded-[36px]",
              isTabletPreview ? "mappingPreviewTablet" : "mappingPreviewMobile",
            ].join(" ")}
          >
            <Outlet />
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default function MappingApp() {
  return (
    <Routes>
      <Route element={<MappingLayout />}>
        {/* Make the map explorer the default page */}
        <Route index element={<MapExplorer />} />
        {/* Keep the explorer route active in case any links still point to it */}
        <Route path="explorer" element={<Navigate to="/mapping" replace />} />
        <Route path="*" element={<MappingNotFound />} />
      </Route>
    </Routes>
  );
}
