import { useState } from "react";

import Header from "@/components/derma/Header";
import PatientDetailsForm from "@/components/derma/PatientDetailsForm";
import SymptomsSelector from "@/components/derma/SymptomsSelector";
import ImageUploader from "@/components/derma/ImageUploader";
import RunAnalysisButton from "@/components/derma/RunAnalysisButton";
import MedicalReport from "@/components/derma/MedicalReport";
import WolframClinicalIntelligence from "@/components/derma/WolframClinicalIntelligence";

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

    let wolframAnalysis = null;
    if (record[15]) {
      try {
        wolframAnalysis = typeof record[15] === "string" ? JSON.parse(record[15]) : record[15];
      } catch (err) {
        console.error("Error parsing historical Wolfram analysis:", err);
      }
    }

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
      wolfram_analysis: wolframAnalysis,
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

            <CroppedCompositeGrid titleLeft="Depth" srcLeft={result.images.depth} titleRight="Depth Raw" srcRight={result.images.depth_gray} />

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

            <WolframClinicalIntelligence analysis={result.wolfram_analysis} loading={loading} classification={result.classification} />

            <div className="grid lg:grid-cols-3 gap-6">

              <MedicalReport report={report} loading={loading} />


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

/* NEW COMPONENTS */

function FullImage({ title, src }: any) {
  if (!src) return null;
  return (
    <div className="glass-card p-5">
      <h3 className="mb-2">{title}</h3>
      <img
        src={`http://127.0.0.1:8000${src}`}
        alt={title}
        className="w-full h-auto object-contain rounded-md"
      />
    </div>
  );
}

/**
 * Displays two images side‑by‑side (or stacked on small screens) with titles.
 * The component ensures the images expand to fill the available width while
 * preserving aspect ratio.
 */
function CroppedCompositeGrid({
  titleLeft,
  srcLeft,
  titleRight,
  srcRight,
}: {
  titleLeft: string;
  srcLeft: string;
  titleRight: string;
  srcRight: string;
}) {
  if (!srcLeft && !srcRight) return null;
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {srcLeft && (
        <div className="glass-card p-5">
          <h3 className="mb-2">{titleLeft}</h3>
          <img
            src={`http://127.0.0.1:8000${srcLeft}`}
            alt={titleLeft}
            className="w-full h-auto object-contain rounded-md"
          />
        </div>
      )}
      {srcRight && (
        <div className="glass-card p-5">
          <h3 className="mb-2">{titleRight}</h3>
          <img
            src={`http://127.0.0.1:8000${srcRight}`}
            alt={titleRight}
            className="w-full h-auto object-contain rounded-md"
          />
        </div>
      )}
    </div>
  );
}