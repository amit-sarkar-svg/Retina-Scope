"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Activity, BarChart2 } from "lucide-react";

interface SeverityDistributionChartProps {
  distribution: { grade: string; count: number; percentage: number; color: string }[];
}

export function SeverityDistributionChart({ distribution }: SeverityDistributionChartProps) {
  const chartData = distribution.map((d) => ({
    name: d.grade,
    value: d.count === 0 ? 1 : d.count,
    rawCount: d.count,
    color: d.color,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Severity Cohort Breakdown
            </h3>
            <p className="text-xs text-slate-500">ICDR 0-4 distribution</p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Total: 248 cases</span>
      </div>

      {/* Chart visualization */}
      <div className="h-48 w-full my-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value, name) => [`${value} screenings`, name]}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "8px",
                border: "none",
                color: "#fff",
                fontSize: "12px",
              }}
            />
            <Pie
              data={chartData}
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
        {distribution.map((d) => (
          <div key={d.grade} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-slate-600 truncate text-[11px] font-medium">
              {d.grade}: <strong className="text-slate-800">{d.percentage}%</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
