import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Deterministic pseudo-random from a string seed (userId) so vitals are stable per user.
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = Math.imul(h ^ (h >>> 15), 1 | h); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(() => ({}))
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle();
    const p: any = profile ?? {};
    const rnd = seeded(context.userId);

    // Vitals — deterministic per user, nudged by lifestyle
    const stressHigh = p.lifestyle?.stress === "High";
    const sleepH = parseFloat(String(p.lifestyle?.sleep ?? "7")) || 7;
    const waterL = parseFloat(String(p.lifestyle?.water ?? "2")) || 2;

    const hr = Math.round(68 + rnd() * 8 + (stressHigh ? 4 : 0));
    const hrv = Math.round(58 - (stressHigh ? 10 : 0) + rnd() * 6);
    const spo2 = 97 + Math.round(rnd() * 2);
    const sleep = Math.round(sleepH * 10) / 10;

    const vitals = [
      { label: "Heart rate", value: String(hr), unit: "bpm", trend: hr > 74 ? "up" : "down" },
      { label: "HRV", value: String(hrv), unit: "ms", trend: hrv >= 55 ? "up" : "down" },
      { label: "SpO₂", value: String(spo2), unit: "%", trend: "up" },
      { label: "Sleep", value: sleep.toString(), unit: "h", trend: sleep >= 7 ? "up" : "down" },
    ];

    // AI finding — derive most-likely concern from family + lifestyle
    const motherGall = /gall/i.test(p.family?.mother ?? "");
    const fatherDiab = /diab/i.test(p.family?.father ?? "");
    const lowHydration = waterL < 1.5;

    let finding: any;
    if (motherGall) {
      finding = {
        headline: "This looks like your gallbladder",
        condition: "Biliary colic — early signal",
        risk: 6.4, band: "Medium",
        reasoning: [
          "Right-upper-quadrant tenderness pattern noted",
          "Reports of pain worsening after fatty meals",
          "Mother has gallstones — ~3× baseline risk",
          lowHydration ? `Hydration at ${waterL} L/day — bile stasis risk` : "Hydration adequate",
          "No fever or jaundice — not acute cholecystitis",
        ],
        next: ["Ultrasound abdomen within 48h", "Low-fat diet for 72 hours", "Consult a gastroenterologist"],
      };
    } else if (fatherDiab) {
      finding = {
        headline: "Watch your metabolic drift",
        condition: "Pre-diabetic pattern risk",
        risk: 5.2, band: "Medium",
        reasoning: [
          "Father has Type 2 Diabetes — ~2× baseline risk",
          `BMI ${p.bmi ?? "unknown"}`,
          sleepH < 7 ? `Sleep ${sleepH}h — insulin sensitivity drops` : "Sleep adequate",
          stressHigh ? "Chronic stress elevates fasting glucose" : "Stress in range",
        ],
        next: ["HbA1c + fasting glucose panel", "Zone-2 cardio 30 min × 3/week", "Cut refined carbs after 7 PM"],
      };
    } else {
      finding = {
        headline: "You're broadly healthy — one lever to pull",
        condition: lowHydration ? "Chronic mild dehydration" : "Sleep debt",
        risk: 3.8, band: "Low",
        reasoning: [
          `Water ${waterL} L/day`,
          `Sleep ${sleepH} h/night`,
          stressHigh ? "Stress: High" : "Stress: managed",
          "No family red flags on file",
        ],
        next: ["Add a 500ml water block mid-morning", "10-min wind-down before bed", "Recheck vitals next week"],
      };
    }

    const regional = { outbreak: "Dengue", change: "+150%", cases: 12, radius: "2 km", air: { aqi: 168, band: "Unhealthy" } };
    const profileEcho = `mother — ${p.family?.mother ?? "n/a"} · father — ${p.family?.father ?? "n/a"} · BMI ${p.bmi ?? "?"} · sleep ${p.lifestyle?.sleep ?? "?"} · water ${p.lifestyle?.water ?? "?"} · stress ${p.lifestyle?.stress ?? "?"}`;

    return { finding, vitals, regional, firstName: p.first_name ?? "there", region: p.region ?? "Mumbai", profileEcho };
  });

export const getInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(() => ({}))
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle();
    const p: any = profile ?? {};
    const rnd = seeded(context.userId + "-insights");
    const sleepH = parseFloat(String(p.lifestyle?.sleep ?? "7")) || 7;
    const waterL = parseFloat(String(p.lifestyle?.water ?? "2")) || 2;
    const stressBase = p.lifestyle?.stress === "High" ? 72 : p.lifestyle?.stress === "Medium" ? 55 : 38;
    const hrBase = 72 + (p.lifestyle?.stress === "High" ? 3 : 0);

    const series = (base: number, jitter: number, decimals = 0) =>
      Array.from({ length: 7 }, () => {
        const v = base + (rnd() - 0.5) * jitter * 2;
        return decimals ? Math.round(v * 10) / 10 : Math.round(v);
      });

    return {
      sleep: series(sleepH, 0.6, 1),
      stress: series(stressBase, 10),
      hydration: series(waterL, 0.3, 1),
      heart: series(hrBase, 3),
      profile: { stress: p.lifestyle?.stress, waterTarget: 2.5, sleepTarget: 7.5 },
      regional: { change: "+150%", cases: 12, air: { aqi: 168, band: "Unhealthy" } },
    };
  });
