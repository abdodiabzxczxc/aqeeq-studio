import React from "react";
import {
  Search,
  ExternalLink,
  Moon,
  Sun,
  Save,
  Command,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExecutiveTopBarProps {
  dark: boolean;
  toggleTheme: () => void;
  onOpenCommandPalette: () => void;
  onSaveAll: () => Promise<void> | void;
  isSaving: boolean;
  hasUnsavedChanges?: boolean;
}

export function ExecutiveTopBar({
  dark,
  toggleTheme,
  onOpenCommandPalette,
  onSaveAll,
  isSaving,
  hasUnsavedChanges = false,
}: ExecutiveTopBarProps) {
  return (
    <header
      className={`sticky top-0 z-40 flex h-16 w-full items-center justify-between px-4 sm:px-6 transition-colors duration-200 border-b backdrop-blur-2xl ${
        dark
          ? "border-white/[0.08] bg-[#070b10]/85 text-white"
          : "border-black/[0.06] bg-white/85 text-slate-900 shadow-sm"
      }`}
    >
      {/* Right Brand & System Live Indicator (RTL context) */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#f8ca14] to-amber-600 text-black font-black text-xs shadow-md shadow-amber-500/20">
            <span>ع</span>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs tracking-tight">نظام العقيق التنفيذي</span>
              <span className="rounded-md bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-black text-amber-400 border border-amber-400/20">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400">منصة إدارة الصرح التعليمي</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-black text-emerald-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>الأنظمة متصلة ومزامنة سحابياً</span>
        </div>
      </div>

      {/* Center Search / Command Launcher */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className={`flex items-center gap-3 rounded-2xl border px-3.5 py-1.5 text-xs font-bold transition-all group cursor-pointer ${
            dark
              ? "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white"
              : "border-black/10 bg-slate-50 text-slate-500 hover:border-black/20 hover:text-slate-900"
          }`}
        >
          <Search size={14} className="group-hover:scale-110 transition" />
          <span className="hidden sm:inline">بحث وتنقل فوري...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-current/20 bg-current/5 px-1.5 py-0.5 text-[10px] font-mono">
            <Command size={10} /> K
          </kbd>
        </button>
      </div>

      {/* Left Quick Action Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Open Live Portal */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition ${
            dark
              ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              : "border-black/10 bg-white text-slate-700 hover:bg-slate-50 shadow-xs"
          }`}
          title="معاينة البوابة الرسمية الحية"
        >
          <span>معاينة الموقع</span>
          <ExternalLink size={13} />
        </a>

        {/* Theme Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition cursor-pointer ${
            dark
              ? "border-white/10 bg-white/5 text-amber-400 hover:bg-white/10"
              : "border-black/10 bg-white text-slate-700 hover:bg-slate-100 shadow-xs"
          }`}
          title={dark ? "التحويل للمظهر النهاري" : "التحويل للمظهر الليلي"}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Global Save Button */}
        <Button
          type="button"
          onClick={() => onSaveAll()}
          disabled={isSaving}
          className={`h-9 rounded-xl font-black text-xs px-4 gap-2 transition-all cursor-pointer ${
            hasUnsavedChanges
              ? "bg-[#f8ca14] hover:bg-yellow-400 text-black shadow-lg shadow-amber-500/20 animate-pulse"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
          }`}
        >
          <Save size={14} className={isSaving ? "animate-spin" : ""} />
          <span>{isSaving ? "جارِ الحفظ..." : hasUnsavedChanges ? "حفظ التعديلات *" : "حفظ الكل"}</span>
        </Button>
      </div>
    </header>
  );
}
