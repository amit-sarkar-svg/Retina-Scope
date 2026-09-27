"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { patientService } from "@/services/mock/patient-service";
import { Patient } from "@/types/patient";
import { cn } from "@/lib/utils";

const newPatientSchema = z.object({
  patientCode: z
    .string()
    .min(2, "Patient ID / Code must be at least 2 characters")
    .max(50, "Patient ID / Code cannot exceed 50 characters")
    .trim(),
  name: z
    .string()
    .min(2, "Patient Name must be at least 2 characters")
    .max(100, "Patient Name cannot exceed 100 characters")
    .trim(),
  age: z
    .number({ message: "Please enter a valid age" })
    .int("Age must be a whole number")
    .min(0, "Age cannot be negative")
    .max(130, "Please enter a valid age (0–130)"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Please select a gender",
  }),
  phone: z
    .string()
    .min(5, "Phone number must be at least 5 digits")
    .max(25, "Phone number cannot exceed 25 characters")
    .regex(/^[0-9+\s()\-]+$/, "Please enter a valid phone number format")
    .trim(),
});

type NewPatientFormData = z.infer<typeof newPatientSchema>;

interface AddPatientFormProps {
  onSuccess: (patient: Patient) => void;
  onCancel?: () => void;
  className?: string;
}

export function AddPatientForm({ onSuccess, onCancel, className }: AddPatientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewPatientFormData>({
    resolver: zodResolver(newPatientSchema),
  });

  const onSubmit = async (data: NewPatientFormData) => {
    try {
      setIsSubmitting(true);
      setServerError(null);

      // Call API service abstraction
      const createdPatient = await patientService.createPatient({
        patientCode: data.patientCode,
        name: data.name,
        age: Number(data.age),
        gender: data.gender,
        phone: data.phone,
      });

      setSuccessMessage(`Patient ${createdPatient.fullName} (${createdPatient.mrn}) registered successfully!`);
      reset();

      // Brief delay to display feedback before advancing
      setTimeout(() => {
        onSuccess(createdPatient);
      }, 400);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to register new patient. Please try again.";
      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5 transition-all",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Add New Patient</h3>
            <p className="text-[11px] text-slate-500">
              Register demographic details for immediate screening intake.
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Server Error Banner */}
      {serverError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Row 1: Patient Code & Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="patientCode"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Patient ID / Code <span className="text-rose-500">*</span>
            </label>
            <input
              id="patientCode"
              type="text"
              placeholder="e.g. P-00126"
              {...register("patientCode")}
              className={cn(
                "w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all font-mono",
                errors.patientCode
                  ? "border-rose-300 focus:ring-rose-500 bg-rose-50/20"
                  : "border-slate-200 focus:ring-teal-500"
              )}
            />
            {errors.patientCode && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.patientCode.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Patient Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Rahul Singh"
              {...register("name")}
              className={cn(
                "w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all",
                errors.name
                  ? "border-rose-300 focus:ring-rose-500 bg-rose-50/20"
                  : "border-slate-200 focus:ring-teal-500"
              )}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.name.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Age & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="age"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Age (Years) <span className="text-rose-500">*</span>
            </label>
            <input
              id="age"
              type="number"
              min="0"
              max="130"
              placeholder="e.g. 52"
              {...register("age", { valueAsNumber: true })}
              className={cn(
                "w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all font-mono",
                errors.age
                  ? "border-rose-300 focus:ring-rose-500 bg-rose-50/20"
                  : "border-slate-200 focus:ring-teal-500"
              )}
            />
            {errors.age && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.age.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="gender"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Gender <span className="text-rose-500">*</span>
            </label>
            <select
              id="gender"
              {...register("gender")}
              defaultValue=""
              className={cn(
                "w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition-all",
                errors.gender
                  ? "border-rose-300 focus:ring-rose-500 bg-rose-50/20"
                  : "border-slate-200 focus:ring-teal-500"
              )}
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.gender.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Phone Number */}
        <div>
          <label
            htmlFor="phone"
            className="block text-xs font-bold text-slate-700 mb-1"
          >
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            {...register("phone")}
            className={cn(
              "w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all font-mono",
              errors.phone
                ? "border-rose-300 focus:ring-rose-500 bg-rose-50/20"
                : "border-slate-200 focus:ring-teal-500"
            )}
          />
          {errors.phone && (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm shadow-teal-900/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Patient & Continue</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
