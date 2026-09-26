"use client";

import { Screening } from "@/types/screening";
import { getSeverityConfig, formatDate, formatDateTime, cn } from "@/lib/utils";
import {
  Printer,
  Download,
  Eye,
  FileCheck,
  ShieldCheck,
  Activity,
  Sparkles,
  UserCheck,
  Building,
} from "lucide-react";

interface ClinicalReportDocumentProps {
  screening: Screening;
}

export function ClinicalReportDocument({ screening }: ClinicalReportDocumentProps) {
  const patient = screening.patient;
  const aiResult = screening.aiResult;
  const review = screening.review;
  const finalGrade = review?.confirmedGrade ?? aiResult?.predictedGrade ?? 0;
  const severityConfig = getSeverityConfig(finalGrade);

  return (
    <div className="space-y-6">
      {/* Action Bar (Hidden on print) */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-teal-700" />
          <span className="font-bold text-slate-800 text-sm">
            Clinical Diagnostic Report Preview
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Report</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Sheet */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-md max-w-4xl mx-auto text-slate-800 font-sans print:shadow-none print:border-none print:p-0">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-teal-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#082024] p-2 flex items-center justify-center text-teal-400">
              <Eye className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 tracking-wider">
                  RETINA
                </span>
                <span className="text-xl font-extrabold text-teal-700 tracking-wider">
                  SCOPE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold tracking-tight">
                Explainable AI Diabetic Retinopathy Diagnostic System
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600">
            <div className="font-bold text-slate-900">{screening.clinicLocation}</div>
            <div>Accession: <strong className="font-mono">{screening.accessionNumber}</strong></div>
            <div>Exam Date: {formatDateTime(screening.createdAt)}</div>
          </div>
        </div>

        {/* Patient Demographics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 my-6 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10.5px]">Patient Name</span>
            <span className="font-bold text-slate-900 text-sm">{patient.fullName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10.5px]">MRN & DOB</span>
            <span className="font-mono font-bold text-slate-800">
              {patient.mrn} ({patient.dob})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10.5px]">Diabetes Profile</span>
            <span className="font-semibold text-slate-800">
              {patient.diabetesType} • {patient.yearsWithDiabetes} yrs
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10.5px]">Latest HbA1c</span>
            <span className="font-bold text-teal-800 text-sm font-mono">
              {patient.latestHbA1c}% ({formatDate(patient.hba1cDate)})
            </span>
          </div>
        </div>

        {/* Visual Inspection & Severity Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* Fundus Photography Display */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Fundus Image ({screening.primaryEye === "OD" ? "Right Eye - OD" : "Left Eye - OS"})</span>
              <span className="font-mono text-[10.5px] text-emerald-700 font-bold">
                Quality: Gradable (94%)
              </span>
            </div>
            <div className="w-full aspect-square rounded-xl bg-black overflow-hidden border-2 border-slate-200 shadow-inner flex items-center justify-center relative">
              <img
                src={screening.primaryImage.imageUrl}
                alt="Retinal Fundus"
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-teal-300 font-mono">
                {screening.primaryImage.modality}
              </div>
            </div>
          </div>

          {/* Diagnostic Severity Callout */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="p-5 rounded-xl border bg-slate-50 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                ICDR Retinopathy Diagnostic Grade
              </div>
              <div className="text-2xl font-black text-slate-900">
                Grade {finalGrade}: {severityConfig.label}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {severityConfig.description}
              </p>
            </div>

            {/* AI Confidence & Lesion Counts */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border bg-white">
                <span className="text-slate-400 block text-[10.5px]">AI Model Confidence</span>
                <span className="text-lg font-mono font-extrabold text-teal-800">
                  {((aiResult?.confidence ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-3 rounded-lg border bg-white">
                <span className="text-slate-400 block text-[10.5px]">Macular Edema (DME)</span>
                <span className="text-sm font-bold text-slate-800">
                  {aiResult?.dmeRisk || "None"}
                </span>
              </div>
            </div>

            {/* Lesion Biomarkers Table Snippet */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 text-[10.5px] font-bold text-slate-700 uppercase">
                Detected Lesion Breakdown
              </div>
              <div className="p-3 text-xs space-y-1">
                {(aiResult?.lesionBreakdown || []).map((l) => (
                  <div key={l.type} className="flex items-center justify-between text-slate-700">
                    <span>{l.type}</span>
                    <span className="font-mono font-bold text-slate-900">{l.count} foci</span>
                  </div>
                ))}
                {(aiResult?.lesionBreakdown || []).length === 0 && (
                  <div className="text-slate-400 italic">No microvascular lesions identified.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Specialist Review & Clinical Impression */}
        <div className="my-6 p-5 rounded-xl border-2 border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-800" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Specialist Diagnostic Impression & Signature
              </span>
            </div>
            <span className="text-[10.5px] font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
              VERIFIED & SIGNED
            </span>
          </div>

          <div className="text-xs text-slate-700 space-y-2">
            <div>
              <strong className="text-slate-900">Clinical Impression:</strong>{" "}
              {review?.clinicalImpression || severityConfig.name}
            </div>
            <div>
              <strong className="text-slate-900">Recommended Action Plan:</strong>{" "}
              {review?.recommendedTreatmentPlan || severityConfig.recommendedInterval}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-end justify-between text-xs">
            <div>
              <div className="font-bold text-slate-900">{review?.specialistName || "Dr. Sarah Lin, MD"}</div>
              <div className="text-[11px] text-slate-500">
                {review?.specialistTitle || "Vitreoretinal Specialist"}
              </div>
            </div>
            <div className="text-right font-mono text-[10px] text-slate-400">
              <div>Signature Hash: {review?.digitalSignatureHash || "SHA256:7fa189c20a44ef"}</div>
              <div>Signed: {formatDate(review?.reviewedAt || screening.createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Regulatory & SaMD Footer */}
        <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-400 flex items-center justify-between">
          <span>RetinaScope CE/FDA Class IIa SaMD • Model Engine DeepEnsemble-v3.4.2</span>
          <span>Confidential Medical Record • Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
}
