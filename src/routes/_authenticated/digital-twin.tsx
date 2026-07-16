import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { computeTwin } from "@/lib/twin.functions";

export const Route = createFileRoute("/_authenticated/digital-twin")({
  component: DigitalTwin,
  ssr: false,
  head: () => ({ meta: [{ title: "Digital Twin — OmniCare" }] }),
});

const NODES: Record<string, { x: number; y: number }> = {
  brain: { x: 50, y: 12 }, heart: { x: 47, y: 40 }, liver: { x: 55, y: 55 },
  kidney: { x: 43, y: 62 }, metabolic: { x: 50, y: 72 }, immune: { x: 60, y: 30 },
};

function DigitalTwin() {
  const compute = useServerFn(computeTwin);
  const [twin, setTwin] = useState<any>(null);
  const [active, setActive] = useState<string | null>("liver");

  useEffect(() => {
    compute({ data: {} }).then(setTwin).catch(() => setTwin(null));
  }, [compute]);

  if (!twin) return <p className="text-muted-foreground italic">Modelling your twin from your profile…</p>;

  const activeNode = twin.systems.find((s: any) => s.key === active);
  const bioDelta = (twin.bio_age - twin.actual_age).toFixed(1);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-widest">Your body, modelled</p>
        <h1 className="text-4xl mt-1">Digital <span className="editorial-italic text-primary">Twin</span></h1>
      </div>

      <section className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
        <div className="hero-panel relative p-6 md:p-10 overflow-hidden min-h-[560px]">
          <div className="absolute inset-0 opacity-40" style={{
            background: "radial-gradient(ellipse at 50% 40%, rgba(255,107,53,0.35), transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(255,255,255,0.15), transparent 60%)",
          }} />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-80 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> live model
              </p>
              <h2 className="text-2xl mt-1"><span className="editorial-italic">Your twin</span> · v3.2</h2>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest opacity-80">Health score</p>
              <p className="text-5xl editorial-italic text-coral">{twin.health_score}<span className="text-xl opacity-70">/100</span></p>
              <p className="text-xs opacity-70 mt-1">Bio-age {twin.bio_age} vs actual {twin.actual_age}</p>
            </div>
          </div>

          <div className="relative mt-4 flex justify-center">
            <svg viewBox="0 0 100 120" className="w-64 md:w-80 h-auto">
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="bodyG" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#a8c4f5" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#4a7ac9" stopOpacity="0.35" />
                </linearGradient>
              </defs>
              <g stroke="url(#bodyG)" strokeWidth="0.6" fill="url(#bodyG)" opacity="0.85">
                <circle cx="50" cy="12" r="7" />
                <path d="M 42 22 Q 50 20 58 22 L 62 42 Q 65 60 62 70 L 60 90 L 55 118 L 50 118 L 48 90 L 40 90 L 40 118 L 35 118 L 38 90 L 35 70 Q 32 60 35 42 Z" />
                <path d="M 42 24 L 25 45 L 22 68" fill="none" />
                <path d="M 58 24 L 75 45 L 78 68" fill="none" />
              </g>
              {twin.systems.map((s: any) => {
                const pos = NODES[s.key] ?? { x: 50, y: 50 };
                const color = s.risk >= 50 ? "#ff6b35" : s.risk >= 30 ? "#e8c98a" : "#b8cfb0";
                const r = s.risk >= 50 ? 4.5 : 3.5;
                return (
                  <g key={s.key} onClick={() => setActive(s.key)} style={{ cursor: "pointer" }}>
                    <circle cx={pos.x} cy={pos.y} r="10" fill="url(#glow)" opacity={active === s.key ? 0.9 : 0.5}>
                      <animate attributeName="opacity" values="0.35;0.7;0.35" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={pos.x} cy={pos.y} r={r} fill={color} stroke="#faf6ee" strokeWidth="0.5" />
                  </g>
                );
              })}
            </svg>
          </div>

          {activeNode && (
            <div className="relative mt-2 mx-auto max-w-md rounded-2xl bg-background/90 text-foreground p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{activeNode.label} system</p>
              <p className="text-lg mt-0.5"><span className="editorial-italic">{activeNode.note}</span></p>
              <p className="text-sm text-muted-foreground mt-1">Risk index {activeNode.risk}%</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card-lux p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Biological age</p>
            <div className="flex items-baseline gap-4 mt-2">
              <div><p className="text-5xl text-primary editorial-italic">{twin.bio_age}</p><p className="text-xs text-muted-foreground mt-1">Modelled</p></div>
              <div className="text-muted-foreground">vs</div>
              <div><p className="text-5xl">{twin.actual_age}</p><p className="text-xs text-muted-foreground mt-1">Actual</p></div>
              <div className="ml-auto rounded-full bg-coral/15 text-coral px-3 py-1 text-xs">{Number(bioDelta) >= 0 ? "+" : ""}{bioDelta} yrs</div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Computed live from your profile: sleep, hydration, stress, BMI and family history.</p>
          </div>

          <div className="card-lux p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">System risk</p>
            <div className="mt-3 space-y-3">
              {twin.systems.map((s: any) => (
                <div key={s.key}>
                  <div className="flex justify-between text-sm"><span>{s.label}</span><span className="text-muted-foreground">{s.risk}%</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.risk}%`, background: s.risk >= 50 ? "var(--coral)" : s.risk >= 30 ? "var(--amber-soft)" : "var(--sage)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl mb-4">What you're <span className="editorial-italic">prone to</span></h3>
        <div className="grid md:grid-cols-3 gap-4">
          {twin.prone_to.map((p: any) => (
            <div key={p.name} className="card-lux p-5">
              <div className="flex items-baseline justify-between">
                <h4 className="text-xl">{p.name}</h4>
                <span className="text-2xl text-coral editorial-italic">{p.pct}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">10-year probability</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-4">Drivers</p>
              <ul className="mt-1.5 space-y-1 text-sm">
                {p.drivers.map((d: string) => <li key={d} className="flex gap-2"><span className="text-coral">·</span>{d}</li>)}
              </ul>
              <div className="mt-4 rounded-xl bg-sage/30 p-3 text-sm">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">The lever you control</p>
                <p className="editorial-italic mt-1">{p.lever}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
