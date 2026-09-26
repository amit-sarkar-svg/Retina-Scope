"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  ShieldAlert,
  Edit3,
  FileSignature,
  FileText,
  Clock,
  ArrowRight,
  AlertTriangle,
  UserCheck,
  Send,
  Printer,
} from "lucide-react";
import { Screening } from "@/types/screening";
import { DRGrade, DMERisk } from "@/types/ai-result";
import { SpecialistReview } from "@/types/review";
import { screeningService } from "@/services/mock/screening-service";
import { getSeverityConfig, cn } from "@/lib/utils";

interface SpecialistReviewPanelProps {
  screening: Screening;
  className?: string;
}

export function SpecialistReviewPanel({
  screening,
  className,
}: SpecialistReviewPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const aiGrade = screening.aiResult?.predictedGrade ?? 0;
  const existingReview = screening.review;

  const [confirmedGrade, setConfirmedGrade] = useState<DRGrade>(
    existingReview?.confirmedGrade ?? aiGrade
  );
  const [confirmedDME, setConfirmedDME] = useState<DMERisk>(
    existingReview?.confirmedDME ?? screening.aiResult?.dmeRisk ?? "None"
  );
  const [overrideReason, setOverrideReason] = useState<string>(
    existingReview?.overrideReason ?? ""
  );
  const [specialistNotes, setSpecialistNotes] = useState<string>(
    existingReview?.specialistNotes ??
      `Fundus photography OD reviewed. Findings correlate with AI severity prediction. No macular involvement requiring immediate focal laser.`
  );
  const [clinicalImpression, setClinicalImpression] = useState<string>(
    existingReview?.clinicalImpression ??
      `${getSeverityConfig(aiGrade).name}. Glycemic control review recommended.`
  );
  const [referralUrgency, setReferralUrgency] = useState<
    "Routine" | "Moderate" | "Urgent (2-4 wks)" | "Emergency (24-48 hrs)" | "No Referral Needed"
  >(
    existingReview?.referralUrgency ??
      (aiGrade >= 4
        ? "Emergency (24-48 hrs)"
        : aiGrade >= 3
        ? "Urgent (2-4 wks)"
        : aiGrade >= 2
        ? "Moderate"
        : "Routine")
  );
  const [followUpMonths, setFollowUpMonths] = useState<number>(
    existingReview?.followUpMonths ?? (aiGrade >= 3 ? 1 : aiGrade >= 2 ? 6 : 12)
  );
  const [specialistName, setSpecialistName] = useState<string>(
    existingReview?.specialistName ?? "Dr. Sarah Lin, MD"
  );
  const [specialistTitle, setSpecialistTitle] = useState<string>(
    existingReview?.specialistTitle ?? "Vitreoretinal Specialist"
  );

  const isOverridden = confirmedGrade !== aiGrade;

  const reviewMutation = useMutation({
    mutationFn: () =>
      screeningService.submitSpecialistReview(screening.id, {
        status: isOverridden ? "AI Grade Overridden" : "Specialist Approved",
        specialistId: "spec-lin-01",
        specialistName,
        specialistTitle,
        specialistAffiliation: "Westside Eye Institute & Diabetic Eye Center",
        confirmedGrade,
        originalAIGrade: aiGrade,
        isOverridden,
        overrideReason: isOverridden ? overrideReason : undefined,
        confirmedDME,
        specialistNotes,
        clinicalImpression,
        recommendedTreatmentPlan: `${referralUrgency} referral protocol. Re-screen in ${followUpMonths} months.`,
        referralUrgency,
        followUpMonths,
        signedOff: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screenings"] });
      queryClient.invalidateQueries({ queryKey: ["screening", screening.id] });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      router.refresh();
    },
  });

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
            <FileSignature className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Specialist Diagnostic Sign-Off & Review
            </h2>
            <p className="text-xs text-slate-500">
              Clinical validation, grade verification, and referral authorization
            </p>
          </div>
        </div>

        {existingReview?.signedOff ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Specialist Signed Off</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-bold">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Pending Review</span>
          </div>
        )}
      </div>

      {/* Grade Comparison & Confirmation */}
      <div className="space-y-4">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Diagnostic DR Grade Verification
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {[0, 1, 2, 3, 4].map((g) => {
            const isAIOriginal = aiGrade === g;
            const isSelected = confirmedGrade === g;
            const conf = getSeverityConfig(g);

            return (
              <button
                key={g}
                type="button"
                onClick={() => setConfirmedGrade(g as DRGrade)}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative",
                  isSelected
                    ? "ring-2 ring-teal-600 border-teal-600 bg-teal-50/50 shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Grade {g}
                  </span>
                  {isAIOriginal && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-teal-100 text-teal-800 font-semibold">
                      AI: G{aiGrade}
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-medium text-slate-600 mt-1">
                  {conf.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Override Alert Reason Box */}
        {isOverridden && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>AI Grade Override Justification (Required for Audit Trail)</span>
            </div>
            <textarea
              rows={2}
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Specify clinical reasoning for overriding the AI classification (e.g. vessel artifact mistaken for intraretinal microvascular abnormality)..."
              className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-amber-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* DME Confirmation & Follow-up Window */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Diabetic Macular Edema (DME) Status
          </label>
          <select
            value={confirmedDME}
            onChange={(e) => setConfirmedDME(e.target.value as DMERisk)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="None">None - Clear Macular Architecture</option>
            <option value="Low">Low - Mild Non-Central Exudates</option>
            <option value="Moderate">Moderate - Exudates within 1 Disc Diameter</option>
            <option value="Clinically Significant (CSME)">
              Clinically Significant Diabetic Macular Edema (CSME)
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Recommended Follow-Up Interval
          </label>
          <select
            value={followUpMonths}
            onChange={(e) => setFollowUpMonths(parseInt(e.target.value, 10))}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value={1}>1 Month (Urgent Close Follow-up)</option>
            <option value={3}>3 Months (Priority Surveillance)</option>
            <option value={6}>6 Months (Moderate Follow-up)</option>
            <option value={12}>12 Months (Routine Annual Rescreening)</option>
          </select>
        </div>
      </div>

      {/* Clinical Notes & Impression */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Specialist Clinical Impression
          </label>
          <input
            type="text"
            value={clinicalImpression}
            onChange={(e) => setClinicalImpression(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Detailed Diagnostic Findings & Recommendations
          </label>
          <textarea
            rows={3}
            value={specialistNotes}
            onChange={(e) => setSpecialistNotes(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Specialist Identity & Digital Signature */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-teal-700" />
            Attending Specialist Authorization
          </span>
          {existingReview?.digitalSignatureHash && (
            <span className="text-[10px] font-mono text-slate-500 truncate max-w-xs">
              {existingReview.digitalSignatureHash}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-slate-500">Reviewer Name:</span>
            <input
              type="text"
              value={specialistName}
              onChange={(e) => setSpecialistName(e.target.value)}
              className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
            />
          </div>

          <div>
            <span className="text-[11px] text-slate-500">Credentials & Title:</span>
            <input
              type="text"
              value={specialistTitle}
              onChange={(e) => setSpecialistTitle(e.target.value)}
              className="w-full mt-0.5 p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Action Submit Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Case File</span>
        </button>

        <button
          type="button"
          onClick={() => reviewMutation.mutate()}
          disabled={reviewMutation.isPending || (isOverridden && !overrideReason)}
          className={cn(
            "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer",
            reviewMutation.isPending
              ? "bg-slate-400 text-white cursor-wait"
              : isOverridden && !overrideReason
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-teal-700 hover:bg-teal-800 text-white shadow-teal-900/20"
          )}
        >
          <FileSignature className="w-4 h-4" />
          <span>{existingReview?.signedOff ? "Update Specialist Sign-Off" : "Authorize & Sign-Off Report"}</span>
        </button>
      </div>
    </div>
  );
}
