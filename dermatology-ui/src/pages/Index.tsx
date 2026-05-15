import { useState } from "react";

import Header from "@/components/derma/Header";
import PatientDetailsForm from "@/components/derma/PatientDetailsForm";
import SymptomsSelector from "@/components/derma/SymptomsSelector";
import ImageUploader from "@/components/derma/ImageUploader";
import RunAnalysisButton from "@/components/derma/RunAnalysisButton";
import MedicalReport from "@/components/derma/MedicalReport";

export default function Index() {

  // -------------------------
  // STATE
  // -------------------------
  const [patient, setPatient] = useState({
    patient_id: "",
    name: "",
    age: "",
    duration: "",
  });

  const [symptoms, setSymptoms] = useState({
    itching: false,
    pain: false,
    bleeding: false,
    oozing: false,
    growth: false,
    color_change: false,
    border_change: false,
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");
  const [result, setResult] = useState<any>(null);

  // 🔥 NEW
  const [history, setHistory] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // -------------------------
  // HANDLERS
  // -------------------------
  const handlePatientChange = (key: string, value: string) => {
    setPatient(prev => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: string) => {
    setSymptoms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // -------------------------
  // REPORT POLLING
  // -------------------------
  const fetchReport = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/report");
      const data = await res.json();

      if (data.status === "ready") {
        setReport(data.report);
      } else {
        setTimeout(fetchReport, 2000);
      }
    } catch {
      setTimeout(fetchReport, 3000);
    }
  };

  // -------------------------
  // FETCH HISTORY
  // -------------------------
  const fetchHistory = async () => {
    if (!patient.patient_id) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/history/${patient.patient_id}`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------
  // LOAD FROM HISTORY
  // -------------------------
  const loadFromHistory = (record: any) => {
    setSelectedRecord(record);

    setReport(record[13]);

    setResult({
      classification: {
        label: record[10],
        confidence: record[11],
        risk: record[12],
      },
      metrics: {
        area_px: record[4],
        perimeter_px: record[5],
        roughness: record[6],
        volume: record[7],
        max_depth: record[8],
        mean_depth: record[9],
      },
      images: result?.images
    });
  };

  // -------------------------
  // MAIN ANALYSIS
  // -------------------------
  const runAnalysis = async () => {
    if (!file) return;

    setLoading(true);
    setReport("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("patient_id", patient.patient_id);
      formData.append("name", patient.name);
      formData.append("age", patient.age);
      formData.append("duration", patient.duration);

      Object.entries(symptoms).forEach(([key, val]) => {
        formData.append(key, val ? "y" : "n");
      });

      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setResult(data);

      fetchReport();
      fetchHistory();

    } catch (err) {
      console.error(err);
      setReport("Error generating report.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="min-h-screen bg-[#0b1220] text-white">

      <Header />

      <div className="w-full px-10 py-12 space-y-12">

        {/* HERO */}
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-extrabold">
            AI-Driven <span className="text-blue-400">Dermatology</span>
          </h1>
        </div>

        {/* FORM */}
        <div className="grid md:grid-cols-2 gap-8">
          <PatientDetailsForm data={patient} onChange={handlePatientChange} />
          <SymptomsSelector selected={symptoms} onToggle={handleToggle} />
        </div>

        {/* IMAGE */}
        <ImageUploader file={file} preview={preview} onFile={handleFile} />

        {/* BUTTON */}
        <div className="flex justify-center">
          <RunAnalysisButton loading={loading} disabled={!file} onClick={runAnalysis} />
        </div>

        {/* RESULTS */}
        {result?.images && (
          <div className="space-y-12">

            <FullImage title="Segmentation" src={result.images.segmentation} />
            <FullImage title="Grad-CAM" src={result.images.gradcam} />

            <div className="grid md:grid-cols-2 gap-6">
              <Card title="Depth" src={result.images.depth} />
              <Card title="Depth Raw" src={result.images.depth_gray} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <iframe
                src={`http://127.0.0.1:8000${result.images.three_d}`}
                className="w-full h-[600px] rounded-lg"
              />
              <img
                src={`http://127.0.0.1:8000${result.images.profile}`}
                className="w-full h-[600px] object-contain"
              />
            </div>

            <div className="grid lg:grid-cols-4 gap-6">

              <MedicalReport report={report} loading={loading} />

              <DiagnosisPanel result={result} />

              <MetricsPanel metrics={result.metrics} />

              <HistoryPanel history={history} onSelect={loadFromHistory} />

            </div>

          </div>
        )}

      </div>
    </div>
  );
}


/* COMPONENTS */

function Card({ title, src }: any) {
  if (!src) return null;
  return (
    <div className="glass-card p-4">
      <p>{title}</p>
      <img src={`http://127.0.0.1:8000${src}`} />
    </div>
  );
}

function FullImage({ title, src }: any) {
  if (!src) return null;
  return (
    <div className="glass-card p-5">
      <h3>{title}</h3>
      <img src={`http://127.0.0.1:8000${src}`} />
    </div>
  );
}

function DiagnosisPanel({ result }: any) {
  return (
    <div className="glass-card p-6">
      <h3>Diagnosis</h3>
      <p>{result?.classification?.label}</p>
      <p>{(result?.classification?.confidence * 100).toFixed(2)}%</p>
      <p>{result?.classification?.risk}</p>
    </div>
  );
}

function MetricsPanel({ metrics }: any) {
  if (!metrics) return null;
  return (
    <div className="glass-card p-6">
      <h3>Metrics</h3>
      <p>Area: {metrics.area_px}</p>
      <p>Perimeter: {metrics.perimeter_px}</p>
      <p>Roughness: {metrics.roughness}</p>
      <p>Volume: {metrics.volume}</p>
    </div>
  );
}

function HistoryPanel({ history, onSelect }: any) {
  if (!history.length) return null;

  return (
    <div className="glass-card p-6">
      <h3>History</h3>
      {history.map((h: any, i: number) => (
        <div key={i} onClick={() => onSelect(h)}>
          {h[14]} - {h[10]}
        </div>
      ))}
    </div>
  );
}