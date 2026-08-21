import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bell, Sparkles, CalendarClock, AlertTriangle, Check, Pill } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: Notifications,
  ssr: false,
  head: () => ({
    meta: [
      { title: "Notifications — OmniCare" },
      {
        name: "description",
        content:
          "Alerts, Omni recommendations and appointment reminders for your health identity, grouped and filterable.",
      },
      { property: "og:title", content: "Notifications — OmniCare" },
      {
        property: "og:description",
        content: "Alerts, Omni recommendations and appointment reminders in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Kind = "alert" | "omni" | "appointment";

type Note = {
  id: string;
  kind: Kind;
  title: string;
  body: string;
  when: string;
  action: string;
  to?: string;
  urgent?: boolean;
};

const SEED: Note[] = [
  {
    id: "n1",
    kind: "alert",
    title: "Dengue advisory near Bandra West",
    body: "12 confirmed cases within a 2 km radius — cases up 150% this fortnight.",
    when: "1h ago",
    action: "See regional intelligence",
    to: "/insights",
    urgent: true,
  },
  {
    id: "n2",
    kind: "alert",
    title: "Air quality is unhealthy today",
    body: "AQI 168 in Mumbai. Avoid outdoor runs; keep your inhaler-free routine indoors.",
    when: "3h ago",
    action: "View air quality",
    to: "/insights",
  },
  {
    id: "n3",
    kind: "alert",
    title: "Hydration below your baseline",
    body: "1.2 L/day against a 2.5 L target for four consecutive days — kidney stone risk rising.",
    when: "Yesterday",
    action: "Open Digital Twin",
    to: "/digital-twin",
  },
  {
    id: "n4",
    kind: "omni",
    title: "Omni finished analysing your symptoms",
    body: "Right-upper-quadrant pain pattern points to biliary colic — medium risk, 6.4/10.",
    when: "2m ago",
    action: "Read the deliberation",
    to: "/ask-omni",
    urgent: true,
  },
  {
    id: "n5",
    kind: "omni",
    title: "Ultrasound abdomen recommended",
    body: "Fasting scan within 48 hours would confirm or rule out gallstones.",
    when: "2m ago",
    action: "Find a doctor",
    to: "/doctors",
  },
  {
    id: "n6",
    kind: "omni",
    title: "Refill suggestion — Shelcal 500",
    body: "Your current strip runs out in 4 days at one tablet daily.",
    when: "Yesterday",
    action: "Add to cart",
    to: "/pharmacy",
  },
  {
    id: "n7",
    kind: "omni",
    title: "Sleep debt is compounding",
    body: "6.4 h average across 7 nights. Omni suggests a 22:45 wind-down alarm.",
    when: "2d ago",
    action: "Open insights",
    to: "/insights",
  },
  {
    id: "n8",
    kind: "appointment",
    title: "Dr. Meera Rao — Gastroenterology",
    body: "Today, 5:30 PM · Lilavati Hospital, Bandra West. Carry your 2021 dengue record.",
    when: "in 4h",
    action: "Book a ride",
    to: "/appointments",
    urgent: true,
  },
  {
    id: "n9",
    kind: "appointment",
    title: "Home sample collection",
    body: "Tomorrow, 7:15 AM · Lipid profile and LFT. Fast for 10 hours beforehand.",
    when: "tomorrow",
    action: "View appointment",
    to: "/appointments",
  },
  {
    id: "n10",
    kind: "appointment",
    title: "Physiotherapy follow-up",
    body: "Sat, 11:00 AM · Rahul Sen, home visit. ₹600 / hour.",
    when: "Sat",
    action: "View appointment",
    to: "/appointments",
  },
];

const GROUPS: { kind: Kind; label: string; icon: typeof Bell; blurb: string }[] = [
  { kind: "alert", label: "Alerts", icon: AlertTriangle, blurb: "Environment and vitals worth attention" },
  { kind: "omni", label: "Omni recommendations", icon: Sparkles, blurb: "Advice from your assistant" },
  { kind: "appointment", label: "Appointment reminders", icon: CalendarClock, blurb: "What's on the calendar" },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "alert", label: "Alerts" },
  { key: "omni", label: "Omni" },
  { key: "appointment", label: "Appointments" },
  { key: "unread", label: "Unread" },
] as const;

function Notifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [read, setRead] = useState<string[]>(["n3", "n7", "n10"]);

  const visible = useMemo(
    () =>
      SEED.filter((n) => {
        if (filter === "all") return true;
        if (filter === "unread") return !read.includes(n.id);
        return n.kind === filter;
      }),
    [filter, read],
  );

  const unread = SEED.filter((n) => !read.includes(n.id)).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-widest">Inbox</p>
        <h1 className="text-4xl mt-1">
          Notification <span className="editorial-italic text-primary">centre</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          {unread} unread · alerts, Omni recommendations and reminders, grouped so nothing important
          hides.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Filter notifications" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-4 py-1.5 text-sm border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  active
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "border-border hover:bg-secondary"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => {
            setRead(SEED.map((n) => n.id));
            toast.success("All notifications marked as read");
          }}
          className="ml-auto text-sm text-primary underline underline-offset-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Mark all as read
        </button>
      </div>

      {GROUPS.map((g) => {
        const items = visible.filter((n) => n.kind === g.kind);
        if (items.length === 0) return null;
        const Icon = g.icon;
        return (
          <section key={g.kind} aria-labelledby={`group-${g.kind}`}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 id={`group-${g.kind}`} className="text-2xl">
                {g.label}
              </h2>
              <span className="text-sm text-muted-foreground editorial-italic">{g.blurb}</span>
            </div>
            <ul className="space-y-3">
              {items.map((n) => {
                const isRead = read.includes(n.id);
                return (
                  <li
                    key={n.id}
                    className={`card-lux p-4 flex gap-3 items-start transition ${
                      isRead ? "opacity-70" : ""
                    }`}
                  >
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${
                        isRead ? "bg-border" : n.urgent ? "bg-coral" : "bg-primary"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{n.title}</p>
                        {n.urgent && !isRead && (
                          <span className="rounded-full bg-rose-soft/60 px-2 py-0.5 text-xs">
                            Needs attention
                          </span>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground">{n.when}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setRead((r) => (r.includes(n.id) ? r : [...r, n.id]));
                            if (n.to) navigate({ to: n.to });
                          }}
                          className="rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          {n.action}
                        </button>
                        <button
                          onClick={() =>
                            setRead((r) =>
                              r.includes(n.id) ? r.filter((x) => x !== n.id) : [...r, n.id],
                            )
                          }
                          className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background inline-flex items-center gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          {isRead ? "Mark unread" : "Mark read"}
                        </button>
                        {n.kind === "omni" && (
                          <button
                            onClick={() => toast("Snoozed for 24 hours")}
                            className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background inline-flex items-center gap-1.5"
                          >
                            <Pill className="h-3.5 w-3.5" aria-hidden="true" /> Snooze
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {visible.length === 0 && (
        <p className="text-muted-foreground italic">Nothing in this filter — try “All”.</p>
      )}
    </div>
  );
}
