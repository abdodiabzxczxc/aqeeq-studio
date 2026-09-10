import React, { useState, useRef } from "react";
import {
  Crosshair,
  Smartphone,
  Square,
  Monitor,
  RotateCcw,
  Sparkles,
  Check,
} from "lucide-react";

interface FocalPoint {
  x: number;
  y: number;
}

interface SmartFocalImageEngineProps {
  imageUrl: string;
  focalPoint?: FocalPoint;
  onChangeFocalPoint: (point: FocalPoint) => void;
  dark?: boolean;
}

export function SmartFocalImageEngine({
  imageUrl,
  focalPoint = { x: 50, y: 50 },
  onChangeFocalPoint,
  dark = true,
}: SmartFocalImageEngineProps) {
  const [point, setPoint] = useState<FocalPoint>(focalPoint);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    const clampedPoint = {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
    setPoint(clampedPoint);
    onChangeFocalPoint(clampedPoint);
  };

  const handleReset = () => {
    const center = { x: 50, y: 50 };
    setPoint(center);
    onChangeFocalPoint(center);
  };

  const objectPosStyle = `${point.x}% ${point.y}%`;

  return (
    <div
      className={`p-5 rounded-3xl border space-y-5 ${
        dark ? "border-white/10 bg-[#0c1015]" : "border-black/10 bg-white shadow-xs"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-current/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Crosshair size={16} />
          </div>
          <div>
            <h4 className="text-xs font-black">محرك التركيز البؤري الذكي للصور (Focal Point)</h4>
            <p className="text-[10px] text-slate-400 font-bold">
              اضغط بالماوس على وجه الشخص أو مركز الصورة لمنع قصّه على شاشات الجوال
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold px-2 py-1 rounded-md bg-white/5 border border-current/10 text-amber-400">
            X: {point.x}% | Y: {point.y}%
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg border border-current/10 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            title="إعادة ضبط للمنتصف"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className="space-y-2">
        <span className="text-[11px] font-black text-slate-300 block">
          اضغط على الصورة لتحديد نقطة التركيز البؤري:
        </span>
        <div
          onClick={handleImageClick}
          className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden cursor-crosshair border border-current/10 bg-black/40 group select-none"
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Focal Canvas"
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Target Crosshair Marker */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="absolute h-8 w-8 rounded-full border-2 border-amber-400 bg-amber-400/20 animate-ping" />
              <div className="h-4 w-4 rounded-full border-2 border-white bg-amber-500 shadow-md" />
              <div className="absolute -top-5 text-[9px] font-black font-mono text-amber-300 bg-black/80 px-1.5 rounded">
                {point.x}%,{point.y}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Triple Viewport Live Previews */}
      <div className="space-y-2 pt-2 border-t border-current/10">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-amber-400" />
          <span className="text-[11px] font-black text-slate-300">
            المعاينة اللحظية لشكل الصورة على شاشات الزوار الثلاث:
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Mobile Vertical (9:16) */}
          <div className="space-y-1.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
              <Smartphone size={11} />
              <span>ستوري موبايل (9:16)</span>
            </div>
            <div className="w-full aspect-[9/14] rounded-xl overflow-hidden border border-current/10 bg-black/30">
              <img
                src={imageUrl}
                alt="Mobile"
                className="w-full h-full object-cover transition-all duration-150"
                style={{ objectPosition: objectPosStyle }}
              />
            </div>
          </div>

          {/* Square Bento (1:1) */}
          <div className="space-y-1.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
              <Square size={11} />
              <span>مربع البنتو (1:1)</span>
            </div>
            <div className="w-full aspect-square rounded-xl overflow-hidden border border-current/10 bg-black/30">
              <img
                src={imageUrl}
                alt="Square"
                className="w-full h-full object-cover transition-all duration-150"
                style={{ objectPosition: objectPosStyle }}
              />
            </div>
          </div>

          {/* Desktop Wide (16:9) */}
          <div className="space-y-1.5 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400">
              <Monitor size={11} />
              <span>غلاف عريض (16:9)</span>
            </div>
            <div className="w-full aspect-[16/10] rounded-xl overflow-hidden border border-current/10 bg-black/30">
              <img
                src={imageUrl}
                alt="Wide"
                className="w-full h-full object-cover transition-all duration-150"
                style={{ objectPosition: objectPosStyle }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
