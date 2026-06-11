import { Brain, Cpu, AlertTriangle, ShieldCheck, ShieldAlert, Activity, Sigma, Layers, Compass, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface WolframAnalysis {
  severity_score: number;
  risk_index: number;
  mathematical_analysis: {
    circularity: number;
    border_asymmetry: number;
    fractal_dimension: number;
    lesion_density: number;
    aspect_ratio: number;
  };
  statistical_interpretation: {
    area_percentile: number;
    depth_percentile: number;
    volume_percentile: number;
  };
  clinical_insights: string[];
}

interface Props {
  analysis?: WolframAnalysis | null;
  loading?: boolean;
  classification?: {
    label: string;
    confidence: number;
    risk: string;
  };
}

export default function WolframClinicalIntelligence({ analysis, loading, classification }: Props) {
  if (loading) {
    return (
      <div className="glass-card p-8 animate-pulse-glow flex flex-col items-center justify-center space-y-4">
        <Cpu className="w-12 h-12 text-primary animate-spin" />
        <div className="text-center">
          <h3 className="text-lg font-bold">Computing Wolfram Clinical Intelligence...</h3>
          <p className="text-xs text-muted-foreground mt-1">Analyzing geometry, statistical benchmarks, and severity metrics</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  // Severity Meta
  const getSeverityMeta = (score: number) => {
    if (score >= 70) return { label: "Severe Lesion Profile", text: "text-danger", gradient: "bg-gradient-danger", ring: "ring-danger/40", glow: "shadow-[0_0_20px_hsl(var(--danger)/0.3)]" };
    if (score >= 35) return { label: "Moderate Lesion Profile", text: "text-warning", gradient: "bg-gradient-warning", ring: "ring-warning/40", glow: "shadow-[0_0_20px_hsl(var(--warning)/0.25)]" };
    return { label: "Mild / Low Severity Profile", text: "text-success", gradient: "bg-gradient-success", ring: "ring-success/40", glow: "shadow-[0_0_20px_hsl(var(--success)/0.25)]" };
  };

  const severityMeta = getSeverityMeta(analysis.severity_score);

  // Risk Meta
  const getRiskMeta = (index: number) => {
    if (index >= 0.7) return { label: "High Critical Risk", text: "text-danger", icon: ShieldAlert };
    if (index >= 0.35) return { label: "Moderate Clinical Risk", text: "text-warning", icon: AlertTriangle };
    return { label: "Low Normal Risk", text: "text-success", icon: ShieldCheck };
  };

  const riskMeta = getRiskMeta(analysis.risk_index);
  const RiskIcon = riskMeta.icon;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 section-fade">
      
      {/* Diagnosis Section */}
      {classification && (
        <div className="p-4 glass-card rounded-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-3xl font-extrabold tracking-tight glow-text">{classification.label}</h3>
              <p className="text-sm text-muted-foreground">AI Diagnosis</p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Confidence:</span>
                <span>{(classification.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="w-48 h-2 bg-secondary/40 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary transition-all" style={{ width: `${Math.min(100, Math.max(0, classification.confidence * 100))}%` }} />
              </div>
              <div className="mt-1">
                <span className={
                  classification.risk.toLowerCase().includes('high') ? 'px-2 py-0.5 bg-red-500/10 text-red-500 rounded' :
                  classification.risk.toLowerCase().includes('medium') || classification.risk.toLowerCase().includes('moderate') ? 'px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded' :
                  'px-2 py-0.5 bg-green-500/10 text-green-500 rounded'
                }>
                  {classification.risk.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-glow">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Wolfram Clinical Intelligence</h2>
            <p className="text-xs text-muted-foreground">Advanced mathematical lesion analytics & medical heuristics powered by Wolfram Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary w-fit self-start md:self-center">
          <Cpu className="w-3.5 h-3.5" />
          Wolfram Engine API Active
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Severity & Risk gauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Severity Score Card */}
          <div className={cn("glass-card p-6 flex flex-col justify-between items-center relative overflow-hidden text-center border-t-2 border-t-primary/50", severityMeta.ring, severityMeta.glow)}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Severity Score</div>
            
            {/* SVG Circle Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center my-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary/50" />
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={`${2.0 * Math.PI * 42}`} 
                        strokeDashoffset={`${2.0 * Math.PI * 42 * (1 - analysis.severity_score / 100)}`}
                        className={cn("transition-all duration-1000", 
                          analysis.severity_score >= 70 ? "text-red-500" : (analysis.severity_score >= 35 ? "text-amber-500" : "text-emerald-500")
                        )} />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black tracking-tight leading-none glow-text">{analysis.severity_score}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold mt-1">/ 100</span>
              </div>
            </div>

            <div className="mt-2">
              <p className={cn("text-base font-bold", severityMeta.text)}>{severityMeta.label}</p>
              <p className="text-xs text-muted-foreground mt-1">Calculated via geometry & depth metrics</p>
            </div>
          </div>

          {/* Risk Index Card */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Risk Index</div>
              <div className={cn("px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5", 
                analysis.risk_index >= 0.7 ? "bg-red-500/10 text-red-400" : (analysis.risk_index >= 0.35 ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400")
              )}>
                <RiskIcon className="w-3.5 h-3.5" />
                {analysis.risk_index >= 0.7 ? "High" : (analysis.risk_index >= 0.35 ? "Moderate" : "Low")}
              </div>
            </div>

            <div className="my-6">
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-extrabold tracking-tight glow-text">{(analysis.risk_index * 100).toFixed(0)}</span>
                <span className="text-xl text-muted-foreground font-semibold">%</span>
              </div>
              <div className="h-3 rounded-full bg-secondary/80 overflow-hidden relative border border-border/40 shadow-inner">
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 w-full opacity-30" />
                <div 
                  className={cn("h-full transition-all duration-1000 relative", 
                    analysis.risk_index >= 0.7 ? "bg-red-500" : (analysis.risk_index >= 0.35 ? "bg-amber-500" : "bg-emerald-500")
                  )} 
                  style={{ width: `${analysis.risk_index * 100}%` }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-glow" />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground">{riskMeta.label}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Aggregate invasion & structural asymmetry index</p>
            </div>
          </div>
        </div>

        {/* Clinical Interpretation & Insights */}
        <div className="glass-card p-6 flex flex-col justify-between border-l-2 border-l-accent/60">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4 border-b border-border/40 pb-3">
            <Activity className="w-4 h-4 text-accent" />
            Wolfram clinical Interpretation & insights
          </div>

          <div className="space-y-4 flex-grow overflow-y-auto max-h-[220px] pr-2">
            {analysis.clinical_insights.map((insight, idx) => (
              <div key={idx} className="flex gap-3 bg-secondary/20 border border-border/40 p-3 rounded-xl transition-all duration-300 hover:border-accent/30">
                <div className="w-5 h-5 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
                  <span className="text-xs font-bold">{idx + 1}</span>
                </div>
                <p className="text-xs leading-relaxed text-foreground/90">{insight}</p>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-muted-foreground/60 italic mt-4 border-t border-border/30 pt-3">
            * Clinical insights are automatically evaluated against dermatological risk criteria and computed shape metrics.
          </div>
        </div>
      </div>

      {/* Advanced Math & Statistical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Mathematical Analysis */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold border-b border-border/40 pb-3">
            <Sigma className="w-4 h-4 text-primary" />
            Mathematical Lesion Analysis (Geometry)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Circularity */}
            <div className="bg-secondary/25 p-3.5 rounded-xl border border-border/40">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Circularity</span>
                <Compass className="w-3.5 h-3.5 text-primary/70" />
              </div>
              <p className="text-lg font-bold glow-text">{analysis.mathematical_analysis.circularity}</p>
              <p className="text-[10px] text-muted-foreground/80 mt-1">Perfect circle = 1.0. Lower values indicate high asymmetry.</p>
            </div>

            {/* Border Asymmetry */}
            <div className="bg-secondary/25 p-3.5 rounded-xl border border-border/40">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Border Asymmetry</span>
                <Layers className="w-3.5 h-3.5 text-primary/70" />
              </div>
              <p className="text-lg font-bold glow-text">{analysis.mathematical_analysis.border_asymmetry}</p>
              <p className="text-[10px] text-muted-foreground/80 mt-1">Circularity deviation factor. Measures outline irregularity.</p>
            </div>

            {/* Fractal Dimension */}
            <div className="bg-secondary/25 p-3.5 rounded-xl border border-border/40">
              <div className="text-xs text-muted-foreground mb-1">Fractal Dimension</div>
              <p className="text-lg font-bold glow-text">{analysis.mathematical_analysis.fractal_dimension}</p>
              <p className="text-[10px] text-muted-foreground/80 mt-1">Boundary complexity scaling. Typical lesions: 1.1 to 1.6.</p>
            </div>

            {/* Depth Aspect Ratio */}
            <div className="bg-secondary/25 p-3.5 rounded-xl border border-border/40">
              <div className="text-xs text-muted-foreground mb-1">Depth Aspect Ratio</div>
              <p className="text-lg font-bold glow-text">{analysis.mathematical_analysis.aspect_ratio.toFixed(4)}</p>
              <p className="text-[10px] text-muted-foreground/80 mt-1">Ratio of vertical penetration depth to lateral radius.</p>
            </div>

          </div>

          <div className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/10 text-xs text-primary-foreground/90">
            <span className="font-semibold text-primary">Lesion Volume Density:</span>
            <span className="font-bold bg-primary/20 px-2 py-0.5 rounded text-primary">{analysis.mathematical_analysis.lesion_density} px⁻¹</span>
          </div>
        </div>

        {/* Statistical Interpretation */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold border-b border-border/40 pb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Statistical Interpretation (Clinical Benchmarks)
          </div>

          <div className="space-y-4">
            
            {/* Area Percentile */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Area Percentile</span>
                <span className="font-bold text-emerald-400">{analysis.statistical_interpretation.area_percentile}th percentile</span>
              </div>
              <div className="h-2 rounded-full bg-secondary/80 overflow-hidden relative">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-glow" 
                  style={{ width: `${analysis.statistical_interpretation.area_percentile}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground/70">Lesion surface area compared to standard benign/malignant distributions.</p>
            </div>

            {/* Depth Percentile */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Invasion Depth Percentile</span>
                <span className="font-bold text-emerald-400">{analysis.statistical_interpretation.depth_percentile}th percentile</span>
              </div>
              <div className="h-2 rounded-full bg-secondary/80 overflow-hidden relative">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-glow" 
                  style={{ width: `${analysis.statistical_interpretation.depth_percentile}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground/70">Estimated invasion thickness relative to standardized biopsy parameters.</p>
            </div>

            {/* Volume Percentile */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Volume Percentile</span>
                <span className="font-bold text-emerald-400">{analysis.statistical_interpretation.volume_percentile}th percentile</span>
              </div>
              <div className="h-2 rounded-full bg-secondary/80 overflow-hidden relative">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-glow" 
                  style={{ width: `${analysis.statistical_interpretation.volume_percentile}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground/70">Aggregate 3D volume percentile of the segmented lesion structure.</p>
            </div>

          </div>

          <div className="text-[10px] text-muted-foreground/80 leading-relaxed bg-secondary/20 p-3 rounded-lg border border-border/30">
            <strong>Benchmark Models:</strong> Area is modeled using a Log-Normal distribution ($\mu=8.5, \sigma=1.2$). Depth is evaluated against a Beta distribution ($\alpha=2.5, \beta=5.0$) normalized to typical clinical margins.
          </div>
        </div>

      </div>

    </div>
  );
}
