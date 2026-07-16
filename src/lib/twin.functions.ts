import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const computeTwin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(() => ({}))
  .handler(async ({ context }) => {
    const { data: p } = await context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle();
    if (!p) throw new Error("no profile");

    // Simple deterministic scoring
    let score = 90;
    const bmi = Number(p.bmi ?? 22);
    if (bmi >= 25) score -= 8; else if (bmi < 18.5) score -= 5;
    const sleepStr = String(p.lifestyle?.sleep ?? "7");
    const sleepH = parseFloat(sleepStr) || 7;
    if (sleepH < 6.5) score -= 6;
    const waterStr = String(p.lifestyle?.water ?? "2");
    const waterL = parseFloat(waterStr) || 2;
    if (waterL < 2) score -= 6;
    if (p.lifestyle?.stress === "High") score -= 5;
    if (p.smoking && p.smoking !== "never") score -= 10;
    if (p.drinking === "daily") score -= 8;
    if (p.family?.mother) score -= 2;
    if (p.family?.father) score -= 2;
    score = Math.max(40, Math.min(100, score));

    const bioAge = (p.age ?? 25) + (100 - score) * 0.15;

    const systems = [
      { key: "brain", label: "Cognition/Stress", risk: p.lifestyle?.stress === "High" ? 55 : 20, note: p.lifestyle?.stress === "High" ? "Chronic stress signal" : "Balanced" },
      { key: "heart", label: "Cardio", risk: bmi >= 25 ? 45 : 22, note: "HR stable" },
      { key: "liver", label: "Hepatobiliary", risk: p.family?.mother?.toLowerCase?.().includes("gall") ? 62 : 25, note: p.family?.mother?.toLowerCase?.().includes("gall") ? "Family gallstones — elevated" : "Normal" },
      { key: "kidney", label: "Renal", risk: waterL < 1.5 ? 58 : 20, note: waterL < 1.5 ? "Low hydration" : "Adequate" },
      { key: "metabolic", label: "Metabolic", risk: p.family?.father?.toLowerCase?.().includes("diab") ? 48 : 22, note: "Watch glucose" },
      { key: "immune", label: "Immune", risk: p.history?.some?.((h: string) => h.toLowerCase().includes("dengue")) ? 40 : 20, note: "Prior dengue on record" },
    ];

    const proneTo: any[] = [];
    if (p.family?.mother?.toLowerCase?.().includes("gall")) proneTo.push({ name: "Gallstones", pct: 34, drivers: ["Mother has gallstones", "Low hydration", "Female under 40"], lever: "Hydrate to 2.5 L/day and cut fried food" });
    if (p.family?.father?.toLowerCase?.().includes("diab")) proneTo.push({ name: "Type 2 Diabetes", pct: 22, drivers: ["Father has T2D", "Sedentary weeks", "Junk food frequency"], lever: "Move 30 min/day, cut refined carbs" });
    if (waterL < 1.5) proneTo.push({ name: "Kidney stones", pct: 18, drivers: ["Low hydration", "Hot climate"], lever: "Water 2.5 L/day, add citrus" });
    if (proneTo.length === 0) proneTo.push({ name: "General deconditioning", pct: 12, drivers: ["Baseline profile"], lever: "Maintain sleep and activity" });

    const snap = { health_score: Math.round(score), bio_age: Math.round(bioAge * 10) / 10, systems, prone_to: proneTo };
    await context.supabase.from("twin_snapshots").insert({ user_id: context.userId, ...snap });
    return { ...snap, actual_age: p.age };
  });
