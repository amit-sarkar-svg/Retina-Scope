"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export function Header() {
  const pathname = usePathname();
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0 || parts[0] === "dashboard") {
      return [{ label: "Dashboard", href: "/dashboard" }];
    }
    return [
      { label: "Dashboard", href: "/dashboard" },
      ...parts.map((p, idx) => {
        const href = "/" + parts.slice(0, idx + 1).join("/");
        const formatted = p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return { label: formatted, href };
      }),
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Breadcrumb path */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="font-semibold text-teal-800 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-teal-600" />
          RetinaScope
        </span>
        {breadcrumbs.map((bc, idx) => (
          <div key={bc.href} className="flex items-center gap-2">
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <Link
              href={bc.href}
              className={
                idx === breadcrumbs.length - 1
                  ? "font-semibold text-slate-800"
                  : "hover:text-teal-700 transition-colors"
              }
            >
              {bc.label}
            </Link>
          </div>
        ))}
      </div>

      {/* Center/Right Toolbar */}
      <div className="flex items-center gap-4">
        {/* System Health Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full text-xs text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-[11px]">AI Model Online (DeepEnsemble-v3.4)</span>
        </div>

        {/* Triage Alert Indicator */}
        <Link
          href="/screenings?urgentOnly=true"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 rounded-full text-xs text-rose-700 hover:bg-rose-100 transition-colors font-medium"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>2 Critical Screenings</span>
        </Link>

        {/* Quick New Screening CTA */}
        <Link
          href="/screenings/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white text-xs font-semibold shadow-xs hover:shadow transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Screening</span>
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationModal(!showNotificationModal)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Triage Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {showNotificationModal && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-800">Clinical Alerts</span>
                <span className="text-[10px] text-teal-700 font-medium">2 Unresolved</span>
              </div>
              <div className="space-y-2 text-xs">
                <Link
                  href="/screenings/scr-1002"
                  onClick={() => setShowNotificationModal(false)}
                  className="block p-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200/70 transition-colors"
                >
                  <div className="flex items-center gap-1 text-rose-800 font-bold text-[11px]">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    EMERGENCY: PDR Detected
                  </div>
                  <div className="text-slate-600 text-[10px] mt-0.5">
                    Marcus Holloway (OD) • Neovascularization at disc (NVD)
                  </div>
                </Link>

                <Link
                  href="/screenings/scr-1001"
                  onClick={() => setShowNotificationModal(false)}
                  className="block p-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200/70 transition-colors"
                >
                  <div className="flex items-center gap-1 text-amber-800 font-bold text-[11px]">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    URGENT: Severe NPDR
                  </div>
                  <div className="text-slate-600 text-[10px] mt-0.5">
                    Eleanor Vance (OD) • Multi-quadrant blot hemorrhages
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
