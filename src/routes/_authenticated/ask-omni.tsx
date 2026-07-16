import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { omniChat, executeOmniAction } from "@/lib/omni.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/ask-omni")({
  component: AskOmni,
  ssr: false,
  head: () => ({ meta: [{ title: "Ask Omni — OmniCare" }] }),
});

type Msg = { role: "user" | "assistant"; content: string; agents?: { name: string; note: string }[]; action?: any };

const AGENT_META: Record<string, { tone: string; role: string }> = {
  Triage: { tone: "sage", role: "acuity & escalation" },
  Population: { tone: "amber", role: "regional patterns" },
  Biometrics: { tone: "sage", role: "vitals & wearable" },
  Records: { tone: "amber", role: "history & family" },
  Nutrition: { tone: "amber", role: "diet & trigger" },
  Skeptic: { tone: "rose", role: "counter-position" },
};

function AskOmni() {
  const chat = useServerFn(omniChat);
  const runAction = useServerFn(executeOmniAction);
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
      const historyForModel = next.map(({ role, content }) => ({ role, content }));
      const { reply, agents, action } = await chat({ data: { messages: historyForModel } });
      setMessages((m) => [...m, { role: "assistant", content: reply, agents, action }]);
    } catch (e: any) {
      toast.error(e.message ?? "Omni is unavailable");
      setMessages((m) => [...m, { role: "assistant", content: "I couldn't reach my reasoning core. Try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  }

  async function confirmAction(idx: number, action: any) {
    try {
      const res = await runAction({ data: { kind: action.kind, payload: action.payload } });
      if (res.ok) toast.success(res.message); else toast.error(res.message);
      setMessages((m) => m.map((msg, i) => (i === idx ? { ...msg, action: { ...msg.action, done: true } } : msg)));
    } catch (e: any) {
      toast.error(e.message ?? "Action failed");
    }
  }

  const lastAgents = [...messages].reverse().find((m) => m.role === "assistant" && m.agents?.length)?.agents;

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
            <Bubble key={i} m={m} onConfirm={() => m.action && confirmAction(i, m.action)} />
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
            {(lastAgents ?? Object.keys(AGENT_META).map((n) => ({ name: n, note: AGENT_META[n].role }))).map((a) => {
              const meta = AGENT_META[a.name] ?? { tone: "sage", role: "" };
              return (
                <div key={a.name} className="rounded-xl border border-border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${meta.tone === "sage" ? "bg-sage" : meta.tone === "amber" ? "bg-amber-soft" : "bg-rose-soft"}`} />
                    <span className="font-medium text-sm">{a.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground editorial-italic mt-1">{a.note}</p>
                </div>
              );
            })}
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

function Bubble({ m, onConfirm }: { m: Msg; onConfirm: () => void }) {
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
      {m.action && (
        <div className="mt-3 rounded-2xl border border-coral/40 bg-coral/5 px-4 py-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Suggested action</p>
          <p className="editorial-italic mt-1">
            {m.action.kind === "book_appointment" && `Book ${m.action.payload.doctor ?? m.action.payload.specialty} · ${m.action.payload.date ?? "soon"}`}
            {m.action.kind === "add_to_cart" && `Add ${m.action.payload.name} to your cart`}
            {m.action.kind === "set_reminder" && `Remind: ${m.action.payload.title} · ${m.action.payload.when}`}
          </p>
          {m.action.done ? (
            <p className="mt-2 text-sm text-primary flex items-center gap-1.5"><Check className="h-4 w-4" /> Confirmed</p>
          ) : (
            <button onClick={onConfirm} className="mt-3 rounded-full bg-coral text-coral-foreground px-4 py-1.5 text-sm">Confirm</button>
          )}
        </div>
      )}
    </div>
  );
}
