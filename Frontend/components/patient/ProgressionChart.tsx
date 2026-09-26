"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Activity, TrendingUp } from "lucide-react";

interface ProgressionChartProps {
  data: { date: string; hba1c: number; grade: number }[];
}

export function ProgressionChart({ data }: ProgressionChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <TrendingUp className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Longitudinal DR Progression & Glycemic Index
            </h3>
            <p className="text-xs text-slate-500">Historical correlation of HbA1c vs Retinopathy Severity</p>
          </div>
        </div>
      </div>

      <div className="h-56 w-full my-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis yAxisId="left" domain={[5, 12]} tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 4]} tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "8px",
                border: "none",
                color: "#fff",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="hba1c"
              name="HbA1c (%)"
              stroke="#0f766e"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#0f766e" }}
            />
            <Line
              yAxisId="right"
              type="stepAfter"
              dataKey="grade"
              name="DR Grade (0-4)"
              stroke="#ea580c"
              strokeWidth={2}
              dot={{ r: 4, fill: "#ea580c" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
