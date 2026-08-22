import { createServerFn } from "@tanstack/react-start";

export type Place = {
  lat: number;
  lng: number;
  city: string;
  district: string;
  state: string;
  country: string;
  label: string;
};

export type Hospital = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  rating: number | null;
  openNow: boolean | null;
  kind: string;
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

function creds() {
  const direct = process.env["GOOGLE_MAPS_API_KEY"] || process.env["VITE_GOOGLE_MAPS_API_KEY"];
  const lovable = process.env["LOVABLE_API_KEY"];
  const connector = process.env["GOOGLE_MAPS_API_KEY"];
  return { direct, lovable, connector };
}

/** True when we can reach Google through the Lovable connector gateway. */
function gatewayReady() {
  const { lovable, connector } = creds();
  return Boolean(lovable && connector);
}

function gatewayHeaders(extra: Record<string, string> = {}) {
  const { lovable, connector } = creds();
  return {
    Authorization: `Bearer ${lovable}`,
    "X-Connection-Api-Key": String(connector),
    ...extra,
  };
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

function placeFromGoogleComponents(comps: any[], lat: number, lng: number, formatted: string): Place {
  const pick = (type: string) => comps.find((c: any) => c.types?.includes(type))?.long_name ?? "";
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

function placeFromOsm(addr: any, lat: number, lng: number, display: string): Place {
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

async function googleReverse(lat: number, lng: number): Promise<Place | null> {
  const { direct } = creds();
  try {
    let res: Response;
    if (direct) {
      res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${direct}`);
    } else if (gatewayReady()) {
      res = await fetch(`${GATEWAY}/maps/api/geocode/json?latlng=${lat},${lng}`, { headers: gatewayHeaders() });
    } else return null;
    if (!res.ok) return null;
    const json: any = await res.json();
    const r = json?.results?.[0];
    if (!r) return null;
    return placeFromGoogleComponents(r.address_components ?? [], lat, lng, r.formatted_address ?? "");
  } catch {
    return null;
  }
}

export const reverseGeocode = createServerFn({ method: "POST" })
  .inputValidator((d: { lat: number; lng: number }) => ({ lat: Number(d.lat), lng: Number(d.lng) }))
  .handler(async ({ data }) => {
    const { lat, lng } = data;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("Invalid coordinates");

    const g = await googleReverse(lat, lng);
    if (g) return g;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`,
      { headers: { "User-Agent": "OmniCare/1.0 (health app)", "Accept-Language": "en" } },
    );
    if (!res.ok) throw new Error(`Reverse geocoding failed (${res.status})`);
    const json: any = await res.json();
    return placeFromOsm(json?.address, lat, lng, json?.display_name ?? "");
  });

export const searchLocation = createServerFn({ method: "POST" })
  .inputValidator((d: { query: string }) => ({ query: String(d.query ?? "").slice(0, 120) }))
  .handler(async ({ data }): Promise<Place[]> => {
    const q = data.query.trim();
    if (q.length < 2) return [];

    const { direct } = creds();
    try {
      let res: Response | null = null;
      if (direct) {
        res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${direct}`,
        );
      } else if (gatewayReady()) {
        res = await fetch(`${GATEWAY}/maps/api/geocode/json?address=${encodeURIComponent(q)}`, {
          headers: gatewayHeaders(),
        });
      }
      if (res?.ok) {
        const json: any = await res.json();
        const out = (json?.results ?? []).slice(0, 6).map((r: any) =>
          placeFromGoogleComponents(
            r.address_components ?? [],
            r.geometry?.location?.lat,
            r.geometry?.location?.lng,
            r.formatted_address ?? "",
          ),
        );
        if (out.length) return out;
      }
    } catch {
      /* fall through to free provider */
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(q)}`,
      { headers: { "User-Agent": "OmniCare/1.0 (health app)", "Accept-Language": "en" } },
    );
    if (!res.ok) throw new Error(`Location search failed (${res.status})`);
    const json: any = await res.json();
    return (json ?? []).map((r: any) =>
      placeFromOsm(r.address, parseFloat(r.lat), parseFloat(r.lon), r.display_name ?? ""),
    );
  });

/** Nearby hospitals / clinics, sorted by real distance from the user. */
export const nearbyHospitals = createServerFn({ method: "POST" })
  .inputValidator((d: { lat: number; lng: number; radiusKm?: number }) => ({
    lat: Number(d.lat),
    lng: Number(d.lng),
    radiusKm: Math.min(Math.max(Number(d.radiusKm ?? 10), 1), 40),
  }))
  .handler(async ({ data }): Promise<Hospital[]> => {
    const { lat, lng, radiusKm } = data;
    const origin = { lat, lng };

    if (gatewayReady() || creds().direct) {
      try {
        const { direct } = creds();
        const url = direct
          ? `https://places.googleapis.com/v1/places:searchNearby?key=${direct}`
          : `${GATEWAY}/places/v1/places:searchNearby`;
        const res = await fetch(url, {
          method: "POST",
          headers: direct
            ? {
                "Content-Type": "application/json",
                "X-Goog-FieldMask":
                  "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.currentOpeningHours.openNow,places.primaryTypeDisplayName",
              }
            : gatewayHeaders({
                "Content-Type": "application/json",
                "X-Goog-FieldMask":
                  "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.currentOpeningHours.openNow,places.primaryTypeDisplayName",
              }),
          body: JSON.stringify({
            includedTypes: ["hospital", "doctor", "medical_lab"],
            maxResultCount: 20,
            locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: radiusKm * 1000 } },
          }),
        });
        if (res.ok) {
          const json: any = await res.json();
          const out: Hospital[] = (json?.places ?? []).map((p: any) => ({
            id: p.id,
            name: p.displayName?.text ?? "Unnamed facility",
            address: p.formattedAddress ?? "",
            lat: p.location?.latitude,
            lng: p.location?.longitude,
            distanceKm: haversineKm(origin, { lat: p.location?.latitude, lng: p.location?.longitude }),
            rating: p.rating ?? null,
            openNow: p.currentOpeningHours?.openNow ?? null,
            kind: p.primaryTypeDisplayName?.text ?? "Healthcare",
          }));
          if (out.length) return out.sort((a, b) => a.distanceKm - b.distanceKm);
        }
      } catch {
        /* fall through to free provider */
      }
    }

    // Free fallback: OpenStreetMap Overpass — real facilities, no API key needed.
    const query = `[out:json][timeout:25];(
      node["amenity"~"^(hospital|clinic|doctors)$"](around:${radiusKm * 1000},${lat},${lng});
      way["amenity"~"^(hospital|clinic|doctors)$"](around:${radiusKm * 1000},${lat},${lng});
    );out center 40;`;
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!res.ok) throw new Error(`Nearby search failed (${res.status})`);
    const json: any = await res.json();
    const seen = new Set<string>();
    return (json?.elements ?? [])
      .map((e: any) => {
        const plat = e.lat ?? e.center?.lat;
        const plng = e.lon ?? e.center?.lon;
        const name = e.tags?.name;
        if (!plat || !plng || !name) return null;
        return {
          id: `${e.type}/${e.id}`,
          name,
          address:
            [e.tags?.["addr:street"], e.tags?.["addr:suburb"], e.tags?.["addr:city"]].filter(Boolean).join(", ") || "",
          lat: plat,
          lng: plng,
          distanceKm: haversineKm(origin, { lat: plat, lng: plng }),
          rating: null,
          openNow: null,
          kind: e.tags?.amenity === "hospital" ? "Hospital" : e.tags?.amenity === "clinic" ? "Clinic" : "Doctor",
        } as Hospital;
      })
      .filter((h: Hospital | null): h is Hospital => {
        if (!h) return false;
        const k = h.name.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .sort((a: Hospital, b: Hospital) => a.distanceKm - b.distanceKm)
      .slice(0, 20);
  });

export type LocalHealth = {
  air: { aqi: number; band: string; pm25: number | null; source: string } | null;
  airWeek: number[];
  outbreaks: { name: string; change: string; cases: number }[];
  outbreakNote: string;
  area: string;
};

function bandFor(aqi: number) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for sensitive groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very unhealthy";
  return "Hazardous";
}

/**
 * Real environmental signals for the user's coordinates.
 * Disease outbreaks are never invented — we only report what a verified feed returns,
 * and we have no licensed epidemiological feed wired up yet.
 */
export const localHealthSignals = createServerFn({ method: "POST" })
  .inputValidator((d: { lat: number; lng: number; area?: string }) => ({
    lat: Number(d.lat),
    lng: Number(d.lng),
    area: String(d.area ?? ""),
  }))
  .handler(async ({ data }): Promise<LocalHealth> => {
    const { lat, lng, area } = data;
    let air: LocalHealth["air"] = null;
    let airWeek: number[] = [];

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
              band: idx.category?.replace(" air quality", "") ?? bandFor(idx.aqi),
              pm25: pm?.concentration?.value ?? null,
              source: "Google Air Quality",
            };
        }
      } catch {
        /* fall through */
      }
    }

    if (!air) {
      try {
        const res = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm2_5&hourly=us_aqi&past_days=6&forecast_days=1`,
        );
        if (res.ok) {
          const json: any = await res.json();
          const aqi = Math.round(json?.current?.us_aqi ?? 0);
          if (aqi > 0)
            air = {
              aqi,
              band: bandFor(aqi),
              pm25: json?.current?.pm2_5 ?? null,
              source: "Open-Meteo Air Quality",
            };
          const hourly: number[] = json?.hourly?.us_aqi ?? [];
          if (hourly.length >= 24) {
            for (let d = 0; d < 7; d++) {
              const slice = hourly.slice(d * 24, d * 24 + 24).filter((v) => typeof v === "number");
              if (slice.length) airWeek.push(Math.round(slice.reduce((s, v) => s + v, 0) / slice.length));
            }
          }
        }
      } catch {
        /* leave air null */
      }
    }

    return {
      air,
      airWeek,
      outbreaks: [],
      outbreakNote: area
        ? `No verified outbreak feed is available for ${area} yet. Omni will not estimate case counts it cannot source.`
        : "No verified outbreak feed is available for your area yet.",
      area,
    };
  });

/** Resolve a facility name to coordinates so ride deep links open in the right place. */
export const geocodeFacility = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; near?: { lat: number; lng: number } }) => ({
    name: String(d.name ?? "").slice(0, 160),
    near: d.near ? { lat: Number(d.near.lat), lng: Number(d.near.lng) } : undefined,
  }))
  .handler(async ({ data }) => {
    const q = data.near ? `${data.name}` : data.name;
    const { direct } = creds();
    try {
      if (direct || gatewayReady()) {
        const url = direct
          ? `https://places.googleapis.com/v1/places:searchText?key=${direct}`
          : `${GATEWAY}/places/v1/places:searchText`;
        const res = await fetch(url, {
          method: "POST",
          headers: direct
            ? { "Content-Type": "application/json", "X-Goog-FieldMask": "places.location,places.formattedAddress" }
            : gatewayHeaders({
                "Content-Type": "application/json",
                "X-Goog-FieldMask": "places.location,places.formattedAddress",
              }),
          body: JSON.stringify({
            textQuery: q,
            maxResultCount: 1,
            ...(data.near
              ? { locationBias: { circle: { center: { latitude: data.near.lat, longitude: data.near.lng }, radius: 30000 } } }
              : {}),
          }),
        });
        if (res.ok) {
          const json: any = await res.json();
          const p = json?.places?.[0];
          if (p?.location) return { lat: p.location.latitude, lng: p.location.longitude, address: p.formattedAddress ?? "" };
        }
      }
    } catch {
      /* fall through */
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`,
      { headers: { "User-Agent": "OmniCare/1.0 (health app)", "Accept-Language": "en" } },
    );
    if (res.ok) {
      const json: any = await res.json();
      if (json?.[0]) return { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon), address: json[0].display_name };
    }
    return null;
  });
