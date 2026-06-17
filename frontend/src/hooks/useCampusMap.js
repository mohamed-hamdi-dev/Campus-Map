import { useState, useEffect } from "react";

// إذا كان لديك ملف api.js يحتوي على apiFetch، قم باستدعائه هنا.
// مؤقتاً إذا لم نجدها سنستخدم دالة تقوم بعمل fetch مباشرة لتجنب الأخطاء
const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("access_token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  
  const res = await fetch(`http://localhost:8000${url}`, { ...options, headers });
  if (!res.ok) throw new Error("API Fetch Error");
  return res.json();
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);
const STORAGE_KEY = "campus_places_data";

const defaultCampusPlaces = [
  {
    id: "seed-building-f",
    name: "Building F at the Faculty of Engineering",
    name_ar: "مبنى F - كلية الهندسة",
    building_code: "F",
    category: "faculties",
    icon_key: "faculties",
    latitude: 30.248717,
    longitude: 31.455538,
    description: "Building F at the Faculty of Engineering used for classrooms, offices, or academic services.",
    description_ar: "مبنى F التابع لكلية الهندسة ويستخدم للقاعات أو المكاتب أو الخدمات الأكاديمية داخل الكلية",
  },
];

export const campusPlacesApi = {
  async list(category = "") {
    const suffix = category ? `?category=${encodeURIComponent(category)}` : "";
    const data = await apiFetch(`/api/campus/places${suffix}`);
    return ensureArray(data);
  },
  async create(payload) {
    return apiFetch("/api/campus/places", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async update(id, payload) {
    return apiFetch(`/api/campus/places/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  async remove(id) {
    return apiFetch(`/api/campus/places/${id}`, {
      method: "DELETE",
    });
  },
};

export function useCampusMap() {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load from Local Storage
  const fetchPlaces = () => {
    setIsLoading(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPlaces(JSON.parse(saved));
      } else {
        setPlaces(defaultCampusPlaces);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCampusPlaces));
      }
    } catch (err) {
      console.error("Failed to parse local places", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const addPlace = (place) => {
    const payload = {
      id: Date.now().toString(),
      name: place.name,
      name_ar: place.name_ar || "",
      building_code: place.building_code || "",
      category: place.category || "Building",
      icon_key: place.icon_key || "",
      latitude: parseFloat(place.latitude) || 0,
      longitude: parseFloat(place.longitude) || 0,
      description: place.description || "",
      description_ar: place.description_ar || ""
    };
    
    const newPlaces = [...places, payload];
    setPlaces(newPlaces);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlaces));
  };

  const updatePlace = (id, updatedData) => {
    const payload = {
      id: id,
      name: updatedData.name,
      name_ar: updatedData.name_ar || "",
      building_code: updatedData.building_code || "",
      category: updatedData.category || "Building",
      icon_key: updatedData.icon_key || "",
      latitude: parseFloat(updatedData.latitude) || 0,
      longitude: parseFloat(updatedData.longitude) || 0,
      description: updatedData.description || "",
      description_ar: updatedData.description_ar || ""
    };
    const newPlaces = places.map((p) => (p.id === id ? payload : p));
    setPlaces(newPlaces);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlaces));
  };

  const deletePlace = (id) => {
    const newPlaces = places.filter((p) => p.id !== id);
    setPlaces(newPlaces);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlaces));
  };

  const importFromJson = (jsonData) => {
    setPlaces(jsonData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jsonData));
  };

  return { places, isLoading, addPlace, updatePlace, deletePlace, fetchPlaces, importFromJson };
}
