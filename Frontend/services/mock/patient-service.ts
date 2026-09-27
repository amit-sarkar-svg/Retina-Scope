import { Patient, CreatePatientInput, Gender } from "@/types/patient";
import { MOCK_PATIENTS } from "@/lib/mock/patients";
import { MOCK_SCREENINGS } from "@/lib/mock/screenings";
import { Screening } from "@/types/screening";

let patientsStore: Patient[] = [...MOCK_PATIENTS];

export const patientService = {
  async getPatients(query?: string): Promise<Patient[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    if (!query) return [...patientsStore];
    const q = query.toLowerCase();
    return patientsStore.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone.includes(q)
    );
  },

  async getPatientById(id: string): Promise<Patient | null> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const patient = patientsStore.find((p) => p.id === id);
    return patient ? { ...patient } : null;
  },

  async createPatient(payload: CreatePatientInput): Promise<Patient> {
    await new Promise((resolve) => setTimeout(resolve, 120));

    const normalizedGender: Gender =
      payload.gender.toLowerCase() === "female"
        ? "female"
        : payload.gender.toLowerCase() === "male"
        ? "male"
        : "other";

    const birthYear = new Date().getFullYear() - (payload.age || 45);

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      mrn: payload.patientCode.trim(),
      fullName: payload.name.trim(),
      age: Number(payload.age),
      gender: normalizedGender,
      dob: `${birthYear}-01-01`,
      phone: payload.phone.trim(),
      email: `${payload.name.toLowerCase().replace(/[^a-z0-9]/g, "") || "patient"}@retinascope.health`,
      diabetesType: "Type 2",
      yearsWithDiabetes: 5,
      latestHbA1c: 7.2,
      hba1cDate: new Date().toISOString().split("T")[0],
      hypertension: false,
      bloodPressure: "120/80 mmHg",
      smokingStatus: "never",
      visualAcuityOD: "20/20",
      visualAcuityOS: "20/20",
      primaryCarePhysician: "Dr. General Intake, MD",
      assignedClinic: "Westside Eye Screening Pavilion",
      totalScreenings: 0,
      highestSeverityRecorded: 0,
      notes: "Newly registered patient.",
    };

    patientsStore = [newPatient, ...patientsStore];
    return newPatient;
  },

  async getPatientScreenings(patientId: string): Promise<Screening[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return MOCK_SCREENINGS.filter((s) => s.patientId === patientId);
  },
};
