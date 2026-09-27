import { Screening, ScreeningStatus } from "@/types/screening";
import { SpecialistReview } from "@/types/review";
import { AIAnalysisResult, DRGrade } from "@/types/ai-result";
import { MOCK_SCREENINGS } from "@/lib/mock/screenings";
import { MOCK_PATIENTS } from "@/lib/mock/patients";
import { generateFundusSvgDataUrl } from "@/lib/mock/fundus-generator";
import { patientService } from "@/services/mock/patient-service";

// Local in-memory store so mutations in the session persist during runtime
let screeningsStore: Screening[] = [...MOCK_SCREENINGS];

export interface ScreeningFilters {
  searchQuery?: string;
  grade?: DRGrade | "all";
  status?: ScreeningStatus | "all";
  urgentOnly?: boolean;
  clinic?: string;
  sortBy?: "date" | "priority" | "grade" | "patientName";
  sortDirection?: "asc" | "desc";
}

export interface ScreeningMetrics {
  totalScreened: number;
  urgentTriageCount: number;
  pendingReviewCount: number;
  completedCount: number;
  averageAIConfidence: number;
  specialistConcordanceRate: number; // e.g. 96.2%
  severityDistribution: { grade: string; count: number; percentage: number; color: string }[];
  weeklyThroughput: { day: string; screenings: number; referred: number }[];
}

export const screeningService = {
  async getScreenings(filters: ScreeningFilters = {}): Promise<Screening[]> {
    // Simulate minimal network latency
    await new Promise((resolve) => setTimeout(resolve, 80));

    let result = [...screeningsStore];

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.patient.fullName.toLowerCase().includes(q) ||
          s.patient.mrn.toLowerCase().includes(q) ||
          s.accessionNumber.toLowerCase().includes(q)
      );
    }

    if (filters.grade !== undefined && filters.grade !== "all") {
      result = result.filter((s) => s.aiResult?.predictedGrade === filters.grade);
    }

    if (filters.status && filters.status !== "all") {
      result = result.filter((s) => s.status === filters.status);
    }

    if (filters.urgentOnly) {
      result = result.filter((s) => s.isFlaggedForUrgentReview);
    }

    if (filters.sortBy) {
      result.sort((a, b) => {
        let diff = 0;
        if (filters.sortBy === "date") {
          diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (filters.sortBy === "priority") {
          diff = b.priorityScore - a.priorityScore;
        } else if (filters.sortBy === "grade") {
          diff = (b.aiResult?.predictedGrade ?? -1) - (a.aiResult?.predictedGrade ?? -1);
        } else if (filters.sortBy === "patientName") {
          diff = a.patient.fullName.localeCompare(b.patient.fullName);
        }
        return filters.sortDirection === "asc" ? -diff : diff;
      });
    }

    return result;
  },

  async getScreeningById(id: string): Promise<Screening | null> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const found = screeningsStore.find((s) => s.id === id);
    return found ? { ...found } : null;
  },

  async checkQuality(payload: {
    screeningId?: string;
    imagePreviewUrl?: string;
    forceScore?: number;
    scenario?: "DEFAULT_94" | "PASS_80" | "FAIL_79" | "FAIL_67" | null;
  }): Promise<{
    screeningId: string;
    qualityScore: number;
    qualityPercentage: number;
    status: "PASSED" | "FAILED";
    canProceed: boolean;
    reason: string;
    checkedAt: string;
    metadata: {
      sharpness: number;
      illumination: number;
      fieldOfViewClarity: number;
      artifactPresence: boolean;
    };
  }> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    let score = 0.94;
    if (payload.forceScore !== undefined) {
      score = payload.forceScore;
    } else if (payload.scenario === "PASS_80") {
      score = 0.8;
    } else if (payload.scenario === "FAIL_79") {
      score = 0.79;
    } else if (payload.scenario === "FAIL_67") {
      score = 0.67;
    }

    const percentage = Math.round(score * 100);
    const isPassed = score >= 0.8;
    const status = isPassed ? "PASSED" : "FAILED";
    const checkedAt = new Date().toISOString();

    const reason = isPassed
      ? "The retinal image meets the minimum quality requirement and can proceed to AI analysis."
      : "This retinal image does not meet the minimum quality requirement for AI analysis (minimum 80% required). Please upload a clearer retinal scan.";

    return {
      screeningId: payload.screeningId || `scr-${Date.now()}`,
      qualityScore: score,
      qualityPercentage: percentage,
      status,
      canProceed: isPassed,
      reason,
      checkedAt,
      metadata: {
        sharpness: Math.round(score * 98) / 100,
        illumination: Math.round(score * 95) / 100,
        fieldOfViewClarity: Math.round(score * 97) / 100,
        artifactPresence: !isPassed,
      },
    };
  },

  async createScreening(payload: {
    patientId: string;
    primaryEye: "OD" | "OS";
    imageFile?: File;
    imagePreviewUrl?: string;
    operatorName: string;
    clinicLocation: string;
    notes?: string;
    qualityScore?: number;
    qualityStatus?: "PENDING" | "PASSED" | "FAILED";
  }): Promise<Screening> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const patient = (await patientService.getPatientById(payload.patientId)) || MOCK_PATIENTS.find((p) => p.id === payload.patientId) || MOCK_PATIENTS[0];
    const newId = `scr-${Date.now()}`;
    const accessionNumber = `RS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const qualityStatus = payload.qualityStatus || "PASSED";
    const qualityScore = payload.qualityScore !== undefined ? payload.qualityScore : 0.94;

    // Hard check: If quality has NOT passed, do not generate AI result!
    if (qualityStatus === "FAILED") {
      const failedScreening: Screening = {
        id: newId,
        accessionNumber,
        patientId: patient.id,
        patient,
        createdAt: new Date().toISOString(),
        status: "QUALITY_REJECTED",
        reviewStatus: "Pending Review",
        qualityStatus: "FAILED",
        qualityScore,
        qualityReason: "Image quality below required threshold (80%). Recapture requested.",
        qualityCheckedAt: new Date().toISOString(),
        primaryEye: payload.primaryEye,
        priorityScore: 0,
        isFlaggedForUrgentReview: false,
        operatorName: payload.operatorName || "Clinical Screener Staff",
        clinicLocation: payload.clinicLocation || "Main Eye Screening Pavilion",
        notes: payload.notes,
        primaryImage: {
          imageId: `img-${Date.now()}`,
          originalFileName: payload.imageFile?.name || `${patient.fullName.toUpperCase().replace(/\s+/g, "_")}_${payload.primaryEye}.jpg`,
          fileSizeBytes: payload.imageFile?.size || 14200000,
          resolution: "3840 x 2880 px",
          capturedAt: new Date().toISOString(),
          laterality: payload.primaryEye,
          modality: "Color Fundus Photography (CFP)",
          fieldOfView: "45-degree Macula-Centered",
          cameraDevice: "Topcon TRC-NW400 Digital Retinal Camera",
          imageUrl: payload.imagePreviewUrl || "",
          thumbnailUrl: payload.imagePreviewUrl || "",
        },
        aiResult: undefined, // NO AI RESULT FOR FAILED QUALITY GATE
      };
      screeningsStore = [failedScreening, ...screeningsStore];
      return failedScreening;
    }

    // Default simulated grade based on patient HbA1c or random clinical profile
    const simulatedGrade: DRGrade = patient.latestHbA1c > 9.0 ? 3 : patient.latestHbA1c > 8.0 ? 2 : 1;
    const fundusImg = payload.imagePreviewUrl || generateFundusSvgDataUrl(simulatedGrade, payload.primaryEye);

    const newScreening: Screening = {
      id: newId,
      accessionNumber,
      patientId: patient.id,
      patient,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: "AI Screened",
      reviewStatus: "Pending Review",
      qualityStatus: "PASSED",
      qualityScore,
      qualityReason: "Image meets minimum clinical quality requirement (>=80%).",
      qualityCheckedAt: new Date().toISOString(),
      primaryEye: payload.primaryEye,
      priorityScore: simulatedGrade >= 3 ? 85 : simulatedGrade >= 2 ? 60 : 30,
      isFlaggedForUrgentReview: simulatedGrade >= 3,
      operatorName: payload.operatorName || "Clinical Screener Staff",
      clinicLocation: payload.clinicLocation || "Main Eye Screening Pavilion",
      notes: payload.notes,
      primaryImage: {
        imageId: `img-${Date.now()}`,
        originalFileName: payload.imageFile?.name || `${patient.fullName.toUpperCase().replace(/\s+/g, "_")}_${payload.primaryEye}.dcm`,
        fileSizeBytes: payload.imageFile?.size || 14200000,
        resolution: "3840 x 2880 px",
        capturedAt: new Date().toISOString(),
        laterality: payload.primaryEye,
        modality: "Color Fundus Photography (CFP)",
        fieldOfView: "45-degree Macula-Centered",
        cameraDevice: "Topcon TRC-NW400 Digital Retinal Camera",
        imageUrl: fundusImg,
        thumbnailUrl: fundusImg,
      },
      aiResult: generateSimulatedAIResult(simulatedGrade),
    };

    screeningsStore = [newScreening, ...screeningsStore];
    return newScreening;
  },

  async submitSpecialistReview(
    screeningId: string,
    reviewPayload: Omit<SpecialistReview, "reviewId" | "screeningId" | "reviewedAt">
  ): Promise<Screening> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const screeningIndex = screeningsStore.findIndex((s) => s.id === screeningId);
    if (screeningIndex === -1) {
      throw new Error("Screening not found");
    }

    const current = screeningsStore[screeningIndex];
    const updatedReview: SpecialistReview = {
      ...reviewPayload,
      reviewId: `rev-${Date.now()}`,
      screeningId,
      reviewedAt: new Date().toISOString(),
      digitalSignatureHash: `SHA256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      signedOff: true,
    };

    const updatedScreening: Screening = {
      ...current,
      status: "Completed",
      reviewStatus: updatedReview.isOverridden ? "AI Grade Overridden" : "Specialist Approved",
      review: updatedReview,
      completedAt: new Date().toISOString(),
    };

    screeningsStore[screeningIndex] = updatedScreening;
    return updatedScreening;
  },

  async getScreeningMetrics(): Promise<ScreeningMetrics> {
    await new Promise((resolve) => setTimeout(resolve, 80));

    const total = screeningsStore.length;
    const urgent = screeningsStore.filter((s) => s.isFlaggedForUrgentReview).length;
    const pending = screeningsStore.filter((s) => s.reviewStatus === "Pending Review" || s.reviewStatus === "Under Specialist Review").length;
    const completed = screeningsStore.filter((s) => s.status === "Completed").length;

    const grades = [
      { grade: "Grade 0 (No DR)", count: 0, color: "#10B981" },
      { grade: "Grade 1 (Mild)", count: 0, color: "#0284C7" },
      { grade: "Grade 2 (Moderate)", count: 0, color: "#D97706" },
      { grade: "Grade 3 (Severe)", count: 0, color: "#EA580C" },
      { grade: "Grade 4 (PDR)", count: 0, color: "#E11D48" },
    ];

    screeningsStore.forEach((s) => {
      const g = s.aiResult?.predictedGrade ?? 0;
      if (g >= 0 && g <= 4) {
        grades[g].count += 1;
      }
    });

    const severityDistribution = grades.map((g) => ({
      ...g,
      percentage: total > 0 ? Math.round((g.count / total) * 100) : 0,
    }));

    return {
      totalScreened: 248, // realistic clinical aggregate
      urgentTriageCount: urgent + 14,
      pendingReviewCount: pending + 6,
      completedCount: completed + 218,
      averageAIConfidence: 95.8,
      specialistConcordanceRate: 97.4,
      severityDistribution,
      weeklyThroughput: [
        { day: "Mon", screenings: 38, referred: 6 },
        { day: "Tue", screenings: 44, referred: 8 },
        { day: "Wed", screenings: 52, referred: 11 },
        { day: "Thu", screenings: 41, referred: 7 },
        { day: "Fri", screenings: 49, referred: 9 },
        { day: "Sat", screenings: 24, referred: 3 },
      ],
    };
  },
};

function generateSimulatedAIResult(grade: DRGrade): AIAnalysisResult {
  const isSevere = grade >= 3;
  const isModerate = grade === 2;
  const isMild = grade === 1;

  return {
    analysisId: `ai-inf-${Date.now()}`,
    timestamp: new Date().toISOString(),
    modelEngineVersion: "RetinaScope DeepEnsemble-v3.4.2 [Validated CE/FDA-SaMD]",
    predictedGrade: grade,
    predictedGradeLabel:
      grade === 0
        ? "No Apparent Diabetic Retinopathy"
        : grade === 1
        ? "Mild Non-Proliferative Diabetic Retinopathy"
        : grade === 2
        ? "Moderate Non-Proliferative Diabetic Retinopathy"
        : grade === 3
        ? "Severe Non-Proliferative Diabetic Retinopathy"
        : "Proliferative Diabetic Retinopathy (PDR)",
    confidence: isSevere ? 0.96 : isModerate ? 0.93 : isMild ? 0.94 : 0.99,
    epistemicUncertainty: 0.05,
    aleatoricUncertainty: 0.04,
    overallReliabilityScore: 96.5,
    dmeRisk: isSevere ? "Clinically Significant (CSME)" : isModerate ? "Low" : "None",
    dmeConfidence: 0.91,
    macularEdemaPresent: isSevere,
    totalLesionsDetected: isSevere ? 34 : isModerate ? 16 : isMild ? 4 : 0,
    lesionBreakdown: [
      {
        type: isSevere ? "Hemorrhage" : "Microaneurysm",
        count: isSevere ? 22 : isModerate ? 10 : isMild ? 4 : 0,
        confidence: 0.95,
        primaryQuadrant: "Superior-Temporal",
        clinicalSignificance: isSevere ? "Deep blot hemorrhages exceeding 4-2-1 criteria." : "Isolated capillary microaneurysms.",
        color: "#991B1B",
        coordinates: [
          { x: 56, y: 36, width: 4, height: 4, label: "Focal Lesion", type: isSevere ? "Hemorrhage" : "Microaneurysm", confidence: 0.95, severity: isSevere ? "severe" : "mild", quadrant: "Superior-Temporal" },
        ],
      },
    ],
    allCoordinates: [
      { x: 56, y: 36, width: 4, height: 4, label: "Focal Lesion", type: isSevere ? "Hemorrhage" : "Microaneurysm", confidence: 0.95, severity: isSevere ? "severe" : "mild", quadrant: "Superior-Temporal" },
    ],
    quadrants: [
      { quadrant: "Superior-Temporal", lesionCount: isSevere ? 16 : 3, severityScore: isSevere ? 88 : 25, primaryLesion: isSevere ? "Hemorrhages" : "Microaneurysms", vesselIntegrity: isSevere ? "Significant Beading" : "Normal" },
      { quadrant: "Inferior-Temporal", lesionCount: isSevere ? 10 : 1, severityScore: isSevere ? 72 : 15, primaryLesion: "Hemorrhages", vesselIntegrity: "Normal" },
      { quadrant: "Superior-Nasal", lesionCount: isSevere ? 5 : 0, severityScore: isSevere ? 55 : 0, primaryLesion: "None", vesselIntegrity: "Normal" },
      { quadrant: "Inferior-Nasal", lesionCount: isSevere ? 3 : 0, severityScore: isSevere ? 40 : 0, primaryLesion: "None", vesselIntegrity: "Normal" },
      { quadrant: "Macular Center", lesionCount: isSevere ? 2 : 0, severityScore: isSevere ? 65 : 0, primaryLesion: isSevere ? "Hard Exudate" : "Clear", vesselIntegrity: "Normal" },
      { quadrant: "Optic Disc Region", lesionCount: 0, severityScore: 5, primaryLesion: "Normal", vesselIntegrity: "Normal" },
    ],
    ensembleVotes: [
      { modelName: "Vision Transformer ViT-H/14", architecture: "Dual-Path Transformer", predictedGrade: grade, confidence: 0.96, weight: 0.4 },
      { modelName: "EfficientNetV2-XL Retina", architecture: "Compound Scaled CNN", predictedGrade: grade, confidence: 0.95, weight: 0.35 },
      { modelName: "DenseNet-201 Clinical", architecture: "Dense Connected Feature", predictedGrade: grade, confidence: 0.94, weight: 0.25 },
    ],
    explainabilityFeatures: [
      { feature: "Microvascular Architecture", category: "Vascular", contribution: 60, description: "Caliber and continuity of primary vessel branches." },
      { feature: "Intraretinal Hemorrhage Mass", category: "Lesion", contribution: 30, description: "Distribution of focal blood extravasation." },
      { feature: "Macular Perfusion Zone", category: "Macular", contribution: 10, description: "Foveal avascular zone circularity." },
    ],
    clinicalSummary: `Automated AI screening evaluated scan as Grade ${grade}. Consistent with clinical findings.`,
    diagnosticReasoning: [
      `Ensemble consensus confirmed Grade ${grade}.`,
      "Epistemic uncertainty within certified safety margins (<0.10).",
    ],
    recommendedReferral: {
      urgency: isSevere ? "Urgent" : isModerate ? "Moderate" : "Routine",
      referralRequired: grade >= 2,
      recommendedTimeframe: isSevere ? "Within 2 to 4 weeks" : isModerate ? "Within 4 to 6 weeks" : "12 months",
      actionProtocol: isSevere ? "Specialist Comprehensive Retina Exam" : "Routine Surveillance",
      managementGuidance: [
        "Optimize glycemic and hypertensive control.",
        "Follow clinical referral guidelines.",
      ],
    },
    qualityMetrics: {
      gradable: true,
      overallScore: 95,
      sharpnessScore: 94,
      illuminationScore: 96,
      fieldOfViewCoverage: 98,
      mediaOpacityDetected: false,
      motionBlurDetected: false,
      qualityGrade: "Excellent",
      feedbackNotes: "Clear 45-degree field of view with crisp vessel contours.",
    },
  };
}
