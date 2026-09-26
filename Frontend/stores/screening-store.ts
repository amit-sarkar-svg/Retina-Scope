import { create } from "zustand";
import { DRGrade, DMERisk, LesionType } from "@/types/ai-result";
import { ScreeningFilters } from "@/services/mock/screening-service";

interface RetinalViewerSettings {
  showGradCam: boolean;
  gradCamOpacity: number;
  showLesions: boolean;
  selectedLesionType: LesionType | "ALL";
  showQuadrants: boolean;
  showMaculaGuide: boolean;
  brightness: number; // -50 to 50
  contrast: number; // 50 to 150
  zoomLevel: number; // 1 to 3
  activeCoordinateId: string | null;
}

interface UploadWizardState {
  currentStep: number; // 1: Patient, 2: Upload, 3: AI Analysis, 4: Results
  selectedPatientId: string | null;
  eyeLaterality: "OD" | "OS";
  imageFile: File | null;
  imagePreviewUrl: string | null;
  operatorName: string;
  clinicLocation: string;
  notes: string;
  isProcessing: boolean;
  processingProgress: number;
  processingStageText: string;
  createdScreeningId: string | null;
}

interface ScreeningStoreState {
  // Viewer state
  viewerSettings: RetinalViewerSettings;
  setViewerSettings: (settings: Partial<RetinalViewerSettings>) => void;
  resetViewerSettings: () => void;

  // Filters state
  filters: ScreeningFilters;
  setFilters: (filters: Partial<ScreeningFilters>) => void;
  resetFilters: () => void;

  // Upload wizard
  wizard: UploadWizardState;
  setWizard: (data: Partial<UploadWizardState>) => void;
  resetWizard: () => void;
}

const initialViewerSettings: RetinalViewerSettings = {
  showGradCam: true,
  gradCamOpacity: 0.65,
  showLesions: true,
  selectedLesionType: "ALL",
  showQuadrants: false,
  showMaculaGuide: true,
  brightness: 0,
  contrast: 100,
  zoomLevel: 1,
  activeCoordinateId: null,
};

const initialWizardState: UploadWizardState = {
  currentStep: 1,
  selectedPatientId: null,
  eyeLaterality: "OD",
  imageFile: null,
  imagePreviewUrl: null,
  operatorName: "Rachel Kim, COA",
  clinicLocation: "Westside Eye Center",
  notes: "",
  isProcessing: false,
  processingProgress: 0,
  processingStageText: "Idle",
  createdScreeningId: null,
};

const initialFilters: ScreeningFilters = {
  searchQuery: "",
  grade: "all",
  status: "all",
  urgentOnly: false,
  sortBy: "date",
  sortDirection: "desc",
};

export const useScreeningStore = create<ScreeningStoreState>((set) => ({
  viewerSettings: initialViewerSettings,
  setViewerSettings: (newSettings) =>
    set((state) => ({
      viewerSettings: { ...state.viewerSettings, ...newSettings },
    })),
  resetViewerSettings: () => set({ viewerSettings: initialViewerSettings }),

  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: initialFilters }),

  wizard: initialWizardState,
  setWizard: (newData) =>
    set((state) => ({
      wizard: { ...state.wizard, ...newData },
    })),
  resetWizard: () => set({ wizard: initialWizardState }),
}));
