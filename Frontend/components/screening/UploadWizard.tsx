"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Cpu,
  Search,
  UserPlus,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Sliders,
  Check,
  X,
  Eye,
} from "lucide-react";
import { patientService } from "@/services/mock/patient-service";
import { screeningService } from "@/services/mock/screening-service";
import { useScreeningStore } from "@/stores/screening-store";
import { AddPatientForm } from "@/components/patient/AddPatientForm";
import { Patient } from "@/types/patient";
import { cn } from "@/lib/utils";

const PIPELINE_STAGES = [
  { stage: 1, name: "Retinal Vascular & Foveal Preprocessing", duration: 700 },
  { stage: 2, name: "Deep Ensemble Multi-Path Feature Extraction", duration: 800 },
  { stage: 3, name: "Microaneurysm & Hemorrhage Localization", duration: 800 },
  { stage: 4, name: "Diabetic Macular Edema (DME) Risk Scoring", duration: 700 },
  { stage: 5, name: "Epistemic Uncertainty & Grad-CAM Synthesis", duration: 600 },
];

export function UploadWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { wizard, setWizard, resetWizard } = useScreeningStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [patientMode, setPatientMode] = useState<"search" | "create">("search");
  const [searchPatientQuery, setSearchPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch patients for selection
  const { data: patients = [] } = useQuery({
    queryKey: ["patients", searchPatientQuery],
    queryFn: () => patientService.getPatients(searchPatientQuery),
  });

  const activePatient =
    selectedPatient || patients.find((p) => p.id === wizard.selectedPatientId) || null;

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setWizard({ selectedPatientId: patient.id });
  };

  const handleNewPatientSuccess = (newPatient: Patient) => {
    setSelectedPatient(newPatient);
    setWizard({
      selectedPatientId: newPatient.id,
      currentStep: 2,
    });
    setPatientMode("search");
    queryClient.invalidateQueries({ queryKey: ["patients"] });
  };

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setWizard({
        imageFile: file,
        imagePreviewUrl: reader.result as string,
        qualityStatus: "IDLE",
        qualityScore: null,
        qualityPercentage: null,
        qualityReason: null,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setWizard({
      imageFile: null,
      imagePreviewUrl: null,
      qualityStatus: "IDLE",
      qualityScore: null,
      qualityPercentage: null,
      qualityReason: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "2.4 MB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Run Quality Gate assessment
  const runQualityAssessment = useCallback(async (
    scenario?: "DEFAULT_94" | "PASS_80" | "FAIL_79" | "FAIL_67" | null,
    forceScore?: number
  ) => {
    setWizard({
      qualityStatus: "CHECKING",
      isProcessing: true,
      currentStep: 3,
    });

    const result = await screeningService.checkQuality({
      imagePreviewUrl: wizard.imagePreviewUrl || undefined,
      scenario: scenario || wizard.simulatedQualityScenario,
      forceScore,
    });

    setWizard({
      qualityStatus: result.status,
      qualityScore: result.qualityScore,
      qualityPercentage: result.qualityPercentage,
      qualityReason: result.reason,
      qualityCheckedAt: result.checkedAt,
      isProcessing: false,
    });
  }, [wizard.imagePreviewUrl, wizard.simulatedQualityScenario, setWizard]);

  const handleProceedToQualityGate = async () => {
    setWizard({ currentStep: 3 });
    await runQualityAssessment();
  };

  const handleProceedToAIInference = async () => {
    const targetPatient = activePatient;
    if (!targetPatient || wizard.qualityStatus !== "PASSED") return;

    setWizard({
      currentStep: 4,
      isProcessing: true,
      processingProgress: 5,
      processingStageText: PIPELINE_STAGES[0].name,
    });

    // Execute staged simulation pipeline
    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      const step = PIPELINE_STAGES[i];
      setWizard({
        processingStageText: step.name,
        processingProgress: Math.round(((i + 1) / PIPELINE_STAGES.length) * 100),
      });
      await new Promise((r) => setTimeout(r, step.duration));
    }

    // Call screening service to persist the new screening
    const created = await screeningService.createScreening({
      patientId: targetPatient.id,
      primaryEye: wizard.eyeLaterality,
      imageFile: wizard.imageFile || undefined,
      imagePreviewUrl: wizard.imagePreviewUrl || undefined,
      operatorName: wizard.operatorName,
      clinicLocation: wizard.clinicLocation,
      notes: wizard.notes,
      qualityScore: wizard.qualityScore || 0.94,
      qualityStatus: "PASSED",
    });

    queryClient.invalidateQueries({ queryKey: ["screenings"] });
    setWizard({
      isProcessing: false,
      createdScreeningId: created.id,
      currentStep: 5,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 5-Step Progress Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { step: 1, label: "1. Patient Selection" },
            { step: 2, label: "2. Scan Upload" },
            { step: 3, label: "3. Image Quality Gate" },
            { step: 4, label: "4. AI Pipeline Inference" },
            { step: 5, label: "5. Screening Result" },
          ].map((s) => {
            const isCompleted = wizard.currentStep > s.step;
            const isCurrent = wizard.currentStep === s.step;
            const isQualityFailed = s.step === 3 && wizard.qualityStatus === "FAILED" && wizard.currentStep === 3;

            return (
              <div
                key={s.step}
                className={cn(
                  "flex items-center gap-2 text-xs font-semibold transition-colors",
                  isQualityFailed
                    ? "text-rose-700 font-bold"
                    : isCurrent
                    ? "text-teal-700 font-bold"
                    : isCompleted
                    ? "text-emerald-600"
                    : "text-slate-400"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs border transition-all shrink-0",
                    isQualityFailed
                      ? "bg-rose-50 text-rose-700 border-rose-400 ring-4 ring-rose-50"
                      : isCurrent
                      ? "bg-teal-700 text-white border-teal-700 ring-4 ring-teal-50"
                      : isCompleted
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  )}
                >
                  {isQualityFailed ? (
                    <X className="w-4 h-4 text-rose-600" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    s.step
                  )}
                </div>
                <span className="truncate">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: PATIENT SELECTION / INTAKE */}
      {wizard.currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 1: Patient Selection</h2>
                <p className="text-xs text-slate-500">
                  Search and select an existing patient or register a new patient profile.
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPatientMode("search")}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    patientMode === "search"
                      ? "bg-white text-teal-800 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Existing Patient</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPatientMode("create")}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                    patientMode === "create"
                      ? "bg-teal-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add New Patient</span>
                </button>
              </div>
            </div>

            {/* OPTION A: SEARCH EXISTING PATIENT */}
            {patientMode === "search" && (
              <div className="space-y-4 pt-1">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search by ID (MRN), name or phone..."
                    value={searchPatientQuery}
                    onChange={(e) => setSearchPatientQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {patients.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-500">
                      <User className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                      <p>No patient matching &quot;{searchPatientQuery}&quot; found.</p>
                      <button
                        type="button"
                        onClick={() => setPatientMode("create")}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register as New Patient</span>
                      </button>
                    </div>
                  ) : (
                    patients.map((pat) => {
                      const isSelected = activePatient?.id === pat.id;
                      return (
                        <div
                          key={pat.id}
                          onClick={() => handlePatientSelect(pat)}
                          className={cn(
                            "p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between",
                            isSelected
                              ? "bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 shadow-xs"
                              : "bg-white border-slate-200/80 hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border">
                              {pat.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                {pat.fullName}
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                                  {pat.mrn}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>
                                  {pat.age} y/o {pat.gender}
                                </span>
                                <span>•</span>
                                <span className="font-mono">{pat.phone}</span>
                                <span>•</span>
                                <span className="font-semibold text-teal-800">
                                  {pat.diabetesType || "Type 2"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="p-1 rounded-full bg-teal-600 text-white">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    {activePatient ? (
                      <span>
                        Selected: <strong className="text-teal-800">{activePatient.fullName}</strong> ({activePatient.mrn})
                      </span>
                    ) : (
                      <span>Please select a patient or add a new patient to continue.</span>
                    )}
                  </div>

                  <button
                    disabled={!activePatient}
                    onClick={() => setWizard({ currentStep: 2 })}
                    className={cn(
                      "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm",
                      activePatient
                        ? "bg-teal-700 hover:bg-teal-800 text-white cursor-pointer shadow-teal-900/20"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    <span>Next: Scan Upload</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* OPTION B: ADD NEW PATIENT FORM */}
            {patientMode === "create" && (
              <AddPatientForm
                onSuccess={handleNewPatientSuccess}
                onCancel={() => setPatientMode("search")}
              />
            )}
          </div>
        </div>
      )}

      {/* STEP 2: SCAN UPLOAD */}
      {wizard.currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 2: Upload Retinal Scan</h2>
              <p className="text-xs text-slate-500">
                Upload a fundus image for AI-assisted screening.
              </p>
            </div>
            {activePatient && (
              <div className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs flex items-center gap-2 self-start sm:self-auto">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-teal-900">{activePatient.fullName}</span>
                <span className="font-mono text-[10px] text-teal-700 bg-white px-1.5 py-0.5 rounded border border-teal-200">
                  {activePatient.mrn}
                </span>
              </div>
            )}
          </div>

          {/* Eye Laterality & Acquisition Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Eye Laterality
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWizard({ eyeLaterality: "OD" })}
                  className={cn(
                    "py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                    wizard.eyeLaterality === "OD"
                      ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  Right Eye (OD)
                </button>
                <button
                  type="button"
                  onClick={() => setWizard({ eyeLaterality: "OS" })}
                  className={cn(
                    "py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                    wizard.eyeLaterality === "OS"
                      ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  Left Eye (OS)
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="operatorName" className="block text-xs font-bold text-slate-700 mb-1">
                Screener / Operator
              </label>
              <input
                id="operatorName"
                type="text"
                value={wizard.operatorName}
                onChange={(e) => setWizard({ operatorName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label htmlFor="clinicLocation" className="block text-xs font-bold text-slate-700 mb-1">
                Clinic Location
              </label>
              <input
                id="clinicLocation"
                type="text"
                value={wizard.clinicLocation}
                onChange={(e) => setWizard({ clinicLocation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Retinal Scan Upload Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Retinal Scan</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Supported formats: JPG, JPEG, PNG
              </span>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (!wizard.imagePreviewUrl) {
                  fileInputRef.current?.click();
                }
              }}
              className={cn(
                "border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3",
                isDragging
                  ? "border-teal-500 bg-teal-50/40"
                  : wizard.imagePreviewUrl
                  ? "border-teal-300 bg-slate-50/70"
                  : "border-slate-300 hover:border-teal-500 bg-slate-50/50 hover:bg-teal-50/20 cursor-pointer"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />

              {wizard.imagePreviewUrl ? (
                <div className="flex flex-col items-center gap-3 animate-in fade-in">
                  <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-teal-500 bg-black shadow-md relative group">
                    <img
                      src={wizard.imagePreviewUrl}
                      alt="Retinal Fundus Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="text-center">
                    <div className="font-bold text-slate-800 text-xs font-mono">
                      {wizard.imageFile?.name || "retinal_scan_fundus.jpg"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {formatFileSize(wizard.imageFile?.size || 2516582)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5 py-4">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/80">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    Drag and drop your retinal image here
                  </div>
                  <span className="text-[11px] text-slate-400">or</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
                  >
                    Browse Files
                  </button>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Supported formats: JPG, JPEG, PNG
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setWizard({ currentStep: 1 })}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={!wizard.imagePreviewUrl}
              onClick={handleProceedToQualityGate}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md",
                wizard.imagePreviewUrl
                  ? "bg-teal-700 hover:bg-teal-800 text-white cursor-pointer shadow-teal-900/20"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              <span>Continue to Quality Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: IMAGE QUALITY GATE */}
      {wizard.currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
                <h2 className="text-lg font-bold text-slate-900">
                  Step 3: Image Quality Assessment
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Checking whether the retinal scan is suitable for AI analysis.
              </p>
            </div>

            {activePatient && (
              <div className="text-right text-xs">
                <span className="text-slate-400">Patient:</span>{" "}
                <span className="font-bold text-teal-900">{activePatient.fullName}</span>
              </div>
            )}
          </div>

          {/* STATE A: CHECKING IN PROGRESS */}
          {wizard.qualityStatus === "CHECKING" && (
            <div className="py-8 text-center space-y-5 max-w-md mx-auto animate-in fade-in">
              <div className="relative w-36 h-36 mx-auto rounded-2xl overflow-hidden border-2 border-teal-500 shadow-md bg-black">
                {wizard.imagePreviewUrl && (
                  <img
                    src={wizard.imagePreviewUrl}
                    alt="Scanning fundus"
                    className="w-full h-full object-cover opacity-80"
                  />
                )}
                {/* Radar Scan Line */}
                <div className="absolute inset-0 bg-gradient-to-b from-teal-500/30 via-teal-400/50 to-transparent animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-white border-t-teal-400 animate-spin" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Assessing Image Quality...
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluating focus sharpness, illumination balance, field of view clarity, and optical artifacts.
                </p>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div className="bg-teal-600 h-full rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {/* STATE B: QUALITY PASSED (>= 80%) */}
          {wizard.qualityStatus === "PASSED" && (
            <div className="space-y-6 animate-in zoom-in-95">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Image Preview with Verified Badge */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-44 h-44 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md bg-black">
                    {wizard.imagePreviewUrl && (
                      <img
                        src={wizard.imagePreviewUrl}
                        alt="Quality Approved Retinal Scan"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold font-mono shadow-xs flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>QUALITY VERIFIED</span>
                    </div>
                  </div>
                </div>

                {/* Quality Score & Status Card */}
                <div className="md:col-span-2 space-y-4">
                  <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 block">
                            Quality Gate Status
                          </span>
                          <h4 className="text-base font-extrabold text-emerald-950">
                            ✓ Scan Accepted
                          </h4>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          Quality Score
                        </span>
                        <span className="text-2xl font-black font-mono text-emerald-800">
                          {wizard.qualityPercentage || 94}%
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-emerald-900/90 leading-relaxed">
                      {wizard.qualityReason ||
                        "The retinal image meets the minimum quality requirement (>=80%) and can proceed to AI analysis."}
                    </p>

                    {/* Telemetry Chips */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 text-center">
                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-200/40">
                        <span className="text-[10px] text-slate-500 block">Sharpness</span>
                        <span className="text-xs font-bold text-slate-800 font-mono">96%</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-200/40">
                        <span className="text-[10px] text-slate-500 block">Illumination</span>
                        <span className="text-xs font-bold text-slate-800 font-mono">94%</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-xl border border-emerald-200/40">
                        <span className="text-[10px] text-slate-500 block">Field Clarity</span>
                        <span className="text-xs font-bold text-slate-800 font-mono">95%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWizard({ currentStep: 2 })}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Upload</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedToAIInference}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md shadow-teal-900/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Proceed to AI Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STATE C: QUALITY FAILED (< 80%) */}
          {wizard.qualityStatus === "FAILED" && (
            <div className="space-y-6 animate-in zoom-in-95">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Image Preview with Warning Badge */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-44 h-44 rounded-2xl overflow-hidden border-2 border-rose-400 shadow-md bg-black">
                    {wizard.imagePreviewUrl && (
                      <img
                        src={wizard.imagePreviewUrl}
                        alt="Rejected Retinal Scan"
                        className="w-full h-full object-cover filter brightness-90"
                      />
                    )}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold font-mono shadow-xs flex items-center gap-1">
                      <X className="w-3 h-3" />
                      <span>QUALITY REJECTED</span>
                    </div>
                  </div>
                </div>

                {/* Rejection Message Card */}
                <div className="md:col-span-2 space-y-4">
                  <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-rose-800 block">
                            Quality Gate Status
                          </span>
                          <h4 className="text-base font-extrabold text-rose-950">
                            ✕ Scan Rejected
                          </h4>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-rose-700 font-semibold block">
                          Quality Score
                        </span>
                        <span className="text-2xl font-black font-mono text-rose-700">
                          {wizard.qualityPercentage || 67}%
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-rose-900 space-y-1.5 leading-relaxed">
                      <p className="font-semibold">
                        {wizard.qualityReason ||
                          "This retinal image does not meet the minimum quality requirement for AI analysis (minimum 80% required)."}
                      </p>
                      <p className="text-rose-800/80">
                        Please upload a clearer retinal scan with balanced illumination and centered macular focus.
                      </p>
                    </div>

                    {/* Hard Gate Enforcement Alert */}
                    <div className="p-3 rounded-xl bg-white/90 border border-rose-200/80 text-[11px] text-rose-900 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Clinical Governance Rule:</strong> AI model inference is strictly blocked for sub-threshold scans to avoid misclassification or false negatives.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => runQualityAssessment()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Quality Check</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleRemoveImage();
                    setWizard({ currentStep: 2 });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-900/20 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Another Scan</span>
                </button>
              </div>
            </div>
          )}

          {/* QA & DEVELOPMENT TESTING TOOLBAR */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-600">
            <div className="flex items-center gap-2 font-medium">
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-bold text-slate-700">
                Test Simulation Scenarios:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => runQualityAssessment("DEFAULT_94", 0.94)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer",
                  wizard.qualityPercentage === 94
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                )}
              >
                94% (High Pass)
              </button>
              <button
                type="button"
                onClick={() => runQualityAssessment("PASS_80", 0.8)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer",
                  wizard.qualityPercentage === 80
                    ? "bg-teal-700 text-white border-teal-700"
                    : "bg-white text-teal-800 border-teal-200 hover:bg-teal-50"
                )}
              >
                80% (Boundary Pass)
              </button>
              <button
                type="button"
                onClick={() => runQualityAssessment("FAIL_79", 0.79)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer",
                  wizard.qualityPercentage === 79
                    ? "bg-rose-700 text-white border-rose-700"
                    : "bg-white text-rose-800 border-rose-200 hover:bg-rose-50"
                )}
              >
                79% (Boundary Fail)
              </button>
              <button
                type="button"
                onClick={() => runQualityAssessment("FAIL_67", 0.67)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer",
                  wizard.qualityPercentage === 67
                    ? "bg-rose-700 text-white border-rose-700"
                    : "bg-white text-rose-800 border-rose-200 hover:bg-rose-50"
                )}
              >
                67% (Low Fail)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: REAL-TIME AI PIPELINE INFERENCE */}
      {wizard.currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 space-y-6 text-center animate-in fade-in">
          <div className="max-w-md mx-auto space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <div className="w-full h-full rounded-full bg-teal-50 border-4 border-teal-500/20 flex items-center justify-center animate-pulse">
                <Cpu className="w-10 h-10 text-teal-700 animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Analyzing Fundus Image...
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              {wizard.processingStageText}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-teal-600 to-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${wizard.processingProgress}%` }}
              />
            </div>

            <div className="text-xs font-bold font-mono text-teal-800">
              {wizard.processingProgress}% Complete
            </div>
          </div>

          {/* Staged Checklist */}
          <div className="max-w-md mx-auto text-left space-y-2 pt-4 border-t border-slate-100">
            {/* Step 0: Image Quality Gate Passed */}
            <div className="p-2.5 rounded-lg text-xs flex items-center justify-between border bg-emerald-50/60 border-emerald-200 text-emerald-800 font-semibold">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Image Quality Gate (Passed: {wizard.qualityPercentage || 94}%)
              </span>
              <span className="font-mono text-[10px] text-emerald-700 font-bold">
                PASSED
              </span>
            </div>

            {PIPELINE_STAGES.map((st, idx) => {
              const isDone = wizard.processingProgress >= ((idx + 1) / PIPELINE_STAGES.length) * 100;
              const isCurrent = !isDone && wizard.processingStageText === st.name;

              return (
                <div
                  key={st.stage}
                  className={cn(
                    "p-2.5 rounded-lg text-xs flex items-center justify-between border transition-all",
                    isDone
                      ? "bg-emerald-50/60 border-emerald-200 text-emerald-800 font-semibold"
                      : isCurrent
                      ? "bg-teal-50/80 border-teal-300 text-teal-900 font-bold"
                      : "bg-slate-50/50 border-slate-200/50 text-slate-400"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border text-[10px] flex items-center justify-center">
                        {st.stage}
                      </span>
                    )}
                    {st.name}
                  </span>
                  <span className="font-mono text-[10px]">
                    {isDone ? "PASS" : isCurrent ? "RUNNING" : "WAITING"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5: SCREENING COMPLETE & ROUTING */}
      {wizard.currentStep === 5 && wizard.createdScreeningId && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              AI Analysis & Diagnostic Scoring Completed!
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Retinal features, lesion clusters, and Grad-CAM explainability maps have been generated successfully.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Image Quality Gate: Accepted ({wizard.qualityPercentage || 94}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                resetWizard();
                router.push(`/screenings/${wizard.createdScreeningId}`);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-lg shadow-teal-900/20 transition-all cursor-pointer"
            >
              <span>View Interactive Screening & Evidence</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                resetWizard();
                router.push("/screenings");
              }}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Go to Screening Queue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
