export type QualityGateStatus = 'PASSED' | 'FAILED';

export interface QualityAssessmentResult {
  score: number; // Normalized float between 0.0 and 1.0 (e.g., 0.94)
  percentage: number; // 0 to 100 (e.g., 94)
  status: QualityGateStatus;
  reason?: string;
  metadata?: {
    sharpness?: number;
    illumination?: number;
    fieldOfViewClarity?: number;
    artifactPresence?: boolean;
    [key: string]: unknown;
  };
}

export interface QualityGateOptions {
  forceScore?: number;
  testScenario?: 'PASS_HIGH' | 'PASS_BORDERLINE' | 'FAIL_BORDERLINE' | 'FAIL_LOW' | 'RANDOM';
}

export interface QualityGateAdapter {
  assess(imagePath: string, options?: QualityGateOptions): Promise<QualityAssessmentResult>;
}
