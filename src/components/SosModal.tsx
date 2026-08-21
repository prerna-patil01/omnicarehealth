import { useEffect, useRef, useState } from "react";
import { Siren, Phone, MapPin, Check, Loader2, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CONTACTS = [
  { id: "mom", name: "Mom — Sunita Patil", relation: "Mother", phone: "+91 98200 12345" },
  { id: "dad", name: "Dad — Rajesh Patil", relation: "Father", phone: "+91 98201 44551" },
  { id: "roommate", name: "Ishita Menon", relation: "Roommate", phone: "+91 90040 77123" },
  { id: "doctor", name: "Dr. Meera Rao", relation: "Gastroenterology", phone: "+91 22 2656 1000" },
];

const SERVICES = [
  { id: "ambulance", label: "108 Ambulance — Mumbai", meta: "ETA 6 min", tone: "coral" as const },
  { id: "er", label: "Lilavati Hospital ER", meta: "3.2 km · Bandra West", tone: "primary" as const },
  { id: "clinic", label: "Hinduja Urgent Care", meta: "1.4 km · walk-in", tone: "secondary" as const },
];

const TIMELINE = [
  "Location shared with responder network",
  "Health identity sent — B+, allergic to Penicillin",
  "Emergency contacts notified",
  "Responder assigned — ambulance MH-01-EA-4417",
  "Help confirmed — arriving in 6 minutes",
];

export function SosModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [service, setService] = useState<string>("ambulance");
  const [contacts, setContacts] = useState<string[]>(["mom"]);
  const [stage, setStage] = useState<"select" | "dispatching">("select");
  const [step, setStep] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!open) {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setStage("select");
      setStep(0);
    }
  }, [open]);

  function dispatch() {
    if (contacts.length === 0) {
      toast.error("Choose at least one emergency contact");
      return;
    }
    setStage("dispatching");
    setStep(0);
    TIMELINE.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => {
          setStep(i + 1);
          if (i === TIMELINE.length - 1) toast.success("Help confirmed — stay where you are");
        }, (i + 1) * 1100),
      );
    });
  }

  const done = step >= TIMELINE.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <span className="h-9 w-9 rounded-full bg-coral text-coral-foreground grid place-items-center">
              <Siren className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>
              <span className="editorial-italic">Emergency</span> assistance
            </span>
          </DialogTitle>
          <DialogDescription>
            {stage === "select"
              ? "Pick who responds and who gets told. Nothing is sent until you confirm."
              : "Live status — keep this open until help is confirmed."}
          </DialogDescription>
        </DialogHeader>

        {stage === "select" ? (
          <div className="space-y-5 mt-1">
            <fieldset>
              <legend className="text-xs uppercase tracking-widest text-muted-foreground">
                Responder
              </legend>
              <div className="mt-2 space-y-2" role="radiogroup" aria-label="Choose responder">
                {SERVICES.map((s) => {
                  const active = service === s.id;
                  return (
                    <button
                      key={s.id}
                      role="radio"
                      aria-checked={active}
                      onClick={() => setService(s.id)}
                      className={`w-full rounded-xl px-4 py-3 flex items-center justify-between border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                        active
                          ? s.tone === "coral"
                            ? "bg-coral text-coral-foreground border-transparent"
                            : s.tone === "primary"
                              ? "bg-primary text-primary-foreground border-transparent"
                              : "bg-secondary text-secondary-foreground border-transparent"
                          : "border-border hover:bg-secondary/50"
                      }`}
                    >
                      <span className="font-medium text-left">{s.label}</span>
                      <span className="text-sm opacity-90 editorial-italic">{s.meta}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs uppercase tracking-widest text-muted-foreground">
                Notify emergency contacts
              </legend>
              <div className="mt-2 space-y-2">
                {CONTACTS.map((c) => {
                  const checked = contacts.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 cursor-pointer hover:bg-secondary/40 focus-within:ring-2 focus-within:ring-ring"
                    >
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-primary"
                        checked={checked}
                        onChange={() =>
                          setContacts((v) =>
                            checked ? v.filter((x) => x !== c.id) : [...v, c.id],
                          )
                        }
                      />
                      <span className="flex-1">
                        <span className="block font-medium">{c.name}</span>
                        <span className="block text-sm text-muted-foreground editorial-italic">
                          {c.relation} · {c.phone}
                        </span>
                      </span>
                      <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="rounded-xl bg-secondary/50 p-3 text-sm text-muted-foreground flex gap-2">
              <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <p>
                Blood group <strong className="text-foreground">B+</strong>, allergy{" "}
                <strong className="text-foreground">Penicillin</strong> and your live location in
                Bandra West are shared with responders on confirm.
              </p>
            </div>

            <Button
              onClick={dispatch}
              className="w-full rounded-full bg-coral text-coral-foreground hover:brightness-110 h-11"
            >
              Confirm and send for help
            </Button>
          </div>
        ) : (
          <div className="mt-1 space-y-4">
            <div className="rounded-xl bg-primary/10 px-4 py-3 flex items-center gap-2 text-primary">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm">
                {SERVICES.find((s) => s.id === service)?.label} ·{" "}
                {contacts.length} contact{contacts.length === 1 ? "" : "s"} notified
              </span>
            </div>

            <ol className="relative space-y-4 pl-2" aria-live="polite">
              {TIMELINE.map((t, i) => {
                const complete = step > i;
                const active = step === i;
                return (
                  <li key={t} className="flex gap-3 items-start">
                    <span
                      className={`mt-0.5 h-6 w-6 shrink-0 rounded-full grid place-items-center ${
                        complete
                          ? "bg-sage text-foreground"
                          : active
                            ? "bg-coral text-coral-foreground"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {complete ? (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : active ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <span className="text-[11px]">{i + 1}</span>
                      )}
                    </span>
                    <span className={complete || active ? "" : "text-muted-foreground"}>{t}</span>
                  </li>
                );
              })}
            </ol>

            {done && (
              <div className="rounded-xl bg-sage/40 p-4">
                <p className="font-medium">Help confirmed</p>
                <p className="text-sm text-muted-foreground editorial-italic">
                  Ambulance MH-01-EA-4417 · Paramedic Sameer · ETA 6 min. Mom is calling you now.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setStage("select")}
              >
                Change details
              </Button>
              <Button className="flex-1 rounded-full" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
