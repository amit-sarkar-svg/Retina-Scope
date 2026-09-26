"use client";

import { DRGrade } from "@/types/ai-result";
import { getSeverityConfig, cn } from "@/lib/utils";

interface SeverityBadgeProps {
  grade: DRGrade | number;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
  className?: string;
}

export function SeverityBadge({
  grade,
  size = "md",
  showDescription = false,
  className,
}: SeverityBadgeProps) {
  const config = getSeverityConfig(grade);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] font-semibold",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3.5 py-1.5 text-sm font-bold",
  };

  return (
    <div className={cn("inline-flex flex-col gap-0.5", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border tracking-tight shadow-2xs",
          config.badgeBg,
          sizeClasses[size]
        )}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: config.color }}
        />
        <span>{config.label}</span>
        <span className="opacity-60 text-[10px] font-mono">
          (Grade {grade})
        </span>
      </span>
      {showDescription && (
        <span className="text-[11px] text-slate-500 mt-0.5">
          {config.description}
        </span>
      )}
    </div>
  );
}
