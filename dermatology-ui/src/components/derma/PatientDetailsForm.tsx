import { User, Calendar, Clock } from "lucide-react";

interface Props {
  data: {
    patient_id: string;
    name: string;
    age: string;
    duration: string;
  };
  onChange: (key: string, value: string) => void;
}

export default function PatientDetailsForm({ data, onChange }: Props) {
  return (
    <div className="glass-card p-5 space-y-4">

      <h2 className="text-sm font-semibold text-muted-foreground">
        Patient Details
      </h2>

      {/* PATIENT ID */}
      <div className="space-y-1">
        <label className="text-xs">Patient ID</label>
        <input
          type="text"
          value={data.patient_id}
          onChange={(e) => onChange("patient_id", e.target.value)}
          placeholder="e.g. PAT-001"
          className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border focus:outline-none"
        />
      </div>

      {/* NAME */}
      <div className="space-y-1">
        <label className="text-xs">Full Name</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="John Doe"
          className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border focus:outline-none"
        />
      </div>

      {/* AGE */}
      <div className="space-y-1">
        <label className="text-xs">Age</label>
        <input
          type="number"
          value={data.age}
          onChange={(e) => onChange("age", e.target.value)}
          placeholder="25"
          className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border focus:outline-none"
        />
      </div>

      {/* DURATION */}
      <div className="space-y-1">
        <label className="text-xs">Duration</label>
        <input
          type="text"
          value={data.duration}
          onChange={(e) => onChange("duration", e.target.value)}
          placeholder="e.g. 2 weeks"
          className="w-full px-3 py-2 rounded-lg bg-secondary/40 border border-border focus:outline-none"
        />
      </div>

    </div>
  );
}