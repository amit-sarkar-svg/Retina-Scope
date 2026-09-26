"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  User,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  FileCheck,
  Cpu,
  Layers,
  Image as ImageIcon,
  ShieldCheck,
  Search,
} from "lucide-react";
import { patientService } from "@/services/mock/patient-service";
import { screeningService } from "@/services/mock/screening-service";
import { useScreeningStore } from "@/stores/screening-store";
import { generateFundusSvgDataUrl } from "@/lib/mock/fundus-generator";
import { Patient } from "@/types/patient";
import { cn } from "@/lib/utils";

const PIPELINE_STAGES = [
  { stage: 1, name: "Image Preprocessing & Illumination Balance", duration: 700 },
  { stage: 2, name: "Retinal Vascular & Foveal Segmentation", duration: 800 },
  { stage: 3, name: "Deep Ensemble Multi-Path Feature Extraction", duration: 900 },
  { stage: 4, name: "Microaneurysm & Hemorrhage Localization", duration: 800 },
  { stage: 5, name: "Epistemic Uncertainty & Grad-CAM Synthesis", duration: 600 },
];

export function UploadWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { wizard, setWizard, resetWizard } = useScreeningStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchPatientQuery, setSearchPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [simulatedSampleGrade, setSimulatedSampleGrade] = useState<number>(3);

  // Fetch patients for selection
  const { data: patients = [] } = useQuery({
    queryKey: ["patients", searchPatientQuery],
    queryFn: () => patientService.getPatients(searchPatientQuery),
  });

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setWizard({ selectedPatientId: patient.id });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setWizard({
        imageFile: file,
        imagePreviewUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUsePresetSample = (grade: number) => {
    setSimulatedSampleGrade(grade);
    const sampleUrl = generateFundusSvgDataUrl(grade as 0 | 1 | 2 | 3 | 4, wizard.eyeLaterality);
    setWizard({
      imagePreviewUrl: sampleUrl,
      imageFile: new File(["mock"], `sample_grade_${grade}.svg`, { type: "image/svg+xml" }),
    });
  };

  const handleStartAnalysis = async () => {
    if (!selectedPatient) return;

    setWizard({
      currentStep: 3,
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

    // Call mock screening service to persist the new screening
    const created = await screeningService.createScreening({
      patientId: selectedPatient.id,
      primaryEye: wizard.eyeLaterality,
      imageFile: wizard.imageFile || undefined,
      imagePreviewUrl: wizard.imagePreviewUrl || undefined,
      operatorName: wizard.operatorName,
      clinicLocation: wizard.clinicLocation,
      notes: wizard.notes,
    });

    queryClient.invalidateQueries({ queryKey: ["screenings"] });
    setWizard({
      isProcessing: false,
      createdScreeningId: created.id,
      currentStep: 4,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Progress Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex items-center justify-between">
          {[
            { step: 1, label: "1. Patient Demographics" },
            { step: 2, label: "2. Scan Upload & Quality" },
            { step: 3, label: "3. AI Pipeline Inference" },
            { step: 4, label: "4. Screening Result" },
          ].map((s) => (
            <div
              key={s.step}
              className={cn(
                "flex items-center gap-2 text-xs font-semibold transition-colors",
                wizard.currentStep === s.step
                  ? "text-teal-700 font-bold"
                  : wizard.currentStep > s.step
                  ? "text-emerald-600"
                  : "text-slate-400"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs border transition-all",
                  wizard.currentStep === s.step
                    ? "bg-teal-700 text-white border-teal-700 ring-4 ring-teal-50"
                    : wizard.currentStep > s.step
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-slate-100 text-slate-400 border-slate-200"
                )}
              >
                {wizard.currentStep > s.step ? <CheckCircle2 className="w-4 h-4" /> : s.step}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: PATIENT SELECTION / INTAKE */}
      {wizard.currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Step 1: Select Patient Record</h2>
            <p className="text-xs text-slate-500">
              Attach retinal fundus examination to an existing patient medical record number (MRN).
            </p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search patient by name, MRN, phone, or email..."
              value={searchPatientQuery}
              onChange={(e) => setSearchPatientQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>

          {/* Patients Selection List */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {patients.map((pat) => {
              const isSelected = selectedPatient?.id === pat.id;
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
                      {pat.fullName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        {pat.fullName}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                          {pat.mrn}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{pat.age} y/o {pat.gender}</span>
                        <span>•</span>
                        <span className="font-semibold text-teal-800">{pat.diabetesType}</span>
                        <span>•</span>
                        <span>HbA1c: <strong>{pat.latestHbA1c}%</strong></span>
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
            })}
          </div>

          {/* Continue Button */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              disabled={!selectedPatient}
              onClick={() => setWizard({ currentStep: 2 })}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm",
                selectedPatient
                  ? "bg-teal-700 hover:bg-teal-800 text-white cursor-pointer shadow-teal-900/20"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              <span>Next: Retinal Scan Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SCAN UPLOAD & QUALITY PREVIEW */}
      {wizard.currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 2: Fundus Scan Upload & Parameters</h2>
              <p className="text-xs text-slate-500">
                Upload 45-degree color fundus photograph (DICOM, TIFF, JPG, or PNG).
              </p>
            </div>
            {selectedPatient && (
              <div className="text-right text-xs">
                <span className="text-slate-400">Patient:</span>{" "}
                <span className="font-bold text-teal-800">{selectedPatient.fullName}</span>
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
                    "py-2 rounded-xl text-xs font-bold border transition-all",
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
                    "py-2 rounded-xl text-xs font-bold border transition-all",
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Screener / Operator
              </label>
              <input
                type="text"
                value={wizard.operatorName}
                onChange={(e) => setWizard({ operatorName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinic Location
              </label>
              <input
                type="text"
                value={wizard.clinicLocation}
                onChange={(e) => setWizard({ clinicLocation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Drag and Drop Zone or Preset Sample Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Retinal Image File</span>
              <span className="text-[11px] text-teal-700 font-normal">
                Or pick a certified clinical test sample below
              </span>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-teal-50/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {wizard.imagePreviewUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-teal-500 bg-black shadow-lg">
                    <img
                      src={wizard.imagePreviewUrl}
                      alt="Fundus Scan Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-teal-700 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    Scan Loaded • Image Quality Verified (Sharpness 94%)
                  </span>
                  <span className="text-[10px] text-slate-400">Click to change file</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    Click to browse or drop retinal fundus DICOM / Image
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Supported: DICOM (.dcm), TIFF, JPG, PNG (Max 50MB)
                  </div>
                </div>
              )}
            </div>

            {/* Quick Sample Presets */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Quick Clinical Case Presets (Simulated AI Targets):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { grade: 0, label: "Grade 0 (No DR)" },
                  { grade: 1, label: "Grade 1 (Mild)" },
                  { grade: 2, label: "Grade 2 (Moderate)" },
                  { grade: 3, label: "Grade 3 (Severe)" },
                  { grade: 4, label: "Grade 4 (PDR)" },
                ].map((preset) => (
                  <button
                    key={preset.grade}
                    type="button"
                    onClick={() => handleUsePresetSample(preset.grade)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all",
                      simulatedSampleGrade === preset.grade && wizard.imagePreviewUrl
                        ? "bg-teal-700 text-white border-teal-700"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setWizard({ currentStep: 1 })}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              disabled={!wizard.imagePreviewUrl}
              onClick={handleStartAnalysis}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md",
                wizard.imagePreviewUrl
                  ? "bg-teal-700 hover:bg-teal-800 text-white cursor-pointer shadow-teal-900/20"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              <Sparkles className="w-4 h-4" />
              <span>Run AI Screening Pipeline</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REAL-TIME AI PIPELINE SIMULATION */}
      {wizard.currentStep === 3 && (
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

      {/* STEP 4: SCREENING COMPLETE & ROUTING */}
      {wizard.currentStep === 4 && wizard.createdScreeningId && (
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
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Go to Screening Queue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
