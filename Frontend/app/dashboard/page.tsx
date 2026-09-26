"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Eye,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Activity,
  Sparkles,
  Calendar,
  FileCheck,
} from "lucide-react";
import { screeningService } from "@/services/mock/screening-service";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { SeverityDistributionChart } from "@/components/dashboard/SeverityDistributionChart";
import { UrgentTriageQueue } from "@/components/dashboard/UrgentTriageQueue";
import { AIConcordanceRateChart } from "@/components/dashboard/AIConcordanceRateChart";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatDateTime } from "@/lib/utils";

export default function DashboardPage() {
  const { data: metrics } = useQuery({
    queryKey: ["metrics"],
    queryFn: () => screeningService.getScreeningMetrics(),
  });

  const { data: recentScreenings = [] } = useQuery({
    queryKey: ["screenings", "recent"],
    queryFn: () => screeningService.getScreenings({ sortBy: "date", sortDirection: "desc" }),
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Dashboard Top Banner */}
      <div className="bg-gradient-to-r from-[#082024] via-[#0c2e34] to-[#114b53] rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-[#17525c] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DeepEnsemble-v3.4.2 Clinical Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              RetinaScope Clinical Workspace
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/80 max-w-xl">
              Explainable AI Diabetic Retinopathy screening triage, lesion localization, and specialist sign-off protocol.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/screenings/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#082024] text-xs font-extrabold shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Screening</span>
            </Link>

            <Link
              href="/screenings"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 backdrop-blur-sm transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>Open Queue</span>
            </Link>
          </div>
        </div>

        {/* Decorative background eye glow */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Metric Cards */}
      {metrics && <MetricCards metrics={metrics} />}

      {/* Charts & Triage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Triage Queue */}
        <div className="lg:col-span-1">
          <UrgentTriageQueue screenings={recentScreenings} />
        </div>

        {/* Severity Distribution */}
        <div className="lg:col-span-1">
          {metrics && <SeverityDistributionChart distribution={metrics.severityDistribution} />}
        </div>

        {/* Throughput and Concordance */}
        <div className="lg:col-span-1">
          {metrics && <AIConcordanceRateChart throughput={metrics.weeklyThroughput} />}
        </div>
      </div>

      {/* Recent Screenings Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Eye className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Clinical Screenings
              </h2>
              <p className="text-xs text-slate-500">
                Latest fundus examinations and automated AI inferencing
              </p>
            </div>
          </div>

          <Link
            href="/screenings"
            className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1"
          >
            <span>View All Screenings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentScreenings.slice(0, 5).map((scr) => {
            const grade = scr.aiResult?.predictedGrade ?? 0;
            return (
              <div
                key={scr.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black overflow-hidden border shrink-0">
                    <img
                      src={scr.primaryImage.imageUrl}
                      alt="Fundus"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <Link
                      href={`/screenings/${scr.id}`}
                      className="font-bold text-xs text-slate-900 hover:text-teal-700 block"
                    >
                      {scr.patient.fullName}
                    </Link>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                      <span>{scr.accessionNumber}</span>
                      <span>•</span>
                      <span>{scr.primaryEye === "OD" ? "Right Eye (OD)" : "Left Eye (OS)"}</span>
                      <span>•</span>
                      <span>{formatDateTime(scr.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <SeverityBadge grade={grade} size="sm" />
                  <div className="text-right hidden md:block">
                    <div className="font-mono text-xs font-bold text-slate-800">
                      {((scr.aiResult?.confidence ?? 0) * 100).toFixed(1)}% Conf
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {scr.reviewStatus}
                    </div>
                  </div>
                  <Link
                    href={`/screenings/${scr.id}`}
                    className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-700 hover:text-white text-teal-800 text-xs font-bold border border-teal-200 transition-colors"
                  >
                    Inspect
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
