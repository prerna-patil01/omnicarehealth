import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const ChatInput = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).min(1),
});

const ActionInput = z.object({
  kind: z.enum(["book_appointment", "add_to_cart", "set_reminder"]),
  payload: z.record(z.any()),
});

function buildSystemPrompt(profile: any, grants: Record<string, boolean>) {
  const p = profile ?? {};
  const allowRecords = grants["omni.records"] !== false;
  const allowLifestyle = grants["omni.lifestyle"] !== false;
  const allowFamily = grants["omni.family_history"] !== false;

  const identity = [
    `Name: ${p.name ?? "the user"} · Age: ${p.age ?? "?"} · Sex: ${p.sex ?? "?"} · Blood group: ${p.blood_group ?? "?"}`,
    `Region: ${p.region ?? "?"}`,
    `Allergies: ${(p.allergies ?? []).join(", ") || "none"}`,
    allowRecords ? `Conditions: ${(p.conditions ?? []).join(", ") || "none"}` : `Conditions: [redacted — consent off]`,
    allowRecords ? `Past history: ${(p.history ?? []).join(", ") || "none"}` : `History: [redacted]`,
    allowFamily ? `Family: mother — ${p.family?.mother ?? "?"}; father — ${p.family?.father ?? "?"}` : `Family: [redacted]`,
    allowLifestyle ? `Lifestyle: sleep ${p.lifestyle?.sleep ?? "?"}, water ${p.lifestyle?.water ?? "?"}, stress ${p.lifestyle?.stress ?? "?"}` : `Lifestyle: [redacted]`,
    `BMI: ${p.bmi ?? "unknown"}`,
  ].join("\n- ");

  return `You are Omni, a calm, precise clinical-assistant AI inside OmniCare. You advise; the human decides.

Diagnostic discipline (VERY IMPORTANT):
- Do NOT jump to a verdict. A responsible clinician gathers evidence first.
- On EVERY turn, decide: do I have enough information to responsibly commit to a most-likely condition?
  Enough = at least 4–6 informative answers covering: onset/duration, character & location, triggers/relievers, associated symptoms (fever, nausea, bowel/urinary, breathing), red flags, and relevant lifestyle/exposure.
- If NOT enough → ask exactly ONE focused clarifying question. No verdict, no plan, no action block yet. Under "Why I'm asking:" give a one-line reason tied to what you're trying to rule in/out.
- Prefer high-yield questions that split the differential (fever? radiation? relation to food? urinary changes? travel/mosquito exposure? menstrual timing?).
- Never re-ask something already answered. Acknowledge what you've learned in one short sentence before the next question.
- Only when the picture is clear enough, give a Verdict: most-likely condition, confidence %, 2–3 plausible alternates, and a 3–5 step staged plan.
- If still uncertain after questioning, say so plainly and propose what to measure/observe (e.g. "take your temperature in 6 hours").

Style:
- Talk like a thoughtful senior physician. Warm, concise, no markdown headers, short paragraphs, under ~140 words.
- Never prescribe scheduled/prescription drugs. Always screen against user allergies.

Internally weigh six perspectives (Triage, Population, Biometrics, Records, Nutrition, Skeptic). At the END of every reply, append this exact block on new lines:
[[AGENTS]]
Triage: <one short sentence>
Population: <one short sentence>
Biometrics: <one short sentence>
Records: <one short sentence>
Nutrition: <one short sentence>
Skeptic: <one short dissenting or cautioning sentence>
[[/AGENTS]]

Only after you commit to a Verdict AND a concrete action would help, append ONE action block (NEVER during the questioning phase):
[[ACTION kind="book_appointment"]]{"specialty":"Gastroenterology","doctor":"Dr. Meera Rao","hospital":"Lilavati Hospital","date":"Today, 5:30 PM","reason":"..."}[[/ACTION]]
  or [[ACTION kind="add_to_cart"]]{"name":"Electral","reason":"rehydration"}[[/ACTION]]
  or [[ACTION kind="set_reminder"]]{"title":"Take temperature","when":"in 6 hours"}[[/ACTION]]

USER HEALTH IDENTITY (ground truth, respect redactions):
- ${identity}

Regional signal: dengue up 150% in Bandra, Mumbai. Air quality often unhealthy.`;
}

export const omniChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => ChatInput.parse(v))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const [{ data: profile }, { data: consents }] = await Promise.all([
      context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
      context.supabase.from("consent_grants").select("scope,granted").eq("user_id", context.userId),
    ]);
    const grants: Record<string, boolean> = {};
    (consents ?? []).forEach((g: any) => { grants[g.scope] = g.granted; });

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const { text } = await generateText({
      model,
      system: buildSystemPrompt(profile, grants),
      messages: data.messages.map((m) => ({ role: m.role, content: m.content })),
    });

    // Parse agent block
    const agents: { name: string; note: string }[] = [];
    const aMatch = text.match(/\[\[AGENTS\]\]([\s\S]*?)\[\[\/AGENTS\]\]/);
    if (aMatch) {
      aMatch[1].split("\n").map((l) => l.trim()).filter(Boolean).forEach((line) => {
        const m = line.match(/^([A-Za-z]+):\s*(.+)$/);
        if (m) agents.push({ name: m[1], note: m[2] });
      });
    }
    // Parse first action
    let action: any = null;
    const actMatch = text.match(/\[\[ACTION kind="([^"]+)"\]\]([\s\S]*?)\[\[\/ACTION\]\]/);
    if (actMatch) {
      try { action = { kind: actMatch[1], payload: JSON.parse(actMatch[2].trim()) }; } catch { /* ignore */ }
    }
    const reply = text
      .replace(/\[\[AGENTS\]\][\s\S]*?\[\[\/AGENTS\]\]/g, "")
      .replace(/\[\[ACTION[\s\S]*?\[\[\/ACTION\]\]/g, "")
      .trim();

    return { reply, agents, action };
  });

export const executeOmniAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => ActionInput.parse(v))
  .handler(async ({ data, context }) => {
    if (data.kind === "book_appointment") {
      const p = data.payload;
      await context.supabase.from("appointments").insert({
        user_id: context.userId,
        doctor: p.doctor ?? "Recommended clinician",
        specialty: p.specialty ?? "General",
        hospital: p.hospital ?? "Nearby hospital",
        date: p.date ?? "Tomorrow, 10 AM",
        status: "Confirmed",
        ride: true,
        is_past: false,
      });
      return { ok: true, message: `Booked ${p.doctor ?? "clinician"} · ${p.date ?? "tomorrow"}` };
    }
    if (data.kind === "add_to_cart") {
      const name = data.payload.name;
      const { data: med } = await context.supabase.from("medicines").select("*").ilike("name", `%${name}%`).limit(1).maybeSingle();
      if (med) {
        await context.supabase.from("cart_items").insert({ user_id: context.userId, medicine_id: (med as any).id, qty: 1 });
        return { ok: true, message: `Added ${(med as any).name} to cart` };
      }
      return { ok: false, message: `${name} not found in catalog` };
    }
    if (data.kind === "set_reminder") {
      return { ok: true, message: `Reminder set: ${data.payload.title} · ${data.payload.when}` };
    }
    return { ok: false, message: "Unknown action" };
  });
