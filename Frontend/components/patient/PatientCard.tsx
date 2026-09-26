"use client";

import Link from "next/link";
import { Patient } from "@/types/patient";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatDate, cn } from "@/lib/utils";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
  Droplet,
  Heart,
  Eye,
  ChevronRight,
} from "lucide-react";

interface PatientCardProps {
  patient: Patient;
  className?: string;
}

export function PatientCard({ patient, className }: PatientCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 hover:shadow-md transition-all flex flex-col justify-between",
        className
      )}
    >
      <div>
        {/* Patient Name & MRN Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-800 font-extrabold text-sm flex items-center justify-center border border-teal-200">
              {patient.fullName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <Link
                href={`/patients/${patient.id}`}
                className="font-bold text-slate-900 text-sm hover:text-teal-700 transition-colors"
              >
                {patient.fullName}
              </Link>
              <div className="text-[11px] text-slate-400 font-mono">
                {patient.mrn} • {patient.age} yrs ({patient.gender})
              </div>
            </div>
          </div>

          <SeverityBadge grade={patient.highestSeverityRecorded} size="sm" />
        </div>

        {/* Clinical Vitals Grid */}
        <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-slate-100 text-xs">
          <div className="p-2 rounded-lg bg-slate-50 flex items-center gap-2">
            <Droplet className="w-3.5 h-3.5 text-rose-500" />
            <div>
              <span className="text-[10px] text-slate-400 block">HbA1c</span>
              <span className="font-mono font-bold text-slate-900">
                {patient.latestHbA1c}%
              </span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-sky-500" />
            <div>
              <span className="text-[10px] text-slate-400 block">BP</span>
              <span className="font-mono font-bold text-slate-900">
                {patient.bloodPressure}
              </span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <div>
              <span className="text-[10px] text-slate-400 block">Type</span>
              <span className="font-medium text-slate-800">
                {patient.diabetesType} ({patient.yearsWithDiabetes}y)
              </span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <div>
              <span className="text-[10px] text-slate-400 block">Acuity (OD/OS)</span>
              <span className="font-mono font-medium text-slate-800">
                {patient.visualAcuityOD} / {patient.visualAcuityOS}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500">
          Last Scan: {patient.lastScreeningDate ? formatDate(patient.lastScreeningDate) : "None"}
        </span>
        <Link
          href={`/patients/${patient.id}`}
          className="inline-flex items-center gap-1 text-teal-700 font-bold hover:underline"
        >
          <span>History ({patient.totalScreenings})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
