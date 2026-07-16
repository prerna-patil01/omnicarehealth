import { createFileRoute } from "@tanstack/react-router";
import { appointments } from "@/lib/mock-data";
import { toast } from "sonner";
import { Car, Calendar } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/appointments")({
  component: Appts,
  head: () => ({ meta: [{ title: "Appointments — OmniCare" }] }),
});

function Appts() {
  const [tab, setTab] = useState<"up" | "past">("up");
  const [ride, setRide] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-widest">Schedule</p>
        <h1 className="text-4xl mt-1">
          Your <span className="editorial-italic text-primary">appointments</span>
        </h1>
      </div>

      <div className="inline-flex rounded-full bg-secondary p-1">
        {[
          { k: "up", l: "Upcoming" },
          { k: "past", l: "Past" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as any)}
            className={`px-5 py-1.5 rounded-full text-sm ${
              tab === t.k ? "bg-primary text-primary-foreground" : ""
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {(tab === "up" ? appointments.upcoming : appointments.past).map((a: any) => (
          <div key={a.id} className="card-lux p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-primary text-primary-foreground grid place-items-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg">{a.doctor} <span className="text-muted-foreground editorial-italic text-sm">· {a.specialty}</span></p>
                <p className="text-sm text-muted-foreground">{a.hospital}</p>
              </div>
              <div className="text-right">
                <p className="editorial-italic">{a.date}</p>
                <span
                  className={`inline-block mt-1 text-xs rounded-full px-2.5 py-0.5 ${
                    a.status === "Confirmed"
                      ? "bg-sage/50"
                      : a.status === "Completed"
                      ? "bg-secondary"
                      : "bg-amber-soft/50"
                  }`}
                >
                  {a.status}
                </span>
              </div>
            </div>
            {tab === "up" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {a.ride && (
                  <button
                    onClick={() => setRide(a.hospital)}
                    className="rounded-full bg-coral text-coral-foreground px-4 py-1.5 text-sm flex items-center gap-1.5"
                  >
                    <Car className="h-4 w-4" /> Book a ride to this appointment
                  </button>
                )}
                <button
                  onClick={() => toast("Reminder set — Omni will nudge you 1h before")}
                  className="rounded-full border border-border px-4 py-1.5 text-sm"
                >
                  Remind me
                </button>
                <button
                  onClick={() => toast.error(`Cancelled: ${a.doctor}`)}
                  className="rounded-full border border-border px-4 py-1.5 text-sm text-destructive"
                >
                  Cancel
                </button>
              </div>
            )}
            {tab === "past" && (
              <button
                onClick={() => toast("Summary and prescription copied to Reports")}
                className="mt-3 text-sm editorial-italic text-primary"
              >
                View visit summary →
              </button>
            )}
          </div>
        ))}
      </div>

      {ride && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setRide(null)}>
          <div className="card-lux max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Ride to</p>
            <h3 className="text-2xl editorial-italic mt-1">{ride}</h3>
            <div className="mt-4 space-y-2">
              {[
                { name: "Uber Go", eta: "4 min", fare: "₹186" },
                { name: "Uber Premier", eta: "6 min", fare: "₹268" },
                { name: "Ola Mini", eta: "5 min", fare: "₹174" },
                { name: "Ola Auto", eta: "3 min", fare: "₹112" },
              ].map((r) => (
                <button
                  key={r.name}
                  onClick={() => {
                    toast.success(`${r.name} booked · arriving in ${r.eta}`);
                    setRide(null);
                  }}
                  className="w-full flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-secondary/60"
                >
                  <span>{r.name}</span>
                  <span className="text-sm text-muted-foreground">{r.eta} · <span className="editorial-italic">{r.fare}</span></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
