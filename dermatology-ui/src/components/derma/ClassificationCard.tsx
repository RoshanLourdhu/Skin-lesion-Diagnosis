import { Classification } from "@/lib/derma-types";
import { AlertTriangle, ShieldCheck, ShieldAlert, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  classification: Classification;
}

const getRiskMeta = (risk: string) => {
  const r = risk.toLowerCase();
  if (r.includes("high") || r.includes("severe"))
    return {
      label: "High Risk",
      gradient: "bg-gradient-danger",
      ring: "ring-danger/40",
      glow: "shadow-[0_0_40px_hsl(var(--danger)/0.4)]",
      icon: ShieldAlert,
      text: "text-danger",
      bg: "bg-danger/10 border-danger/30",
    };
  if (r.includes("mod") || r.includes("med") || r.includes("yellow"))
    return {
      label: "Moderate Risk",
      gradient: "bg-gradient-warning",
      ring: "ring-warning/40",
      glow: "shadow-[0_0_40px_hsl(var(--warning)/0.35)]",
      icon: AlertTriangle,
      text: "text-warning",
      bg: "bg-warning/10 border-warning/30",
    };
  return {
    label: "Low Risk",
    gradient: "bg-gradient-success",
    ring: "ring-success/40",
    glow: "shadow-[0_0_40px_hsl(var(--success)/0.35)]",
    icon: ShieldCheck,
    text: "text-success",
    bg: "bg-success/10 border-success/30",
  };
};

export default function ClassificationCard({ classification }: Props)  {
  const meta = getRiskMeta(classification.risk);
  const Icon = meta.icon;
  const conf = Math.round((classification.confidence ?? 0) * (classification.confidence > 1 ? 1 : 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Predicted label */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
          <Activity className="w-3.5 h-3.5" />
          Predicted Diagnosis
        </div>
        <p className="text-2xl font-bold leading-tight">{classification.label}</p>
        <p className="text-xs text-muted-foreground mt-2">AI classification result</p>
      </div>

      {/* Confidence */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Confidence
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold glow-text">{conf}</span>
          <span className="text-lg text-muted-foreground">%</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-secondary/60 overflow-hidden">
          <div
            className="h-full bg-gradient-primary transition-all duration-1000"
            style={{ width: `${Math.min(100, Math.max(0, conf))}%` }}
          />
        </div>
      </div>

      {/* Risk */}
      <div className={cn("glass-card p-6 ring-1", meta.ring, meta.glow)}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Risk Level
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", meta.gradient)}>
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className={cn("text-xl font-bold", meta.text)}>{meta.label}</p>
            <p className="text-xs text-muted-foreground capitalize">{classification.risk}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
