import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, Search, Moon, Sun, Siren, Menu, X, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SosModal } from "@/components/SosModal";
import { toast } from "sonner";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/ask-omni", label: "Ask Omni" },
  { to: "/digital-twin", label: "Digital Twin" },
  { to: "/doctors", label: "Find Doctors" },
  { to: "/care", label: "Care Services" },
  { to: "/appointments", label: "Appointments" },
  { to: "/pharmacy", label: "Pharmacy" },
  { to: "/reports", label: "Reports" },
  { to: "/insights", label: "Insights" },
  { to: "/notifications", label: "Notifications" },
  { to: "/consent", label: "Consent" },
] as const;

export function TopNav() {
  const [dark, setDark] = useState(false);
  const [sos, setSos] = useState(false);
  const [mobile, setMobile] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();


  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-5 py-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-semibold text-primary tracking-tight">
              Omni<span className="editorial-italic">Care</span>
            </span>
            <span className="ai-pill">AI</span>
          </Link>

          <nav className="ml-4 hidden lg:flex items-center gap-1 overflow-x-auto">
            {NAV.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-3 py-1.5 text-[15px] rounded-full transition whitespace-nowrap ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors, meds, records…"
                className="pl-9 w-56 rounded-full bg-secondary/60 border-transparent focus-visible:ring-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") toast("Searching across your health graph…");
                }}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative min-h-11 min-w-11"
              onClick={() => navigate({ to: "/notifications" })}
              aria-label="Notifications, 7 unread"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-coral" aria-hidden="true" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setDark((v) => !v)}
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <button
              onClick={() => setSos(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-coral px-3.5 py-1.5 text-sm text-coral-foreground shadow-soft hover:brightness-110 transition"
            >
              <Siren className="h-4 w-4" /> SOS
            </button>
            <div className="ml-1 h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">
              PP
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={signOut}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setMobile((v) => !v)}
              aria-label="Menu"
            >
              {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobile && (
          <div className="lg:hidden border-t border-border bg-background">
            <div className="px-4 py-3 grid grid-cols-2 gap-2">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobile(false)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    pathname === n.to
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMobile(false);
                  setSos(true);
                }}
                className="col-span-2 mt-1 rounded-lg bg-coral px-3 py-2 text-sm text-coral-foreground"
              >
                SOS — Emergency
              </button>
            </div>
          </div>
        )}
      </header>

      <SosModal open={sos} onOpenChange={setSos} />

    </>
  );
}
