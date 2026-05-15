import { Symptom } from "@/lib/derma-types";
import { cn } from "@/lib/utils";
import {
  Droplet,
  Flame,
  Sparkles,
  Waves,
  TrendingUp,
  Palette,
  Square,
  AlertCircle,
} from "lucide-react";

interface Props {
  selected: Record<Symptom, boolean>;
  onToggle: (s: Symptom) => void;
  error?: string;
  showError?: boolean;
}

const SYMPTOMS: { key: Symptom; label: string; icon: typeof Droplet }[] = [
  { key: "itching", label: "Itching", icon: Sparkles },
  { key: "pain", label: "Pain", icon: Flame },
  { key: "bleeding", label: "Bleeding", icon: Droplet },
  { key: "oozing", label: "Oozing", icon: Waves },
  { key: "growth", label: "Growth", icon: TrendingUp },
  { key: "color_change", label: "Color Change", icon: Palette },
  { key: "border_change", label: "Border Change", icon: Square },
];

export default function SymptomsSelector({
  selected = {},
  onToggle,
  error,
  showError,
}: Props) {
  const invalid = !!showError && !!error;

  return (
    <div className="space-y-4">

      <div
        className={cn(
          "flex flex-wrap gap-4 rounded-xl transition-all",
          invalid && "p-4 -m-4 ring-2 ring-destructive/50 bg-destructive/5"
        )}
      >
        {SYMPTOMS.map(({ key, label, icon: Icon }) => {
          const active = selected[key];

          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggle(key)}
              className={cn(
                "group flex items-center gap-3",
                "px-6 py-3.5 rounded-full",
                "text-base font-semibold",   // 🔥 bigger text
                "border transition-all duration-300 backdrop-blur-md",
                active
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl scale-105 border-transparent"
                  : "bg-secondary/40 border-border/60 text-muted-foreground hover:border-primary/40 hover:text-white hover:bg-secondary/60"
              )}
            >
              {/* 🔥 Bigger icon */}
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform",   // ⬆️ from 4 → 5
                  active && "scale-110"
                )}
              />

              {label}
            </button>
          );
        })}
      </div>

      {invalid && (
        <p className="text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}