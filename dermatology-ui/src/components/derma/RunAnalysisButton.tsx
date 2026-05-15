import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function RunAnalysisButton({ loading, disabled, onClick }: Props)  {
  return (
    <div className="flex justify-center pt-2">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          "group relative inline-flex items-center justify-center gap-3",
          "px-12 py-4 rounded-2xl text-base font-semibold tracking-wide",
          "bg-gradient-primary text-primary-foreground",
          "transition-all duration-300",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          !disabled && !loading && "animate-pulse-glow hover:scale-105 active:scale-100",
          loading && "cursor-wait"
        )}
      >
        <span className="absolute inset-0 rounded-2xl bg-gradient-primary blur-xl opacity-60 -z-10" />
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Run AI Analysis
          </>
        )}
      </button>
    </div>
  );
};
