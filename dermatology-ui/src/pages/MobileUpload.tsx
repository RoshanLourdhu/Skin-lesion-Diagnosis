import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Camera, Image as ImageIcon, Upload, CheckCircle2, AlertCircle, RefreshCw, X, Loader2, ShieldCheck } from "lucide-react";

import { API_BASE_URL } from "@/config";

export default function MobileUpload() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [sessionStatus, setSessionStatus] = useState<"checking" | "waiting" | "uploaded" | "expired" | "invalid">("checking");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Check session status on mount
  useEffect(() => {
    if (!sessionId) {
      setSessionStatus("invalid");
      return;
    }

    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/mobile/session/${sessionId}/status`);
        if (!res.ok) {
          setSessionStatus("invalid");
          return;
        }
        const data = await res.json();
        if (data.status === "waiting") {
          setSessionStatus("waiting");
        } else if (data.status === "uploaded") {
          setSessionStatus("uploaded");
        } else if (data.status === "expired") {
          setSessionStatus("expired");
        } else {
          setSessionStatus("invalid");
        }
      } catch (err) {
        console.error("Session verification error:", err);
        setErrorMsg("Unable to connect to DermaVision backend server.");
        setSessionStatus("invalid");
      }
    };

    checkSession();
  }, [sessionId]);

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    // 15MB limit check
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("File size exceeds maximum limit of 15 MB.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile || !sessionId) return;

    setUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(`${API_BASE_URL}/mobile/upload/${sessionId}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.error || "Failed to upload image.");
      }

      setUploadSuccess(true);
      setSessionStatus("uploaded");
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg(err.message || "An error occurred while uploading the image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-white flex flex-col items-center p-4 sm:p-6 font-sans">
      
      {/* Mobile App Header */}
      <header className="w-full max-w-md flex items-center justify-between py-4 mb-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-extrabold text-sm">
            DV
          </div>
          <span className="text-lg font-bold tracking-tight">
            DermaVision <span className="text-cyan-400">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secure Session</span>
        </div>
      </header>

      <main className="w-full max-w-md space-y-6">

        {/* State: Checking */}
        {sessionStatus === "checking" && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-cyan-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium text-gray-300">Verifying session...</p>
          </div>
        )}

        {/* State: Invalid Session */}
        {sessionStatus === "invalid" && (
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-400">Invalid Upload Session</h2>
              <p className="text-xs text-gray-300 mt-1">
                {errorMsg || "This QR code link is invalid or no longer exists. Please generate a new QR code on your computer screen."}
              </p>
            </div>
          </div>
        )}

        {/* State: Expired Session */}
        {sessionStatus === "expired" && (
          <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-400">Session Expired</h2>
              <p className="text-xs text-gray-300 mt-1">
                This mobile session has expired. Please click "Upload from Phone" on your computer to get a fresh QR code.
              </p>
            </div>
          </div>
        )}

        {/* State: Upload Success */}
        {uploadSuccess && (
          <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-emerald-400">Image Uploaded Successfully!</h2>
              <p className="text-xs text-gray-300 leading-relaxed">
                The lesion image has been received by the laptop dashboard. You can now return to your computer screen to run the AI analysis.
              </p>
            </div>
          </div>
        )}

        {/* State: Waiting (Main Upload Flow) */}
        {sessionStatus === "waiting" && !uploadSuccess && (
          <div className="space-y-6">

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Hidden Input Elements */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />

            {/* Input Option Buttons (When no file selected) */}
            {!previewUrl ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-b from-cyan-500/20 to-blue-600/10 hover:from-cyan-500/30 hover:to-blue-600/20 border border-cyan-500/30 hover:border-cyan-400 rounded-2xl transition duration-200 shadow-glow active:scale-95 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block">Take Photo</span>
                    <span className="text-[11px] text-gray-400">Use Rear Camera</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 p-6 bg-secondary/30 hover:bg-secondary/50 border border-white/10 hover:border-white/30 rounded-2xl transition duration-200 active:scale-95 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block">Choose Photo</span>
                    <span className="text-[11px] text-gray-400">From Gallery</span>
                  </div>
                </button>
              </div>
            ) : (
              /* Image Selected Preview State */
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-black/60 shadow-glow">
                  <img
                    src={previewUrl}
                    alt="Selected lesion"
                    className="w-full h-72 object-contain bg-black/40"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-red-500/80 text-white transition border border-white/20"
                    aria-label="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* File Details */}
                {selectedFile && (
                  <div className="flex items-center justify-between text-xs px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="truncate max-w-[200px] text-gray-300 font-medium">{selectedFile.name}</span>
                    <span className="text-cyan-400 font-mono">{(selectedFile.size / 1024).toFixed(0)} KB</span>
                  </div>
                )}

                {/* Retake / Change Photo button */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 text-gray-300"
                  >
                    <Camera className="w-3.5 h-3.5" /> Retake
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 text-gray-300"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Gallery
                  </button>
                </div>

                {/* Submit Upload Button */}
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm rounded-xl shadow-glow transition duration-200 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Uploading to Dashboard...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Upload Image to Dashboard</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Instructions */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs space-y-2 text-gray-400">
              <p className="font-semibold text-gray-300">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Take a clear, close-up photo of the lesion under good lighting.</li>
                <li>Preview the photo to ensure it is focused and readable.</li>
                <li>Tap <strong>Upload Image</strong> to send it to your computer screen.</li>
              </ol>
            </div>

          </div>
        )}

      </main>

      <footer className="mt-auto py-6 text-center text-[11px] text-gray-500">
        DermaVision AI · Mobile QR Transfer
      </footer>

    </div>
  );
}
