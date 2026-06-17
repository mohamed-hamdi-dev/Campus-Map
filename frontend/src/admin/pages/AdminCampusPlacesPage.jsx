import React, { useState, useRef, useEffect, useMemo } from "react";
import { Edit2, Trash2, MapPin, RefreshCw, Plus, Briefcase, GraduationCap, Building2, LayoutTemplate, ChevronDown, Search, Layers3 } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCampusMap } from "../../hooks/useCampusMap";

const customMarkerIcon = new L.DivIcon({
  className: "",
  html: `
    <div class="admin-map-marker">
      <svg viewBox="0 0 32 44" aria-hidden="true">
        <path d="M16 42C16 42 4 27.7 4 16.5C4 9.6 9.4 4 16 4C22.6 4 28 9.6 28 16.5C28 27.7 16 42 16 42Z" fill="#0f172a"/>
        <path d="M16 42C16 42 4 27.7 4 16.5C4 9.6 9.4 4 16 4C22.6 4 28 9.6 28 16.5C28 27.7 16 42 16 42Z" fill="url(#adminMarkerGlow)" opacity="0.18"/>
        <circle cx="16" cy="16.5" r="5.5" fill="#ffffff"/>
        <defs>
          <linearGradient id="adminMarkerGlow" x1="16" y1="4" x2="16" y2="42" gradientUnits="userSpaceOnUse">
            <stop stop-color="#38bdf8"/>
            <stop offset="1" stop-color="#0284c7"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  `,
  iconSize: [32, 44],
  iconAnchor: [16, 42],
});

function LocationMarker({ position, setPosition }) {
  const markerRef = useRef(null);
  
  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const latLng = marker.getLatLng();
        setPosition(latLng.lat.toFixed(6), latLng.lng.toFixed(6));
      }
    },
  }), [setPosition]);

  useMapEvents({
    click(e) {
      setPosition(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
    },
  });

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      icon={customMarkerIcon}
      ref={markerRef}
    />
  );
}

function MapRecenter({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, Math.max(map.getZoom(), 16), { animate: true });
  }, [center, map]);

  return null;
}

const categories = [
  { value: "services", label: "خدمات" },
  { value: "faculties", label: "كليات" },
  { value: "administration", label: "إدارة" },
  { value: "facilities", label: "مرافق" },
  { value: "gates", label: "بوابات" },
];

const iconsList = [
  { value: "services", label: "خدمة", icon: Briefcase },
  { value: "faculties", label: "كلية", icon: GraduationCap },
  { value: "administration", label: "إدارة", icon: Building2 },
  { value: "facilities", label: "مرفق", icon: LayoutTemplate },
  { value: "gates", label: "بوابة", icon: MapPin },
];

export default function AdminCampusPlacesPage() {
  const { places, addPlace, updatePlace, deletePlace, fetchPlaces } = useCampusMap();
  const [searchQuery, setSearchQuery] = useState("");
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [mapSearchLoading, setMapSearchLoading] = useState(false);
  const [mapType, setMapType] = useState("street");
  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    building_code: "",
    category: "facilities",
    icon_key: "services",
    latitude: "",
    longitude: "",
    description: "",
    description_ar: ""
  });

  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [editingPlaceId, setEditingPlaceId] = useState(null);
  const iconDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (iconDropdownRef.current && !iconDropdownRef.current.contains(event.target)) {
        setIsIconDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIconSelect = (val) => {
    setFormData((prev) => ({ ...prev, icon_key: val }));
    setIsIconDropdownOpen(false);
  };

  const handleCategorySelect = (val) => {
    setFormData((prev) => ({ ...prev, category: val }));
    setIsCategoryDropdownOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: "", name_ar: "", building_code: "", category: "facilities", icon_key: "services",
      latitude: "", longitude: "", description: "", description_ar: ""
    });
    setEditingPlaceId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return alert("الاسم بالإنجليزية مطلوب");

    if (editingPlaceId) {
      updatePlace(editingPlaceId, formData);
    } else {
      addPlace(formData);
    }

    resetForm();
  };

  const handleMapPositionChange = (lat, lng) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  useEffect(() => {
    const query = mapSearchQuery.trim();

    if (query.length < 2) {
      setMapSearchResults([]);
      setMapSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setMapSearchLoading(true);

      try {
        const params = new URLSearchParams({
          format: "jsonv2",
          q: `${query}, مصر`,
          limit: "6",
          addressdetails: "1",
          "accept-language": "ar",
          countrycodes: "eg",
        });

        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search failed");

        const results = await response.json();
        setMapSearchResults(Array.isArray(results) ? results : []);
      } catch (error) {
        if (error.name !== "AbortError") setMapSearchResults([]);
      } finally {
        if (!controller.signal.aborted) setMapSearchLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [mapSearchQuery]);

  const filteredPlaces = places.filter(p => {
    const q = searchQuery.toLowerCase();
    return (p.name && p.name.toLowerCase().includes(q)) || 
           (p.name_ar && p.name_ar.toLowerCase().includes(q)) || 
           (p.building_code && p.building_code.toLowerCase().includes(q)) ||
           (p.category && p.category.toLowerCase().includes(q));
  });

  const filteredSavedMapPlaces = mapSearchQuery.trim()
    ? places
        .filter((place) => {
          const q = mapSearchQuery.trim().toLowerCase();
          return [place.name, place.name_ar, place.building_code, place.category]
            .map((value) => String(value || "").toLowerCase())
            .some((value) => value.includes(q));
        })
        .filter((place) => Number.isFinite(parseFloat(place.lat ?? place.latitude)) && Number.isFinite(parseFloat(place.lng ?? place.longitude)))
        .slice(0, 6)
    : [];

  const handleMapPlaceSelect = (place) => {
    const lat = parseFloat(place.lat ?? place.latitude);
    const lng = parseFloat(place.lng ?? place.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
    setMapSearchQuery(place.name_ar || place.name || "");
  };

  const handleGeocodeSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
    setMapSearchQuery(result.display_name?.split(",").slice(0, 2).join("، ") || result.name || "");
    setMapSearchResults([]);
  };

  const handleEditPlace = (place) => {
    setEditingPlaceId(place.id);
    setFormData({
      name: place.name || "",
      name_ar: place.name_ar || "",
      building_code: place.building_code || "",
      category: place.category || "facilities",
      icon_key: place.icon_key || "services",
      latitude: String(place.latitude ?? place.lat ?? ""),
      longitude: String(place.longitude ?? place.lng ?? ""),
      description: place.description || "",
      description_ar: place.description_ar || "",
    });

    const lat = parseFloat(place.latitude ?? place.lat);
    const lng = parseFloat(place.longitude ?? place.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setMapSearchQuery(place.name_ar || place.name || "");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedIconObj = iconsList.find(i => i.value === formData.icon_key) || iconsList[0];
  const SelectedIcon = selectedIconObj.icon;
  const selectedCategoryObj = categories.find(c => c.value === formData.category) || categories[0];

  const mapCenter = (formData.latitude && formData.longitude) 
    ? [parseFloat(formData.latitude), parseFloat(formData.longitude)] 
    : [30.4726, 31.1847];

  return (
    <div className="space-y-6" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
          .leaflet-container {
            z-index: 0 !important;
            direction: ltr !important;
          }
          .leaflet-pane,
          .leaflet-control-container,
          .leaflet-marker-pane,
          .leaflet-tile-pane {
            direction: ltr !important;
          }
          .admin-map .leaflet-control-zoom {
            overflow: hidden;
            border: 1px solid rgba(226, 232, 240, 0.9) !important;
            border-radius: 16px !important;
            background: rgba(255, 255, 255, 0.88);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
            backdrop-filter: blur(10px);
          }
          .admin-map .leaflet-control-zoom a {
            width: 34px !important;
            height: 34px !important;
            line-height: 32px !important;
            border: 0 !important;
            color: #334155 !important;
            font-size: 17px !important;
            font-weight: 900 !important;
            background: transparent !important;
          }
          .admin-map .leaflet-control-zoom a + a {
            border-top: 1px solid rgba(226, 232, 240, 0.9) !important;
          }
          .admin-map .leaflet-control-zoom a:hover {
            background: rgba(248, 250, 252, 0.92) !important;
            color: #0284c7 !important;
          }
          .admin-map-marker {
            width: 32px;
            height: 44px;
            filter: drop-shadow(0 12px 12px rgba(15, 23, 42, 0.22));
          }
          .admin-map-marker svg {
            display: block;
            width: 32px;
            height: 44px;
          }
          .admin-field {
            width: 100%;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            background: #fff;
            padding: 0.72rem 1rem;
            font-size: 0.875rem;
            outline: none;
            transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
          }
          .admin-field:focus {
            border-color: #38bdf8;
            box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.12);
          }
        `}
      </style>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <MapPin className="text-sky-600" size={28} />
          <div>
            <h1 className="text-xl font-black text-slate-800">إدارة أماكن الجامعة</h1>
            <p className="text-sm text-slate-500 mt-1">إضافة/تعديل الأماكن التي تظهر في خريطة المساعد.</p>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[28px] bg-white p-2 shadow-[0_18px_46px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
        <div className="absolute right-5 top-5 z-[400] w-[min(380px,calc(100%-2.5rem))]">
          <div className="rounded-[22px] border border-white/80 bg-white/88 p-1.5 shadow-[0_10px_26px_rgba(15,23,42,0.1)] backdrop-blur-md">
            <div className="flex h-10 items-center gap-2 rounded-[17px] bg-[#F8FAFC]/80 px-3">
                <Search size={16} className="text-sky-600" />
                <input
                  type="text"
                  value={mapSearchQuery}
                  onChange={(event) => setMapSearchQuery(event.target.value)}
                  placeholder="ابحث عن مكان على الخريطة..."
                  className="min-w-0 flex-1 border-none bg-transparent text-right text-[12px] font-bold text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              {mapSearchQuery.trim().length >= 2 ? (
                <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-100 bg-white">
                  {filteredSavedMapPlaces.map((place) => (
                    <button
                      key={`saved-${place.id}`}
                      type="button"
                      onClick={() => handleMapPlaceSelect(place)}
                      className="flex w-full items-center justify-between gap-3 border-b border-slate-50 px-3 py-2 text-right transition hover:bg-sky-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-black text-slate-800">
                          {place.name_ar || place.name}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] font-bold text-slate-400">
                          مكان مسجل • {place.building_code || place.category || "مكان"}
                        </span>
                      </span>
                      <MapPin size={14} className="shrink-0 text-sky-600" />
                    </button>
                  ))}

                  {mapSearchResults.map((result) => (
                    <button
                      key={`geo-${result.place_id}`}
                      type="button"
                      onClick={() => handleGeocodeSelect(result)}
                      className="flex w-full items-center justify-between gap-3 border-b border-slate-50 px-3 py-2 text-right transition hover:bg-sky-50 last:border-0"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-black text-slate-800">
                          {result.name || result.display_name?.split(",")[0] || "مكان على الخريطة"}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] font-bold text-slate-400">
                          {result.display_name || "نتيجة من الخريطة"}
                        </span>
                      </span>
                      <MapPin size={14} className="shrink-0 text-sky-600" />
                    </button>
                  ))}

                  {mapSearchLoading ? (
                    <div className="px-3 py-2 text-right text-[11px] font-black text-slate-400">
                      جاري البحث في الخريطة...
                    </div>
                  ) : null}

                  {!mapSearchLoading && filteredSavedMapPlaces.length === 0 && mapSearchResults.length === 0 ? (
                    <div className="px-3 py-2 text-right text-[11px] font-black text-slate-400">
                      لا توجد نتائج لهذا البحث
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

          <button
            type="button"
            onClick={() => setMapType((value) => (value === "street" ? "satellite" : "street"))}
            className="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-sky-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)] backdrop-blur-md transition hover:bg-sky-50"
            title={mapType === "street" ? "عرض القمر الصناعي" : "عرض الخريطة العادية"}
          >
            <Layers3 size={18} />
          </button>
        </div>
        <div dir="ltr" className="admin-map h-[340px] w-full overflow-hidden rounded-[22px] sm:h-[390px] lg:h-[430px]">
          <MapContainer 
            center={mapCenter} 
            zoom={16} 
            scrollWheelZoom={true} 
            style={{ height: "100%", width: "100%", zIndex: 0 }}
          >
            {mapType === "street" ? (
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap &copy; CARTO"
              />
            ) : (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
              />
            )}
            <MapRecenter center={mapCenter} />
            <LocationMarker position={mapCenter} setPosition={handleMapPositionChange} />
          </MapContainer>
        </div>
      </div>
        
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 rounded-[28px] bg-white p-6 shadow-[0_18px_46px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/70">
        
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input 
              name="name" value={formData.name} onChange={handleChange} required
              placeholder="الاسم (بالانجليزية) *" 
              className="admin-field text-right" 
            />
          </div>
          <div>
            <input 
              name="name_ar" value={formData.name_ar} onChange={handleChange}
              placeholder="الاسم (AR)" 
              className="admin-field text-right" 
            />
          </div>
          <div>
            <input 
              name="building_code" value={formData.building_code} onChange={handleChange}
              placeholder="كود المبنى (مثل A)" 
              className="admin-field text-right" 
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right transition-colors hover:border-sky-400 hover:shadow-[0_0_0_4px_rgba(14,165,233,0.08)]"
            >
              <span className="text-sm font-bold text-slate-700">{selectedCategoryObj.label}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_34px_rgba(15,23,42,0.12)]">
                {categories.map((category) => {
                  const active = category.value === formData.category;

                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => handleCategorySelect(category.value)}
                      className={[
                        "flex w-full items-center justify-between px-4 py-3 text-right text-sm font-bold transition-colors",
                        active ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <span>{category.label}</span>
                      {active ? <span className="h-2 w-2 rounded-full bg-sky-600" /> : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Custom Icon Dropdown */}
          <div className="relative" ref={iconDropdownRef}>
            <div 
              onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-sky-400 hover:shadow-[0_0_0_4px_rgba(14,165,233,0.08)]"
            >
              <div className="flex items-center gap-2">
                <SelectedIcon size={16} className="text-slate-600" />
                <span className="text-sm font-bold text-slate-700">{selectedIconObj.label}</span>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
            
            {isIconDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_34px_rgba(15,23,42,0.12)]">
                {iconsList.map(iconObj => {
                  const IconComp = iconObj.icon;
                  return (
                    <div 
                      key={iconObj.value}
                      onClick={() => handleIconSelect(iconObj.value)}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b last:border-0 border-slate-50"
                    >
                      <IconComp size={16} className="text-slate-600" />
                      <span className="text-sm font-bold text-slate-700">{iconObj.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <input 
              name="latitude" value={formData.latitude} onChange={handleChange} type="number" step="any"
              placeholder="Latitude" 
              className="admin-field text-left" 
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input 
              name="longitude" value={formData.longitude} onChange={handleChange} type="number" step="any"
              placeholder="Longitude" 
              className="admin-field text-left" 
            />
          </div>
          <div>
            <input 
              name="description" value={formData.description} onChange={handleChange}
              placeholder="الوصف (بالانجليزية)" 
              className="admin-field text-right" 
            />
          </div>
        </div>

        {/* Row 4 */}
        <div>
          <input 
            name="description_ar" value={formData.description_ar} onChange={handleChange}
            placeholder="الوصف (AR)" 
            className="admin-field text-right" 
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-start gap-3 pt-4">
          <button type="submit" className="flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 font-black text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-800">
            {editingPlaceId ? "حفظ التعديل" : "إضافة المكان"} <Plus size={18} />
          </button>
          {editingPlaceId ? (
            <button type="button" onClick={resetForm} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-600 shadow-sm transition-colors hover:bg-slate-50">
              إلغاء
            </button>
          ) : null}
          <button type="button" onClick={fetchPlaces} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-600 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700">
            تحديث <RefreshCw size={16} />
          </button>
        </div>
      </form>

      {/* Table & Search */}
      <div className="mt-6 overflow-hidden rounded-[28px] bg-white shadow-[0_18px_46px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/70">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 p-4">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="ابحث عن مكان بالاسم أو الكود أو التصنيف..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-slate-700 placeholder-slate-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm" dir="rtl">
            <tbody>
              {filteredPlaces.map((place, idx) => {
                const PlaceIcon = iconsList.find(i => i.value === place.icon_key)?.icon || Briefcase;
                const placeLabel = iconsList.find(i => i.value === place.icon_key)?.label || "خدمة";
                
                return (
                <tr key={place.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                  <td className="w-12 whitespace-nowrap p-4 text-center font-bold text-slate-900">{idx + 1}</td>
                  <td className="whitespace-nowrap p-4">
                    <div className="font-bold text-slate-900">{place.name_ar || place.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{place.name}</div>
                  </td>
                  <td className="whitespace-nowrap p-4 text-center text-slate-500">{place.building_code || "-"}</td>
                  <td className="whitespace-nowrap p-4 text-center text-slate-600">{place.category}</td>
                  <td className="whitespace-nowrap p-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      <PlaceIcon size={12} /> {placeLabel}
                    </span>
                  </td>
                  <td className="whitespace-nowrap p-4 text-center font-mono text-slate-600">{place.latitude}</td>
                  <td className="whitespace-nowrap p-4 text-center font-mono text-slate-600">{place.longitude}</td>
                  <td className="w-40 whitespace-nowrap p-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => handleEditPlace(place)} className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 font-bold text-emerald-600 transition-colors hover:bg-emerald-100">
                        تعديل <Edit2 size={14} />
                      </button>
                      <button type="button" onClick={() => deletePlace(place.id)} className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 font-bold text-red-600 transition-colors hover:bg-red-100">
                        حذف <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
              {filteredPlaces.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400 font-bold">لا توجد أماكن مطابقة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
