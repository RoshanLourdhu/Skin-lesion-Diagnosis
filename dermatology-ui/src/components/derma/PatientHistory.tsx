import { useEffect, useMemo, useState } from "react";
import { Search, Clock, FileText, ChevronRight, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HistoryRecord } from "@/lib/derma-types";
import { fetchRemoteHistory, loadHistory } from "@/lib/derma-storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Props {
  refreshKey: number;
}

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const riskColor = (risk: string) => {
  const r = risk.toLowerCase();
  if (r.includes("high")) return "text-danger bg-danger/10 border-danger/30";
  if (r.includes("mod")) return "text-warning bg-warning/10 border-warning/30";
  return "text-success bg-success/10 border-success/30";
};

export default function PatientHistory({ refreshKey }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<HistoryRecord | null>(null);
  const [records, setRecords] = useState<HistoryRecord[]>(() => loadHistory());
  const [source, setSource] = useState<"remote" | "local">("local");
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    const remote = await fetchRemoteHistory();
    if (remote && remote.length > 0) {
      setRecords(remote);
      setSource("remote");
    } else {
      setRecords(loadHistory());
      setSource("local");
    }
    setRefreshing(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const filtered = useMemo(() => {
    if (!query.trim()) return records;
    const q = query.trim().toLowerCase();
    return records.filter(
      (r) =>
        r.patient_id.toLowerCase().includes(q) ||
        (r.name ?? "").toLowerCase().includes(q)
    );
  }, [query, records]);

  return (
    <>
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Patient History</h2>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-semibold",
                  source === "remote"
                    ? "text-success bg-success/10 border-success/30"
                    : "text-muted-foreground bg-secondary/40 border-border/60"
                )}
                title={source === "remote" ? "Loaded from backend" : "Loaded from local cache"}
              >
                {source === "remote" ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {source}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Previous analyses & reports</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by Patient ID or name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                maxLength={50}
                className="pl-10 h-11 bg-secondary/40 border-border/60 rounded-xl"
              />
            </div>
            <button
              onClick={refresh}
              disabled={refreshing}
              className="h-11 w-11 flex items-center justify-center rounded-xl bg-secondary/40 border border-border/60 hover:border-primary/40 hover:text-primary transition-all disabled:opacity-50"
              aria-label="Refresh history"
              title="Refresh from backend"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              {query ? `No records matching "${query}".` : "No records found."}
            </p>
            <p className="text-xs mt-1">Run an analysis to populate the patient history.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((rec, idx) => (
              <button
                key={rec.id}
                onClick={() => setSelected(rec)}
                className="group text-left p-4 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/60 hover:border-primary/40 transition-all section-fade"
                style={{ animationDelay: `${Math.min(idx, 8) * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  {rec.originalImage ? (
                    <img
                      src={rec.originalImage}
                      alt={rec.name}
                      className="w-14 h-14 rounded-lg object-cover border border-border/60"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-secondary/50 border border-border/60 flex items-center justify-center text-muted-foreground">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate">{rec.name || "—"}</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">{rec.patient_id}</p>
                    <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">
                      {rec.classification.label}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-semibold ${riskColor(
                          rec.classification.risk
                        )}`}
                      >
                        {rec.classification.risk}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(rec.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto bg-background/95 backdrop-blur-xl border-primary/20">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selected.originalImage && (
                    <img src={selected.originalImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <div className="text-base">{selected.name}</div>
                    <div className="text-xs font-mono text-muted-foreground">{selected.patient_id}</div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-secondary/40">
                  <p className="text-muted-foreground uppercase tracking-wider">Diagnosis</p>
                  <p className="font-semibold mt-1">{selected.classification.label}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/40">
                  <p className="text-muted-foreground uppercase tracking-wider">Confidence</p>
                  <p className="font-semibold mt-1 glow-text">
                    {Math.round((selected.classification.confidence ?? 0) * (selected.classification.confidence > 1 ? 1 : 100))}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/40">
                  <p className="text-muted-foreground uppercase tracking-wider">Risk</p>
                  <p className="font-semibold mt-1 capitalize">{selected.classification.risk}</p>
                </div>
              </div>
              <div className="rounded-lg bg-secondary/30 border border-border/60 overflow-hidden">
                <div className="px-4 py-2 border-b border-border/60 text-xs font-semibold flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  Report
                </div>
                <pre className="p-4 text-xs font-mono whitespace-pre-wrap max-h-72 overflow-auto">
                  {selected.report}
                </pre>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
