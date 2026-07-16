import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Car, Calendar, MapPin, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/appointments")({
  component: Appts,
  ssr: false,
  head: () => ({ meta: [{ title: "Appointments — OmniCare" }] }),
});

type Appt = { id: string; doctor: string; specialty: string; hospital: string; date: string; status: string; ride: boolean; is_past: boolean };

// Real-ish coordinates for Mumbai landmarks so the Uber deep link opens in the right place.
const COORDS: Record<string, { lat: number; lng: number }> = {
  "Lilavati Hospital": { lat: 19.0507, lng: 72.8285 },
  "Hinduja Clinic": { lat: 19.0330, lng: 72.8397 },
  "Kokilaben Hospital": { lat: 19.1305, lng: 72.8264 },
  "Breach Candy": { lat: 18.9700, lng: 72.8035 },
  "Jaslok Hospital": { lat: 18.9718, lng: 72.8081 },
  "Bombay Skin Clinic": { lat: 19.0596, lng: 72.8295 },
};

function Appts() {
  const [tab, setTab] = useState<"up" | "past">("up");
  const [ride, setRide] = useState<Appt | null>(null);
  const [items, setItems] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const { data } = await supabase.from("appointments").select("*").order("created_at", { ascending: false });
    setItems((data as Appt[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function cancel(a: Appt) {
    await supabase.from("appointments").update({ status: "Cancelled" }).eq("id", a.id);
    toast.error(`Cancelled: ${a.doctor}`);
    refresh();
  }

  const shown = items.filter((a) => (tab === "up" ? !a.is_past : a.is_past));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-widest">Schedule</p>
        <h1 className="text-4xl mt-1">Your <span className="editorial-italic text-primary">appointments</span></h1>
      </div>

      <div className="inline-flex rounded-full bg-secondary p-1">
        {[{ k: "up", l: "Upcoming" }, { k: "past", l: "Past" }].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k as any)} className={`px-5 py-1.5 rounded-full text-sm ${tab === t.k ? "bg-primary text-primary-foreground" : ""}`}>
            {t.l}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading && <p className="text-muted-foreground italic">Loading…</p>}
        {!loading && shown.length === 0 && <p className="text-muted-foreground italic">No appointments here.</p>}
        {shown.map((a) => (
          <div key={a.id} className="card-lux p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-primary text-primary-foreground grid place-items-center"><Calendar className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-lg">{a.doctor} <span className="text-muted-foreground editorial-italic text-sm">· {a.specialty}</span></p>
                <p className="text-sm text-muted-foreground">{a.hospital}</p>
              </div>
              <div className="text-right">
                <p className="editorial-italic">{a.date}</p>
                <span className={`inline-block mt-1 text-xs rounded-full px-2.5 py-0.5 ${a.status === "Confirmed" ? "bg-sage/50" : a.status === "Completed" ? "bg-secondary" : a.status === "Cancelled" ? "bg-rose-soft/60" : "bg-amber-soft/50"}`}>{a.status}</span>
              </div>
            </div>
            {tab === "up" && a.status !== "Cancelled" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => setRide(a)} className="rounded-full bg-coral text-coral-foreground px-4 py-1.5 text-sm flex items-center gap-1.5">
                  <Car className="h-4 w-4" /> Book a ride to this appointment
                </button>
                <button onClick={() => toast("Reminder set — Omni will nudge you 1h before")} className="rounded-full border border-border px-4 py-1.5 text-sm">Remind me</button>
                <button onClick={() => cancel(a)} className="rounded-full border border-border px-4 py-1.5 text-sm text-destructive">Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {ride && <RideModal a={ride} onClose={() => setRide(null)} />}
    </div>
  );
}

function RideModal({ a, onClose }: { a: Appt; onClose: () => void }) {
  const c = COORDS[a.hospital] ?? { lat: 19.076, lng: 72.877 };
  const uber = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${c.lat}&dropoff[longitude]=${c.lng}&dropoff[nickname]=${encodeURIComponent(a.hospital)}`;
  const ola = `https://book.olacabs.com/?drop_lat=${c.lat}&drop_lng=${c.lng}&drop_name=${encodeURIComponent(a.hospital)}`;
  const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}&travelmode=driving`;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="card-lux max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Ride to</p>
        <h3 className="text-2xl editorial-italic mt-1">{a.hospital}</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1"><MapPin className="h-3.5 w-3.5" /> {c.lat.toFixed(4)}, {c.lng.toFixed(4)}</p>
        <div className="mt-4 space-y-2">
          <a href={uber} target="_blank" rel="noopener noreferrer" onClick={onClose} className="w-full flex items-center justify-between rounded-xl bg-black text-white px-4 py-3">
            <span>Open in Uber</span><ExternalLink className="h-4 w-4" />
          </a>
          <a href={ola} target="_blank" rel="noopener noreferrer" onClick={onClose} className="w-full flex items-center justify-between rounded-xl bg-[#c8e152] text-black px-4 py-3">
            <span>Open in Ola</span><ExternalLink className="h-4 w-4" />
          </a>
          <a href={gmaps} target="_blank" rel="noopener noreferrer" onClick={onClose} className="w-full flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <span>Directions on Google Maps</span><ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
