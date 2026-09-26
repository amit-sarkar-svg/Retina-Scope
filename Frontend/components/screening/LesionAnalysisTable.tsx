"use client";

import { LesionGroup } from "@/types/ai-result";
import { cn } from "@/lib/utils";
import { Activity, Layers, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";

interface LesionAnalysisTableProps {
  lesions: LesionGroup[];
  totalCount: number;
  className?: string;
}

export function LesionAnalysisTable({
  lesions,
  totalCount,
  className,
}: LesionAnalysisTableProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Quantitative Lesion Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Deep-learning feature localization and cluster analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Total Foci:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono text-xs font-bold">
            {totalCount}
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {lesions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-700">Zero Microvascular Lesions Detected</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Retinal vasculature and foveal architecture within standard physiological parameters.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-semibold">
              <tr>
                <th className="px-5 py-3">Lesion Biomarker</th>
                <th className="px-4 py-3">Foci Count</th>
                <th className="px-4 py-3">Primary Zone</th>
                <th className="px-4 py-3">AI Confidence</th>
                <th className="px-5 py-3">Clinical Significance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {lesions.map((group) => (
                <tr key={group.type} className="hover:bg-slate-50/70 transition-colors">
                  {/* Biomarker with Color Tag */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full ring-2 ring-white shrink-0"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="font-bold text-slate-900">{group.type}</span>
                    </div>
                  </td>

                  {/* Foci Count */}
                  <td className="px-4 py-3.5 font-mono text-slate-900 font-bold">
                    {group.count}
                  </td>

                  {/* Primary Quadrant */}
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono">
                      {group.primaryQuadrant}
                    </span>
                  </td>

                  {/* Confidence */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-teal-600 h-full rounded-full"
                          style={{ width: `${group.confidence * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-slate-600">
                        {(group.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>

                  {/* Clinical Significance */}
                  <td className="px-5 py-3.5 text-slate-600 text-[11px] max-w-sm">
                    {group.clinicalSignificance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
