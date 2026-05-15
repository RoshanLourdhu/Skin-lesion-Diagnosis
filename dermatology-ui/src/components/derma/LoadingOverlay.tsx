import { Loader2, Brain, Microscope, ScanLine } from "lucide-react";

export default function LoadingOverlay()  {
  return (
    <div className="glass-card p-12 flex flex-col items-center justify-center text-center section-fade">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-primary blur-3xl opacity-50 animate-pulse" />
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-glow-strong">
          <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">AI Pipeline Running</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Performing multi-stage analysis on the uploaded lesion image. This may take a few seconds.
      </p>
      <div className="grid grid-cols-3 gap-3 w-full max-w-xl">
        {[
          { icon: ScanLine, label: "Segmentation" },
          { icon: Brain, label: "Classification" },
          { icon: Microscope, label: "Depth Mapping" },
        ].map(({ icon: Icon, label }, i) => (
          <div
            key={label}
            className="p-3 rounded-xl bg-secondary/40 border border-border/60 flex flex-col items-center gap-2"
            style={{ animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite` }}
          >
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
