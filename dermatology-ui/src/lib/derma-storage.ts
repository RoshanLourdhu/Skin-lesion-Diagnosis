import { API_BASE, HistoryRecord } from "./derma-types";

const KEY = "derma_history_v1";

export function loadHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryRecord[];
  } catch {
    return [];
  }
}

export function saveHistoryRecord(rec: HistoryRecord) {
  const all = loadHistory();
  all.unshift(rec);
  // cap at 50
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50)));
}

export function searchHistory(patientId: string): HistoryRecord[] {
  const all = loadHistory();
  if (!patientId.trim()) return all;
  const q = patientId.trim().toLowerCase();
  return all.filter(
    (r) =>
      r.patient_id.toLowerCase().includes(q) ||
      (r.name ?? "").toLowerCase().includes(q)
  );
}

/**
 * Try to fetch history from the backend (GET /history). If unavailable,
 * silently fall back to local records — keeps the UI usable offline.
 */
export async function fetchRemoteHistory(): Promise<HistoryRecord[] | null> {
  try {
    const res = await fetch(`${API_BASE}/history`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const list = Array.isArray(data) ? data : data?.records ?? data?.history;
    if (!Array.isArray(list)) return null;
    return list.map(normalizeRecord);
  } catch {
    return null;
  }
}

// Normalize possible backend shapes into HistoryRecord
function normalizeRecord(raw: any): HistoryRecord {
  const cls = raw.classification ?? raw.data?.classification ?? {};
  const images = raw.images ?? raw.data?.images ?? {};
  const ts =
    typeof raw.timestamp === "number"
      ? raw.timestamp
      : raw.created_at
      ? new Date(raw.created_at).getTime()
      : Date.now();
  return {
    id: String(raw.id ?? `${raw.patient_id ?? "rec"}-${ts}`),
    patient_id: String(raw.patient_id ?? ""),
    name: String(raw.name ?? ""),
    age: String(raw.age ?? ""),
    duration: String(raw.duration ?? ""),
    timestamp: ts,
    classification: {
      label: String(cls.label ?? "Unknown"),
      confidence: Number(cls.confidence ?? 0),
      risk: String(cls.risk ?? "low"),
    },
    report: String(raw.report ?? raw.data?.report ?? ""),
    originalImage: raw.originalImage ?? raw.original_image ?? "",
    apiBase: API_BASE,
    images: {
      overlay: images.overlay ?? "",
      segmentation: images.segmentation ?? "",
      gradcam: images.gradcam ?? "",
      depth_color: images.depth_color ?? images.depth ?? "",
      depth_gray: images.depth_gray ?? "",
      profile: images.profile ?? "",
    },
  };
}
