import {
  QualityGateAdapter,
  QualityAssessmentResult,
  QualityGateOptions,
  QualityGateStatus,
} from './quality.adapter';

export const QUALITY_ACCEPTANCE_THRESHOLD = 0.8; // 80%

export class MockQualityGate implements QualityGateAdapter {
  private defaultScore: number = 0.94;

  public setDefaultScore(score: number): void {
    this.defaultScore = Math.max(0, Math.min(1, score));
  }

  public async assess(
    imagePath: string,
    options?: QualityGateOptions
  ): Promise<QualityAssessmentResult> {
    // Simulate lightweight quality neural network inference latency (100ms - 250ms)
    await new Promise(resolve => setTimeout(resolve, 150));

    let score: number;

    // 1. Explicit forceScore takes precedence for deterministic test cases
    if (options?.forceScore !== undefined) {
      score = Math.max(0, Math.min(1, options.forceScore));
    } else if (options?.testScenario) {
      switch (options.testScenario) {
        case 'PASS_HIGH':
          score = 0.95;
          break;
        case 'PASS_BORDERLINE':
          score = 0.8;
          break;
        case 'FAIL_BORDERLINE':
          score = 0.79;
          break;
        case 'FAIL_LOW':
          score = 0.65;
          break;
        case 'RANDOM':
        default:
          score = Math.round((0.75 + Math.random() * 0.23) * 100) / 100;
          break;
      }
    } else {
      // 2. Check filename hints for developer / QA manual test control
      const lower = imagePath.toLowerCase();
      if (lower.includes('fail') || lower.includes('reject') || lower.includes('blur') || lower.includes('poor')) {
        score = 0.67;
      } else if (lower.includes('borderline_pass') || lower.includes('pass_80')) {
        score = 0.8;
      } else if (lower.includes('borderline_fail') || lower.includes('fail_79')) {
        score = 0.79;
      } else {
        score = this.defaultScore;
      }
    }

    const percentage = Math.round(score * 100);
    const isPassed = score >= QUALITY_ACCEPTANCE_THRESHOLD;
    const status: QualityGateStatus = isPassed ? 'PASSED' : 'FAILED';

    const reason = isPassed
      ? 'The retinal image meets the minimum quality requirement and can proceed to AI analysis.'
      : 'This retinal image does not meet the minimum quality requirement for AI analysis (minimum 80% required). Please upload a clearer retinal scan.';

    return {
      score,
      percentage,
      status,
      reason,
      metadata: {
        sharpness: Math.round(score * 98) / 100,
        illumination: Math.round(score * 95) / 100,
        fieldOfViewClarity: Math.round(score * 97) / 100,
        artifactPresence: !isPassed,
      },
    };
  }
}
