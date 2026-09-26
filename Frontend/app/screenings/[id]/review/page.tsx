"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Eye, FileSignature, ShieldCheck } from "lucide-react";
import { screeningService } from "@/services/mock/screening-service";
import { SpecialistReviewPanel } from "@/components/review/SpecialistReviewPanel";
import { RetinalViewer } from "@/components/screening/RetinalViewer";

export default function SpecialistReviewPage({
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
        Loading specialist review workstation...
      </div>
    );
  }

  if (!screening) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/screenings/${screening.id}`}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Specialist Review Workstation
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Reviewing case: <strong className="text-slate-800">{screening.patient.fullName}</strong> (MRN: {screening.patient.mrn}) • {screening.accessionNumber}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-xs font-semibold text-teal-800">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Attending Ophthalmologist Sign-Off Mode</span>
        </div>
      </div>

      {/* 2-Column Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Retinal Fundus Viewer Reference */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-teal-600" />
            <span>Fundus Scan & Pathology Reference</span>
          </div>
          <RetinalViewer
            image={screening.primaryImage}
            aiResult={screening.aiResult}
            patientName={screening.patient.fullName}
          />
        </div>

        {/* Right: Specialist Review Verification Panel */}
        <div className="lg:col-span-6 space-y-4">
          <SpecialistReviewPanel screening={screening} />
        </div>
      </div>
    </div>
  );
}
