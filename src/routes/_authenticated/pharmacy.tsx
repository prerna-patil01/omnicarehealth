import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingCart, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/pharmacy")({
  component: Pharmacy,
  ssr: false,
  head: () => ({ meta: [{ title: "Pharmacy — OmniCare" }] }),
});

type Med = { id: string; name: string; generic: string; price: number; rx: boolean; eta: string; tag: string | null };

function Pharmacy() {
  const [q, setQ] = useState("");
  const [medicines, setMedicines] = useState<Med[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (u.user) setUserId(u.user.id);
      const { data: meds } = await supabase.from("medicines").select("*");
      setMedicines((meds as Med[]) ?? []);
      const { data: ci } = await supabase.from("cart_items").select("*");
      const map: Record<string, number> = {};
      (ci ?? []).forEach((c: any) => { map[c.medicine_id] = c.qty; });
      setCart(map);
    })();
  }, []);

  const list = useMemo(
    () => medicines.filter((m) => (m.name + m.generic).toLowerCase().includes(q.toLowerCase())),
    [q, medicines],
  );

  const rec = medicines.filter((m) => m.tag === "Recommended");
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  async function setQty(id: string, delta: number) {
    if (!userId) return;
    const next = Math.max(0, (cart[id] || 0) + delta);
    const nextCart = { ...cart, [id]: next };
    if (next === 0) delete nextCart[id];
    setCart(nextCart);
    if (next === 0) {
      await supabase.from("cart_items").delete().eq("user_id", userId).eq("medicine_id", id);
    } else {
      await supabase.from("cart_items").upsert({ user_id: userId, medicine_id: id, qty: next }, { onConflict: "user_id,medicine_id" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Pharmacy</p>
          <h1 className="text-4xl mt-1">Order <span className="editorial-italic text-primary">medicines</span></h1>
        </div>
        <Link to="/cart" className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 flex items-center gap-2 text-sm">
          <ShoppingCart className="h-4 w-4" /> Cart · {totalItems}
        </Link>
      </div>

      {rec.length > 0 && (
        <section>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Recommended for you</p>
          <div className="grid md:grid-cols-2 gap-3">
            {rec.map((m) => (
              <div key={m.id} className="card-lux p-4 flex items-center gap-3 border-coral/30 border">
                <div className="h-10 w-10 rounded-full bg-coral/20 grid place-items-center text-coral">℞</div>
                <div className="flex-1">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground editorial-italic">{m.generic}</p>
                </div>
                <button onClick={() => { setQty(m.id, 1); toast(`${m.name} added to cart`); }} className="text-sm rounded-full bg-coral text-coral-foreground px-3 py-1.5">
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
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search medicines by name or generic…" className="w-full rounded-full bg-secondary/60 pl-9 pr-4 py-2.5 focus:outline-none" />
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
                      <button onClick={() => setQty(m.id, -1)} className="h-7 w-7 rounded-full bg-secondary grid place-items-center"><Minus className="h-3 w-3" /></button>
                      <span>{cart[m.id]}</span>
                      <button onClick={() => setQty(m.id, 1)} className="h-7 w-7 rounded-full bg-primary text-primary-foreground grid place-items-center"><Plus className="h-3 w-3" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setQty(m.id, 1)} className="rounded-full bg-primary text-primary-foreground px-4 py-1.5">Add</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
