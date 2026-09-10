import React, { useState, useRef } from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  ExternalLink,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft,
  Eye,
} from "lucide-react";

interface LiveStudioCanvasProps {
  dark?: boolean;
  initialPath?: string;
  onClose?: () => void;
}

export function LiveStudioCanvas({
  dark = true,
  initialPath = "/",
  onClose,
}: LiveStudioCanvasProps) {
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">("mobile");
  const [currentPath, setCurrentPath] = useState(initialPath);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = currentPath;
    }
  };

  const PATHS = [
    { label: "الرئيسية 🏠", path: "/" },
    { label: "مدارسنا 🏛️", path: "/about" },
    { label: "الاعتمادات 🛡️", path: "/accreditations" },
    { label: "القبول والرسوم 💰", path: "/admissions" },
    { label: "مجلة العقيق 📖", path: "/journal" },
  ];

  return (
    <div
      className={`rounded-3xl border flex flex-col h-[750px] overflow-hidden shadow-2xl transition-all duration-300 ${
        dark ? "border-white/10 bg-[#070b10]" : "border-black/10 bg-slate-100 shadow-lg"
      }`}
    >
      {/* Canvas Controls Header */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b backdrop-blur-xl ${
          dark ? "border-white/10 bg-black/40 text-white" : "border-black/10 bg-white text-slate-800"
        }`}
      >
        {/* Device Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/10 dark:bg-white/5 border border-current/10">
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              device === "mobile"
                ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone size={13} />
            <span>آيفون (موبايل)</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice("tablet")}
            className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              device === "tablet"
                ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Tablet size={13} />
            <span>آيباد (تابلت)</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              device === "desktop"
                ? dark ? "bg-[#f8ca14] text-black shadow" : "bg-[#08467d] text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Monitor size={13} />
            <span>كمبيوتر</span>
          </button>
        </div>

        {/* Path Quick Jump Pills */}
        <div className="hidden sm:flex items-center gap-1 overflow-x-auto">
          {PATHS.map((p) => (
            <button
              key={p.path}
              type="button"
              onClick={() => {
                setCurrentPath(p.path);
                if (iframeRef.current) iframeRef.current.src = p.path;
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                currentPath === p.path
                  ? "border-amber-400 bg-amber-400/10 text-amber-400 font-black"
                  : "border-current/10 text-slate-400 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Refresh & Open External */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-current/10 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            title="إعادة تحميل الكانفاس"
          >
            <RotateCcw size={13} />
          </button>
          <a
            href={currentPath}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-current/10 hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="فتح في تبويب مستقل"
          >
            <ExternalLink size={13} />
          </a>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black transition cursor-pointer"
            >
              إغلاق
            </button>
          )}
        </div>
      </div>

      {/* Frame Container with Adaptive Viewport */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-dot-grid">
        <div
          className={`transition-all duration-300 rounded-[2.5rem] p-3 shadow-2xl border ${
            device === "mobile"
              ? "w-[390px] h-[680px] bg-[#1a1e26] border-slate-700/80 ring-8 ring-black/40"
              : device === "tablet"
              ? "w-[720px] h-[680px] bg-[#1a1e26] border-slate-700/80 ring-8 ring-black/40"
              : "w-full h-full rounded-2xl bg-transparent border-transparent ring-0 p-0"
          }`}
        >
          {/* Dynamic Island / Bezel Notch for mobile */}
          {device === "mobile" && (
            <div className="mx-auto w-24 h-4 rounded-full bg-black mb-2 shadow-inner" />
          )}

          <iframe
            ref={iframeRef}
            src={currentPath}
            title="Live Preview Canvas"
            className="w-full h-full rounded-[2rem] border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
}
