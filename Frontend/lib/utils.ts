import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getSeverityConfig(grade: number | string) {
  const g = typeof grade === "string" ? parseInt(grade, 10) : grade;
  switch (g) {
    case 0:
      return {
        label: "No DR",
        code: "GRADE_0",
        name: "No Apparent Diabetic Retinopathy",
        description: "No microaneurysms or vascular abnormalities detected.",
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        color: "#10B981",
        lightColor: "#ECFDF5",
        accent: "emerald",
        urgency: "Routine",
        urgencyColor: "text-emerald-700 bg-emerald-50",
        recommendedInterval: "Annual routine rescreening (12 months)",
      };
    case 1:
      return {
        label: "Mild NPDR",
        code: "GRADE_1",
        name: "Mild Non-Proliferative Diabetic Retinopathy",
        description: "Microaneurysms only. Early microvascular alterations.",
        badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
        color: "#0284C7",
        lightColor: "#F0F9FF",
        accent: "sky",
        urgency: "Moderate",
        urgencyColor: "text-sky-700 bg-sky-50",
        recommendedInterval: "Follow-up screening in 6-9 months with glycemic control review",
      };
    case 2:
      return {
        label: "Moderate NPDR",
        code: "GRADE_2",
        name: "Moderate Non-Proliferative Diabetic Retinopathy",
        description: "More than microaneurysms, but less than severe NPDR (cotton wool spots, hard exudates).",
        badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
        color: "#D97706",
        lightColor: "#FFFBEB",
        accent: "amber",
        urgency: "Priority",
        urgencyColor: "text-amber-800 bg-amber-50",
        recommendedInterval: "Ophthalmology clinic referral within 4-6 weeks",
      };
    case 3:
      return {
        label: "Severe NPDR",
        code: "GRADE_3",
        name: "Severe Non-Proliferative Diabetic Retinopathy",
        description: "4-2-1 rule met: hemorrhages in 4 quadrants, venous beading in 2+, or IRMA in 1+.",
        badgeBg: "bg-orange-50 text-orange-800 border-orange-200",
        color: "#EA580C",
        lightColor: "#FFF7ED",
        accent: "orange",
        urgency: "High Priority",
        urgencyColor: "text-orange-800 bg-orange-50",
        recommendedInterval: "Urgent Specialist Consultation within 2-4 weeks",
      };
    case 4:
      return {
        label: "Proliferative DR",
        code: "GRADE_4",
        name: "Proliferative Diabetic Retinopathy (PDR)",
        description: "Neovascularization (NVD/NVE) or vitreous/preretinal hemorrhage present.",
        badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
        color: "#E11D48",
        lightColor: "#FFF1F2",
        accent: "rose",
        urgency: "Critical / Emergency",
        urgencyColor: "text-rose-700 bg-rose-50 animate-pulse",
        recommendedInterval: "Immediate Ophthalmology Referral within 24-48 hours (Anti-VEGF/PRP evaluation)",
      };
    default:
      return {
        label: "Ungradable",
        code: "UNGRADABLE",
        name: "Ungradable / Inadequate Scan Quality",
        description: "Image quality insufficient for automated diagnostic inference.",
        badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
        color: "#64748B",
        lightColor: "#F8FAFC",
        accent: "slate",
        urgency: "Rescan Required",
        urgencyColor: "text-slate-700 bg-slate-100",
        recommendedInterval: "Repeat fundus photography with pupillary dilation",
      };
  }
}
