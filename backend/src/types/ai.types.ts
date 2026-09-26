import {
  DRSeverity,
  DMERisk,
  ImageQualityStatus,
  UncertaintyLevel,
  ReferralPriority,
  LesionType,
} from '@prisma/client';

export interface DRAnalysisResult {
  grade: number; // 0 (NO_DR) to 4 (PROLIFERATIVE)
  severity: DRSeverity;
  confidence: number;
}

export interface DMEAnalysisResult {
  risk: DMERisk;
  confidence: number;
}

export interface ImageQualityResult {
  status: ImageQualityStatus;
  score: number;
}

export interface LesionCountResult {
  type: LesionType;
  count: number;
}

export interface UncertaintyResult {
  level: UncertaintyLevel;
  abstain: boolean;
}

export interface ActionRecommendationResult {
  priority: ReferralPriority;
  recommendation: string;
}

export interface VisualizationPathsResult {
  segmentationMaskPath: string | null;
  gradcamPath: string | null;
}

export interface NormalizedAIOutput {
  dr: DRAnalysisResult;
  dme: DMEAnalysisResult;
  imageQuality: ImageQualityResult;
  lesions: LesionCountResult[];
  uncertainty: UncertaintyResult;
  action: ActionRecommendationResult;
  visualizations: VisualizationPathsResult;
}
