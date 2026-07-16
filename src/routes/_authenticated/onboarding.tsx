import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
  ssr: false,
  head: () => ({ meta: [{ title: "Welcome — OmniCare" }] }),
});

const STEPS = ["Personal", "Medical", "Lifestyle", "Devices"] as const;

function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>({
    name: "Prerna Patil", first_name: "Prerna", age: 21, sex: "Female", blood_group: "B+",
    height_cm: 162, weight_kg: 55,
    dob: "2004-05-01",
    region: "Mumbai, IN",
    emergency_contact: { name: "Mom", phone: "+91 98200 12345" },
    allergies: ["Penicillin"],
    conditions: [],
    history: ["Dengue (2021)"],
    surgeries: [],
    medications: [],
    family: { mother: "Gallstones", father: "Type 2 Diabetes" },
    smoking: "never",
    drinking: "never",
    diet: "vegetarian",
    junk_frequency: "weekly",
    exercise: "light",
    lifestyle: { sleep: "6.4 h", water: "1.2 L / day", stress: "High" },
    devices: { apple_watch: true, glucometer: false, bp_cuff: false },
  });

  async function save() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("profiles").upsert({ id: u.user.id, ...form, onboarded: true } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved · Omni is now personalised for you");
    nav({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl card-lux p-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" /> Onboarding · step {step + 1} of {STEPS.length}
        </p>
        <h1 className="text-3xl mt-2">
          Tell Omni about <span className="editorial-italic text-primary">you</span>
        </h1>
        <div className="mt-4 flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {step === 0 && (
            <>
              <Field label="Full name"><input className="in" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, first_name: e.target.value.split(" ")[0] })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="DOB"><input type="date" className="in" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></Field>
                <Field label="Sex"><select className="in" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}><option>Female</option><option>Male</option><option>Other</option></select></Field>
                <Field label="Height (cm)"><input type="number" className="in" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: +e.target.value })} /></Field>
                <Field label="Weight (kg)"><input type="number" className="in" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: +e.target.value })} /></Field>
                <Field label="Blood group"><select className="in" value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })}>{["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(b => <option key={b}>{b}</option>)}</select></Field>
                <Field label="Region"><input className="in" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></Field>
              </div>
              <Field label="Emergency contact (name / phone)">
                <div className="grid grid-cols-2 gap-2">
                  <input className="in" placeholder="Name" value={form.emergency_contact.name} onChange={(e) => setForm({ ...form, emergency_contact: { ...form.emergency_contact, name: e.target.value } })} />
                  <input className="in" placeholder="Phone" value={form.emergency_contact.phone} onChange={(e) => setForm({ ...form, emergency_contact: { ...form.emergency_contact, phone: e.target.value } })} />
                </div>
              </Field>
            </>
          )}
          {step === 1 && (
            <>
              <ArrField label="Allergies" value={form.allergies} onChange={(v) => setForm({ ...form, allergies: v })} />
              <ArrField label="Current conditions" value={form.conditions} onChange={(v) => setForm({ ...form, conditions: v })} />
              <ArrField label="Past conditions / history" value={form.history} onChange={(v) => setForm({ ...form, history: v })} />
              <ArrField label="Surgeries" value={form.surgeries} onChange={(v) => setForm({ ...form, surgeries: v })} />
              <ArrField label="Current medications" value={form.medications} onChange={(v) => setForm({ ...form, medications: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mother's history"><input className="in" value={form.family.mother} onChange={(e) => setForm({ ...form, family: { ...form.family, mother: e.target.value } })} /></Field>
                <Field label="Father's history"><input className="in" value={form.family.father} onChange={(e) => setForm({ ...form, family: { ...form.family, father: e.target.value } })} /></Field>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Smoking"><select className="in" value={form.smoking} onChange={(e) => setForm({ ...form, smoking: e.target.value })}><option>never</option><option>occasional</option><option>daily</option></select></Field>
                <Field label="Drinking"><select className="in" value={form.drinking} onChange={(e) => setForm({ ...form, drinking: e.target.value })}><option>never</option><option>occasional</option><option>weekly</option><option>daily</option></select></Field>
                <Field label="Diet"><select className="in" value={form.diet} onChange={(e) => setForm({ ...form, diet: e.target.value })}><option>vegetarian</option><option>non-vegetarian</option><option>vegan</option><option>eggetarian</option></select></Field>
                <Field label="Junk food"><select className="in" value={form.junk_frequency} onChange={(e) => setForm({ ...form, junk_frequency: e.target.value })}><option>rarely</option><option>weekly</option><option>daily</option></select></Field>
                <Field label="Exercise"><select className="in" value={form.exercise} onChange={(e) => setForm({ ...form, exercise: e.target.value })}><option>none</option><option>light</option><option>moderate</option><option>intense</option></select></Field>
                <Field label="Stress"><select className="in" value={form.lifestyle.stress} onChange={(e) => setForm({ ...form, lifestyle: { ...form.lifestyle, stress: e.target.value } })}><option>Low</option><option>Medium</option><option>High</option></select></Field>
                <Field label="Sleep"><input className="in" value={form.lifestyle.sleep} onChange={(e) => setForm({ ...form, lifestyle: { ...form.lifestyle, sleep: e.target.value } })} /></Field>
                <Field label="Water"><input className="in" value={form.lifestyle.water} onChange={(e) => setForm({ ...form, lifestyle: { ...form.lifestyle, water: e.target.value } })} /></Field>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-sm text-muted-foreground">Connect any wearables Omni should read. You can change this later.</p>
              {[
                { key: "apple_watch", label: "Apple Watch / Fitbit" },
                { key: "glucometer", label: "Glucometer" },
                { key: "bp_cuff", label: "BP cuff" },
                { key: "cgm", label: "CGM" },
              ].map((d) => (
                <label key={d.key} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <span>{d.label}</span>
                  <input type="checkbox" checked={!!form.devices[d.key]} onChange={(e) => setForm({ ...form, devices: { ...form.devices, [d.key]: e.target.checked } })} />
                </label>
              ))}
            </>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <button className="text-sm text-muted-foreground" onClick={() => step > 0 ? setStep(step - 1) : nav({ to: "/" })}>
            {step === 0 ? "Skip for now" : "Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="rounded-full bg-primary text-primary-foreground px-6 py-2.5 flex items-center gap-1.5">
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={save} className="rounded-full bg-coral text-coral-foreground px-6 py-2.5">Finish</button>
          )}
        </div>
      </div>
      <style>{`.in{width:100%;border-radius:0.75rem;background:color-mix(in oklab,var(--secondary) 60%,transparent);padding:0.55rem 0.9rem;outline:none}`}</style>
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function ArrField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [txt, setTxt] = useState("");
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((v, i) => (
          <span key={i} className="rounded-full bg-secondary px-3 py-1 text-xs flex items-center gap-1">
            {v}
            <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-muted-foreground">×</button>
          </span>
        ))}
        {value.length === 0 && <span className="text-xs text-muted-foreground italic">none</span>}
      </div>
      <input className="in" placeholder="Type and press Enter" value={txt}
        onChange={(e) => setTxt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && txt.trim()) { e.preventDefault(); onChange([...value, txt.trim()]); setTxt(""); }
        }} />
    </Field>
  );
}
