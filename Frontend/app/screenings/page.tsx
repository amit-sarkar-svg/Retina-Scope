"use client";

import Link from "next/link";
import { Plus, Eye, Sparkles } from "lucide-react";
import { ScreeningQueueTable } from "@/components/queue/ScreeningQueueTable";

export default function ScreeningsQueuePage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Screening Queue & Triage
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold font-mono">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage automated AI screenings, sort priority cases, and conduct ophthalmologist review.
          </p>
        </div>

        <Link
          href="/screenings/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Screening Intake</span>
        </Link>
      </div>

      {/* Main Table */}
      <ScreeningQueueTable />
    </div>
  );
}
