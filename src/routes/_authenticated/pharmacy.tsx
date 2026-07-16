import { createFileRoute } from "@tanstack/react-router";
import { medicines } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { Search, ShoppingCart, X, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pharmacy")({
  component: Pharmacy,
  head: () => ({ meta: [{ title: "Pharmacy — OmniCare" }] }),
});

function Pharmacy() {
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);

  const list = useMemo(
    () => medicines.filter((m) => (m.name + m.generic).toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  const rec = medicines.filter((m) => m.tag === "Recommended");
  const total = Object.entries(cart).reduce((s, [id, n]) => {
    const m = medicines.find((x) => x.id === id);
    return s + (m ? m.price * n : 0);
  }, 0);

  function add(id: string, delta = 1) {
    setCart((c) => {
      const next = { ...c, [id]: Math.max(0, (c[id] || 0) + delta) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Pharmacy</p>
          <h1 className="text-4xl mt-1">
            Order <span className="editorial-italic text-primary">medicines</span>
          </h1>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 flex items-center gap-2 text-sm"
        >
          <ShoppingCart className="h-4 w-4" /> Cart · {Object.values(cart).reduce((a, b) => a + b, 0)}
        </button>
      </div>

      {rec.length > 0 && (
        <section>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Recommended for you
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {rec.map((m) => (
              <div key={m.id} className="card-lux p-4 flex items-center gap-3 border-coral/30 border">
                <div className="h-10 w-10 rounded-full bg-coral/20 grid place-items-center text-coral">℞</div>
                <div className="flex-1">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground editorial-italic">{m.generic}</p>
                </div>
                <button
                  onClick={() => {
                    add(m.id);
                    toast(`${m.name} added to cart`);
                  }}
                  className="text-sm rounded-full bg-coral text-coral-foreground px-3 py-1.5"
                >
                  Add · ₹{m.price}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="card-lux p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search medicines by name or generic…"
            className="w-full rounded-full bg-secondary/60 pl-9 pr-4 py-2.5 focus:outline-none"
          />
        </div>
      </div>

      <div className="card-lux overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left">
            <tr>
              <th className="p-3 font-normal editorial-italic">Medicine</th>
              <th className="p-3 font-normal editorial-italic">Generic</th>
              <th className="p-3 font-normal editorial-italic">Price</th>
              <th className="p-3 font-normal editorial-italic">Delivery</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} className="border-t border-border">
                <td className="p-3">
                  <p className="font-medium">{m.name}</p>
                  {m.rx && <span className="text-[10px] rounded-full bg-rose-soft/60 px-2 py-0.5">Rx</span>}
                </td>
                <td className="p-3 text-muted-foreground">{m.generic}</td>
                <td className="p-3">₹{m.price}</td>
                <td className="p-3 text-muted-foreground editorial-italic">{m.eta}</td>
                <td className="p-3 text-right">
                  {cart[m.id] ? (
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => add(m.id, -1)} className="h-7 w-7 rounded-full bg-secondary grid place-items-center"><Minus className="h-3 w-3" /></button>
                      <span>{cart[m.id]}</span>
                      <button onClick={() => add(m.id, 1)} className="h-7 w-7 rounded-full bg-primary text-primary-foreground grid place-items-center"><Plus className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => add(m.id)}
                      className="rounded-full bg-primary text-primary-foreground px-4 py-1.5"
                    >
                      Add
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md h-full bg-card p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl editorial-italic">Your cart</h3>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 space-y-3">
              {Object.keys(cart).length === 0 && (
                <p className="text-muted-foreground italic">Cart is empty. Try adding Pan-D — Omni recommends it.</p>
              )}
              {Object.entries(cart).map(([id, n]) => {
                const m = medicines.find((x) => x.id === id)!;
                return (
                  <div key={id} className="flex items-center justify-between border-b border-border pb-2">
                    <div>
                      <p>{m.name}</p>
                      <p className="text-xs text-muted-foreground">₹{m.price} × {n}</p>
                    </div>
                    <p>₹{m.price * n}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 border-t border-border pt-4 flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-2xl text-primary editorial-italic">₹{total}</span>
            </div>
            <button
              disabled={total === 0}
              onClick={() => {
                toast.success("Order placed · arriving in 45 min");
                setCart({});
                setOpen(false);
              }}
              className="mt-4 w-full rounded-full bg-coral text-coral-foreground py-3 disabled:opacity-40"
            >
              Place order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
