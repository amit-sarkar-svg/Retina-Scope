"use client";

import { QuadrantMetric } from "@/types/ai-result";
import { cn } from "@/lib/utils";
import { Grid, Eye, Compass, Activity } from "lucide-react";

interface AnatomicalQuadrantMapProps {
  quadrants: QuadrantMetric[];
  className?: string;
}

export function AnatomicalQuadrantMap({
  quadrants,
  className,
}: AnatomicalQuadrantMapProps) {
  const getQuadrant = (name: string) => quadrants.find((q) => q.quadrant.includes(name));

  const st = getQuadrant("Superior-Temporal");
  const it = getQuadrant("Inferior-Temporal");
  const sn = getQuadrant("Superior-Nasal");
  const in_quad = getQuadrant("Inferior-Nasal");
  const mac = getQuadrant("Macular");

  const getHeatStyle = (severity: number = 0) => {
    if (severity > 75) return "bg-rose-50 border-rose-300 text-rose-900";
    if (severity > 45) return "bg-amber-50 border-amber-300 text-amber-900";
    if (severity > 15) return "bg-sky-50 border-sky-300 text-sky-900";
    return "bg-slate-50 border-slate-200 text-slate-700";
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col gap-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <Compass className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Anatomical Quadrant Distribution
            </h3>
            <p className="text-xs text-slate-500">
              4-2-1 Criteria & Regional Lesion Density
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border">
          Fundus ETDRS Grid
        </span>
      </div>

      {/* 2x2 Anatomical Matrix */}
      <div className="grid grid-cols-2 gap-2.5 relative">
        {/* Superior Nasal */}
        <div
          className={cn(
            "p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[90px]",
            getHeatStyle(sn?.severityScore)
          )}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Superior-Nasal</span>
            <span className="font-mono text-[11px] font-bold">
              {sn?.lesionCount ?? 0} Foci
            </span>
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            <div>Lesions: <span className="font-medium text-slate-800">{sn?.primaryLesion || "None"}</span></div>
            <div>Vessels: <span className="font-medium text-slate-800">{sn?.vesselIntegrity || "Normal"}</span></div>
          </div>
        </div>

        {/* Superior Temporal */}
        <div
          className={cn(
            "p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[90px]",
            getHeatStyle(st?.severityScore)
          )}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Superior-Temporal</span>
            <span className="font-mono text-[11px] font-bold">
              {st?.lesionCount ?? 0} Foci
            </span>
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            <div>Lesions: <span className="font-medium text-slate-800">{st?.primaryLesion || "None"}</span></div>
            <div>Vessels: <span className="font-medium text-slate-800">{st?.vesselIntegrity || "Normal"}</span></div>
          </div>
        </div>

        {/* Inferior Nasal */}
        <div
          className={cn(
            "p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[90px]",
            getHeatStyle(in_quad?.severityScore)
          )}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Inferior-Nasal</span>
            <span className="font-mono text-[11px] font-bold">
              {in_quad?.lesionCount ?? 0} Foci
            </span>
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            <div>Lesions: <span className="font-medium text-slate-800">{in_quad?.primaryLesion || "None"}</span></div>
            <div>Vessels: <span className="font-medium text-slate-800">{in_quad?.vesselIntegrity || "Normal"}</span></div>
          </div>
        </div>

        {/* Inferior Temporal */}
        <div
          className={cn(
            "p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[90px]",
            getHeatStyle(it?.severityScore)
          )}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Inferior-Temporal</span>
            <span className="font-mono text-[11px] font-bold">
              {it?.lesionCount ?? 0} Foci
            </span>
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            <div>Lesions: <span className="font-medium text-slate-800">{it?.primaryLesion || "None"}</span></div>
            <div>Vessels: <span className="font-medium text-slate-800">{it?.vesselIntegrity || "Normal"}</span></div>
          </div>
        </div>
      </div>

      {/* Macular Core Zone Callout */}
      {mac && (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="font-bold text-slate-800">Macular Foveal Zone:</span>
            <span className="text-slate-600">{mac.primaryLesion}</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            Severity Index: {mac.severityScore}/100
          </span>
        </div>
      )}
    </div>
  );
}
