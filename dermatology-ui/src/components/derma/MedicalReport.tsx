import { FileText, Download } from "lucide-react";

interface Props {
  report: string;
  loading?: boolean;
}

export default function MedicalReport({ report, loading }: Props) {

  const download = () => {
    if (!report) return;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `medical-report-${Date.now()}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-[#0f172a]/80 to-[#020617]/80 backdrop-blur-xl shadow-xl overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-white/5">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-semibold tracking-wide">
            AI Clinical Report
          </h2>
        </div>

        <button
          onClick={download}
          disabled={!report}
          className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 transition disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {/* BODY */}
      <div className="p-6">

        {/* LOADING STATE */}
        {loading && (
          <div className="animate-pulse text-sm text-muted-foreground">
            Generating AI report...
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !report && (
          <div className="text-sm text-muted-foreground">
            No report generated.
          </div>
        )}

        {/* REPORT CONTENT */}
        {!loading && report && (
          <div className="space-y-4 text-sm leading-relaxed">

            {report.split("\n").map((line, i) => {

              // Highlight important sections
              if (line.toLowerCase().includes("classification")) {
                return (
                  <div key={i} className="text-green-400 font-semibold">
                    {line}
                  </div>
                );
              }

              if (line.toLowerCase().includes("risk")) {
                return (
                  <div key={i} className="text-red-400 font-semibold">
                    {line}
                  </div>
                );
              }

              if (line.toLowerCase().includes("recommendation")) {
                return (
                  <div key={i} className="text-yellow-300 font-semibold">
                    {line}
                  </div>
                );
              }

              return (
                <div key={i} className="text-gray-300">
                  {line}
                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}