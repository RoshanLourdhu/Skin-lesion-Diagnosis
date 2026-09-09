// API Base URL configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://dermavision-backend-530379106718.us-central1.run.app";

// Frontend Base URL configuration for QR generation
export const getFrontendBaseUrl = (): string => {
  if (import.meta.env.VITE_FRONTEND_BASE_URL) {
    return import.meta.env.VITE_FRONTEND_BASE_URL;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "https://dermatology-ui.vercel.app";
};
