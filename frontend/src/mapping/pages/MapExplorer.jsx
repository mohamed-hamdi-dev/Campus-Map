import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Briefcase,
  Building2,
  Car,
  Footprints,
  GraduationCap,
  Layers3,
  Library,
  LayoutTemplate,
  LocateFixed,
  MapPin,
  Route,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCampusMap } from "../../hooks/useCampusMap";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const palette = {
  navy: "#0F172A",
  navyDeep: "#020617",
  brandBlue: "#0284C7",
  mapBg: "#EAF2F5",
};

const travelModes = [
  { label: "مشي", value: "walking", Icon: Footprints },
  { label: "سيارة", value: "driving", Icon: Car },
];

function MapUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

function RouteBoundsUpdater({ routePath }) {
  const map = useMap();

  useEffect(() => {
    if (!routePath || routePath.length < 2) return;
    map.fitBounds(L.latLngBounds(routePath), { animate: true, padding: [44, 120] });
  }, [map, routePath]);

  return null;
}

function getPlacePosition(place) {
  const lat = parseFloat(place?.lat ?? place?.latitude);
  const lng = parseFloat(place?.lng ?? place?.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
}

function getPlaceKind(place) {
  const iconKey = String(place?.icon_key || "").toLowerCase();
  const categoryKey = String(place?.category || "").toLowerCase();
  const textKey = [
    place?.name,
    place?.name_ar,
    place?.description,
    place?.description_ar,
  ]
    .map((value) => String(value || "").toLowerCase())
    .join(" ");
  const key = `${iconKey} ${categoryKey}`;

  if (
    categoryKey.includes("facult") ||
    categoryKey.includes("college") ||
    categoryKey.includes("كلية") ||
    categoryKey.includes("كليات") ||
    textKey.includes("faculty") ||
    textKey.includes("college") ||
    textKey.includes("كلية") ||
    textKey.includes("كليات")
  ) {
    return { label: "كلية", Icon: GraduationCap };
  }
  if (categoryKey.includes("service") || categoryKey.includes("خدمة")) return { label: "خدمة", Icon: Briefcase };
  if (categoryKey.includes("admin") || categoryKey.includes("administration") || categoryKey.includes("إدارة")) {
    return { label: "إدارة", Icon: Building2 };
  }
  if (categoryKey.includes("facilit") || categoryKey.includes("مرفق")) return { label: "مرفق", Icon: LayoutTemplate };
  if (categoryKey.includes("gate") || categoryKey.includes("بوابة")) return { label: "بوابة", Icon: MapPin };

  if (key.includes("gate") || key.includes("بوابة")) return { label: "بوابة", Icon: MapPin };
  if (key.includes("admin") || key.includes("administration") || key.includes("إدارة")) {
    return { label: "إدارة", Icon: Building2 };
  }
  if (key.includes("librar") || key.includes("مكتبة")) return { label: "مكتبة", Icon: Library };
  if (key.includes("facilit") || key.includes("مرفق")) return { label: "مرفق", Icon: LayoutTemplate };
  if (key.includes("facult") || key.includes("college") || key.includes("كلية")) {
    return { label: "كلية", Icon: GraduationCap };
  }
  if (key.includes("service") || key.includes("خدمة")) return { label: "خدمة", Icon: Briefcase };

  return { label: "مكان", Icon: ShieldCheck };
}

function getPlaceMetrics(place) {
  const numericId = Number(String(place?.id ?? "").replace(/\D/g, "").slice(-2)) || 12;
  const minutes = 2 + (numericId % 5);
  const distance = 180 + (numericId % 6) * 55;

  return {
    distanceLabel: distance >= 1000 ? `${(distance / 1000).toFixed(1)} كم` : `${distance} م`,
    timeLabel: `يبعد ${minutes} دقائق مشيًا`,
  };
}

function createPlaceIcon(place, selected = false) {
  const { Icon } = getPlaceKind(place);
  const svg = renderToStaticMarkup(<Icon size={16} strokeWidth={2.4} />);
  const placeTitle = place?.building_code || place?.name_ar || place?.name || "";

  return new L.DivIcon({
    className: "",
    html: `
      <div class="campus-marker-wrap ${selected ? "campus-marker-wrap-active" : ""}">
        ${placeTitle ? `<div class="campus-marker-label">${placeTitle}</div>` : ""}
        <div class="campus-marker ${selected ? "campus-marker-active" : ""}">
          <div class="campus-marker-inner">${svg}</div>
        </div>
      </div>
    `,
    iconSize: selected ? [180, 68] : [168, 66],
    iconAnchor: selected ? [90, 62] : [84, 60],
  });
}

const userIcon = new L.DivIcon({
  className: "",
  html: `
    <div class="campus-user">
      <div class="campus-user-pulse"></div>
      <div class="campus-user-core"></div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

export default function MapExplorer() {
  const { places } = useCampusMap();
  const [activePlace, setActivePlace] = useState(null);
  const [navigationPlace, setNavigationPlace] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customCenter, setCustomCenter] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapType, setMapType] = useState("street");
  const [placesPanelOpen, setPlacesPanelOpen] = useState(false);
  const [searchBoxFocused, setSearchBoxFocused] = useState(false);
  const [travelMode, setTravelMode] = useState("walking");
  const [routePath, setRoutePath] = useState(null);
  const [routeStatus, setRouteStatus] = useState("idle");
  const [detailsSheetClosing, setDetailsSheetClosing] = useState(false);

  const defaultCenter = [30.4726, 31.1847];
  const hasSearchQuery = searchQuery.trim().length > 0;
  const showPlacesButton = hasSearchQuery || searchBoxFocused || placesPanelOpen;

  const filteredPlaces = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return places.filter((place) => {
      const haystack = [place.name, place.name_ar, place.category, place.building_code]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      return !query || haystack.includes(query);
    });
  }, [places, searchQuery]);

  const mappablePlaces = filteredPlaces.filter((place) => getPlacePosition(place));
  const mapCenter =
    customCenter ||
    getPlacePosition(activePlace) ||
    mappablePlaces.map(getPlacePosition).find(Boolean) ||
    places.map(getPlacePosition).find(Boolean) ||
    defaultCenter;

  const activePlacePosition = useMemo(() => getPlacePosition(activePlace), [activePlace]);
  const navigationPlacePosition = useMemo(() => getPlacePosition(navigationPlace), [navigationPlace]);
  const activePlaceMeta = activePlace ? getPlaceKind(activePlace) : null;
  const activePlaceMetrics = activePlace ? getPlaceMetrics(activePlace) : null;
  const activePlaceDescription = activePlace
    ? activePlace.description_ar || activePlace.description || ""
    : "";
  const navigationPlaceMeta = navigationPlace ? getPlaceKind(navigationPlace) : null;
  const navigationModeLabel = travelModes.find((mode) => mode.value === travelMode)?.label || "مشي";

  useEffect(() => {
    if (hasSearchQuery) {
      setPlacesPanelOpen(true);
      return;
    }

    if (!searchBoxFocused) {
      setPlacesPanelOpen(false);
    }
  }, [hasSearchQuery, searchBoxFocused]);

  useEffect(() => {
    if (!userLocation || !navigationPlacePosition) {
      setRoutePath(null);
      setRouteStatus("idle");
      return;
    }

    const controller = new AbortController();
    const profile = travelMode === "driving" ? "driving" : "foot";
    const coordinates = `${userLocation[1]},${userLocation[0]};${navigationPlacePosition[1]},${navigationPlacePosition[0]}`;
    const routeUrl = `https://router.project-osrm.org/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson`;

    async function loadRoute() {
      setRouteStatus("loading");

      try {
        const response = await fetch(routeUrl, { signal: controller.signal });
        if (!response.ok) throw new Error("Route request failed");

        const data = await response.json();
        const routeCoordinates = data?.routes?.[0]?.geometry?.coordinates;
        if (!Array.isArray(routeCoordinates) || routeCoordinates.length < 2) {
          throw new Error("No route found");
        }

        setRoutePath(routeCoordinates.map(([lng, lat]) => [lat, lng]));
        setRouteStatus("ready");
      } catch (error) {
        if (error.name === "AbortError") return;
        setRoutePath(null);
        setRouteStatus("error");
      }
    }

    loadRoute();
    return () => controller.abort();
  }, [navigationPlacePosition, travelMode, userLocation]);

  const handlePlaceClick = (place) => {
    const position = getPlacePosition(place);
    setDetailsSheetClosing(false);
    setPlacesPanelOpen(false);
    setActivePlace(place);
    setNavigationPlace(null);
    if (position) setCustomCenter(position);
  };

  const closeDetails = () => {
    if (!activePlace || detailsSheetClosing) return;
    setDetailsSheetClosing(true);
    setTimeout(() => {
      setActivePlace(null);
      setDetailsSheetClosing(false);
    }, 220);
  };

  const handleLocateMe = (onLocated) => {
    if (!navigator.geolocation) {
      alert("متصفحك لا يدعم تحديد الموقع.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextPosition = [position.coords.latitude, position.coords.longitude];
        setUserLocation(nextPosition);
        setCustomCenter(nextPosition);
        if (typeof onLocated === "function") onLocated(nextPosition);
      },
      () => {
        alert("تأكد من تفعيل صلاحيات الموقع في المتصفح.");
      }
    );
  };

  const startNavigation = (place) => {
    if (!place) return;
    const placePosition = getPlacePosition(place);
    if (!placePosition) return;

    if (!userLocation) {
      handleLocateMe((nextPosition) => {
        setNavigationPlace(place);
        setActivePlace(null);
        setCustomCenter(nextPosition);
      });
      return;
    }

    setNavigationPlace(place);
    setActivePlace(null);
    setCustomCenter(userLocation);
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      dir="rtl"
      style={{ fontFamily: "'Cairo', sans-serif", backgroundColor: palette.mapBg }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
          .leaflet-control-attribution { display: none; }
          .leaflet-popup-content-wrapper { border-radius: 18px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.16); }
          .campus-marker-wrap {
            width: 168px;
            height: 66px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            gap: 4px;
            pointer-events: auto;
          }
          .campus-marker-wrap-active {
            width: 180px;
            height: 68px;
          }
          .campus-marker-label {
            max-width: 156px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.76);
            background: rgba(255, 255, 255, 0.82);
            padding: 3px 8px;
            color: #0f172a;
            font-family: 'Cairo', sans-serif;
            font-size: 10.5px;
            font-weight: 900;
            line-height: 1.2;
            box-shadow: 0 10px 22px rgba(15, 23, 42, 0.14);
            backdrop-filter: blur(10px);
          }
          .campus-marker {
            width: 46px;
            height: 46px;
            display: grid;
            place-items: center;
            border-radius: 18px;
            background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
            border: 2px solid rgba(255,255,255,0.95);
            box-shadow: 0 16px 32px rgba(2, 6, 23, 0.28);
          }
          .campus-marker-active {
            width: 42px;
            height: 42px;
            border-radius: 16px;
            background: linear-gradient(180deg, #0284c7 0%, #0ea5e9 100%);
            box-shadow: 0 12px 26px rgba(2, 132, 199, 0.3);
          }
          .campus-marker-inner {
            width: 24px;
            height: 24px;
            display: grid;
            place-items: center;
            border-radius: 12px;
            color: #ffffff;
            background: rgba(255,255,255,0.08);
          }
          .campus-marker-inner svg {
            width: 16px;
            height: 16px;
            stroke: currentColor;
          }
          .campus-user {
            position: relative;
            width: 48px;
            height: 48px;
            display: grid;
            place-items: center;
          }
          .campus-user-pulse {
            position: absolute;
            inset: 3px;
            border-radius: 999px;
            background: rgba(2, 132, 199, 0.16);
            animation: campusPulse 1.8s ease-out infinite;
          }
          .campus-user-core {
            width: 18px;
            height: 18px;
            border-radius: 999px;
            background: #0284c7;
            border: 4px solid #ffffff;
            box-shadow: 0 14px 26px rgba(2, 132, 199, 0.34);
          }
          @keyframes campusPulse {
            0% { transform: scale(.6); opacity: .9; }
            100% { transform: scale(1.35); opacity: 0; }
          }
          .mapSearchBox {
            overflow: visible;
          }
          .searchDropdown {
            max-height: 0;
            opacity: 0;
            pointer-events: none;
            transform: translateY(-8px);
            overflow: hidden;
            transition:
              max-height 260ms ease,
              opacity 180ms ease,
              transform 220ms ease,
              margin-top 220ms ease;
          }
          .mapSearchBox:focus-within .searchDropdown {
            max-height: 132px;
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
          }
          @media (hover: hover) and (pointer: fine) {
            .mapSearchBox:hover .searchDropdown {
              max-height: 132px;
              opacity: 1;
              pointer-events: auto;
              transform: translateY(0);
            }
          }
          .mapDetailsSheet {
            will-change: transform, opacity;
          }
          .mapFloatingControls {
            left: auto;
            right: 1rem;
          }
          .mappingPreviewMobile .mapDetailsSheet {
            left: 0;
            right: 0;
            bottom: 0;
            width: auto;
            max-width: none;
            margin-left: 0;
            margin-right: 0;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
          }
          .mappingPreviewMobile .detailsActions {
            width: 100%;
            max-width: none;
            margin-left: 0;
            grid-template-columns: 1fr auto;
            justify-content: stretch;
          }
          .mappingPreviewMobile .travelModesGroup {
            grid-column: 1 / -1;
            margin-left: auto;
          }
          .mappingPreviewMobile .routeButton {
            width: 100%;
            min-width: 0;
          }
          .mappingPreviewTablet .detailsActions,
          .mappingPreviewMobile .detailsActions {
            margin-left: 0;
            margin-right: 0;
            max-width: none;
            justify-content: stretch;
          }
          .mappingPreviewTablet .mapDetailsSheet {
            max-width: 520px;
            width: calc(100% - 120px);
          }
          .mappingPreviewTablet .routeButton {
            min-width: 260px;
            justify-content: flex-start;
          }
          .mapSheetOpening {
            animation: mapSheetUp 240ms cubic-bezier(.2,.85,.24,1) both;
          }
          .mapSheetClosing {
            animation: mapSheetDown 220ms ease-in both;
          }
          @keyframes mapSheetUp {
            from { transform: translateY(calc(100% + 24px)); opacity: .65; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes mapSheetDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(calc(100% + 24px)); opacity: .65; }
          }
          .placesGlassPanel {
            background: rgba(255, 255, 255, 0.58);
            border: 1px solid rgba(255, 255, 255, 0.65);
            box-shadow: 0 18px 42px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.68);
            backdrop-filter: blur(18px) saturate(1.2);
          }
          .placesGlassItem {
            background: rgba(255, 255, 255, 0.62);
            border: 1px solid rgba(255, 255, 255, 0.72);
            box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
          }
          .placesGlassItem:hover {
            background: rgba(240, 249, 255, 0.78);
            border-color: rgba(125, 211, 252, 0.95);
          }
        `}
      </style>

      <div className="absolute inset-0 z-0">
        <MapContainer center={mapCenter} zoom={16} zoomControl={false} style={{ height: "100%", width: "100%" }}>
          {mapType === "street" ? (
            <TileLayer
              attribution="&copy; OpenStreetMap &copy; CARTO"
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          ) : (
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}

          <MapUpdater center={mapCenter} />
          <RouteBoundsUpdater routePath={routePath} />

          {routePath ? (
            <>
              <Polyline
                positions={routePath}
                pathOptions={{
                  color: "#BAE6FD",
                  weight: 12,
                  opacity: 0.55,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              <Polyline
                positions={routePath}
                pathOptions={{
                  color: palette.brandBlue,
                  weight: 6,
                  opacity: 0.95,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </>
          ) : null}

          {userLocation ? (
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="text-sm font-bold">موقعك الحالي</div>
              </Popup>
            </Marker>
          ) : null}

          {mappablePlaces.map((place) => {
            const position = getPlacePosition(place);
            if (!position) return null;

            return (
              <Marker
                key={place.id}
                icon={createPlaceIcon(place, activePlace?.id === place.id || navigationPlace?.id === place.id)}
                position={position}
                eventHandlers={{ click: () => handlePlaceClick(place) }}
              />
            );
          })}
        </MapContainer>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[320] h-44 bg-gradient-to-b from-[#EAF2F5] via-[#EAF2F5]/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[320] h-44 bg-gradient-to-t from-[#EAF2F5]/90 via-[#EAF2F5]/42 to-transparent" />

      {!activePlace && !navigationPlace ? (
        <div
          className="mapSearchBox absolute right-1/2 top-[58px] z-[420] w-[86%] max-w-[380px] translate-x-1/2 rounded-[24px] border border-white/65 bg-white/55 p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-2xl"
          onFocus={() => setSearchBoxFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setSearchBoxFocused(false);
            }
          }}
        >
          <div className="searchInput flex h-10 items-center gap-2.5 rounded-[19px] border border-white/60 bg-white/45 px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]">
            <input
              type="text"
              placeholder="ابحث عن مكان..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="min-w-0 flex-1 border-none bg-transparent text-right text-[13px] font-black text-slate-900 outline-none placeholder:text-slate-500"
            />

            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/70 text-slate-500 shadow-sm ring-1 ring-white/70"
              >
                <X size={14} />
              </button>
            ) : (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50/80 text-sky-700 ring-1 ring-white/80">
                <Search size={15} />
              </span>
            )}
          </div>

          {showPlacesButton ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setPlacesPanelOpen((value) => !value)}
              className={[
                "mt-2.5 ml-auto flex h-8 items-center justify-center rounded-full border px-4 text-[11px] font-black transition",
                placesPanelOpen
                  ? "border-sky-500/70 bg-sky-600/90 text-white shadow-[0_10px_24px_rgba(2,132,199,0.26)]"
                  : "border-white/65 bg-white/55 text-slate-700 shadow-sm backdrop-blur-md hover:border-sky-200 hover:bg-white/78 hover:text-sky-800",
              ].join(" ")}
            >
              {placesPanelOpen ? "إخفاء الأماكن" : "عرض الأماكن"}
            </button>
          ) : null}

          {placesPanelOpen ? (
            <div className="placesGlassPanel mt-2 max-h-[260px] overflow-y-auto rounded-[20px] p-2">
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-[11px] font-black text-slate-500">
                  {mappablePlaces.length} مكان
                </span>
                <span className="text-[12px] font-black text-slate-900">الأماكن</span>
              </div>

              <div className="space-y-1.5">
                {mappablePlaces.length > 0 ? (
                  mappablePlaces.map((place) => {
                    const placeMeta = getPlaceKind(place);
                    const PlaceIcon = placeMeta.Icon;
                    const selected = activePlace?.id === place.id || navigationPlace?.id === place.id;

                    return (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => handlePlaceClick(place)}
                        className={[
                          "placesGlassItem flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-right transition",
                          selected
                            ? "border-slate-950 bg-sky-50 text-sky-800"
                            : "text-slate-700",
                        ].join(" ")}
                      >
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
                          <PlaceIcon size={15} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-black text-slate-950">
                            {place.name_ar || place.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[10.5px] font-bold text-slate-500">
                            {placeMeta.label} {place.building_code ? `• ${place.building_code}` : ""}
                          </span>
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-2xl bg-white/70 px-3 py-4 text-center text-[12px] font-black text-slate-400">
                    لا توجد أماكن مطابقة
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mapFloatingControls absolute bottom-6 z-[410] flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setMapType((value) => (value === "street" ? "satellite" : "street"))}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-slate-800/20 bg-white/90 text-sky-700 shadow-[0_14px_30px_rgba(15,23,42,0.16)] backdrop-blur-md transition hover:border-sky-300 hover:bg-sky-50"
          title="طبقات الخريطة"
        >
          <Layers3 size={19} className={mapType === "satellite" ? "text-sky-700" : "text-slate-700"} />
        </button>

        <button
          type="button"
          onClick={handleLocateMe}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[18px] border border-slate-800/20 bg-white/90 text-sky-700 shadow-[0_14px_30px_rgba(15,23,42,0.16)] backdrop-blur-md transition hover:border-sky-300 hover:bg-sky-50"
          title="موقعي"
        >
          <LocateFixed size={19} />
        </button>
      </div>

      {activePlace ? (
        <div
          className={[
            "mapDetailsSheet absolute inset-x-0 bottom-0 z-[430] rounded-b-none rounded-t-[28px] border border-white/90 bg-white/95 px-4 pb-4 pt-3 shadow-[0_-16px_42px_rgba(15,23,42,0.15)] backdrop-blur-xl md:bottom-6 md:mx-auto md:w-[calc(100%-72px)] md:max-w-[560px] md:rounded-[26px] md:px-5 md:pb-4 md:pt-2",
            detailsSheetClosing ? "mapSheetClosing" : "mapSheetOpening",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={closeDetails}
            aria-label="إغلاق التفاصيل"
            className="mx-auto block h-6 w-20 rounded-full p-2"
          >
            <span className="block h-1.5 w-16 rounded-full bg-slate-400 shadow-[inset_0_1px_1px_rgba(15,23,42,0.16)]" />
          </button>

          <button
            type="button"
            onClick={closeDetails}
            aria-label="إغلاق التفاصيل"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
          >
            <X size={18} />
          </button>

          <div className="mt-3 flex items-start gap-3 pr-11 md:mt-2">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black text-sky-700 md:text-[10px]">
                {activePlaceMetrics?.distanceLabel || "250 م"}
              </div>

              <h2 className="mt-2 text-[17px] font-black leading-tight text-slate-950 md:text-[15px]">
                {activePlace.name_ar || activePlace.name}
              </h2>

              <p className="mt-1 text-[12px] font-bold text-slate-500 md:text-[11px]">
                {activePlaceMeta?.label || "مكان"} <span className="px-1 text-slate-300">•</span>{" "}
                {activePlaceMetrics?.timeLabel || "يبعد 4 دقائق مشيًا"}
              </p>

              {activePlaceDescription ? (
                <p className="mt-2 line-clamp-2 text-[10.5px] font-bold leading-relaxed text-slate-500 md:text-[10px]">
                  {activePlaceDescription}
                </p>
              ) : null}
            </div>
          </div>

          <div className="detailsActions mt-4 grid grid-cols-[1fr_auto] gap-3 md:grid-cols-[1fr_auto]">
            <div className="travelModesGroup col-span-2 ml-auto inline-grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
              {travelModes.map(({ label, value, Icon }) => {
                const active = travelMode === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTravelMode(value)}
                    className={[
                      "inline-flex h-8 min-w-[84px] items-center justify-center gap-1.5 rounded-xl px-3 text-[11px] font-black transition md:min-w-[72px] md:px-2",
                      active
                        ? "bg-white text-sky-700 shadow-[0_8px_18px_rgba(15,23,42,0.1)]"
                        : "text-slate-500 hover:text-slate-800",
                    ].join(" ")}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => startNavigation(activePlace)}
              dir="rtl"
              className="routeButton inline-flex h-11 items-center justify-start gap-2 rounded-[18px] bg-[#0F172A] px-4 text-[14px] font-black text-white shadow-[0_14px_28px_rgba(15,23,42,0.2)] transition hover:bg-[#020617] md:min-w-[172px] md:text-[13px]"
            >
              <Route size={18} />
              <span>اتجه إليها</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchQuery(activePlace.name_ar || activePlace.name || "");
                setActivePlace(null);
                setNavigationPlace(null);
              }}
              className="inline-flex h-11 items-center justify-center rounded-[18px] bg-slate-100 px-4 text-[13px] font-black text-slate-700 transition hover:bg-slate-200 md:text-[12px]"
            >
              بحث
            </button>
          </div>
        </div>
      ) : null}

      {!activePlace && navigationPlace ? (
        <div className="absolute inset-x-6 bottom-4 z-[430] rounded-[24px] border border-white/90 bg-white/95 p-3.5 shadow-[0_-12px_34px_rgba(15,23,42,0.14)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-black text-sky-700">الاتجاه إلى</p>
              <h3 className="mt-0.5 truncate text-[16px] font-black text-slate-950">
                {navigationPlace.name_ar || navigationPlace.name}
              </h3>
              <p className="mt-0.5 text-[11px] font-bold text-slate-500">
                {navigationPlaceMeta?.label || "مكان"} <span className="px-1 text-slate-300">•</span>{" "}
                {navigationModeLabel}
              </p>
              <p
                className={[
                  "mt-0.5 text-[10.5px] font-black",
                  routeStatus === "error" ? "text-rose-500" : "text-slate-400",
                ].join(" ")}
              >
                {routeStatus === "loading"
                  ? "جاري حساب المسار على الطرق..."
                  : routeStatus === "ready"
                    ? "المسار مرسوم على الطرق"
                    : routeStatus === "error"
                      ? "تعذر حساب المسار على الطرق الآن"
                      : "سيظهر المسار بعد تحديد موقعك"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNavigationPlace(null)}
              aria-label="إيقاف الاتجاه"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
            >
              <X size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setActivePlace(navigationPlace);
              setNavigationPlace(null);
              const position = getPlacePosition(navigationPlace);
              if (position) setCustomCenter(position);
            }}
            className="mt-2.5 inline-flex h-10 w-full items-center justify-center rounded-[16px] bg-[#0F172A] text-[13px] font-black text-white transition hover:bg-[#020617]"
          >
            عرض التفاصيل
          </button>
        </div>
      ) : null}
    </div>
  );
}
