import { useCallback, useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  file: File | null;
  preview: string | null;
  onFile: (file: File | null, preview: string | null) => void;
}

export default function ImageUploader({ file, preview, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

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
        <img src={preview} alt="Lesion preview" className="w-full h-72 object-contain" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span className="font-medium truncate max-w-[200px]">{file?.name}</span>
            <span className="text-xs text-muted-foreground">
              {file ? `${(file.size / 1024).toFixed(0)} KB` : ""}
            </span>
          </div>
          <button
            onClick={() => onFile(null, null)}
            className="p-2 rounded-lg bg-destructive/20 hover:bg-destructive/40 border border-destructive/40 transition-colors"
            aria-label="Remove image"
          >
            <X className="w-4 h-4 text-destructive-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return (
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
        "flex flex-col items-center justify-center gap-3 h-72 px-6 text-center",
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
      <div className="w-16 h-16 rounded-2xl bg-gradient-primary/20 border border-primary/30 flex items-center justify-center">
        <Upload className="w-7 h-7 text-primary" />
      </div>
      <div>
        <p className="text-base font-semibold">Drop lesion image here</p>
        <p className="text-sm text-muted-foreground mt-1">
          or <span className="text-primary">click to browse</span> · PNG, JPG, WEBP
        </p>
      </div>
    </div>
  );
};
