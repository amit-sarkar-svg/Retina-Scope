"use client";

import { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Sliders,
  Bell,
  Building,
  Key,
  Database,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
  const [confidenceThreshold, setConfidenceThreshold] = useState(90);
  const [autoTriageUrgent, setAutoTriageUrgent] = useState(true);
  const [requireOverrideReason, setRequireOverrideReason] = useState(true);
  const [defaultFollowUpPDR, setDefaultFollowUpPDR] = useState("24-48 hours");
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = () => {
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Clinical Protocols & AI Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold font-mono">
              Admin Config
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure triage thresholds, referral routing rules, and specialist sign-off policies.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition-all"
        >
          Save Configuration
        </button>
      </div>

      {savedAlert && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Protocol configuration saved successfully!</span>
        </div>
      )}

      {/* AI Decision Thresholds */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sliders className="w-4 h-4 text-teal-700" />
          <h2 className="text-sm font-bold text-slate-900">
            AI Screening & Uncertainty Thresholds
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-800">
              <span>Minimum AI Diagnostic Confidence for Auto-Approval</span>
              <span className="font-mono text-teal-800 font-bold">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min="75"
              max="99"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-teal-700 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Screenings with confidence below this threshold are automatically flagged for mandatory specialist review.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Automatic Urgent Triage Dispatch</span>
              <span className="text-[11px] text-slate-400">
                Instantly alert on-call vitreoretinal ophthalmologist when Grade 4 (PDR) is predicted.
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoTriageUrgent}
              onChange={(e) => setAutoTriageUrgent(e.target.checked)}
              className="w-4 h-4 accent-teal-700 rounded cursor-pointer"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Mandatory Grade Override Audit Trail</span>
              <span className="text-[11px] text-slate-400">
                Require written clinical rationale when a specialist modifies the AI proposed grade.
              </span>
            </div>
            <input
              type="checkbox"
              checked={requireOverrideReason}
              onChange={(e) => setRequireOverrideReason(e.target.checked)}
              className="w-4 h-4 accent-teal-700 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Referral Network Directory */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Building className="w-4 h-4 text-teal-700" />
          <h2 className="text-sm font-bold text-slate-900">
            Integrated Referral Ophthalmology Clinics
          </h2>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">Westside Retina & Vitreous Center</div>
              <div className="text-[11px] text-slate-500">Urgent PDR & CSME Priority Hub • Contact: (555) 900-2100</div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Primary Endpoint
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">University Medical Eye Institute</div>
              <div className="text-[11px] text-slate-500">Tertiary Laser & Anti-VEGF Clinic • Contact: (555) 900-3400</div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              Secondary Endpoint
            </span>
          </div>
        </div>
      </div>

      {/* API / Backend Readiness Stub */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900">
              FastAPI & DICOM PACS Backend Integration (Milestone 2 Ready)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-semibold">
            Mock Mode Active
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The application service layer (`services/mock/screening-service.ts`) is fully architected as an asynchronous API abstraction. Switching to the production FastAPI backend requires only updating the endpoint base URL in environment configuration without any UI redesign.
        </p>
      </div>
    </div>
  );
}
