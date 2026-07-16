import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Sign in — OmniCare" }] }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/onboarding" },
        });
        if (error) throw error;
        toast.success("Account created. Let's set up your profile.");
        navigate({ to: "/onboarding" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { data } = await supabase.from("profiles").select("onboarded").maybeSingle();
        navigate({ to: (data as any)?.onboarded ? "/" : "/onboarding" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hero-panel hidden md:flex flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-coral/30 blur-3xl" />
        <div>
          <p className="text-xs uppercase tracking-widest opacity-80 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> OmniCare · AI
          </p>
          <h1 className="mt-6 text-5xl leading-tight">
            One <span className="editorial-italic text-coral">health identity</span>,
            <br /> one intelligent care team.
          </h1>
          <p className="mt-4 opacity-85 max-w-md">
            Omni listens, reasons, and advises across your doctors, records, pharmacy and daily
            care. You always decide.
          </p>
        </div>
        <p className="opacity-70 text-sm italic">"Omni advises. You decide. Always."</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl">
            {mode === "signin" ? "Welcome back" : "Create your"}{" "}
            <span className="editorial-italic text-primary">
              {mode === "signin" ? "" : "account"}
            </span>
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {mode === "signin"
              ? "Sign in to continue to your health identity."
              : "Your demo account is seeded as Prerna Patil, 21, Mumbai."}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="mt-6 w-full rounded-full border border-border bg-card py-2.5 text-sm hover:bg-secondary/60 transition disabled:opacity-50"
          >
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl bg-secondary/60 px-4 py-2.5 focus:outline-none"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6)"
              className="w-full rounded-xl bg-secondary/60 px-4 py-2.5 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-primary text-primary-foreground py-2.5 disabled:opacity-50"
            >
              {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-5 text-sm text-primary editorial-italic w-full text-center"
          >
            {mode === "signin"
              ? "New to OmniCare? Create an account →"
              : "Already have an account? Sign in →"}
          </button>
        </div>
      </div>
    </div>
  );
}
