"use client";

import { Eye, AlertTriangle, Clock, CheckCircle2, ShieldCheck, Sparkles, Activity } from "lucide-react";
import { ScreeningMetrics } from "@/services/mock/screening-service";

interface MetricCardsProps {
  metrics: ScreeningMetrics;
}

export function MetricCards({ metrics }: MetricCardsProps) {
  const cards = [
    {
      title: "Total Screenings",
      value: metrics.totalScreened.toString(),
      subtext: "+18 today",
      icon: Eye,
      color: "text-teal-700 bg-teal-50 border-teal-200/60",
      trend: "up",
    },
    {
      title: "Critical / High Triage",
      value: metrics.urgentTriageCount.toString(),
      subtext: "Immediate ophthalmology referral",
      icon: AlertTriangle,
      color: "text-rose-700 bg-rose-50 border-rose-200/60",
      alert: true,
    },
    {
      title: "Pending Specialist Review",
      value: metrics.pendingReviewCount.toString(),
      subtext: "Avg turnaround 18 mins",
      icon: Clock,
      color: "text-amber-700 bg-amber-50 border-amber-200/60",
    },
    {
      title: "Specialist Concordance",
      value: `${metrics.specialistConcordanceRate}%`,
      subtext: "AI vs Retinal Specialist agreement",
      icon: ShieldCheck,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <span className={`p-2 rounded-xl border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </span>
            </div>

            <div className="mt-4">
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {card.value}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                {card.alert && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                <span>{card.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
