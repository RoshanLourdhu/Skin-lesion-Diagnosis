import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  number: number;
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ResultSection({ number, title, description, icon, children, className }: Props)  {
  return (
    <section className={cn("section-fade", className)} style={{ animationDelay: `${number * 80}ms` }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-gradient-primary/20 border border-primary/30 flex items-center justify-center text-primary">
            {icon}
          </div>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center shadow-glow">
            {number}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
};
