import { createFileRoute } from "@tanstack/react-router";
import { careProviders } from "@/lib/mock-data";
import { toast } from "sonner";
import { Home } from "lucide-react";

export const Route = createFileRoute("/care")({
  component: Care,
  head: () => ({ meta: [{ title: "Care Services — OmniCare" }] }),
});

function Care() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Care at home</p>
          <h1 className="text-4xl mt-1">
            Care <span className="editorial-italic text-primary">services</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Nurses, ASHA workers, physios, lab techs and dieticians — verified, on demand.
          </p>
        </div>
        <button
          onClick={() => toast.success("Home sample collection scheduled for tomorrow, 8 AM")}
          className="rounded-full bg-coral text-coral-foreground px-5 py-2.5 flex items-center gap-2 text-sm"
        >
          <Home className="h-4 w-4" /> Book home sample collection
        </button>
      </div>

      {Object.entries(careProviders).map(([group, items]) => (
        <section key={group}>
          <h3 className="text-2xl mb-3 editorial-italic">{group}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p: any) => (
              <div key={p.name} className="card-lux p-5">
                <div className="flex gap-3">
                  <div className="h-11 w-11 rounded-full bg-sage/50 grid place-items-center">
                    {p.name.split(" ")[0][0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.exp} experience</p>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-2xl text-primary">₹{p.rate}<span className="text-sm text-muted-foreground">/hr</span></span>
                  <span className="text-xs text-muted-foreground editorial-italic">{p.avail}</span>
                </div>
                <button
                  onClick={() => toast.success(`Booked ${p.name}`)}
                  className="mt-4 w-full rounded-full bg-primary text-primary-foreground py-2 text-sm"
                >
                  Book
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
