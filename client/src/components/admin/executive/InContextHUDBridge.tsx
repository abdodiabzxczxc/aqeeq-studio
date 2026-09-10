import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  Sparkles,
  Sliders,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Layers,
  GraduationCap,
  Building2,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export function InContextHUDBridge() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState(false);

  // Only show if user is admin and not currently on /admin
  if (!isAuthenticated || user?.role !== "admin" || location.startsWith("/admin")) {
    return null;
  }

  // Determine current context
  const getContextInfo = () => {
    if (location === "/") return { label: "تعديل محتوى الرئيسية", pillar: "pages", section: "homepage" };
    if (location.startsWith("/about")) return { label: "تعديل محتوى مدارسنا", pillar: "pages", section: "about" };
    if (location.startsWith("/admissions")) return { label: "إدارة القبول والتسجيل", pillar: "admissions", section: "inbox" };
    if (location.startsWith("/accreditations")) return { label: "تعديل الاعتمادات والجوائز", pillar: "pages", section: "accreditations" };
    if (location.startsWith("/journal")) return { label: "استوديو المجلات 3D", pillar: "media", section: "master" };
    if (location.startsWith("/albums")) return { label: "استوديو ألبومات الفعاليات", pillar: "media", section: "master" };
    if (location.startsWith("/podcasts") || location.startsWith("/podcast")) return { label: "بودكاست العقيق", pillar: "media", section: "master" };
    return { label: "غرفة القيادة التنفيذية", pillar: "admissions", section: "inbox" };
  };

  const ctx = getContextInfo();

  return (
    <div
      dir="rtl"
      className="fixed bottom-6 left-6 z-50 select-none animate-in fade-in slide-in-from-bottom-4 duration-300 font-[Tajawal,sans-serif]"
    >
      <div className="rounded-2xl border border-amber-400/40 bg-[#070b10]/95 text-white shadow-2xl backdrop-blur-2xl p-2 flex flex-col gap-2 min-w-[240px]">
        {/* Header Pill */}
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <span className="text-[11px] font-black text-amber-400 tracking-tight">وضع الإشراف والتحكم الحي</span>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        {/* Quick Context Jump Button */}
        <button
          type="button"
          onClick={() => navigate(`/admin?pillar=${ctx.pillar}&section=${ctx.section}`)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-400 hover:bg-yellow-300 text-black font-black text-xs transition shadow-md cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sliders size={14} />
            <span>{ctx.label}</span>
          </div>
          <span className="text-[10px] bg-black/15 px-1.5 py-0.5 rounded-md">الداش بورد ⚙️</span>
        </button>

        {/* Expanded Quick Links */}
        {expanded && (
          <div className="space-y-1 pt-1 border-t border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => navigate("/admin?pillar=admissions")}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition text-right cursor-pointer"
            >
              <GraduationCap size={13} className="text-emerald-400" />
              <span>1. القبول والتسجيل (الطلبات والتواصل)</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin?pillar=finance")}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition text-right cursor-pointer"
            >
              <Building2 size={13} className="text-amber-400" />
              <span>2. الرسوم الدراسية وحاسبة الأقساط</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin?pillar=pages")}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition text-right cursor-pointer"
            >
              <Globe size={13} className="text-blue-400" />
              <span>3. صفحات الموقع (الرئيسية، مدارسنا، الاعتمادات)</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin?pillar=media")}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition text-right cursor-pointer"
            >
              <Layers size={13} className="text-indigo-400" />
              <span>4. المركز الإعلامي (المجلات، الألبومات، المقالات)</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin?pillar=community")}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition text-right cursor-pointer"
            >
              <Sparkles size={13} className="text-violet-400" />
              <span>5. الأسئلة الشائعة والشركاء</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin?pillar=channels")}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition text-right cursor-pointer"
            >
              <Globe size={13} className="text-cyan-400" />
              <span>6. القنوات وبوابات الوزارة وروابط الفوتر</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin?pillar=alerts")}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition text-right cursor-pointer"
            >
              <ShieldCheck size={13} className="text-rose-400" />
              <span>7. الإعلانات والمواسم ووضع الصيانة</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
