import { Patient } from "./patient";
import { AIAnalysisResult, DRGrade } from "./ai-result";
import { SpecialistReview, ReviewStatus } from "./review";

export type EyeLaterality = "OD" | "OS"; // OD = Right Eye, OS = Left Eye

export type QualityStatus = "PENDING" | "PASSED" | "FAILED";

export type ScreeningWorkflowStep = 
  | 1 // 1: Patient Selection
  | 2 // 2: Scan Upload
  | 3 // 3: Image Quality Gate
  | 4 // 4: AI Pipeline Inference
  | 5; // 5: Screening Result

export type ScreeningStatus = 
  | "Processing" 
  | "AI Screened" 
  | "Pending Review" 
  | "Under Review" 
  | "Completed" 
  | "Referred" 
  | "Flagged Rescan"
  | "QUALITY_REJECTED"
  | "QUALITY_PASSED"
  | "UPLOADED";

export interface QualityCheckResponse {
  screeningId: string;
  qualityScore: number;
  qualityPercentage: number;
  status: "PASSED" | "FAILED";
  canProceed: boolean;
  reason?: string;
  checkedAt: string;
  metadata?: {
    sharpness?: number;
    illumination?: number;
    fieldOfViewClarity?: number;
    artifactPresence?: boolean;
  };
}

export interface RetinalImageMetadata {
  imageId: string;
  originalFileName: string;
  fileSizeBytes: number;
  resolution: string; // e.g., "3840x2160 px"
  capturedAt: string;
  laterality: EyeLaterality;
  modality: "Color Fundus Photography (CFP)" | "Ultra-widefield (UWF)" | "OCT Angiography";
  fieldOfView: "45-degree Macula-Centered" | "45-degree Disc-Centered" | "200-degree UWF";
  cameraDevice: string; // e.g. "Canon CR-2 AF / Topcon TRC-NW400"
  imageUrl: string;
  thumbnailUrl: string;
  gradcamHeatmapUrl?: string;
}

export interface Screening {
  id: string;
  accessionNumber: string; // e.g. "RS-2026-8839"
  patientId: string;
  patient: Patient;
  createdAt: string;
  completedAt?: string;
  status: ScreeningStatus;
  reviewStatus: ReviewStatus;
  qualityStatus?: QualityStatus;
  qualityScore?: number;
  qualityReason?: string;
  qualityCheckedAt?: string;
  primaryEye: EyeLaterality;
  secondaryEye?: EyeLaterality;
  primaryImage: RetinalImageMetadata;
  secondaryImage?: RetinalImageMetadata;
  aiResult?: AIAnalysisResult;
  review?: SpecialistReview;
  operatorName: string;
  clinicLocation: string;
  priorityScore: number; // 0 to 100 for triage sorting
  isFlaggedForUrgentReview: boolean;
  notes?: string;
}
