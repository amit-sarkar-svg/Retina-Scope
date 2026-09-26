"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ShieldCheck } from "lucide-react";

interface AIConcordanceRateChartProps {
  throughput: { day: string; screenings: number; referred: number }[];
}

export function AIConcordanceRateChart({ throughput }: AIConcordanceRateChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Weekly Screening Throughput & Referrals
            </h3>
            <p className="text-xs text-slate-500">Volume and urgent triage dispatches</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          97.4% Concordance
        </span>
      </div>

      <div className="h-52 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={throughput} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "8px",
                border: "none",
                color: "#fff",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="screenings" name="Total Scans" fill="#0f766e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="referred" name="Specialist Referrals" fill="#ea580c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-[#0f766e]" />
          <span className="text-slate-600 font-medium">Total Screenings Screened</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-[#ea580c]" />
          <span className="text-slate-600 font-medium">Specialist Referrals Actioned</span>
        </div>
      </div>
    </div>
  );
}
