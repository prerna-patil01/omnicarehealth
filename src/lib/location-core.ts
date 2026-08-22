
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

