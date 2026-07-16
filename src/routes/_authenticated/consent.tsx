import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/consent")({
  component: Consent,
  ssr: false,
  head: () => ({ meta: [{ title: "Consent — OmniCare" }] }),
});

const SCOPES = [
  { key: "omni.records", label: "Omni can read my medical records", desc: "Reports, biomarkers, past appointments" },
  { key: "omni.lifestyle", label: "Omni can read my lifestyle", desc: "Sleep, water, stress, diet, exercise" },
  { key: "omni.family_history", label: "Omni can read my family history", desc: "Mother, father, siblings" },
  { key: "pharmacy.recommend", label: "Pharmacy may recommend OTC medicines", desc: "Based on Omni's suggestions" },
  { key: "doctors.share_summary", label: "Share visit summary with booked doctors", desc: "Only clinicians you book" },
  { key: "research.anonymised", label: "Contribute anonymised data to research", desc: "Never identifiable, revocable" },
];

function Consent() {
  const [grants, setGrants] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setUserId(u.user.id);
      const { data } = await supabase.from("consent_grants").select("*");
      const map: Record<string, boolean> = {};
      SCOPES.forEach((s) => { map[s.key] = true; });
      (data ?? []).forEach((g: any) => { map[g.scope] = g.granted; });
      setGrants(map);
    })();
  }, []);

  async function toggle(scope: string) {
    if (!userId) return;
    const next = !grants[scope];
    setGrants((g) => ({ ...g, [scope]: next }));
    await supabase.from("consent_grants").upsert({ user_id: userId, scope, granted: next, updated_at: new Date().toISOString() }, { onConflict: "user_id,scope" });
    toast(next ? "Consent granted" : "Consent revoked");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-widest">Privacy</p>
        <h1 className="text-4xl mt-1">Consent & <span className="editorial-italic text-primary">privacy</span></h1>
        <p className="text-muted-foreground mt-1">You control who reads what. Every switch is revocable, immediately.</p>
      </div>

      <div className="card-lux p-2">
        {SCOPES.map((s) => (
          <label key={s.key} className="flex items-start gap-4 p-4 border-b border-border last:border-0 cursor-pointer">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
              <Shield className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{s.label}</p>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
            <input type="checkbox" checked={!!grants[s.key]} onChange={() => toggle(s.key)} className="mt-2 h-5 w-5 accent-primary" />
          </label>
        ))}
      </div>

      <p className="text-xs text-muted-foreground italic">
        Consent grants are stored per user in Lovable Cloud (Postgres, RLS-scoped to your account). Revoking a scope
        immediately restricts what Omni includes in its context on your next question.
      </p>
    </div>
  );
}
