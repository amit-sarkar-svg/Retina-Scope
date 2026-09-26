"use client";

import Link from "next/link";
import { AIAnalysisResult } from "@/types/ai-result";
import { cn } from "@/lib/utils";
import {
  Calendar,
  AlertOctagon,
  ArrowRight,
  ClipboardList,
  CheckCircle,
  FileCheck,
  Stethoscope,
} from "lucide-react";

interface RecommendedActionCardProps {
  screeningId: string;
  aiResult: AIAnalysisResult;
  className?: string;
}

export function RecommendedActionCard({
  screeningId,
  aiResult,
  className,
}: RecommendedActionCardProps) {
  const referral = aiResult.recommendedReferral;
  const isUrgent = referral.urgency === "Urgent" || referral.urgency === "Emergency";

  return (
    <div
      className={cn(
        "rounded-2xl border shadow-sm p-6 flex flex-col justify-between gap-5",
        isUrgent
          ? "bg-rose-50/40 border-rose-200"
          : "bg-white border-slate-200/90",
        className
      )}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "p-2 rounded-xl",
                isUrgent ? "bg-rose-100 text-rose-700" : "bg-teal-50 text-teal-700"
              )}
            >
              <Stethoscope className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Clinical Recommendation & Referral Pathway
              </h3>
              <p className="text-xs text-slate-500">
                Evidence-based Diabetic Retinopathy clinical triage protocol
              </p>
            </div>
          </div>

          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
              isUrgent
                ? "bg-rose-100 text-rose-800 border-rose-300 animate-pulse"
                : "bg-slate-100 text-slate-700 border-slate-300"
            )}
          >
            {referral.urgency} Urgency
          </span>
        </div>

        {/* Time Window Banner */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-teal-600" />
            <div>
              <div className="text-xs text-slate-500 font-medium">Recommended Timeframe</div>
              <div className="text-sm font-bold text-slate-900 font-mono">
                {referral.recommendedTimeframe}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Triage Protocol</div>
            <div className="text-xs font-semibold text-teal-800">
              {referral.actionProtocol}
            </div>
          </div>
        </div>

        {/* Clinical Management Guidance Points */}
        <div>
          <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5 text-teal-600" />
            <span>Recommended Clinical Actions:</span>
          </div>
          <ul className="space-y-1.5">
            {referral.managementGuidance.map((guide, idx) => (
              <li
                key={idx}
                className="text-xs text-slate-600 flex items-start gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100"
              >
                <CheckCircle className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                <span>{guide}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Specialist Review Routing CTA */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
        <span className="text-xs text-slate-500">
          Specialist verification required before dispatching external referral.
        </span>
        <Link
          href={`/screenings/${screeningId}/review`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all shrink-0"
        >
          <span>Open Specialist Review</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
