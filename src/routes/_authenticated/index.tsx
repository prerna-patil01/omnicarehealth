import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Sparkles, ShieldAlert, Wind, Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getDashboard } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/_authenticated/")({
  component: Dashboard,
  ssr: false,
  head: () => ({ meta: [{ title: "Dashboard — OmniCare" }] }),
});

function Dashboard() {
  const nav = useNavigate();
  const load = useServerFn(getDashboard);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("onboarded").maybeSingle();
      if (prof && (prof as any).onboarded === false) { nav({ to: "/onboarding" }); return; }
      const res = await load({});
      setData(res);
    })();
  }, [nav, load]);

  if (!data) {
    return <div className="flex items-center gap-2 text-muted-foreground italic"><Loader2 className="h-4 w-4 animate-spin" /> Omni is composing your dashboard…</div>;
  }

  const { finding, vitals, regional, firstName, region } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest">{new Date().toLocaleDateString("en-GB", { weekday: "long" })} · {region}</p>
          <h1 className="text-4xl md:text-5xl mt-1">
            Good to see you, <span className="editorial-italic text-primary">{firstName}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Omni has been listening to your body while you slept.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/ask-omni" className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Ask Omni</Link>
          <Link to="/digital-twin" className="rounded-full border border-primary/30 px-5 py-2.5 text-sm text-primary">Open Digital Twin</Link>
        </div>
      </div>

      <section className="hero-panel p-8 md:p-10 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-coral/30 blur-3xl" />
        <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
              <Sparkles className="h-3.5 w-3.5" /> Omni · clinical finding
              <span className="ml-1 rounded-full bg-coral/25 text-coral-foreground px-2 py-0.5 text-[10px] tracking-widest">LIVE · computed for {firstName}</span>
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl leading-tight">
              {finding.headline.split(" ").slice(0, -2).join(" ")} <span className="editorial-italic text-coral">{finding.headline.split(" ").slice(-2).join(" ")}</span>.
            </h2>
            <p className="mt-2 opacity-85">Consistent with <em>{finding.condition}</em>. Not an emergency yet — but worth attention.</p>
            <p className="mt-1 text-xs opacity-70 editorial-italic">Personalised from your profile: {data.profileEcho}</p>
            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest opacity-70 mb-2">Why Omni thinks so</p>
              <ul className="space-y-1.5 text-[15px]">
                {finding.reasoning.map((r: string) => (
                  <li key={r} className="flex gap-2"><span className="text-coral">·</span><span className="opacity-95">{r}</span></li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/doctors" className="rounded-full bg-coral px-5 py-2 text-sm text-coral-foreground">Find a specialist</Link>
              <Link to="/ask-omni" className="rounded-full bg-primary-foreground/10 border border-primary-foreground/25 px-5 py-2 text-sm">Discuss with Omni</Link>
              <button onClick={() => toast("Full reasoning trail saved to your record")} className="rounded-full bg-primary-foreground/10 border border-primary-foreground/25 px-5 py-2 text-sm">Save reasoning</button>
            </div>
          </div>
          <div className="card-lux bg-background/95 text-foreground p-6 rounded-3xl">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Risk score</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-6xl text-primary editorial-italic">{finding.risk}</span>
              <span className="text-muted-foreground mb-2">/ 10</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-soft/50 px-3 py-1 text-xs">
              <ShieldAlert className="h-3.5 w-3.5" /> {finding.band}
            </div>
            <div className="mt-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Suggested next</p>
              <ul className="space-y-1.5 text-sm">
                {finding.next.map((n: string) => <li key={n} className="flex gap-2"><span className="text-coral">→</span><span>{n}</span></li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-2xl">Today's <span className="editorial-italic">vitals</span></h3>
          <span className="text-xs text-muted-foreground">Synced 4 min ago · Apple Watch</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {vitals.map((v: any) => (
            <div key={v.label} className="card-lux p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{v.label}</p>
              <div className="mt-2 flex items-end gap-1.5">
                <span className="text-4xl text-primary">{v.value}</span>
                <span className="text-muted-foreground mb-1.5 text-sm">{v.unit}</span>
                <span className="ml-auto mb-1.5">{v.trend === "up" ? <ArrowUp className="h-4 w-4 text-emerald-600" /> : <ArrowDown className="h-4 w-4 text-coral" />}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-5">
        <div className="card-lux p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Activity className="h-4 w-4" /> Regional disease intelligence
          </div>
          <h4 className="mt-2 text-2xl"><span className="editorial-italic">Dengue</span> is up near you</h4>
          <div className="mt-4 flex items-baseline gap-6">
            <div><p className="text-xs text-muted-foreground">Change (7d)</p><p className="text-3xl text-coral">{regional.change}</p></div>
            <div><p className="text-xs text-muted-foreground">Confirmed cases</p><p className="text-3xl">{regional.cases}</p></div>
            <div><p className="text-xs text-muted-foreground">Radius</p><p className="text-3xl">{regional.radius}</p></div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Wind className="h-4 w-4 text-primary" /><span>Bandra AQI</span>
            <span className="rounded-full bg-rose-soft/50 px-2 py-0.5 text-xs">{regional.air.aqi} · {regional.air.band}</span>
          </div>
        </div>
        <div className="card-lux p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-4 w-4" /> Digital Twin · preview
          </div>
          <h4 className="mt-2 text-2xl">Open your <span className="editorial-italic text-primary">live model</span></h4>
          <p className="text-sm text-muted-foreground mt-2">Computed from your onboarding data — BMI, family history, hydration, stress, sleep.</p>
          <Link to="/digital-twin" className="mt-5 inline-flex text-sm text-primary editorial-italic">Open full Digital Twin →</Link>
        </div>
      </section>
    </div>
  );
}
