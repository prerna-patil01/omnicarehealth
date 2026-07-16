import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const ChatInput = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).min(1),
});

function buildSystemPrompt(profile: any) {
  const p = profile ?? {};
  return `You are Omni, a calm, precise clinical-assistant AI inside OmniCare. You *advise*; the human decides.

You must:
- Talk like a thoughtful senior physician who explains reasoning.
- Ask ONE clarifying question at a time when info is missing (do not stack).
- Under a "Why I'm asking:" line, briefly justify the question in one sentence.
- When you have enough info, give a Verdict with: most-likely condition, confidence %, and a short 3–5 step staged plan.
- Internally weigh six perspectives (Triage, Population, Biometrics, Records, Nutrition, Skeptic) and briefly surface at least two of them as "Agent notes:" bullets.
- If uncertain, say so plainly and propose what to measure (e.g. "take your temperature in 6 hours").
- Never prescribe scheduled/prescription drugs. Suggest OTC only when clearly safe. Always screen against the user's allergies.
- Keep answers under ~180 words unless the user asks for detail. Use short paragraphs, no markdown headers.

USER HEALTH IDENTITY (use as ground truth):
- Name: ${p.name ?? "the user"} · Age: ${p.age ?? "?"} · Sex: ${p.sex ?? "?"} · Blood group: ${p.blood_group ?? "?"}
- Region: ${p.region ?? "?"}
- Allergies: ${(p.allergies ?? []).join(", ") || "none"}
- Conditions: ${(p.conditions ?? []).join(", ") || "none"}
- Past history: ${(p.history ?? []).join(", ") || "none"}
- Family: mother — ${p.family?.mother ?? "?"}; father — ${p.family?.father ?? "?"}
- Lifestyle: sleep ${p.lifestyle?.sleep ?? "?"}, water ${p.lifestyle?.water ?? "?"}, stress ${p.lifestyle?.stress ?? "?"}
- BMI: ${p.bmi ?? "unknown"}
${p.medications?.length ? `- Current meds: ${p.medications.join(", ")}` : ""}

Regional signal to remember: dengue up 150% in Bandra, Mumbai. Air quality often unhealthy.`;
}

export const omniChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => ChatInput.parse(v))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const { data: profile } = await context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle();

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const { text } = await generateText({
      model,
      system: buildSystemPrompt(profile),
      messages: data.messages.map((m) => ({ role: m.role, content: m.content })),
    });

    return { reply: text };
  });
