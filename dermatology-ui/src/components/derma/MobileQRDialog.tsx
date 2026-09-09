import { useState, useEffect, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone, X, Clock, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { API_BASE_URL, getFrontendBaseUrl } from "@/config";

interface MobileQRDialogProps {
  open: boolean;
  onClose: () => void;
  onFile: (file: File, preview: string) => void;
}

export default function MobileQRDialog({ open, onClose, onFile }: MobileQRDialogProps) {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number>(600);
  const [status, setStatus] = useState<"loading" | "waiting" | "uploaded" | "expired" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Preserve latest callbacks without invalidating effect dependencies
  const onFileRef = useRef(onFile);
  onFileRef.current = onFile;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const clearTimers = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const startSessionAndPolling = useCallback(async () => {
    clearTimers();
    setLoading(true);
    setStatus("loading");
    setErrorMessage("");

    try {
      console.log("[MobileQRDialog] Creating session via POST", `${API_BASE_URL}/mobile/session`);
      const res = await fetch(`${API_BASE_URL}/mobile/session`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const currentSessionId = data.session_id;
      console.log("[MobileQRDialog] Session created successfully:", currentSessionId);
      
      setSessionId(currentSessionId);
      setExpiresIn(data.expires_in_seconds || 600);
      setStatus("waiting");

      // Start Countdown Timer
      countdownIntervalRef.current = setInterval(() => {
        setExpiresIn((prev) => {
          if (prev <= 1) {
            clearTimers();
            setStatus("expired");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start Polling loop (every 1.5 seconds)
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`${API_BASE_URL}/mobile/session/${currentSessionId}/status`);
          if (!statusRes.ok) return;

          const statusData = await statusRes.json();
          console.log("[MobileQRDialog] Polling status for", currentSessionId, ":", statusData.status);

          if (statusData.status === "uploaded") {
            clearTimers();
            setStatus("uploaded");
            console.log("[MobileQRDialog] Upload detected! Fetching image...");

            // Fetch the uploaded image blob
            const imgRes = await fetch(`${API_BASE_URL}/mobile/session/${currentSessionId}/image`);
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              const filename = statusData.filename || "mobile_lesion.jpg";
              const fileObj = new File([blob], filename, { type: blob.type || "image/jpeg" });
              const previewUrl = URL.createObjectURL(fileObj);

              console.log("[MobileQRDialog] Image fetched successfully. Size:", blob.size, "Type:", blob.type);
              
              // Pass file and preview URL to parent
              onFileRef.current(fileObj, previewUrl);

              // Auto close modal after brief confirmation display
              setTimeout(() => {
                onCloseRef.current();
              }, 1200);
            } else {
              console.error("[MobileQRDialog] Failed to retrieve image HTTP", imgRes.status);
              setErrorMessage("Image uploaded but failed to retrieve file.");
              setStatus("error");
            }
          } else if (statusData.status === "expired") {
            clearTimers();
            setStatus("expired");
          }
        } catch (err) {
          console.error("[MobileQRDialog] Polling error:", err);
        }
      }, 1500);

    } catch (err: any) {
      console.error("[MobileQRDialog] Session creation error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  }, [clearTimers]);

  useEffect(() => {
    if (open) {
      startSessionAndPolling();
    } else {
      clearTimers();
      setSessionId(null);
    }

    return () => {
      clearTimers();
    };
  }, [open, startSessionAndPolling, clearTimers]);

  if (!open) return null;

  const frontendBase = getFrontendBaseUrl();
  const mobilePageUrl = sessionId ? `${frontendBase}/mobile-upload/${sessionId}` : "";

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0e1726] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl text-white space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Upload from Phone</h2>
              <p className="text-xs text-gray-400">Scan QR code using smartphone camera</p>
            </div>
          </div>
          <button
            onClick={() => onCloseRef.current()}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {status === "loading" && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-cyan-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">Generating secure QR session...</p>
          </div>
        )}

        {status === "error" && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-3 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-semibold text-red-400">Session Error</h3>
              <p className="text-xs text-gray-300 mt-1">{errorMessage}</p>
            </div>
            <button
              onClick={startSessionAndPolling}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg text-xs transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {status === "waiting" && (
          <div className="flex flex-col items-center space-y-5">
            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl shadow-glow border border-white/20">
              {mobilePageUrl && (
                <QRCodeSVG
                  value={mobilePageUrl}
                  size={190}
                  level="M"
                  includeMargin={false}
                />
              )}
            </div>

            {/* Countdown & Status Badge */}
            <div className="w-full flex items-center justify-between text-xs px-2 bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-cyan-400">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                </span>
                <span className="font-medium">Waiting for upload...</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300 font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{formatTime(expiresIn)}</span>
              </div>
            </div>

            {/* Direct Link fallback display */}
            <div className="w-full text-center space-y-1">
              <p className="text-[11px] text-gray-400">Mobile Page Link:</p>
              <p className="text-xs font-mono text-cyan-300/80 truncate px-3 py-1 bg-black/40 rounded-md border border-cyan-500/20 select-all">
                {mobilePageUrl}
              </p>
            </div>
          </div>
        )}

        {status === "uploaded" && (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-emerald-400">Image Received!</h3>
            <p className="text-xs text-gray-300">Updating dashboard preview...</p>
          </div>
        )}

        {status === "expired" && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-400">Session Expired</h3>
              <p className="text-xs text-gray-400 mt-1">This QR code has expired after 10 minutes.</p>
            </div>
            <button
              onClick={startSessionAndPolling}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg text-xs transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Generate New QR Code
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
