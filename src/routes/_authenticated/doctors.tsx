import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, MapPin, Video, IndianRupee, Clock, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/doctors")({
  component: FindDoctors,
  head: () => ({ meta: [{ title: "Find Doctors — OmniCare" }] }),
});

const SPECS = ["All", "Gastroenterology", "General Physician", "Endocrinology", "Cardiology", "Gynaecology", "Dermatology"];

type Doctor = { id: number; name: string; specialty: string; hospital: string; fee: number; distance: string; rating: number; slot: string };

function FindDoctors() {
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("All");
  const [booking, setBooking] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("doctors").select("*").order("id").then(({ data }) => {
      setDoctors((data as Doctor[]) ?? []);
      setLoading(false);
    });
  }, []);

  async function confirmBooking(slot: string) {
    if (!booking) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    await supabase.from("appointments").insert({
      user_id: userData.user.id,
      doctor: booking.name,
      specialty: booking.specialty,
      hospital: booking.hospital,
      date: slot,
      status: "Confirmed",
      ride: true,
      is_past: false,
    });
    toast.success(`Confirmed: ${booking.name} · ${slot}`);
    setBooking(null);
  }

  const list = useMemo(
    () =>
      doctors.filter(
        (d) =>
          (spec === "All" || d.specialty === spec) &&
          (d.name.toLowerCase().includes(q.toLowerCase()) ||
            d.hospital.toLowerCase().includes(q.toLowerCase()) ||
            d.specialty.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, spec, doctors],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-widest">Care team</p>
        <h1 className="text-4xl mt-1">
          Find <span className="editorial-italic text-primary">doctors</span> near you
        </h1>
        <p className="text-muted-foreground mt-1">
          Omni suggests <em>Dr. Meera Rao</em> based on today's finding.
        </p>
      </div>

      <div className="card-lux p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, hospital, specialty…"
            className="w-full rounded-full bg-secondary/60 pl-9 pr-4 py-2.5 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SPECS.map((s) => (
            <button
              key={s}
              onClick={() => setSpec(s)}
              className={`text-sm rounded-full px-3 py-1.5 ${
                spec === s ? "bg-primary text-primary-foreground" : "bg-secondary/60"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {list.map((d) => (
          <div key={d.id} className="card-lux p-5">
            <div className="flex gap-4">
              <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center text-lg">
                {d.name.split(" ").slice(1, 3).map((s) => s[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl truncate">{d.name}</h3>
                <p className="text-sm text-muted-foreground editorial-italic">{d.specialty}</p>
                <p className="text-sm mt-1">{d.hospital}</p>
              </div>
              <div className="flex items-center gap-1 text-sm shrink-0">
                <Star className="h-4 w-4 fill-current text-amber-soft" />
                {d.rating}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <IndianRupee className="h-3.5 w-3.5" /> {d.fee}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {d.distance}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {d.slot}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setBooking(d)}
                className="flex-1 rounded-full bg-coral text-coral-foreground py-2 text-sm"
              >
                Book
              </button>
              <button
                onClick={() => toast(`Video consult requested with ${d.name}`)}
                className="rounded-full border border-primary/30 text-primary px-4 py-2 text-sm flex items-center gap-1.5"
              >
                <Video className="h-4 w-4" /> Video
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p className="text-muted-foreground italic col-span-full">No doctors match that filter.</p>
        )}
      </div>

      <Dialog open={!!booking} onOpenChange={(o) => !o && setBooking(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              Book <span className="editorial-italic">{booking?.name}</span>
            </DialogTitle>
          </DialogHeader>
          {booking && (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl bg-secondary/50 p-3">
                <p>{booking.hospital} · {booking.specialty}</p>
                <p className="text-muted-foreground">Next slot: {booking.slot} · ₹{booking.fee}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["Today, 5:30 PM", "Today, 7:00 PM", "Tomorrow, 10 AM"].map((s) => (
                  <button key={s} className="rounded-lg border border-border py-2 text-xs hover:bg-secondary">
                    {s}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  toast.success(`Confirmed: ${booking.name} · ${booking.slot}`);
                  setBooking(null);
                }}
                className="w-full rounded-full bg-primary text-primary-foreground py-2.5"
              >
                Confirm appointment
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
