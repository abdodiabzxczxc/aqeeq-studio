import React, { useState } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  Check,
  Sparkles,
  ArrowRight,
  Layers,
  FilePlus,
  Sliders,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export type DeviceMode = "desktop" | "tablet" | "mobile" | "fluid";

export type StudioPageOption = {
  path: string;
  label: string;
  icon: string;
};

export const STUDIO_PAGES: StudioPageOption[] = [
  { path: "/", label: "الصفحة الرئيسية", icon: "🏠" },
  { path: "/about", label: "عن مدارس العقيق", icon: "🏛️" },
  { path: "/albums", label: "معارض الألبومات", icon: "📸" },
  { path: "/articles", label: "المقالات والأخبار", icon: "📰" },
  { path: "/journal", label: "مجلة العقيق المدرسية", icon: "📖" },
  { path: "/admissions", label: "القبول والتسجيل", icon: "💰" },
  { path: "/accreditations", label: "الاعتمادات والجودة", icon: "🛡️" },
  { path: "/atheer", label: "أثير وبودكاست العقيق", icon: "🎙️" },
];

export function StudioTopBar({
  currentPath,
  onSelectPath,
  device,
  onSelectDevice,
  viewportWidth,
  viewportHeight,
  zoom,
  onSelectZoom,
  isLivePreview,
  onToggleLivePreview,
  undoCount = 0,
  redoCount = 0,
  dirtyCount = 0,
  smartAutoDetect = false,
  onToggleSmartAutoDetect,
  onOpenSnapshots,
  onUndo,
  onRedo,
  onPublish,
  onRefresh,
}: {
  currentPath: string;
  onSelectPath: (path: string) => void;
  device: DeviceMode;
  onSelectDevice: (device: DeviceMode) => void;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
  onSelectZoom: (zoom: number) => void;
  isLivePreview: boolean;
  onToggleLivePreview: () => void;
  undoCount?: number;
  redoCount?: number;
  dirtyCount?: number;
  smartAutoDetect?: boolean;
  onToggleSmartAutoDetect?: () => void;
  onOpenSnapshots?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onPublish?: () => void;
  onRefresh?: () => void;
}) {
  const [, navigate] = useLocation();
  const [pageMenuOpen, setPageMenuOpen] = useState(false);

  const currentPage = STUDIO_PAGES.find((p) => p.path === currentPath) || {
    path: currentPath,
    label: currentPath === "/" ? "الصفحة الرئيسية" : currentPath,
    icon: "📄",
  };

  return (
    <header
      data-aq-studio-topbar
      className="relative z-50 flex h-14 items-center justify-between border-b border-white/10 bg-[#07090e]/95 px-4 text-white shadow-2xl backdrop-blur-2xl"
      dir="rtl"
    >
      {/* ── RIGHT (in RTL): Brand, Exit, Page Switcher ───────────── */}
      <div className="flex items-center gap-3">
        {/* Exit to Admin */}
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          title="العودة إلى لوحة الإدارة"
        >
          <ArrowRight size={14} />
          <span className="hidden sm:inline">لوحة الإدارة</span>
        </button>

        {/* Brand Label */}
        <div className="hidden md:flex items-center gap-2 border-r border-white/10 pr-3">
          <span className="relative grid h-7 w-7 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-[0_0_15px_rgba(251,191,36,0.35)]">
            <Sparkles size={14} className="font-black" />
          </span>
          <div className="leading-tight">
            <div className="text-xs font-black text-white">استوديو العقيق الإبداعي</div>
            <div className="text-[9px] font-bold text-amber-400 tracking-wider">PRO STUDIO IDE</div>
          </div>
        </div>

        {/* Page Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPageMenuOpen(!pageMenuOpen)}
            className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-black text-amber-200 transition hover:border-amber-400/60 hover:bg-amber-400/15"
          >
            <span>{currentPage.icon}</span>
            <span>{currentPage.label}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${pageMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {pageMenuOpen && (
            <div
              className="absolute top-full right-0 mt-2 w-56 rounded-2xl border border-white/15 bg-[#0f141f] p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50"
              onClick={() => setPageMenuOpen(false)}
            >
              <div className="px-2 py-1 text-[10px] font-black text-slate-400">اختر صفحة للتعديل:</div>
              <div className="space-y-0.5">
                {STUDIO_PAGES.map((page) => (
                  <button
                    key={page.path}
                    type="button"
                    onClick={() => onSelectPath(page.path)}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-right text-xs font-bold transition ${
                      currentPath === page.path
                        ? "bg-amber-400 text-black font-black shadow"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{page.icon}</span>
                      <span>{page.label}</span>
                    </span>
                    {currentPath === page.path && <Check size={13} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CENTER: Viewport Device Switcher & Dimensions ──────────── */}
      <div className="flex items-center gap-2">
        {/* Device Switcher */}
        <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-black/40 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => onSelectDevice("desktop")}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition ${
              device === "desktop"
                ? "bg-amber-400 text-black font-black shadow"
                : "text-slate-400 hover:text-white"
            }`}
            title="شاشة كمبيوتر (1440px)"
          >
            <Monitor size={14} />
            <span className="hidden lg:inline text-[11px]">كمبيوتر</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectDevice("tablet")}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition ${
              device === "tablet"
                ? "bg-amber-400 text-black font-black shadow"
                : "text-slate-400 hover:text-white"
            }`}
            title="شاشة آيباد (768px)"
          >
            <Tablet size={14} />
            <span className="hidden lg:inline text-[11px]">آيباد</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectDevice("mobile")}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition ${
              device === "mobile"
                ? "bg-amber-400 text-black font-black shadow"
                : "text-slate-400 hover:text-white"
            }`}
            title="شاشة هاتف (390px)"
          >
            <Smartphone size={14} />
            <span className="hidden lg:inline text-[11px]">هاتف</span>
          </button>
        </div>

        {/* Viewport Dimension Display */}
        <div
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl border border-white/5 bg-black/40 text-[10px] font-mono text-slate-400 font-bold"
          dir="ltr"
        >
          <span>{viewportWidth}</span>
          <span className="text-slate-600">×</span>
          <span>{viewportHeight}</span>
        </div>

        {/* Zoom Selector */}
        <div className="hidden xl:flex items-center gap-1 text-[11px] font-bold text-slate-400">
          {[100, 75, 50].map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => onSelectZoom(z)}
              className={`rounded-lg px-2 py-0.5 transition ${
                zoom === z ? "bg-white/15 text-white font-black" : "hover:text-white"
              }`}
            >
              {z}%
            </button>
          ))}
        </div>
      </div>

      {/* ── LEFT (in RTL): Undo, Redo, Preview, Publish ───────────── */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
          <button
            type="button"
            onClick={onUndo}
            disabled={!undoCount}
            className="rounded-xl p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-25"
            title="تراجع (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!redoCount}
            className="rounded-xl p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-25"
            title="إعادة (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Refresh Canvas */}
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          title="إعادة تحميل الكانفاس"
        >
          <RotateCcw size={15} />
        </button>

        {/* Open in New Tab */}
        <a
          href={currentPath}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          title="معاينة الصفحة في تبويب مستقل"
        >
          <ExternalLink size={15} />
        </a>

        {/* Smart Auto-Detect Toggle Button */}
        {onToggleSmartAutoDetect && (
          <button
            type="button"
            onClick={onToggleSmartAutoDetect}
            className={`hidden md:flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              smartAutoDetect
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
            }`}
            title={smartAutoDetect ? "المحرر الذكي مفعل (اضغط للإيقاف والتركيز على العناصر الأساسية)" : "المحرر الذكي معطل (اضغط للتفعيل لالتقاط أي نص أو صورة)"}
          >
            <span className="relative flex h-2 w-2">
              {smartAutoDetect && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${smartAutoDetect ? "bg-emerald-400" : "bg-slate-500"}`} />
            </span>
            <span>{smartAutoDetect ? "⚡ ذكي: مفعل" : "💤 ذكي: معطل"}</span>
          </button>
        )}

        {/* Snapshots Button */}
        {onOpenSnapshots && (
          <button
            type="button"
            onClick={onOpenSnapshots}
            className="hidden lg:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
            title="حفظ واستعادة نسخ التصميم الاحتياطية (Design Snapshots)"
          >
            <Camera size={14} className="text-amber-300" />
            <span>لقطة تصميم</span>
          </button>
        )}

        {/* Live Visitor Preview Toggle */}
        <button
          type="button"
          onClick={onToggleLivePreview}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
            isLivePreview
              ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
          title={isLivePreview ? "العودة لوضع التحرير والتصميم" : "معاينة الصفحة كزائر حقيقي"}
        >
          {isLivePreview ? <EyeOff size={14} /> : <Eye size={14} />}
          <span className="hidden sm:inline">{isLivePreview ? "عودة للتصميم" : "معاينة كزائر"}</span>
        </button>

        {/* Dirty Count Indicator Badge */}
        {dirtyCount > 0 && (
          <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-black text-amber-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span>{dirtyCount} تعديل</span>
          </div>
        )}

        {/* Master Publish Button */}
        <button
          type="button"
          onClick={onPublish}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1.5 text-xs font-black text-amber-950 shadow-[0_0_20px_rgba(251,191,36,0.35)] transition hover:from-amber-300 hover:to-amber-400 active:scale-95 cursor-pointer"
        >
          <Check size={16} className="stroke-[3]" />
          <span>نشر التعديلات</span>
        </button>
      </div>
    </header>
  );
}
