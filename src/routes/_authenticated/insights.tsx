import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wind, Droplet, Heart, Moon, Activity, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getInsights } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/_authenticated/insights")({
  component: Insights,
  ssr: false,
  head: () => ({ meta: [{ title: "Health Insights — OmniCare" }] }),
});

const CARDS = [
  { key: "sleep", label: "Sleep", unit: "h", icon: Moon, tone: "sage", avg: (a: number[]) => (a.reduce((s, x) => s + x, 0) / a.length).toFixed(1) },
  { key: "stress", label: "Stress", unit: "/100", icon: Activity, tone: "coral", avg: (a: number[]) => Math.round(a.reduce((s, x) => s + x, 0) / a.length) },
  { key: "hydration", label: "Hydration", unit: "L", icon: Droplet, tone: "amber", avg: (a: number[]) => (a.reduce((s, x) => s + x, 0) / a.length).toFixed(1) },
  { key: "heart", label: "Heart", unit: "bpm", icon: Heart, tone: "sage", avg: (a: number[]) => Math.round(a.reduce((s, x) => s + x, 0) / a.length) },
] as const;

function Insights() {
  const load = useServerFn(getInsights);
  const [data, setData] = useState<any>(null);
  useEffect(() => { load({}).then(setData); }, [load]);

  if (!data) return <div className="flex items-center gap-2 text-muted-foreground italic"><Loader2 className="h-4 w-4 animate-spin" /> Loading your trends…</div>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-widest">Weekly patterns</p>
        <h1 className="text-4xl mt-1">Health <span className="editorial-italic text-primary">insights</span></h1>
        <p className="text-muted-foreground mt-1">Trends over the last 7 days — computed from your profile & lifestyle.</p>
      </div>

      <section className="grid md:grid-cols-2 gap-5">
        {CARDS.map((c) => {
          const arr = data[c.key] as number[];
          const Icon = c.icon;
          const avgN = c.key === "sleep" || c.key === "hydration" ? parseFloat(c.avg(arr) as string) : Number(c.avg(arr));
          const targ = c.key === "sleep" ? data.profile.sleepTarget : c.key === "hydration" ? data.profile.waterTarget : null;
          return (
            <div key={c.key} className="card-lux p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <Icon className="h-4 w-4" /> {c.label}
                </div>
                <p className="text-2xl text-primary editorial-italic">
                  {c.avg(arr)}<span className="text-sm text-muted-foreground"> {c.unit} avg</span>
                </p>
              </div>
              <Chart data={arr} tone={c.tone} />
              <p className="text-sm text-muted-foreground mt-2 editorial-italic">
                {c.key === "sleep" && (avgN < 7 ? `Below your ${targ}h target — bio-age is paying for it.` : "On target — keep the rhythm.")}
                {c.key === "stress" && (avgN > 60 ? "Elevated stress load — deliberate wind-downs help." : "Stress in a healthy band.")}
                {c.key === "hydration" && (avgN < 2 ? `${avgN}L is well under Mumbai's humidity demand.` : "Hydration steady — nice.")}
                {c.key === "heart" && "Resting HR stable. HRV trending — good sign."}
              </p>
            </div>
          );
        })}
      </section>

      <section className="grid md:grid-cols-2 gap-5">
        <div className="card-lux p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Activity className="h-4 w-4" /> Regional outbreak signals
          </div>
          <h4 className="text-2xl mt-2"><span className="editorial-italic">Bandra West</span></h4>
          <div className="mt-4 space-y-3">
            {[
              { name: "Dengue", change: data.regional.change, cases: data.regional.cases, tone: "coral" },
              { name: "Viral fever", change: "+42%", cases: 38, tone: "amber" },
              { name: "Gastroenteritis", change: "+18%", cases: 21, tone: "amber" },
              { name: "Chikungunya", change: "-9%", cases: 3, tone: "sage" },
            ].map((o) => (
              <div key={o.name} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full" style={{ background: `var(--${o.tone === "coral" ? "coral" : o.tone === "amber" ? "amber-soft" : "sage"})` }} />
                <span className="flex-1">{o.name}</span>
                <span className="text-sm text-muted-foreground">{o.cases} cases</span>
                <span className="w-14 text-right editorial-italic">{o.change}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-lux p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Wind className="h-4 w-4" /> Air quality — Bandra
          </div>
          <div className="mt-3 flex items-end gap-4">
            <p className="text-6xl editorial-italic text-coral">{data.regional.air.aqi}</p>
            <div className="mb-2">
              <p className="editorial-italic">{data.regional.air.band}</p>
              <p className="text-xs text-muted-foreground">PM2.5 · 92 μg/m³</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-1.5">
            {[142, 156, 168, 173, 168, 154, 168].map((v, i) => (
              <div key={i} className="text-center">
                <div className="h-16 rounded-lg bg-secondary flex items-end">
                  <div className="w-full rounded-lg" style={{ height: `${(v / 200) * 100}%`, background: v > 150 ? "var(--coral)" : "var(--amber-soft)" }} />
                </div>
                <p className="text-[10px] mt-1 text-muted-foreground">{["M","T","W","T","F","S","S"][i]}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground editorial-italic">Wear an N95 on your commute Wednesday — that's the ridge.</p>
        </div>
      </section>
    </div>
  );
}

function Chart({ data, tone }: { data: number[]; tone: string }) {
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.9;
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(" ");
  const color = tone === "coral" ? "var(--coral)" : tone === "amber" ? "var(--amber-soft)" : "#5a8c50";
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-4 h-24 w-full">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.4" />
      {data.map((v, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * 100} cy={100 - ((v - min) / range) * 100} r="1.2" fill={color} />
      ))}
    </svg>
  );
}
