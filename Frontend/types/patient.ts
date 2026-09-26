export type Gender = "male" | "female" | "other";
export type DiabetesType = "Type 1" | "Type 2" | "Gestational" | "Pre-diabetes";

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  fullName: string;
  age: number;
  gender: Gender;
  dob: string;
  phone: string;
  email: string;
  diabetesType: DiabetesType;
  yearsWithDiabetes: number;
  latestHbA1c: number; // in %
  hba1cDate: string;
  hypertension: boolean;
  bloodPressure: string; // e.g., "135/85 mmHg"
  smokingStatus: "never" | "former" | "current";
  visualAcuityOD: string; // Right Eye, e.g. "20/25"
  visualAcuityOS: string; // Left Eye, e.g. "20/30"
  primaryCarePhysician: string;
  assignedClinic: string;
  lastScreeningDate?: string;
  totalScreenings: number;
  highestSeverityRecorded: number; // 0 to 4
  notes?: string;
  avatarUrl?: string;
}
