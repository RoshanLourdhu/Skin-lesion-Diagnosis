import { useCallback, useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Smartphone, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import MobileQRDialog from "./MobileQRDialog";

interface Props {
  file: File | null;
  preview: string | null;
  onFile: (file: File | null, preview: string | null) => void;
}

export default function ImageUploader({ file, preview, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [mobileDialogOpen, setMobileDialogOpen] = useState(false);

  const handleFile = useCallback(
    (f: File) => {
      if (!f.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => onFile(f, reader.result as string);
      reader.readAsDataURL(f);
    },
    [onFile]
  );

  if (preview) {
    return (
      <div className="relative group rounded-2xl overflow-hidden border border-primary/30 shadow-glow">
        <img src={preview} alt="Lesion preview" className="w-full h-72 object-contain bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span className="font-medium truncate max-w-[200px]">{file?.name}</span>
            <span className="text-xs text-muted-foreground">
              {file ? `${(file.size / 1024).toFixed(0)} KB` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileDialogOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/40 text-cyan-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" /> Replace via Mobile
            </button>
            <button
              onClick={() => onFile(null, null)}
              className="p-2 rounded-lg bg-destructive/20 hover:bg-destructive/40 border border-destructive/40 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-4 h-4 text-destructive-foreground" />
            </button>
          </div>
        </div>

        <MobileQRDialog
          open={mobileDialogOpen}
          onClose={() => setMobileDialogOpen(false)}
          onFile={(file, preview) => {
            onFile(file, preview);
            setMobileDialogOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* File Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300",
          "flex flex-col items-center justify-center gap-3 h-52 px-6 text-center",
          "bg-secondary/20 hover:bg-secondary/40",
          drag
            ? "border-primary bg-primary/10 scale-[1.02] shadow-glow"
            : "border-border/60 hover:border-primary/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <div className="w-12 h-12 rounded-2xl bg-gradient-primary/20 border border-primary/30 flex items-center justify-center">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-base font-semibold">Drop lesion image here</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            or <span className="text-primary">click to browse</span> · PNG, JPG, WEBP
          </p>
        </div>
      </div>

      {/* OR Separator */}
      <div className="flex items-center gap-3">
        <div className="h-[1px] flex-1 bg-border/40" />
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">OR</span>
        <div className="h-[1px] flex-1 bg-border/40" />
      </div>

      {/* Upload from Phone Button */}
      <button
        type="button"
        onClick={() => setMobileDialogOpen(true)}
        className="w-full py-3 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-semibold text-sm transition duration-200 flex items-center justify-center gap-2.5 shadow-glow hover:border-cyan-400 active:scale-98"
      >
        <Smartphone className="w-4.5 h-4.5 text-cyan-400" />
        <QrCode className="w-4.5 h-4.5 text-cyan-400" />
        <span>Upload from Phone (Scan QR)</span>
      </button>

      <MobileQRDialog
        open={mobileDialogOpen}
        onClose={() => setMobileDialogOpen(false)}
        onFile={(file, preview) => {
          onFile(file, preview);
          setMobileDialogOpen(false);
        }}
      />
    </div>
  );
}
