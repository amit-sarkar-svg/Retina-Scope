"use client";

import Link from "next/link";
import { AlertTriangle, ChevronRight, Eye, Sparkles } from "lucide-react";
import { Screening } from "@/types/screening";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatDateTime } from "@/lib/utils";

interface UrgentTriageQueueProps {
  screenings: Screening[];
}

export function UrgentTriageQueue({ screenings }: UrgentTriageQueueProps) {
  const urgentItems = screenings.filter((s) => s.isFlaggedForUrgentReview).slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              High Priority Triage Queue
            </h3>
            <p className="text-xs text-slate-500">Requires urgent ophthalmologist evaluation</p>
          </div>
        </div>

        <Link
          href="/screenings?urgentOnly=true"
          className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1"
        >
          View All ({urgentItems.length})
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 my-2">
        {urgentItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No critical screenings pending triage.
          </div>
        ) : (
          urgentItems.map((scr) => (
            <div
              key={scr.id}
              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {scr.patient.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="font-mono">{scr.patient.mrn}</span>
                    <span>•</span>
                    <span>{scr.primaryEye === "OD" ? "Right Eye" : "Left Eye"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <SeverityBadge grade={scr.aiResult?.predictedGrade ?? 3} size="sm" />
                <Link
                  href={`/screenings/${scr.id}/review`}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-700 hover:text-white text-teal-800 text-[11px] font-bold border border-teal-200 transition-colors"
                >
                  Review
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        Referral SLA: Level 4 PDR within 24-48 hrs • Level 3 NPDR within 2-4 wks
      </div>
    </div>
  );
}
