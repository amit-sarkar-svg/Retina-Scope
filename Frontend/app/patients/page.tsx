"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserPlus, Users, Filter } from "lucide-react";
import { patientService } from "@/services/mock/patient-service";
import { PatientCard } from "@/components/patient/PatientCard";

export default function PatientsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients", searchQuery],
    queryFn: () => patientService.getPatients(searchQuery),
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Patient Cohort Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold font-mono">
              {patients.length} Active Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track diabetic retinopathy surveillance, HbA1c history, and longitudinal progression.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search patient name, MRN, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Grid of Patient Cards */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-400 text-xs">
          Loading patients...
        </div>
      ) : patients.length === 0 ? (
        <div className="py-24 text-center text-slate-400 text-xs">
          No patients found matching your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </div>
  );
}
