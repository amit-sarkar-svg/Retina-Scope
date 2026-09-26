"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  ChevronRight,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { screeningService, ScreeningFilters } from "@/services/mock/screening-service";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatDate, formatDateTime, cn } from "@/lib/utils";
import { DRGrade } from "@/types/ai-result";
import { ScreeningStatus } from "@/types/screening";

export function ScreeningQueueTable() {
  const [filters, setFilters] = useState<ScreeningFilters>({
    searchQuery: "",
    grade: "all",
    status: "all",
    urgentOnly: false,
    sortBy: "date",
    sortDirection: "desc",
  });

  const { data: screenings = [], isLoading } = useQuery({
    queryKey: ["screenings", filters],
    queryFn: () => screeningService.getScreenings(filters),
  });

  const handleGradeFilter = (grade: DRGrade | "all") => {
    setFilters((prev) => ({ ...prev, grade }));
  };

  const handleStatusFilter = (status: ScreeningStatus | "all") => {
    setFilters((prev) => ({ ...prev, status }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Search and Filters Toolbar */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by patient name, MRN, or accession ID..."
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Urgent Toggle Button */}
          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, urgentOnly: !prev.urgentOnly }))
            }
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
              filters.urgentOnly
                ? "bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-200"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Urgent Only</span>
          </button>

          {/* Grade Selector */}
          <select
            value={filters.grade === "all" ? "all" : filters.grade}
            onChange={(e) =>
              handleGradeFilter(
                e.target.value === "all" ? "all" : (parseInt(e.target.value, 10) as DRGrade)
              )
            }
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All DR Grades</option>
            <option value="0">Grade 0 (No DR)</option>
            <option value="1">Grade 1 (Mild NPDR)</option>
            <option value="2">Grade 2 (Moderate NPDR)</option>
            <option value="3">Grade 3 (Severe NPDR)</option>
            <option value="4">Grade 4 (PDR)</option>
          </select>

          {/* Status Selector */}
          <select
            value={filters.status}
            onChange={(e) =>
              handleStatusFilter(e.target.value as ScreeningStatus | "all")
            }
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Review Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed / Signed Off</option>
            <option value="AI Screened">AI Screened</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10.5px] tracking-wider font-semibold border-b border-slate-100">
            <tr>
              <th className="px-5 py-3.5">Accession & Date</th>
              <th className="px-5 py-3.5">Patient Info</th>
              <th className="px-4 py-3.5">Eye / Quality</th>
              <th className="px-5 py-3.5">AI Severity Grade</th>
              <th className="px-4 py-3.5">Confidence / DME</th>
              <th className="px-4 py-3.5">Review Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  Loading screenings...
                </td>
              </tr>
            ) : screenings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  No screening records matching your filters.
                </td>
              </tr>
            ) : (
              screenings.map((screening) => {
                const aiGrade = screening.aiResult?.predictedGrade ?? 0;
                const isUrgent = screening.isFlaggedForUrgentReview;

                return (
                  <tr
                    key={screening.id}
                    className="hover:bg-teal-50/30 transition-colors group cursor-pointer"
                  >
                    {/* Accession Number & Time */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {isUrgent && (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"
                            title="Critical / Urgent Case"
                          />
                        )}
                        <div>
                          <div className="font-mono font-bold text-slate-900">
                            {screening.accessionNumber}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {formatDateTime(screening.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Patient Name & MRN */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/patients/${screening.patientId}`}
                        className="hover:text-teal-700 block"
                      >
                        <div className="font-bold text-slate-900">
                          {screening.patient.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span className="font-mono">{screening.patient.mrn}</span>
                          <span>•</span>
                          <span>{screening.patient.age} y/o</span>
                        </div>
                      </Link>
                    </td>

                    {/* Laterality & Quality */}
                    <td className="px-4 py-4">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-bold text-[11px] text-slate-800">
                        {screening.primaryEye === "OD" ? "Right (OD)" : "Left (OS)"}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                        Quality: Gradable (94%)
                      </div>
                    </td>

                    {/* AI Severity Badge */}
                    <td className="px-5 py-4">
                      <SeverityBadge grade={aiGrade} size="sm" />
                    </td>

                    {/* AI Confidence & DME Risk */}
                    <td className="px-4 py-4">
                      <div className="font-mono font-bold text-slate-800">
                        {((screening.aiResult?.confidence ?? 0) * 100).toFixed(1)}%
                      </div>
                      <div className="text-[10.5px] text-slate-500">
                        DME:{" "}
                        <span
                          className={cn(
                            "font-semibold",
                            screening.aiResult?.macularEdemaPresent
                              ? "text-rose-600"
                              : "text-slate-600"
                          )}
                        >
                          {screening.aiResult?.dmeRisk}
                        </span>
                      </div>
                    </td>

                    {/* Review Status */}
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                          screening.review?.signedOff
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isUrgent
                            ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        )}
                      >
                        {screening.review?.signedOff ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : isUrgent ? (
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{screening.reviewStatus}</span>
                      </span>
                    </td>

                    {/* Action Links */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/screenings/${screening.id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-700 hover:text-white text-slate-700 text-xs font-semibold transition-all shadow-2xs"
                        >
                          Inspect
                        </Link>
                        <Link
                          href={`/screenings/${screening.id}/review`}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-700 hover:text-white text-teal-800 text-xs font-semibold transition-all border border-teal-200"
                        >
                          Sign-Off
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
