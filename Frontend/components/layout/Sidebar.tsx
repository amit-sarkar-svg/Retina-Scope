"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Eye,
  PlusCircle,
  Users,
  FileText,
  BarChart3,
  Settings,
  ShieldCheck,
  Activity,
  Sparkles,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Screening Queue",
    href: "/screenings",
    icon: Eye,
    badge: "2 Pending",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    name: "New Screening",
    href: "/screenings/new",
    icon: PlusCircle,
    badge: "Intake",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    name: "Patients",
    href: "/patients",
    icon: Users,
    badge: null,
  },
  {
    name: "Clinical Reports",
    href: "/reports",
    icon: FileText,
    badge: null,
  },
  {
    name: "AI Analytics & Audit",
    href: "/analytics",
    icon: BarChart3,
    badge: "v3.4.2",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  },
  {
    name: "Settings & Protocols",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#082024] text-slate-200 flex flex-col shrink-0 border-r border-[#13444d] z-30 select-none shadow-xl min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#123d45]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-teal-950/50 flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#082024] rounded-[10px] flex items-center justify-center">
              <Eye className="w-5 h-5 text-teal-400 group-hover:text-emerald-300 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-wider text-base text-white">RETINA</span>
              <span className="font-bold tracking-wider text-base text-teal-400">SCOPE</span>
            </div>
            <p className="text-[10px] text-teal-200/70 font-medium tracking-tight">
              Explainable DR Platform
            </p>
          </div>
        </Link>

        {/* Tagline Badge */}
        <div className="mt-3 px-2.5 py-1 rounded-md bg-[#0e353b]/80 border border-[#174e57] text-[10.5px] text-teal-300/90 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-teal-400 animate-pulse" />
            Detect • Explain • Refer
          </span>
          <span className="text-[9px] uppercase px-1 py-0.5 bg-teal-950 rounded text-teal-400 font-mono">
            AI-SaMD
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-teal-400/60">
          Clinical Workspace
        </div>
        {navigationItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/" || pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-[#114b53] text-white shadow-md shadow-black/20 border-l-4 border-teal-400"
                  : "text-slate-300 hover:text-white hover:bg-[#0c2e34]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-teal-300"
                      : "text-slate-400 group-hover:text-teal-300"
                  )}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full border font-medium",
                    item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Clinical Reference Section */}
        <div className="pt-5 px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-teal-400/60">
          Clinical Protocols
        </div>
        <div className="px-3 py-2 space-y-2 text-xs text-slate-400">
          <div className="flex items-center justify-between p-2 rounded-md bg-[#0a272c] border border-[#113d44]">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-[11px] text-slate-300">ICDR 0-4 Scale</span>
            </div>
            <span className="text-[10px] text-teal-400 font-mono">Active</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-[#0a272c] border border-[#113d44]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-slate-300">FDA SaMD Class IIa</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Verified</span>
          </div>
        </div>
      </nav>

      {/* Clinician User Profile Footer */}
      <div className="p-3.5 border-t border-[#123d45] bg-[#06191c]">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-[#0b2b31] border border-[#144750]">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-800 text-white font-semibold text-xs flex items-center justify-center border border-teal-400/40">
              SL
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#06191c]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              Dr. Sarah Lin, MD
            </div>
            <div className="text-[10px] text-teal-300/80 truncate">
              Vitreoretinal Specialist
            </div>
          </div>
        </div>
        <div className="mt-2 text-center text-[10px] text-slate-400">
          RetinaScope Clinical v1.0.4-rc
        </div>
      </div>
    </aside>
  );
}
