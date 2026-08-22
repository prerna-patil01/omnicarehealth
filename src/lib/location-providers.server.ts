import { aqiBand, haversineKm, type Hospital, type LocalHealth, type Place } from "@/lib/location-core";

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";
const UA = { "User-Agent": "OmniCare/1.0 (health app)", "Accept-Language": "en" };

function creds() {
  return {
    direct: process.env["GOOGLE_MAPS_API_KEY_DIRECT"] || process.env["VITE_GOOGLE_MAPS_API_KEY"] || "",
    lovable: process.env["LOVABLE_API_KEY"] || "",
    connector: process.env["GOOGLE_MAPS_API_KEY"] || "",
  };
}

function gatewayReady() {
  const { lovable, connector } = creds();
  return Boolean(lovable && connector);
}

function gatewayHeaders(extra: Record<string, string> = {}) {
  const { lovable, connector } = creds();
  return { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": connector, ...extra };
}

function fromGoogle(comps: any[], lat: number, lng: number, formatted: string): Place {
  const pick = (t: string) => comps.find((c: any) => c.types?.includes(t))?.long_name ?? "";
  const city = pick("locality") || pick("postal_town") || pick("administrative_area_level_3") || pick("sublocality");
  const district = pick("administrative_area_level_2") || pick("sublocality_level_1") || city;
  const state = pick("administrative_area_level_1");
  const country = pick("country");
  return {
    lat,
    lng,
    city: city || district || state || "Unknown area",
    district,
    state,
    country,
    label: [city || district, state, country].filter(Boolean).join(", ") || formatted,
  };
}

function fromOsm(addr: any, lat: number, lng: number, display: string): Place {
  const city = addr?.city || addr?.town || addr?.village || addr?.municipality || addr?.suburb || "";
  const district = addr?.county || addr?.state_district || addr?.city_district || city;
  const state = addr?.state || "";
  const country = addr?.country || "";
  return {
    lat,
    lng,
    city: city || district || state || "Unknown area",
    district,
    state,
    country,
    label: [city || district, state, country].filter(Boolean).join(", ") || display,
  };
}

export async function doReverseGeocode(lat: number, lng: number): Promise<Place> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("Invalid coordinates");
  const { direct } = creds();
  try {
    let res: Response | null = null;
    if (direct) res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${direct}`);
    else if (gatewayReady()) res = await fetch(`${GATEWAY}/maps/api/geocode/json?latlng=${lat},${lng}`, { headers: gatewayHeaders() });
    if (res?.ok) {
      const json: any = await res.json();
      const r = json?.results?.[0];
      if (r) return fromGoogle(r.address_components ?? [], lat, lng, r.formatted_address ?? "");
    }
  } catch {
    /* fall back to the free provider */
  }

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`,
    { headers: UA },
  );
  if (!res.ok) throw new Error(`Reverse geocoding failed (${res.status})`);
  const json: any = await res.json();
  return fromOsm(json?.address, lat, lng, json?.display_name ?? "");
}

export async function doSearchLocation(query: string): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const { direct } = creds();
  try {
    let res: Response | null = null;
    if (direct) res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${direct}`);
    else if (gatewayReady()) res = await fetch(`${GATEWAY}/maps/api/geocode/json?address=${encodeURIComponent(q)}`, { headers: gatewayHeaders() });
    if (res?.ok) {
      const json: any = await res.json();
      const out: Place[] = (json?.results ?? [])
        .slice(0, 6)
        .map((r: any) =>
          fromGoogle(r.address_components ?? [], r.geometry?.location?.lat, r.geometry?.location?.lng, r.formatted_address ?? ""),
        );
      if (out.length) return out;
    }
  } catch {
    /* fall back to the free provider */
  }

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(q)}`,
    { headers: UA },
  );
  if (!res.ok) throw new Error(`Location search failed (${res.status})`);
  const json: any = await res.json();
  return (json ?? []).map((r: any) => fromOsm(r.address, parseFloat(r.lat), parseFloat(r.lon), r.display_name ?? ""));
}

const FIELD_MASK =
  "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.currentOpeningHours.openNow,places.primaryTypeDisplayName";

export async function doNearbyHospitals(lat: number, lng: number, radiusKm: number): Promise<Hospital[]> {
  const origin = { lat, lng };
  const { direct } = creds();

  if (direct || gatewayReady()) {
    try {
      const url = direct
        ? `https://places.googleapis.com/v1/places:searchNearby?key=${direct}`
        : `${GATEWAY}/places/v1/places:searchNearby`;
      const headers = direct
        ? { "Content-Type": "application/json", "X-Goog-FieldMask": FIELD_MASK }
        : gatewayHeaders({ "Content-Type": "application/json", "X-Goog-FieldMask": FIELD_MASK });
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          includedTypes: ["hospital", "doctor", "medical_lab"],
          maxResultCount: 20,
          locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: radiusKm * 1000 } },
        }),
      });
      if (res.ok) {
        const json: any = await res.json();
        const out: Hospital[] = (json?.places ?? [])
          .filter((p: any) => p?.location)
          .map((p: any) => ({
            id: p.id,
            name: p.displayName?.text ?? "Unnamed facility",
            address: p.formattedAddress ?? "",
            lat: p.location.latitude,
            lng: p.location.longitude,
            distanceKm: haversineKm(origin, { lat: p.location.latitude, lng: p.location.longitude }),
            rating: p.rating ?? null,
            openNow: p.currentOpeningHours?.openNow ?? null,
            kind: p.primaryTypeDisplayName?.text ?? "Healthcare",
          }));
        if (out.length) return out.sort((a, b) => a.distanceKm - b.distanceKm);
      }
    } catch {
      /* fall back to the free provider */
    }
  }

  // Free fallback: OpenStreetMap Overpass — real facilities, no key required.
  const query = `[out:json][timeout:25];(node["amenity"~"^(hospital|clinic|doctors)$"](around:${radiusKm * 1000},${lat},${lng});way["amenity"~"^(hospital|clinic|doctors)$"](around:${radiusKm * 1000},${lat},${lng}););out center 60;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error(`Nearby search failed (${res.status})`);
  const json: any = await res.json();
  const seen = new Set<string>();
  const rows: Hospital[] = [];
  for (const e of json?.elements ?? []) {
    const plat = e.lat ?? e.center?.lat;
    const plng = e.lon ?? e.center?.lon;
    const name = e.tags?.name;
    if (!plat || !plng || !name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    rows.push({
      id: `${e.type}/${e.id}`,
      name,
      address: [e.tags?.["addr:street"], e.tags?.["addr:suburb"], e.tags?.["addr:city"]].filter(Boolean).join(", "),
      lat: plat,
      lng: plng,
      distanceKm: haversineKm(origin, { lat: plat, lng: plng }),
      rating: null,
      openNow: null,
      kind: e.tags?.amenity === "hospital" ? "Hospital" : e.tags?.amenity === "clinic" ? "Clinic" : "Doctor",
    });
  }
  return rows.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 20);
}

export async function doLocalHealth(lat: number, lng: number, area: string): Promise<LocalHealth> {
  let air: LocalHealth["air"] = null;
  const airWeek: number[] = [];

  if (gatewayReady()) {
    try {
      const res = await fetch(`${GATEWAY}/airquality/v1/currentConditions:lookup`, {
        method: "POST",
        headers: gatewayHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          location: { latitude: lat, longitude: lng },
          extraComputations: ["LOCAL_AQI", "POLLUTANT_CONCENTRATION"],
        }),
      });
      if (res.ok) {
        const json: any = await res.json();
        const idx = json?.indexes?.find((i: any) => i.code !== "uaqi") ?? json?.indexes?.[0];
        const pm = json?.pollutants?.find((p: any) => p.code === "pm25");
        if (idx)
          air = {
            aqi: idx.aqi,
            band: (idx.category ?? "").replace(/ air quality/i, "") || aqiBand(idx.aqi),
            pm25: pm?.concentration?.value ?? null,
            source: "Google Air Quality",
          };
      }
    } catch {
      /* fall back to the free provider */
    }
  }

  try {
    const res = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm2_5&hourly=us_aqi&past_days=6&forecast_days=1`,
    );
    if (res.ok) {
      const json: any = await res.json();
      const aqi = Math.round(json?.current?.us_aqi ?? 0);
      if (!air && aqi > 0)
        air = { aqi, band: aqiBand(aqi), pm25: json?.current?.pm2_5 ?? null, source: "Open-Meteo Air Quality" };
      const hourly: number[] = json?.hourly?.us_aqi ?? [];
      for (let d = 0; d < 7; d++) {
        const slice = hourly.slice(d * 24, d * 24 + 24).filter((v) => typeof v === "number");
        if (slice.length) airWeek.push(Math.round(slice.reduce((s, v) => s + v, 0) / slice.length));
      }
    }
  } catch {
    /* air stays null */
  }

  return {
    air,
    airWeek,
    outbreaks: [],
    outbreakNote: area
      ? `No verified outbreak feed is available for ${area} yet — Omni will not estimate case counts it cannot source.`
      : "No verified outbreak feed is available for your area yet.",
    area,
  };
}

export async function doGeocodeFacility(name: string, near?: { lat: number; lng: number }) {
  const { direct } = creds();
  try {
    if (direct || gatewayReady()) {
      const url = direct
        ? `https://places.googleapis.com/v1/places:searchText?key=${direct}`
        : `${GATEWAY}/places/v1/places:searchText`;
      const mask = "places.location,places.formattedAddress";
      const res = await fetch(url, {
        method: "POST",
        headers: direct
          ? { "Content-Type": "application/json", "X-Goog-FieldMask": mask }
          : gatewayHeaders({ "Content-Type": "application/json", "X-Goog-FieldMask": mask }),
        body: JSON.stringify({
          textQuery: name,
          maxResultCount: 1,
          ...(near ? { locationBias: { circle: { center: { latitude: near.lat, longitude: near.lng }, radius: 30000 } } } : {}),
        }),
      });
      if (res.ok) {
        const json: any = await res.json();
        const p = json?.places?.[0];
        if (p?.location) return { lat: p.location.latitude, lng: p.location.longitude, address: p.formattedAddress ?? "" };
      }
    }
  } catch {
    /* fall back to the free provider */
  }

  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(name)}`, {
    headers: UA,
  });
  if (res.ok) {
    const json: any = await res.json();
    if (json?.[0]) return { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon), address: json[0].display_name as string };
  }
  return null;
}
