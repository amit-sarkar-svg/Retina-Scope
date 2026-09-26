"use client";

import { useState, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Layers,
  Eye,
  Grid,
  Maximize2,
  Minimize2,
  Info,
  Download,
  Crosshair,
  Sparkles,
} from "lucide-react";
import { RetinalImageMetadata } from "@/types/screening";
import { AIAnalysisResult, LesionCoordinate, LesionType } from "@/types/ai-result";
import { useScreeningStore } from "@/stores/screening-store";
import { cn } from "@/lib/utils";

interface RetinalViewerProps {
  image: RetinalImageMetadata;
  aiResult?: AIAnalysisResult;
  patientName?: string;
  className?: string;
}

export function RetinalViewer({
  image,
  aiResult,
  patientName = "Patient",
  className,
}: RetinalViewerProps) {
  const { viewerSettings, setViewerSettings, resetViewerSettings } = useScreeningStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hoveredCoordinate, setHoveredCoordinate] = useState<LesionCoordinate | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const coordinates: LesionCoordinate[] = aiResult?.allCoordinates || [];

  const filteredCoordinates =
    viewerSettings.selectedLesionType === "ALL"
      ? coordinates
      : coordinates.filter((c) => c.type === viewerSettings.selectedLesionType);

  const handleZoom = (delta: number) => {
    const nextZoom = Math.min(Math.max(viewerSettings.zoomLevel + delta, 0.8), 2.8);
    setViewerSettings({ zoomLevel: Number(nextZoom.toFixed(1)) });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const lesionTypeOptions: (LesionType | "ALL")[] = [
    "ALL",
    "Hemorrhage",
    "Microaneurysm",
    "Hard Exudate",
    "Cotton Wool Spot",
    "Neovascularization",
    "Venous Beading",
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col select-none",
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "h-[620px]",
        className
      )}
    >
      {/* Top Floating Inspection Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        {/* Laterality & Modality Badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="px-3 py-1 bg-slate-900/90 backdrop-blur-md border border-teal-500/40 rounded-lg text-xs font-bold text-teal-300 shadow-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            {image.laterality === "OD" ? "Right Eye (OD)" : "Left Eye (OS)"} • {image.fieldOfView}
          </span>
          <span className="hidden sm:inline-flex px-2.5 py-1 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-lg text-[11px] text-slate-300 font-mono">
            {image.resolution}
          </span>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setShowControls(!showControls)}
            className={cn(
              "p-2 rounded-lg backdrop-blur-md text-xs font-medium border transition-all flex items-center gap-1.5 shadow-md",
              showControls
                ? "bg-teal-900/80 border-teal-500/50 text-teal-200"
                : "bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white"
            )}
            title="Toggle Inspection Controls"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Controls</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white transition-all shadow-md"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Viewer"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Retinal Viewport */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-[#040d10] cursor-crosshair">
        {/* Scaled/Transformed Fundus Container */}
        <div
          className="relative transition-transform duration-150 ease-out flex items-center justify-center"
          style={{
            transform: `scale(${viewerSettings.zoomLevel})`,
            filter: `brightness(${1 + viewerSettings.brightness / 100}) contrast(${viewerSettings.contrast}%)`,
            width: "540px",
            height: "540px",
          }}
        >
          {/* Base Fundus Image (SVG Data URL) */}
          <img
            src={image.imageUrl}
            alt="Retinal Fundus Photograph"
            className="w-full h-full object-contain rounded-full shadow-2xl pointer-events-none"
          />

          {/* Grad-CAM Heatmap Layer */}
          {viewerSettings.showGradCam && aiResult && (
            <div
              className="absolute inset-0 rounded-full gradcam-layer transition-opacity duration-200"
              style={{
                opacity: viewerSettings.gradCamOpacity,
              }}
            />
          )}

          {/* Anatomical Quadrant Grid Overlay */}
          {viewerSettings.showQuadrants && (
            <div className="absolute inset-0 rounded-full border-2 border-teal-400/40 pointer-events-none">
              {/* Vertical Crosshair */}
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-teal-400/50 border-r border-dashed border-teal-300/60" />
              {/* Horizontal Crosshair */}
              <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-teal-400/50 border-b border-dashed border-teal-300/60" />
              
              {/* Quadrant Labels */}
              <span className="absolute top-6 left-6 text-[10px] font-bold text-teal-300/80 bg-slate-950/70 px-1.5 py-0.5 rounded">
                Superior-Nasal
              </span>
              <span className="absolute top-6 right-6 text-[10px] font-bold text-teal-300/80 bg-slate-950/70 px-1.5 py-0.5 rounded">
                Superior-Temporal
              </span>
              <span className="absolute bottom-6 left-6 text-[10px] font-bold text-teal-300/80 bg-slate-950/70 px-1.5 py-0.5 rounded">
                Inferior-Nasal
              </span>
              <span className="absolute bottom-6 right-6 text-[10px] font-bold text-teal-300/80 bg-slate-950/70 px-1.5 py-0.5 rounded">
                Inferior-Temporal
              </span>
            </div>
          )}

          {/* Macula Center Guide Ring */}
          {viewerSettings.showMaculaGuide && (
            <div
              className={cn(
                "absolute w-24 h-24 rounded-full border border-teal-400/60 pointer-events-none flex items-center justify-center animate-pulse-slow",
                image.laterality === "OD" ? "right-[26%] top-[40%]" : "left-[26%] top-[40%]"
              )}
            >
              <span className="text-[8px] font-mono text-teal-300 bg-slate-900/80 px-1 rounded -translate-y-12">
                Foveal Center
              </span>
            </div>
          )}

          {/* Lesion Annotation Markers */}
          {viewerSettings.showLesions &&
            filteredCoordinates.map((coord, idx) => {
              const isHovered = hoveredCoordinate?.label === coord.label && hoveredCoordinate?.x === coord.x;
              const markerColor =
                coord.type === "Hemorrhage"
                  ? "border-red-500 bg-red-500/20 text-red-300"
                  : coord.type === "Microaneurysm"
                  ? "border-rose-400 bg-rose-400/30 text-rose-200"
                  : coord.type === "Hard Exudate"
                  ? "border-yellow-400 bg-yellow-400/20 text-yellow-200"
                  : coord.type === "Cotton Wool Spot"
                  ? "border-slate-200 bg-white/30 text-white"
                  : "border-teal-400 bg-teal-400/20 text-teal-200";

              return (
                <div
                  key={`${coord.type}-${coord.x}-${coord.y}-${idx}`}
                  onMouseEnter={() => setHoveredCoordinate(coord)}
                  onMouseLeave={() => setHoveredCoordinate(null)}
                  className="absolute cursor-pointer transition-all transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{
                    left: `${coord.x}%`,
                    top: `${coord.y}%`,
                    width: `${Math.max((coord.width || 3) * 3.5, 14)}px`,
                    height: `${Math.max((coord.height || 3) * 3.5, 14)}px`,
                  }}
                >
                  <div
                    className={cn(
                      "w-full h-full rounded-full border-2 transition-transform shadow-lg flex items-center justify-center",
                      markerColor,
                      isHovered ? "scale-150 ring-2 ring-white z-40 bg-opacity-70" : "scale-100 hover:scale-125"
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>
                </div>
              );
            })}
        </div>

        {/* Hovered Lesion Inspector Tooltip */}
        {hoveredCoordinate && (
          <div className="absolute bottom-4 left-4 z-40 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl text-xs text-white max-w-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between font-bold text-teal-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-teal-400" />
                {hoveredCoordinate.label}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-teal-950 border border-teal-800 text-[10px] text-teal-300 font-mono">
                {(hoveredCoordinate.confidence * 100).toFixed(1)}% Conf
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-0.5">
              <div>
                <span className="text-slate-400">Quadrant:</span> {hoveredCoordinate.quadrant}
              </div>
              <div>
                <span className="text-slate-400">Severity:</span>{" "}
                <span className="capitalize font-semibold text-rose-400">
                  {hoveredCoordinate.severity}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Coordinates:</span> ({hoveredCoordinate.x.toFixed(1)}%, {hoveredCoordinate.y.toFixed(1)}%)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Bottom Control Dock */}
      {showControls && (
        <div className="bg-slate-900/95 border-t border-slate-800 px-4 py-3 z-30 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Layer Toggles & Opacity */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* GradCAM Toggle & Slider */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewerSettings({ showGradCam: !viewerSettings.showGradCam })}
                className={cn(
                  "flex items-center gap-1.5 font-medium px-2 py-0.5 rounded transition-colors",
                  viewerSettings.showGradCam
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Grad-CAM Heatmap
              </button>
              {viewerSettings.showGradCam && (
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={viewerSettings.gradCamOpacity}
                  onChange={(e) =>
                    setViewerSettings({ gradCamOpacity: parseFloat(e.target.value) })
                  }
                  className="w-16 accent-rose-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                  title="Grad-CAM Opacity"
                />
              )}
            </div>

            {/* Lesion Markers Toggle */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewerSettings({ showLesions: !viewerSettings.showLesions })}
                className={cn(
                  "flex items-center gap-1.5 font-medium px-2 py-0.5 rounded transition-colors",
                  viewerSettings.showLesions
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                Lesions ({filteredCoordinates.length})
              </button>

              {/* Lesion Type Filter */}
              {viewerSettings.showLesions && (
                <select
                  value={viewerSettings.selectedLesionType}
                  onChange={(e) =>
                    setViewerSettings({ selectedLesionType: e.target.value as LesionType | "ALL" })
                  }
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded px-2 py-0.5 focus:ring-1 focus:ring-teal-500 outline-none"
                >
                  {lesionTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quadrant & Guide Toggles */}
            <button
              onClick={() => setViewerSettings({ showQuadrants: !viewerSettings.showQuadrants })}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                viewerSettings.showQuadrants
                  ? "bg-teal-900/60 border-teal-500/50 text-teal-300"
                  : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200"
              )}
            >
              <Grid className="w-3.5 h-3.5" />
              Quadrants
            </button>
          </div>

          {/* Zoom & Reset Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
              <button
                onClick={() => handleZoom(-0.2)}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-slate-300 px-1">
                {(viewerSettings.zoomLevel * 100).toFixed(0)}%
              </span>
              <button
                onClick={() => handleZoom(0.2)}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={resetViewerSettings}
              className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
