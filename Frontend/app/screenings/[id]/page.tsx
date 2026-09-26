"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  FileCheck,
  FileSignature,
  Printer,
  ShieldCheck,
  User,
  Activity,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";
import { screeningService } from "@/services/mock/screening-service";
import { RetinalViewer } from "@/components/screening/RetinalViewer";
import { SeverityCard } from "@/components/screening/SeverityCard";
import { LesionAnalysisTable } from "@/components/screening/LesionAnalysisTable";
import { AnatomicalQuadrantMap } from "@/components/screening/AnatomicalQuadrantMap";
import { GradCamExplanation } from "@/components/screening/GradCamExplanation";
import { RecommendedActionCard } from "@/components/screening/RecommendedActionCard";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function ScreeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: screening, isLoading } = useQuery({
    queryKey: ["screening", id],
    queryFn: () => screeningService.getScreeningById(id),
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm">
        Loading clinical screening examination...
      </div>
    );
  }

  if (!screening) {
    notFound();
  }

  const patient = screening.patient;
  const aiResult = screening.aiResult;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Patient Header & Case Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <Link
            href="/screenings"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
            title="Back to Screening Queue"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {patient.fullName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-700">
                {patient.mrn}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800">
                {screening.primaryEye === "OD" ? "Right Eye (OD)" : "Left Eye (OS)"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>{patient.age} yrs ({patient.gender})</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">{patient.diabetesType} ({patient.yearsWithDiabetes} yrs)</span>
              <span>•</span>
              <span>HbA1c: <strong className="text-teal-800">{patient.latestHbA1c}%</strong></span>
              <span>•</span>
              <span>Exam Date: {formatDate(screening.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Link
            href={`/screenings/${screening.id}/review`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <FileSignature className="w-4 h-4" />
            <span>Specialist Sign-Off</span>
          </Link>

          <Link
            href="/reports"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs transition-colors"
            title="Generate Clinical Report"
          >
            <Printer className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Retinal Viewer & Severity Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: High-Resolution Retinal Viewer */}
        <div className="lg:col-span-7 space-y-4">
          <RetinalViewer
            image={screening.primaryImage}
            aiResult={aiResult}
            patientName={patient.fullName}
          />
        </div>

        {/* Right Column: ICDR Diagnostic Severity & Confidence Card */}
        <div className="lg:col-span-5 space-y-6">
          {aiResult && <SeverityCard aiResult={aiResult} />}
          {aiResult && (
            <RecommendedActionCard
              screeningId={screening.id}
              aiResult={aiResult}
            />
          )}
        </div>
      </div>

      {/* Lower Section: Explainability & Anatomical Breakdown Grid */}
      {aiResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lesion Quantitative Table */}
          <div className="lg:col-span-7 space-y-6">
            <LesionAnalysisTable
              lesions={aiResult.lesionBreakdown}
              totalCount={aiResult.totalLesionsDetected}
            />
            <GradCamExplanation aiResult={aiResult} />
          </div>

          {/* Anatomical Quadrant Map & Specialist Status */}
          <div className="lg:col-span-5 space-y-6">
            <AnatomicalQuadrantMap quadrants={aiResult.quadrants} />

            {/* Specialist Sign-Off Snippet */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Specialist Review Status
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {screening.reviewStatus}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {screening.review?.specialistNotes ||
                  "Case awaiting ophthalmologist sign-off. Open specialist workstation to confirm diagnosis."}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {screening.review?.specialistName ? `Signed by: ${screening.review.specialistName}` : "Unsigned Draft"}
                </span>
                <Link
                  href={`/screenings/${screening.id}/review`}
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  Edit Sign-Off →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
