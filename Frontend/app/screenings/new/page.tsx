"use client";

import { UploadWizard } from "@/components/screening/UploadWizard";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewScreeningPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/screenings"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              New Retinal Screening Intake
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 ml-8">
            Upload fundus photography and initiate deep ensemble AI diagnostic inference.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-xs font-semibold text-teal-800">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
          <span>Automated Pipeline Ready</span>
        </div>
      </div>

      {/* Main Intake Wizard */}
      <UploadWizard />
    </div>
  );
}
