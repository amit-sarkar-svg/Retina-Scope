import { ModelAdapter } from './model.adapter';
import { NormalizedAIOutput } from '../../types/ai.types';
import {
  DRSeverity,
  DMERisk,
  ImageQualityStatus,
  UncertaintyLevel,
  ReferralPriority,
  LesionType,
} from '@prisma/client';

export class MockModel implements ModelAdapter {
  private artificialDelayMs: number;

  constructor(artificialDelayMs: number = 250) {
    this.artificialDelayMs = artificialDelayMs;
  }

  public async analyze(imagePath: string): Promise<NormalizedAIOutput> {
    // Artificial latency for realism during UI feedback testing
    if (this.artificialDelayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.artificialDelayMs));
    }

    // Generate realistic, consistent synthetic outputs based on image filename hash or seed
    const hash = this.hashString(imagePath);
    const severityProfiles = [
      {
        grade: 0,
        severity: DRSeverity.NO_DR,
        confidence: 0.96,
        dmeRisk: DMERisk.LOW,
        dmeConfidence: 0.94,
        uncertainty: UncertaintyLevel.LOW,
        priority: ReferralPriority.LOW,
        recommendation: 'Annual routine rescreening recommended. No diabetic retinopathy lesions detected.',
        lesions: [
          { type: LesionType.MICROANEURYSM, count: 0 },
          { type: LesionType.HEMORRHAGE, count: 0 },
          { type: LesionType.EXUDATE, count: 0 },
          { type: LesionType.OTHER, count: 0 },
        ],
      },
      {
        grade: 1,
        severity: DRSeverity.MILD,
        confidence: 0.89,
        dmeRisk: DMERisk.LOW,
        dmeConfidence: 0.91,
        uncertainty: UncertaintyLevel.LOW,
        priority: ReferralPriority.MEDIUM,
        recommendation: 'Follow-up screening in 6-12 months. Early microaneurysms noted.',
        lesions: [
          { type: LesionType.MICROANEURYSM, count: 3 },
          { type: LesionType.HEMORRHAGE, count: 0 },
          { type: LesionType.EXUDATE, count: 1 },
          { type: LesionType.OTHER, count: 0 },
        ],
      },
      {
        grade: 2,
        severity: DRSeverity.MODERATE,
        confidence: 0.91,
        dmeRisk: DMERisk.HIGH,
        dmeConfidence: 0.87,
        uncertainty: UncertaintyLevel.LOW,
        priority: ReferralPriority.HIGH,
        recommendation: 'Specialist ophthalmology referral within 2-4 weeks. Multiple microaneurysms and hard exudates present.',
        lesions: [
          { type: LesionType.MICROANEURYSM, count: 12 },
          { type: LesionType.HEMORRHAGE, count: 4 },
          { type: LesionType.EXUDATE, count: 7 },
          { type: LesionType.OTHER, count: 2 },
        ],
      },
      {
        grade: 3,
        severity: DRSeverity.SEVERE,
        confidence: 0.94,
        dmeRisk: DMERisk.HIGH,
        dmeConfidence: 0.92,
        uncertainty: UncertaintyLevel.MEDIUM,
        priority: ReferralPriority.CRITICAL,
        recommendation: 'Urgent specialist referral required within 1-2 weeks. Marked blot hemorrhages and cotton wool spots.',
        lesions: [
          { type: LesionType.MICROANEURYSM, count: 24 },
          { type: LesionType.HEMORRHAGE, count: 16 },
          { type: LesionType.EXUDATE, count: 11 },
          { type: LesionType.OTHER, count: 5 },
        ],
      },
      {
        grade: 4,
        severity: DRSeverity.PROLIFERATIVE,
        confidence: 0.97,
        dmeRisk: DMERisk.HIGH,
        dmeConfidence: 0.95,
        uncertainty: UncertaintyLevel.LOW,
        priority: ReferralPriority.CRITICAL,
        recommendation: 'Immediate vitreoretinal specialist intervention required. High-risk proliferative diabetic retinopathy features detected.',
        lesions: [
          { type: LesionType.MICROANEURYSM, count: 35 },
          { type: LesionType.HEMORRHAGE, count: 28 },
          { type: LesionType.EXUDATE, count: 19 },
          { type: LesionType.OTHER, count: 9 },
        ],
      },
    ];

    // Select profile (defaulting to MODERATE if deterministic hash matches index 2)
    const profileIndex = Math.abs(hash) % severityProfiles.length;
    const selected = severityProfiles[profileIndex] || severityProfiles[2];

    return {
      dr: {
        grade: selected.grade,
        severity: selected.severity,
        confidence: selected.confidence,
      },
      dme: {
        risk: selected.dmeRisk,
        confidence: selected.dmeConfidence,
      },
      imageQuality: {
        status: ImageQualityStatus.ACCEPTED,
        score: 0.94,
      },
      lesions: selected.lesions,
      uncertainty: {
        level: selected.uncertainty,
        abstain: false,
      },
      action: {
        priority: selected.priority,
        recommendation: selected.recommendation,
      },
      visualizations: {
        segmentationMaskPath: null,
        gradcamPath: null,
      },
    };
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash;
  }
}
