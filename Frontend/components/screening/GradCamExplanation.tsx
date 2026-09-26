"use client";

import { AIAnalysisResult } from "@/types/ai-result";
import { cn } from "@/lib/utils";
import { Sparkles, BrainCircuit, BarChart, Info, ShieldAlert } from "lucide-react";

interface GradCamExplanationProps {
  aiResult: AIAnalysisResult;
  className?: string;
}

export function GradCamExplanation({
  aiResult,
  className,
}: GradCamExplanationProps) {
  const features = aiResult.explainabilityFeatures || [];

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col gap-5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <BrainCircuit className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Explainable AI Feature Attribution (Grad-CAM)
            </h3>
            <p className="text-xs text-slate-500">
              Visual reasoning map identifying anatomical decision drivers
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500 bg-slate-50 border px-2.5 py-1 rounded-lg">
          ViT-H/14 Attention Heads
        </div>
      </div>

      {/* Clinical Narrative Summary */}
      <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/70 text-xs text-slate-800 leading-relaxed">
        <div className="font-bold text-teal-900 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          AI Diagnostic Rationale
        </div>
        <p>{aiResult.clinicalSummary}</p>
      </div>

      {/* Feature Attribution Bar Breakdown */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Decision Feature Weight Contribution
        </div>

        <div className="space-y-3">
          {features.map((feat) => (
            <div
              key={feat.feature}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{feat.feature}</span>
                <span className="font-mono text-teal-700 font-bold">
                  +{feat.contribution}% Weight
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-600 to-rose-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(feat.contribution * 1.5, 100)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-600 leading-tight">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Ensemble Architecture Verification Table */}
      <div className="pt-2 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-700 mb-2">
          Ensemble Architecture Consensus
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {aiResult.ensembleVotes.map((vote) => (
            <div
              key={vote.modelName}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between"
            >
              <span className="font-semibold text-slate-800 truncate text-[11px]">
                {vote.modelName}
              </span>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-slate-500">Grade {vote.predictedGrade}</span>
                <span className="font-mono text-teal-700 font-bold">
                  {(vote.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
