import { Activity, Stethoscope } from "lucide-react";

export default function Header() {
  return (
    <header className="relative z-10 border-b border-border/40 backdrop-blur-xl bg-background/40">
      <div className="container flex items-center justify-between py-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary blur-xl opacity-60" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Stethoscope className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Derma<span className="glow-text">AI</span>
            </h1>
            <p className="text-xs text-muted-foreground">Clinical Dermatology Analysis Platform</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-success" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-success animate-ping" />
          </div>
          <span className="text-xs font-medium text-success">System Online</span>
          <Activity className="w-3.5 h-3.5 text-success" />
        </div>
      </div>
    </header>
  );
};
