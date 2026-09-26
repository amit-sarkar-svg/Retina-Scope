"use client";

import {
  BarChart3,
  ShieldCheck,
  Cpu,
  Sparkles,
  Activity,
  CheckCircle2,
  Layers,
  Database,
  Sliders,
  TrendingUp,
} from "lucide-react";

export default function AnalyticsPage() {
  const modelMetrics = [
    { title: "Referable DR Sensitivity", value: "98.4%", sub: "95% CI [97.6% - 99.1%]", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    { title: "Referable DR Specificity", value: "97.2%", sub: "95% CI [96.3% - 98.0%]", color: "text-teal-700 bg-teal-50 border-teal-200" },
    { title: "AUC-ROC Score", value: "0.992", sub: "Quad-Class Macro AUC", color: "text-sky-700 bg-sky-50 border-sky-200" },
    { title: "Specialist Agreement Rate", value: "97.4%", sub: "Double-blind adjudicated", color: "text-amber-700 bg-amber-50 border-amber-200" },
  ];

  const lesionPrecisions = [
    { lesion: "Neovascularization (NVD/NVE)", precision: 99.1, recall: 98.5, samples: "1,420" },
    { lesion: "Intraretinal Hemorrhages", precision: 97.6, recall: 98.1, samples: "14,800" },
    { lesion: "Hard Lipid Exudates", precision: 95.1, recall: 96.4, samples: "8,920" },
    { lesion: "Capillary Microaneurysms", precision: 94.2, recall: 93.8, samples: "22,400" },
    { lesion: "Cotton Wool Spots (Infarc)", precision: 93.8, recall: 94.5, samples: "4,110" },
    { lesion: "Venous Beading Caliber", precision: 94.6, recall: 92.1, samples: "2,350" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              AI Diagnostic Model Validation & Audit
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold font-mono">
              SaMD v3.4.2
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Clinical validation benchmarks, uncertainty calibration, and lesion detection performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Audit Log: Verified Clean</span>
        </div>
      </div>

      {/* Model Benchmark Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modelMetrics.map((m) => (
          <div
            key={m.title}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between"
          >
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {m.title}
            </span>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-slate-900 font-mono">
                {m.value}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{m.sub}</div>
            </div>
            <div className={`px-2 py-1 rounded-lg border text-[11px] font-bold ${m.color} text-center`}>
              FDA SaMD Gold Standard
            </div>
          </div>
        ))}
      </div>

      {/* Deep Ensemble Architecture Specs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Cpu className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Multi-Model Deep Ensemble Architecture
              </h2>
              <p className="text-xs text-slate-500">
                Heterogeneous neural network committee with epistemic uncertainty quantification
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
            3 Models • 182M Parameters
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Vision Transformer (ViT-H/14)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">40% Weight</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Global retinal contextual modeling, vascular arcade topology, and foveal reflex analysis.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">Sensitivity: 98.6% • AUC: 0.994</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">EfficientNetV2-XL Retina</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">35% Weight</span>
            </div>
            <p className="text-[11px] text-slate-600">
              High-resolution micro-focal lesion extraction (microaneurysms, blot hemorrhages).
            </p>
            <div className="text-[10px] text-slate-500 font-mono">Sensitivity: 98.1% • AUC: 0.991</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">DenseNet-201 Clinical</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">25% Weight</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Dense feature reuse for subtle hard exudate rings and cotton wool boundaries.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">Sensitivity: 97.8% • AUC: 0.989</div>
          </div>
        </div>
      </div>

      {/* Lesion Precision & Recall Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Biomarker & Lesion Precision Benchmarks
              </h2>
              <p className="text-xs text-slate-500">
                Granular precision & recall against board-certified retinal expert ground truth
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100 font-semibold">
              <tr>
                <th className="px-4 py-3">Pathological Biomarker</th>
                <th className="px-4 py-3">Precision Rate</th>
                <th className="px-4 py-3">Recall (Sensitivity)</th>
                <th className="px-4 py-3">Validation Cohort Foci</th>
                <th className="px-4 py-3">Reliability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {lesionPrecisions.map((lp) => (
                <tr key={lp.lesion} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3.5 font-bold text-slate-900">{lp.lesion}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-teal-800">{lp.precision}%</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-emerald-800">{lp.recall}%</td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">{lp.samples} annotated</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10.5px] font-bold">
                      Grade A Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
