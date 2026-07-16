import { createFileRoute } from "@tanstack/react-router";
import { biomarkers } from "@/lib/mock-data";
import { useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reports")({
  component: Reports,
  head: () => ({ meta: [{ title: "Reports — OmniCare" }] }),
});

const PAST = [
  { name: "Complete Blood Count — Dr Lal PathLabs", date: "12 Mar 2026" },
  { name: "Lipid Panel — Metropolis", date: "18 Feb 2026" },
  { name: "Dengue NS1 — Suburban Diagnostics", date: "3 Jul 2021" },
];

function Reports() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  function fake() {
    setState("loading");
    setTimeout(() => setState("done"), 1400);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-widest">Records</p>
        <h1 className="text-4xl mt-1">
          Your <span className="editorial-italic text-primary">reports</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload any PDF or photo — Omni will extract biomarkers automatically.
        </p>
      </div>

      <div
        onClick={() => state === "idle" && fake()}
        className="card-lux border-dashed border-2 border-primary/30 p-10 text-center cursor-pointer hover:bg-secondary/30 transition"
      >
        {state === "idle" && (
          <>
            <Upload className="h-8 w-8 mx-auto text-primary" />
            <p className="mt-3 text-lg">Drop a PDF or photo, or <span className="editorial-italic text-primary underline">browse</span></p>
            <p className="text-sm text-muted-foreground mt-1">CBC, LFT, Lipid, TFT — Omni parses all of them.</p>
          </>
        )}
        {state === "loading" && (
          <div className="flex items-center justify-center gap-3 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="editorial-italic">Omni is reading your report…</span>
          </div>
        )}
        {state === "done" && (
          <p className="text-sage-foreground editorial-italic">✓ CBC report parsed · 8 biomarkers extracted</p>
        )}
      </div>

      {state === "done" && (
        <section>
          <h3 className="text-2xl mb-3">Extracted <span className="editorial-italic">biomarkers</span></h3>
          <div className="card-lux overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left">
                <tr>
                  <th className="p-3 font-normal editorial-italic">Marker</th>
                  <th className="p-3 font-normal editorial-italic">Value</th>
                  <th className="p-3 font-normal editorial-italic">Reference</th>
                  <th className="p-3 font-normal editorial-italic">Status</th>
                </tr>
              </thead>
              <tbody>
                {biomarkers.map((b) => (
                  <tr key={b.name} className="border-t border-border">
                    <td className="p-3">{b.name}</td>
                    <td className="p-3">{b.value} <span className="text-muted-foreground">{b.unit}</span></td>
                    <td className="p-3 text-muted-foreground">{b.ref}</td>
                    <td className="p-3">
                      <Flag flag={b.flag} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => toast("Omni will highlight anomalies and message Dr. Meera Rao")}
            className="mt-4 rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm"
          >
            Ask Omni to interpret
          </button>
        </section>
      )}

      <section>
        <h3 className="text-2xl mb-3 editorial-italic">Past reports</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {PAST.map((r) => (
            <div key={r.name} className="card-lux p-4 flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground editorial-italic">{r.date}</p>
              </div>
              <button
                onClick={() => toast(`Opening ${r.name}`)}
                className="text-sm text-primary editorial-italic"
              >
                Open
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Flag({ flag }: { flag: string }) {
  if (flag === "normal") return <span className="rounded-full bg-sage/50 px-2.5 py-0.5 text-xs">Normal</span>;
  if (flag === "low") return <span className="rounded-full bg-amber-soft/60 px-2.5 py-0.5 text-xs">Low</span>;
  return <span className="rounded-full bg-rose-soft/60 px-2.5 py-0.5 text-xs">High</span>;
}
