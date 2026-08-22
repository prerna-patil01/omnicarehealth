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

export type LocalHealth = {
  air: { aqi: number; band: string; pm25: number | null; source: string } | null;
  airWeek: number[];
  outbreaks: { name: string; change: string; cases: number }[];
  outbreakNote: string;
  area: string;
};

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}

export function aqiBand(aqi: number) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for sensitive groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very unhealthy";
  return "Hazardous";
}

/** Ride / directions deep links for any coordinate pair. */
export function rideLinks(lat: number, lng: number, name: string) {
  return {
    uber: `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[nickname]=${encodeURIComponent(name)}`,
    ola: `https://book.olacabs.com/?drop_lat=${lat}&drop_lng=${lng}&drop_name=${encodeURIComponent(name)}`,
    maps: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
  };
}
