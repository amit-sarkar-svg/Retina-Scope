import { Patient } from "@/types/patient";
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
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q)
    );
  },

  async getPatientById(id: string): Promise<Patient | null> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const patient = patientsStore.find((p) => p.id === id);
    return patient ? { ...patient } : null;
  },

  async createPatient(payload: Omit<Patient, "id" | "totalScreenings" | "highestSeverityRecorded">): Promise<Patient> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const newPatient: Patient = {
      ...payload,
      id: `pat-${Date.now()}`,
      totalScreenings: 0,
      highestSeverityRecorded: 0,
    };
    patientsStore = [newPatient, ...patientsStore];
    return newPatient;
  },

  async getPatientScreenings(patientId: string): Promise<Screening[]> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return MOCK_SCREENINGS.filter((s) => s.patientId === patientId);
  },
};
