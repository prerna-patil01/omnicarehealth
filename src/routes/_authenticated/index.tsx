import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Sparkles, ShieldAlert, Wind, Activity } from "lucide-react";
import { aiFinding, patient, regional, vitals, systems } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Dashboard — OmniCare" }],
  }),
});

function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest">
            Wednesday · Mumbai
          </p>
          <h1 className="text-4xl md:text-5xl mt-1">
            Good to see you, <span className="editorial-italic text-primary">{patient.firstName}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Omni has been listening to your body while you slept.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/ask-omni"
            className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground shadow-soft"
          >
            Ask Omni
          </Link>
          <Link
            to="/digital-twin"
            className="rounded-full border border-primary/30 px-5 py-2.5 text-sm text-primary"
          >
            Open Digital Twin
          </Link>
        </div>
      </div>

      {/* HERO — AI clinical finding */}
      <section className="hero-panel p-8 md:p-10 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-coral/30 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
              <Sparkles className="h-3.5 w-3.5" /> Omni · clinical finding
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl leading-tight">
              This looks like <span className="editorial-italic text-coral">your gallbladder</span>.
            </h2>
            <p className="mt-2 opacity-85">
              Consistent with <em>biliary colic</em>. Not an emergency yet — but worth a scan today.
            </p>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest opacity-70 mb-2">Why Omni thinks so</p>
              <ul className="space-y-1.5 text-[15px]">
                {aiFinding.reasoning.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="text-coral">·</span>
                    <span className="opacity-95">{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/doctors"
                className="rounded-full bg-coral px-5 py-2 text-sm text-coral-foreground"
              >
                Book Dr. Meera Rao
              </Link>
              <Link
                to="/ask-omni"
                className="rounded-full bg-primary-foreground/10 border border-primary-foreground/25 px-5 py-2 text-sm"
              >
                Discuss with Omni
              </Link>
              <button
                onClick={() => toast("Full reasoning trail saved to your record")}
                className="rounded-full bg-primary-foreground/10 border border-primary-foreground/25 px-5 py-2 text-sm"
              >
                Save reasoning
              </button>
            </div>
          </div>

          <div className="card-lux bg-background/95 text-foreground p-6 rounded-3xl">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Risk score</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-6xl text-primary editorial-italic">{aiFinding.risk}</span>
              <span className="text-muted-foreground mb-2">/ 10</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-soft/50 px-3 py-1 text-xs">
              <ShieldAlert className="h-3.5 w-3.5" /> {aiFinding.band}
            </div>
            <div className="mt-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Suggested next
              </p>
              <ul className="space-y-1.5 text-sm">
                {aiFinding.next.map((n) => (
                  <li key={n} className="flex gap-2">
                    <span className="text-coral">→</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Vitals strip */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-2xl">
            Today's <span className="editorial-italic">vitals</span>
          </h3>
          <span className="text-xs text-muted-foreground">
            Synced 4 min ago · Apple Watch
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {vitals.map((v) => (
            <div key={v.label} className="card-lux p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{v.label}</p>
              <div className="mt-2 flex items-end gap-1.5">
                <span className="text-4xl text-primary">{v.value}</span>
                <span className="text-muted-foreground mb-1.5 text-sm">{v.unit}</span>
                <span className="ml-auto mb-1.5">
                  {v.trend === "up" ? (
                    <ArrowUp className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-coral" />
                  )}
                </span>
              </div>
              <MiniSpark trend={v.trend} />
            </div>
          ))}
        </div>
      </section>

      {/* Regional + twin preview */}
      <section className="grid md:grid-cols-2 gap-5">
        <div className="card-lux p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Activity className="h-4 w-4" /> Regional disease intelligence
          </div>
          <h4 className="mt-2 text-2xl">
            <span className="editorial-italic">Dengue</span> is up near you
          </h4>
          <div className="mt-4 flex items-baseline gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Change (7d)</p>
              <p className="text-3xl text-coral">{regional.change}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Confirmed cases</p>
              <p className="text-3xl">{regional.cases}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Radius</p>
              <p className="text-3xl">{regional.radius}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            You had dengue in 2021. Re-infection tends to be more severe — Omni is watching for
            fever, retro-orbital pain, or a rash.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Wind className="h-4 w-4 text-primary" />
            <span>Bandra AQI</span>
            <span className="rounded-full bg-rose-soft/50 px-2 py-0.5 text-xs">
              {regional.air.aqi} · {regional.air.band}
            </span>
          </div>
        </div>

        <div className="card-lux p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-4 w-4" /> Digital Twin · preview
          </div>
          <h4 className="mt-2 text-2xl">
            Health score <span className="editorial-italic text-primary">80</span>
            <span className="text-muted-foreground">/100</span>
          </h4>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {systems.slice(0, 6).map((s) => (
              <div
                key={s.key}
                className="rounded-xl border border-border p-3"
                style={{
                  background:
                    s.risk >= 50
                      ? "color-mix(in oklab, var(--coral) 12%, var(--card))"
                      : s.risk >= 30
                      ? "color-mix(in oklab, var(--amber-soft) 30%, var(--card))"
                      : "color-mix(in oklab, var(--sage) 25%, var(--card))",
                }}
              >
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg">{s.risk}%</p>
              </div>
            ))}
          </div>
          <Link
            to="/digital-twin"
            className="mt-5 inline-flex text-sm text-primary editorial-italic"
          >
            Open full Digital Twin →
          </Link>
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Order refill", to: "/pharmacy" },
          { label: "Upload report", to: "/reports" },
          { label: "Home sample", to: "/care" },
          { label: "Book physio", to: "/care" },
        ].map((q) => (
          <Link
            key={q.label}
            to={q.to}
            className="card-lux p-4 hover:-translate-y-0.5 transition text-center"
          >
            <p className="editorial-italic text-primary">{q.label}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

function MiniSpark({ trend }: { trend: string }) {
  const points =
    trend === "up"
      ? "0,20 12,18 24,15 36,12 48,10 60,7 72,5"
      : "0,6 12,9 24,11 36,10 48,14 60,17 72,20";
  return (
    <svg viewBox="0 0 72 24" className="mt-3 h-6 w-full">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={trend === "up" ? "text-emerald-600" : "text-coral"}
      />
    </svg>
  );
}
