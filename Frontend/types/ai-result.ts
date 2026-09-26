export type DRGrade = 0 | 1 | 2 | 3 | 4;

export type DMERisk = "None" | "Low" | "Moderate" | "Clinically Significant (CSME)";

export type LesionType = 
  | "Microaneurysm"
  | "Hemorrhage"
  | "Hard Exudate"
  | "Cotton Wool Spot"
  | "Neovascularization"
  | "Intraretinal Microvascular Abnormality (IRMA)"
  | "Venous Beading";

export type AnatomicalQuadrant = 
  | "Superior-Temporal"
  | "Inferior-Temporal"
  | "Superior-Nasal"
  | "Inferior-Nasal"
  | "Macular Center"
  | "Optic Disc Region";

export interface LesionCoordinate {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  radius?: number; // percentage radius
  width?: number;
  height?: number;
  label: string;
  type: LesionType;
  confidence: number; // 0 - 1
  severity: "mild" | "moderate" | "severe";
  quadrant: AnatomicalQuadrant;
}

export interface LesionGroup {
  type: LesionType;
  count: number;
  confidence: number;
  primaryQuadrant: AnatomicalQuadrant;
  clinicalSignificance: string;
  color: string;
  coordinates: LesionCoordinate[];
}

export interface QuadrantMetric {
  quadrant: AnatomicalQuadrant;
  lesionCount: number;
  severityScore: number; // 0 - 100
  primaryLesion: string;
  vesselIntegrity: "Normal" | "Minor Tortuosity" | "Significant Beading" | "Neovascular";
}

export interface EnsembleModelVote {
  modelName: string;
  architecture: string;
  predictedGrade: DRGrade;
  confidence: number;
  weight: number;
}

export interface ImageQualityMetrics {
  gradable: boolean;
  overallScore: number; // 0 - 100
  sharpnessScore: number; // 0 - 100
  illuminationScore: number; // 0 - 100
  fieldOfViewCoverage: number; // e.g. 98%
  mediaOpacityDetected: boolean;
  motionBlurDetected: boolean;
  qualityGrade: "Excellent" | "Good" | "Acceptable" | "Suboptimal" | "Ungradable";
  feedbackNotes: string;
}

export interface ExplainabilityFeature {
  feature: string;
  category: "Vascular" | "Lesion" | "Macular" | "Disc";
  contribution: number; // -100 to +100
  description: string;
}

export interface AIAnalysisResult {
  analysisId: string;
  timestamp: string;
  modelEngineVersion: string;
  predictedGrade: DRGrade;
  predictedGradeLabel: string;
  confidence: number; // 0 to 1
  epistemicUncertainty: number; // 0 (low model uncertainty) to 1 (high)
  aleatoricUncertainty: number; // 0 (low image noise) to 1 (high)
  overallReliabilityScore: number; // 0 to 100%
  dmeRisk: DMERisk;
  dmeConfidence: number;
  macularEdemaPresent: boolean;
  totalLesionsDetected: number;
  lesionBreakdown: LesionGroup[];
  allCoordinates: LesionCoordinate[];
  quadrants: QuadrantMetric[];
  ensembleVotes: EnsembleModelVote[];
  explainabilityFeatures: ExplainabilityFeature[];
  clinicalSummary: string;
  diagnosticReasoning: string[];
  recommendedReferral: {
    urgency: "Routine" | "Moderate" | "Priority" | "Urgent" | "Emergency";
    referralRequired: boolean;
    recommendedTimeframe: string;
    actionProtocol: string;
    managementGuidance: string[];
  };
  qualityMetrics: ImageQualityMetrics;
}
