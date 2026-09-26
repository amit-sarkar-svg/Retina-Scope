import { DRGrade, DMERisk } from "./ai-result";

export type ReviewStatus = 
  | "Pending Review" 
  | "Under Specialist Review" 
  | "Specialist Approved" 
  | "AI Grade Overridden" 
  | "Second Opinion Requested" 
  | "Referred to Retina Clinic";

export interface SpecialistReview {
  reviewId: string;
  screeningId: string;
  status: ReviewStatus;
  specialistId: string;
  specialistName: string;
  specialistTitle: string;
  specialistAffiliation: string;
  reviewedAt?: string;
  confirmedGrade: DRGrade;
  originalAIGrade: DRGrade;
  isOverridden: boolean;
  overrideReason?: string;
  confirmedDME: DMERisk;
  specialistNotes: string;
  clinicalImpression: string;
  recommendedTreatmentPlan: string;
  referralUrgency: "Routine" | "Moderate" | "Urgent (2-4 wks)" | "Emergency (24-48 hrs)" | "No Referral Needed";
  followUpMonths: number;
  digitalSignatureHash?: string;
  signedOff: boolean;
}
