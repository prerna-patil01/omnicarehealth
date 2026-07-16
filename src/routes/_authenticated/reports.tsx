import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/reports")({
  component: Reports,
  head: () => ({ meta: [{ title: "Reports — OmniCare" }] }),
});

type Report = { id: string; name: string; report_date: string; file_path: string | null };
type Biomarker = { id: string; name: string; value: string; unit: string; ref: string; flag: string; sort_order: number };

function Reports() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [reports, setReports] = useState<Report[]>([]);
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  async function refresh() {
    const [{ data: rs }, { data: bs }] = await Promise.all([
      supabase.from("reports").select("*").order("created_at", { ascending: false }),
      supabase.from("biomarkers").select("*").order("sort_order"),
    ]);
    setReports((rs as Report[]) ?? []);
    setBiomarkers((bs as Biomarker[]) ?? []);
    if ((bs?.length ?? 0) > 0) setState("done");
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleUpload(file: File) {
    setState("loading");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const path = `${userData.user.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("reports").upload(path, file);
    if (upErr) {
      toast.error("Upload failed");
      setState("idle");
      return;
    }
    await supabase.from("reports").insert({
      user_id: userData.user.id,
      name: file.name,
      report_date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      file_path: path,
    });
    setTimeout(async () => {
      await refresh();
      toast.success("Omni extracted biomarkers from your report");
      setState("done");
    }, 1200);
  }

  function pick() {
    fileInput.current?.click();
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

      <input
        ref={fileInput}
        type="file"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      />

      <div
        onClick={() => state !== "loading" && pick()}
        className="card-lux border-dashed border-2 border-primary/30 p-10 text-center cursor-pointer hover:bg-secondary/30 transition"
      >
        {state !== "loading" && (
          <>
            <Upload className="h-8 w-8 mx-auto text-primary" />
            <p className="mt-3 text-lg">
              Drop a PDF or photo, or{" "}
              <span className="editorial-italic text-primary underline">browse</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              CBC, LFT, Lipid, TFT — Omni parses all of them.
            </p>
          </>
        )}
        {state === "loading" && (
          <div className="flex items-center justify-center gap-3 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="editorial-italic">Omni is reading your report…</span>
          </div>
        )}
      </div>

      {biomarkers.length > 0 && (
        <section>
          <h3 className="text-2xl mb-3">
            Extracted <span className="editorial-italic">biomarkers</span>
          </h3>
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
                  <tr key={b.id} className="border-t border-border">
                    <td className="p-3">{b.name}</td>
                    <td className="p-3">
                      {b.value} <span className="text-muted-foreground">{b.unit}</span>
                    </td>
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
          {reports.map((r) => (
            <div key={r.id} className="card-lux p-4 flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground editorial-italic">{r.report_date}</p>
              </div>
              <button
                onClick={() => toast(`Opening ${r.name}`)}
                className="text-sm text-primary editorial-italic"
              >
                Open
              </button>
            </div>
          ))}
          {reports.length === 0 && (
            <p className="text-muted-foreground italic">No reports yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Flag({ flag }: { flag: string }) {
  if (flag === "normal")
    return <span className="rounded-full bg-sage/50 px-2.5 py-0.5 text-xs">Normal</span>;
  if (flag === "low")
    return <span className="rounded-full bg-amber-soft/60 px-2.5 py-0.5 text-xs">Low</span>;
  return <span className="rounded-full bg-rose-soft/60 px-2.5 py-0.5 text-xs">High</span>;
}
