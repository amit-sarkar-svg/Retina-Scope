"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { screeningService } from "@/services/mock/screening-service";
import { ClinicalReportDocument } from "@/components/reports/ClinicalReportDocument";
import { FileText, Printer, Search, Eye, CheckCircle2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function ReportsPage() {
  const [selectedScreeningId, setSelectedScreeningId] = useState<string>("scr-1001");

  const { data: screenings = [], isLoading } = useQuery({
    queryKey: ["screenings"],
    queryFn: () => screeningService.getScreenings(),
  });

  const selectedScreening = screenings.find((s) => s.id === selectedScreeningId) || screenings[0];

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header (hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Clinical Reports Repository
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold font-mono">
              Official Diagnostic Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate, preview, and print standardized CE/FDA compliant clinical ophthalmic reports.
          </p>
        </div>

        {/* Case Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Select Case:</label>
          <select
            value={selectedScreeningId}
            onChange={(e) => setSelectedScreeningId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-teal-500 shadow-2xs"
          >
            {screenings.map((scr) => (
              <option key={scr.id} value={scr.id}>
                {scr.patient.fullName} — {scr.accessionNumber} (Grade {scr.aiResult?.predictedGrade ?? 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Report Document Sheet */}
      {selectedScreening && <ClinicalReportDocument screening={selectedScreening} />}
    </div>
  );
}
