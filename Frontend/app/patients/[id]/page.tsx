"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
  Droplet,
  Heart,
  Eye,
  Plus,
  FileCheck,
  ChevronRight,
} from "lucide-react";
import { patientService } from "@/services/mock/patient-service";
import { ProgressionChart } from "@/components/patient/ProgressionChart";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: patient, isLoading: isPatientLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => patientService.getPatientById(id),
  });

  const { data: screenings = [] } = useQuery({
    queryKey: ["patient-screenings", id],
    queryFn: () => patientService.getPatientScreenings(id),
  });

  if (isPatientLoading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm">
        Loading patient profile...
      </div>
    );
  }

  if (!patient) {
    notFound();
  }

  // Generate longitudinal progression data for the chart
  const progressionData = [
    { date: "Jan 2024", hba1c: 7.2, grade: 0 },
    { date: "Sep 2024", hba1c: 7.9, grade: 1 },
    { date: "May 2025", hba1c: 8.5, grade: 2 },
    { date: "Jan 2026", hba1c: 9.1, grade: 2 },
    { date: "Sep 2026", hba1c: patient.latestHbA1c, grade: patient.highestSeverityRecorded },
  ];

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <Link
            href="/patients"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {patient.fullName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-700">
                {patient.mrn}
              </span>
              <SeverityBadge grade={patient.highestSeverityRecorded} size="sm" />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
              <span>DOB: {patient.dob} ({patient.age} y/o)</span>
              <span>•</span>
              <span>{patient.phone}</span>
              <span>•</span>
              <span>{patient.email}</span>
            </div>
          </div>
        </div>

        <Link
          href="/screenings/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Retinal Scan</span>
        </Link>
      </div>

      {/* Clinical Profile Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <span className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
            <Droplet className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10.5px] text-slate-400 block font-medium">Latest HbA1c</span>
            <span className="font-mono text-base font-extrabold text-slate-900">
              {patient.latestHbA1c}%
            </span>
            <span className="text-[10px] text-slate-400 block">Date: {formatDate(patient.hba1cDate)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <span className="p-2.5 rounded-lg bg-teal-50 text-teal-600">
            <Activity className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10.5px] text-slate-400 block font-medium">Diabetes Profile</span>
            <span className="text-sm font-bold text-slate-900">
              {patient.diabetesType}
            </span>
            <span className="text-[10px] text-slate-400 block">{patient.yearsWithDiabetes} years duration</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <span className="p-2.5 rounded-lg bg-sky-50 text-sky-600">
            <Heart className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10.5px] text-slate-400 block font-medium">Blood Pressure</span>
            <span className="font-mono text-base font-bold text-slate-900">
              {patient.bloodPressure}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {patient.hypertension ? "Hypertensive" : "Normotensive"}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <span className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <Eye className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10.5px] text-slate-400 block font-medium">Visual Acuity (OD/OS)</span>
            <span className="font-mono text-base font-bold text-slate-900">
              {patient.visualAcuityOD} / {patient.visualAcuityOS}
            </span>
            <span className="text-[10px] text-slate-400 block">Snellen Distance</span>
          </div>
        </div>
      </div>

      {/* Longitudinal Progression Chart */}
      <ProgressionChart data={progressionData} />

      {/* Screenings History */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Eye className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Examination History
              </h2>
              <p className="text-xs text-slate-500">
                Past fundus examinations, AI grades, and specialist diagnoses
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {screenings.map((scr) => (
            <div
              key={scr.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-black overflow-hidden border shrink-0">
                  <img
                    src={scr.primaryImage.imageUrl}
                    alt="Fundus"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    {scr.accessionNumber} • {scr.primaryEye === "OD" ? "Right Eye (OD)" : "Left Eye (OS)"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Examined on {formatDateTime(scr.createdAt)} • {scr.clinicLocation}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <SeverityBadge grade={scr.aiResult?.predictedGrade ?? 0} size="sm" />
                <Link
                  href={`/screenings/${scr.id}`}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-700 hover:text-white text-teal-800 text-xs font-bold border border-teal-200 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
