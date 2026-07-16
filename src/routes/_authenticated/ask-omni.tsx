import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { omniChat } from "@/lib/omni.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/ask-omni")({
  component: AskOmni,
  ssr: false,
  head: () => ({ meta: [{ title: "Ask Omni — OmniCare" }] }),
});

type Msg = { role: "user" | "assistant"; content: string };

const AGENTS = [
  { name: "Triage", role: "acuity & escalation", tone: "sage" },
  { name: "Population", role: "regional patterns", tone: "amber" },
  { name: "Biometrics", role: "vitals & wearable", tone: "sage" },
  { name: "Records", role: "history & family", tone: "amber" },
  { name: "Nutrition", role: "diet & trigger", tone: "amber" },
  { name: "Skeptic", role: "counter-position", tone: "rose" },
];

function AskOmni() {
  const chat = useServerFn(omniChat);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi — I'm Omni. Tell me what you're feeling, or ask about a report, medicine, or symptom. I know your health identity, so I can be specific." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("profiles").select("*").maybeSingle().then(({ data }) => setProfile(data));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setBusy(true);
    try {
      const { reply } = await chat({ data: { messages: next } });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e: any) {
      toast.error(e.message ?? "Omni is unavailable");
      setMessages((m) => [...m, { role: "assistant", content: "I couldn't reach my reasoning core. Try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="card-lux flex flex-col h-[78vh]">
        <div className="border-b border-border px-5 py-4 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="editorial-italic text-lg">Omni</p>
            <p className="text-xs text-muted-foreground">Advises. You decide.</p>
          </div>
          <span className="ml-auto ai-pill">Gemini · 6-agent</span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
          {messages.map((m, i) => (
            <Bubble key={i} m={m} />
          ))}
          {busy && (
            <div className="text-sm text-muted-foreground editorial-italic flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Omni is deliberating with 6 specialist agents…
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask Omni anything about your health…"
              className="flex-1 rounded-full bg-secondary/60 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button onClick={() => send()} disabled={busy} className="rounded-full bg-primary text-primary-foreground px-5 flex items-center gap-2 disabled:opacity-50">
              <Send className="h-4 w-4" /> Send
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {["I've had a dull pain under my right ribs since Sunday, worse after fatty food", "Should I be worried about dengue this season?", "Interpret my latest report"].map((q) => (
              <button key={q} onClick={() => send(q)} className="text-xs rounded-full border border-border px-3 py-1.5 hover:bg-secondary">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card-lux p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Deliberation</p>
          <h4 className="text-xl mt-1">Six agents, one <span className="editorial-italic">verdict</span></h4>
          <div className="mt-4 space-y-2">
            {AGENTS.map((a) => (
              <div key={a.name} className="rounded-xl border border-border px-3 py-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${a.tone === "sage" ? "bg-sage" : a.tone === "amber" ? "bg-amber-soft" : "bg-rose-soft"}`} />
                <span className="font-medium">{a.name}</span>
                <span className="text-xs text-muted-foreground editorial-italic ml-auto">{a.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-lux p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Your identity</p>
          {profile ? (
            <ul className="mt-2 space-y-1.5 text-sm">
              <li>{profile.name}, {profile.age}{String(profile.sex)[0]} · {profile.blood_group} · {profile.region}</li>
              <li>Allergy: <em>{(profile.allergies ?? []).join(", ") || "none"}</em></li>
              <li>Family: mother — {profile.family?.mother}; father — {profile.family?.father}</li>
              <li>Sleep {profile.lifestyle?.sleep} · Water {profile.lifestyle?.water} · Stress {profile.lifestyle?.stress}</li>
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic mt-2">Loading…</p>
          )}
        </div>
      </aside>
    </div>
  );
}

function Bubble({ m }: { m: Msg }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-3 whitespace-pre-wrap">
          {m.content}
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-[85%]">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
        <Sparkles className="h-3 w-3" /> Omni
      </div>
      <div className="rounded-2xl rounded-bl-md bg-secondary px-4 py-3 whitespace-pre-wrap text-[15px] leading-relaxed">
        {m.content}
      </div>
    </div>
  );
}
