import { z } from "zod";
import { PatientForm, Symptom } from "@/lib/derma-types";

export const patientFieldSchemas = {
  patient_id: z
    .string()
    .trim()
    .min(1, "Patient ID is required")
    .max(50, "Max 50 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, - or _ only"),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Max 100 characters")
    .regex(/^[A-Za-z .'-]+$/, "Letters, spaces, . ' - only"),
  age: z
    .string()
    .trim()
    .min(1, "Age is required")
    .refine((v) => /^\d+$/.test(v), "Age must be a whole number")
    .refine((v) => {
      const n = Number(v);
      return n > 0 && n < 150;
    }, "Enter a realistic age (1–149)"),
  duration: z
    .string()
    .trim()
    .min(2, "Duration is required (e.g. 3 weeks)")
    .max(100, "Max 100 characters"),
} as const;

export type PatientFieldKey = keyof typeof patientFieldSchemas;

export type FieldErrors = Partial<Record<PatientFieldKey | "symptoms" | "file", string>>;

export const validateField = (key: PatientFieldKey, value: string): string | undefined => {
  const result = patientFieldSchemas[key].safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
};

export const validateAll = (form: PatientForm, file: File | null): FieldErrors => {
  const errors: FieldErrors = {};
  (Object.keys(patientFieldSchemas) as PatientFieldKey[]).forEach((k) => {
    const msg = validateField(k, form[k]);
    if (msg) errors[k] = msg;
  });
  const anySymptom = (Object.keys(form.symptoms) as Symptom[]).some((s) => form.symptoms[s]);
  if (!anySymptom) errors.symptoms = "Select at least one symptom";
  if (!file) errors.file = "Upload a lesion image";
  return errors;
};
