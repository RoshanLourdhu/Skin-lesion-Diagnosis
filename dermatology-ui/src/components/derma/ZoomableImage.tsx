import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  alt: string;
  label: string;
  className?: string;
  imgClassName?: string;
}

export default function ZoomableImage({ src, alt, label, className, imgClassName }: Props)  {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={cn("group relative rounded-xl overflow-hidden border border-border/60 bg-secondary/30", className)}>
        <button
          onClick={() => setOpen(true)}
          className="block w-full"
          aria-label={`Zoom ${label}`}
        >
          <img
            src={src}
            alt={alt}
            className={cn("w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105", imgClassName)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-background/70 backdrop-blur-md border border-border/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="w-4 h-4 text-primary" />
          </div>
        </button>
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-background/70 backdrop-blur-md border-t border-border/60">
          <p className="text-xs font-semibold tracking-wide text-foreground/90">{label}</p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl bg-background/95 backdrop-blur-xl border-primary/20 p-2">
          <img src={src} alt={alt} className="w-full h-auto rounded-lg" />
          <p className="text-center text-sm text-muted-foreground py-2">{label}</p>
        </DialogContent>
      </Dialog>
    </>
  );
};
