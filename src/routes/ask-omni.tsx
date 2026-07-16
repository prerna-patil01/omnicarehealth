import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/ask-omni")({
  component: AskOmni,
  head: () => ({ meta: [{ title: "Ask Omni — OmniCare" }] }),
});

type Msg =
  | { role: "user"; text: string }
  | { role: "omni-question"; text: string; why: string }
  | { role: "omni-thinking" }
  | { role: "omni-verdict"; verdict: any };

const SEED: Msg[] = [
  {
    role: "user",
    text: "I've had a dull pain under my right ribs since Sunday. It got worse after dinner.",
  },
  {
    role: "omni-question",
    text: "Does the pain travel anywhere — up to your right shoulder blade, or across your upper back?",
    why: "Referred pain to the right scapula is a signature of biliary origin. It changes my differential from muscular to hepatobiliary.",
  },
];

const AGENTS = [
  { name: "Triage", role: "acuity & escalation", stance: "Not an ER case yet. Watch fever & jaundice.", conf: 0.86, tone: "sage" },
  { name: "Population", role: "regional patterns", stance: "Dengue is up 150% in Bandra. Fever changes everything.", conf: 0.74, tone: "amber" },
  { name: "Biometrics", role: "vitals & wearable", stance: "HR 72, HRV up, SpO₂ 98. No systemic inflammation signal.", conf: 0.81, tone: "sage" },
  { name: "Records", role: "history & family", stance: "Mother has gallstones. 3x baseline risk for Prerna at 21.", conf: 0.9, tone: "amber" },
  { name: "Nutrition", role: "diet & trigger", stance: "Fatty meal Sunday, low hydration. Classic biliary trigger.", conf: 0.79, tone: "amber" },
  { name: "Skeptic", role: "counter-position", stance: "Could still be gastritis. Omeprazole trial would confuse the scan — don't start it.", conf: 0.62, tone: "rose" },
];

function AskOmni() {
  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(1); // how many follow-ups asked
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setMessages((m) => [...m, { role: "omni-thinking" }]);

    setTimeout(() => {
      setMessages((m) => {
        const clean = m.filter((x) => x.role !== "omni-thinking");
        if (step === 1) {
          setStep(2);
          return [
            ...clean,
            {
              role: "omni-question",
              text: "One more: any fever, chills, or yellowing of your eyes since Sunday?",
              why: "Fever + jaundice would flip this from biliary colic to acute cholecystitis — that's a same-day ER, not a scan tomorrow.",
            },
          ];
        }
        if (step === 2) {
          setStep(3);
          return [...clean, { role: "omni-verdict", verdict: buildVerdict() }];
        }
        // abstain
        return [
          ...clean,
          {
            role: "omni-question",
            text: "I don't know yet — take your temperature in 6 hours and log it. If it crosses 100.4°F, tell me immediately.",
            why: "Without a temperature reading, I can't rule out acute cholecystitis. Guessing here would be irresponsible.",
          },
        ];
      });
    }, 1100);
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
          <span className="ml-auto ai-pill">AI · 6-agent</span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
          {messages.map((m, i) => (
            <MessageBubble key={i} m={m} />
          ))}
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={
                step === 1
                  ? "Answer Omni — does the pain radiate?"
                  : step === 2
                  ? "Tell Omni about fever, chills, or yellowing…"
                  : "Ask Omni anything about your health…"
              }
              className="flex-1 rounded-full bg-secondary/60 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={send}
              className="rounded-full bg-primary text-primary-foreground px-5 flex items-center gap-2"
            >
              <Send className="h-4 w-4" /> Send
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Yes, up to my right shoulder", "No fever, no yellowing", "I'm scared"].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setInput(q);
                  setTimeout(send, 30);
                }}
                className="text-xs rounded-full border border-border px-3 py-1.5 hover:bg-secondary"
              >
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
          <div className="mt-4 space-y-3">
            {AGENTS.map((a) => (
              <AgentRow key={a.name} a={a} />
            ))}
          </div>
        </div>

        <div className="card-lux p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Context</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li>Prerna, 21F, B+ · Mumbai</li>
            <li>Allergy: <em>Penicillin</em></li>
            <li>Family Dx: gallstones (mother)</li>
            <li>Water 1.2 L/day · Sleep 6.4 h</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function MessageBubble({ m }: { m: Msg }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-3">
          {m.text}
        </div>
      </div>
    );
  }
  if (m.role === "omni-thinking") {
    return (
      <div className="text-sm text-muted-foreground editorial-italic flex items-center gap-2">
        <span className="inline-flex gap-1">
          <Dot delay={0} /> <Dot delay={150} /> <Dot delay={300} />
        </span>
        Omni is deliberating with 6 specialist agents…
      </div>
    );
  }
  if (m.role === "omni-question") {
    return (
      <div className="max-w-[85%]">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" /> Omni
        </div>
        <div className="rounded-2xl rounded-bl-md bg-secondary px-4 py-3">
          <p className="text-lg">{m.text}</p>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-muted-foreground editorial-italic flex items-center gap-1">
              <ChevronDown className="h-3.5 w-3.5" /> Why I'm asking
            </summary>
            <p className="mt-1.5 text-muted-foreground">{m.why}</p>
          </details>
        </div>
      </div>
    );
  }
  // verdict
  const v = m.verdict;
  return (
    <div className="max-w-[92%] space-y-3">
      <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
        <Sparkles className="h-3 w-3" /> Omni · verdict
      </div>
      <div className="hero-panel p-5">
        <p className="text-xs opacity-80 uppercase tracking-widest">Most likely</p>
        <h3 className="text-2xl mt-1">
          <span className="editorial-italic text-coral">Biliary colic</span> — medium risk
        </h3>
        <p className="mt-2 opacity-90 text-sm">
          Confidence 78%. Six agents agree it's hepatobiliary; Skeptic asks you not to start any
          acid-suppressant yet — it would confuse the ultrasound.
        </p>
      </div>
      <div className="card-lux p-4">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Staged plan</p>
        <ol className="mt-2 space-y-2 text-sm">
          {v.plan.map((s: string, i: number) => (
            <li key={i} className="flex gap-3">
              <span className="rounded-full bg-primary text-primary-foreground h-6 w-6 grid place-items-center text-xs shrink-0">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <button
          onClick={() => toast.success("Plan confirmed — Dr. Meera Rao slot held for 5:30 PM")}
          className="mt-4 w-full rounded-full bg-coral text-coral-foreground py-3"
        >
          Confirm plan
        </button>
      </div>
    </div>
  );
}

function AgentRow({ a }: { a: any }) {
  const tone =
    a.tone === "sage" ? "bg-sage/40" : a.tone === "amber" ? "bg-amber-soft/50" : "bg-rose-soft/50";
  return (
    <details className="rounded-xl border border-border overflow-hidden">
      <summary className="cursor-pointer px-3 py-2.5 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${tone}`} />
        <span className="font-medium">{a.name}</span>
        <span className="text-xs text-muted-foreground editorial-italic">{a.role}</span>
        <span className="ml-auto text-xs">{Math.round(a.conf * 100)}%</span>
      </summary>
      <div className="px-4 pb-3 text-sm text-muted-foreground">{a.stance}</div>
    </details>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 inline-block animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

function buildVerdict() {
  return {
    plan: [
      "Ultrasound abdomen today at Lilavati — Omni holds a 6 PM slot",
      "Low-fat, high-water diet for 72 hours (Omni built the menu)",
      "Skip acid-suppressants — they will muddy the scan",
      "Consult Dr. Meera Rao (Gastro) with the scan in hand",
      "If fever > 100.4°F or yellow eyes → call SOS immediately",
    ],
  };
}
