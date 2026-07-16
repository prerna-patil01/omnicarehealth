import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Truck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/cart")({
  component: Cart,
  ssr: false,
  head: () => ({ meta: [{ title: "Cart — OmniCare" }] }),
});

type Row = { id: string; medicine_id: string; qty: number; name: string; price: number; generic: string; eta: string };

function Cart() {
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [addr, setAddr] = useState("Flat 402, Sea Palm, Bandra West, Mumbai 400050");
  const [step, setStep] = useState<"cart" | "pay" | "done">("cart");
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  async function refresh() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    setUserId(u.user.id);
    const [{ data: ci }, { data: meds }] = await Promise.all([
      supabase.from("cart_items").select("*"),
      supabase.from("medicines").select("*"),
    ]);
    const medMap = new Map((meds ?? []).map((m: any) => [m.id, m]));
    setRows((ci ?? []).map((c: any) => {
      const m = medMap.get(c.medicine_id);
      return { id: c.id, medicine_id: c.medicine_id, qty: c.qty, name: m?.name ?? "Item", price: m?.price ?? 0, generic: m?.generic ?? "", eta: m?.eta ?? "" };
    }));
  }

  useEffect(() => { refresh(); }, []);

  const subtotal = rows.reduce((s, r) => s + r.price * r.qty, 0);
  const delivery = subtotal > 0 && subtotal < 500 ? 40 : 0;
  const total = subtotal + delivery;

  async function checkout() {
    if (!userId || rows.length === 0) return;
    setBusy(true);
    // Simulated payment
    await new Promise((r) => setTimeout(r, 1200));
    const { data: order } = await supabase.from("orders").insert({ user_id: userId, total, status: "Placed" }).select().single();
    if (!order) { toast.error("Payment failed"); setBusy(false); return; }
    await supabase.from("order_items").insert(rows.map((r) => ({
      order_id: order.id, user_id: userId, medicine_id: r.medicine_id, name: r.name, price: r.price, qty: r.qty,
    })));
    await supabase.from("cart_items").delete().eq("user_id", userId);
    setBusy(false);
    setStep("done");
    toast.success("Order placed · arriving in 45 min");
  }

  if (step === "done") {
    return (
      <div className="max-w-lg mx-auto card-lux p-8 text-center mt-10">
        <div className="h-12 w-12 rounded-full bg-sage/60 grid place-items-center mx-auto"><Truck className="h-6 w-6 text-primary" /></div>
        <h2 className="text-3xl mt-4">Order <span className="editorial-italic text-primary">placed</span></h2>
        <p className="text-muted-foreground mt-2">₹{total} paid. Estimated delivery in 45 minutes. Omni will notify you when your rider arrives.</p>
        <button onClick={() => nav({ to: "/pharmacy" })} className="mt-6 rounded-full bg-primary text-primary-foreground px-6 py-2.5">Back to pharmacy</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-widest">Cart</p>
        <h1 className="text-4xl mt-1">Your <span className="editorial-italic text-primary">order</span></h1>
      </div>

      {rows.length === 0 && step === "cart" && <p className="text-muted-foreground italic">Cart is empty.</p>}

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="card-lux p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground editorial-italic">{r.generic} · {r.eta}</p>
              </div>
              <p className="text-muted-foreground">× {r.qty}</p>
              <p className="text-primary text-lg w-20 text-right">₹{r.price * r.qty}</p>
            </div>
          ))}

          {step === "pay" && (
            <div className="card-lux p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Deliver to</p>
              <textarea className="mt-2 w-full rounded-xl bg-secondary/60 p-3" value={addr} onChange={(e) => setAddr(e.target.value)} rows={2} />
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-4">Payment</p>
              <div className="mt-2 space-y-2">
                {["UPI · you@okhdfc", "Card · **** 4218", "Cash on delivery"].map((p) => (
                  <label key={p} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
                    <input type="radio" name="pay" defaultChecked={p.startsWith("UPI")} /> {p}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="card-lux p-5 h-fit sticky top-24">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Summary</p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{delivery === 0 ? "Free" : `₹${delivery}`}</span></div>
            <div className="border-t border-border pt-2 flex justify-between text-lg">
              <span>Total</span><span className="editorial-italic text-primary">₹{total}</span>
            </div>
          </div>
          {step === "cart" ? (
            <button disabled={rows.length === 0} onClick={() => setStep("pay")} className="mt-5 w-full rounded-full bg-coral text-coral-foreground py-3 disabled:opacity-40 flex items-center justify-center gap-2">
              <CreditCard className="h-4 w-4" /> Checkout
            </button>
          ) : (
            <button disabled={busy} onClick={checkout} className="mt-5 w-full rounded-full bg-coral text-coral-foreground py-3 disabled:opacity-60 flex items-center justify-center gap-2">
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <>Pay ₹{total}</>}
            </button>
          )}
          <p className="text-xs text-muted-foreground italic mt-2 text-center">Demo payments — no card is charged.</p>
        </aside>
      </div>
    </div>
  );
}
