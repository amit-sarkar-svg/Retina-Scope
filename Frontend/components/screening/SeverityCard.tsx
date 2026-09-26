"use client";

import { AIAnalysisResult, DRGrade } from "@/types/ai-result";
import { getSeverityConfig, cn } from "@/lib/utils";
import {
  AlertTriangle,
  ShieldCheck,
  Activity,
  Sparkles,
  HelpCircle,
  Eye,
  CheckCircle2,
} from "lucide-react";

interface SeverityCardProps {
  aiResult: AIAnalysisResult;
  className?: string;
}

export function SeverityCard({ aiResult, className }: SeverityCardProps) {
  const currentGrade = aiResult.predictedGrade;
  const config = getSeverityConfig(currentGrade);
  const confidencePercent = (aiResult.confidence * 100).toFixed(1);
  const reliabilityScore = aiResult.overallReliabilityScore.toFixed(1);

  const grades: { grade: DRGrade; label: string; name: string }[] = [
    { grade: 0, label: "0", name: "No DR" },
    { grade: 1, label: "1", name: "Mild" },
    { grade: 2, label: "2", name: "Moderate" },
    { grade: 3, label: "3", name: "Severe" },
    { grade: 4, label: "4", name: "PDR" },
  ];

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col gap-6",
        className
      )}
    >
      {/* Header with Title & Ensemble Engine */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Diagnostic Severity Assessment
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            International Clinical Diabetic Retinopathy (ICDR) Standard
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 font-mono">
          <Sparkles className="w-3 h-3 text-teal-600" />
          <span>Ensemble Agreement 98%</span>
        </div>
      </div>

      {/* Primary Severity Hero Display */}
      <div
        className="rounded-xl p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          backgroundColor: config.lightColor,
          borderColor: `${config.color}40`,
        }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-xs"
              style={{ backgroundColor: config.color }}
            >
              Grade {currentGrade}
            </span>
            <span className="text-xs font-semibold text-slate-700">
              {config.label}
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">{config.name}</h3>
          <p className="text-xs text-slate-600 max-w-xl">{config.description}</p>
        </div>

        {/* Big Confidence Callout */}
        <div className="flex sm:flex-col items-baseline sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            AI Confidence
          </span>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {confidencePercent}%
          </div>
          <span className="text-[11px] text-teal-800 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Reliability {reliabilityScore}%
          </span>
        </div>
      </div>

      {/* ICDR 5-Step Visual Progression Gauge */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
          <span>ICDR Severity Spectrum</span>
          <span className="text-slate-400 font-normal text-[11px]">
            Selected: Grade {currentGrade}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {grades.map((item) => {
            const isSelected = item.grade === currentGrade;
            const itemConfig = getSeverityConfig(item.grade);

            return (
              <div
                key={item.grade}
                className={cn(
                  "relative p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1",
                  isSelected
                    ? "ring-2 ring-offset-1 font-bold shadow-sm"
                    : "bg-slate-50/70 border-slate-200/60 opacity-60 hover:opacity-100"
                )}
                style={{
                  borderColor: isSelected ? itemConfig.color : undefined,
                  backgroundColor: isSelected ? itemConfig.lightColor : undefined,
                  boxShadow: isSelected ? `0 0 0 2px ${itemConfig.color}` : undefined,
                }}
              >
                <div className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: itemConfig.color }}
                  />
                  <span className="text-xs font-bold text-slate-800">
                    G{item.grade}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-600 truncate max-w-full">
                  {item.name}
                </span>
                {isSelected && (
                  <span
                    className="absolute -top-1.5 right-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full text-white"
                    style={{ backgroundColor: itemConfig.color }}
                  >
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Uncertainty and DME Risk Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
        {/* Epistemic (Model) Uncertainty */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Model Epistemic Risk</span>
            <span className="font-mono text-slate-700 font-bold">
              {(aiResult.epistemicUncertainty * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all"
              style={{ width: `${aiResult.epistemicUncertainty * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Low epistemic score indicates high model certitude.
          </p>
        </div>

        {/* Aleatoric (Scan Quality) Uncertainty */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Scan Aleatoric Noise</span>
            <span className="font-mono text-slate-700 font-bold">
              {(aiResult.aleatoricUncertainty * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${aiResult.aleatoricUncertainty * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            High image SNR and sharp vessel boundary contrast.
          </p>
        </div>

        {/* Macular Edema (DME) Risk */}
        <div
          className={cn(
            "p-3 rounded-xl border flex flex-col justify-between",
            aiResult.macularEdemaPresent
              ? "bg-amber-50/70 border-amber-200 text-amber-900"
              : "bg-slate-50 border-slate-200/80 text-slate-700"
          )}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium">Macular Edema (DME)</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded text-[10.5px] font-bold",
                aiResult.macularEdemaPresent
                  ? "bg-amber-600 text-white"
                  : "bg-slate-200 text-slate-700"
              )}
            >
              {aiResult.dmeRisk}
            </span>
          </div>
          <p className="text-[10.5px] text-slate-500">
            {aiResult.macularEdemaPresent
              ? "Hard exudates encroaching center. OCT scan advised."
              : "Foveal avascular zone clear of significant edema."}
          </p>
        </div>
      </div>
    </div>
  );
}
