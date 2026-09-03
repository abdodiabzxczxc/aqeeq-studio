import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Sparkles, Activity, BookOpen, Camera, FileText, Database, ShieldCheck, ArrowUpLeft } from "lucide-react";
import { VisualEditable } from "@/components/VisualEditor";
import { useLocation } from "wouter";

function RollingNumber({ value, duration = 1.6 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = value;
    if (end === 0) {
      setDisplay(0);
      return;
    }
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(1, elapsed / duration);
      // Easing: easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(ease * end);
      setDisplay(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setDisplay(end);
      }
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums font-mono">
      {String(display).padStart(2, "0")}
    </span>
  );
}

interface LiveArchiveProps {
  dark: boolean;
  totalPosts: number;
  totalIssues: number;
  totalAlbums: number;
  totalPages: number;
  totalMedia: number;
}

export function AqeeqLiveArchiveSection({
  dark,
  totalPosts,
  totalIssues,
  totalAlbums,
  totalPages,
  totalMedia,
}: LiveArchiveProps) {
  const [, navigate] = useLocation();

  const pods = [
    {
      id: "posts",
      kicker: "LIVE FEED & UPDATES",
      title: "منشور وخبر حي",
      value: totalPosts,
      icon: <Activity size={22} className="text-emerald-400" />,
      tag: "تغطية فورية",
      tagColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      glowColor: "rgba(16, 185, 129, 0.25)",
      href: "/offers",
    },
    {
      id: "issues",
      kicker: "DIGITAL ISSUES",
      title: "عدد مجلة منشور",
      value: totalIssues,
      icon: <BookOpen size={22} className="text-amber-400" />,
      tag: "إصدار رسمي",
      tagColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      glowColor: "rgba(245, 158, 11, 0.25)",
      href: "/journal",
    },
    {
      id: "albums",
      kicker: "PHOTO ARCHIVE",
      title: "ألبوم فعالية موثق",
      value: totalAlbums,
      icon: <Camera size={22} className="text-sky-400" />,
      tag: "معرض فوتوغرافي",
      tagColor: "bg-sky-500/15 text-sky-400 border-sky-500/30",
      glowColor: "rgba(14, 165, 233, 0.25)",
      href: "/albums",
    },
    {
      id: "pages",
      kicker: "PRESERVED PAGES",
      title: "صفحة صحفية محفوظة",
      value: totalPages,
      icon: <FileText size={22} className="text-purple-400" />,
      tag: "أرشيف توثيقي",
      tagColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      glowColor: "rgba(168, 85, 247, 0.25)",
      href: "/journal",
    },
    {
      id: "media",
      kicker: "VERIFIED MEDIA",
      title: "صورة وفيديو معتمد",
      value: totalMedia,
      icon: <Database size={22} className="text-[#f8ca14]" />,
      tag: "خزينة وسائط",
      tagColor: "bg-[#f8ca14]/15 text-[#f8ca14] border-[#f8ca14]/30",
      glowColor: "rgba(248, 202, 20, 0.25)",
      href: "/albums",
    },
  ];

  return (
    <VisualEditable
      id="studio-archive-summary"
      tag="section"
      label="قسم الأرشيف المفتوح"
      as="section"
      className="mx-auto max-w-[1380px] px-4 sm:px-6 md:px-8 py-16 md:py-24 relative overflow-hidden"
    >
      {/* Container with Cybernetic Glass Architecture */}
      <div className={`rounded-[3rem] border relative overflow-hidden backdrop-blur-3xl shadow-2xl p-6 sm:p-10 md:p-14 ${
        dark
          ? "border-white/10 bg-[#060a0f]/95 text-white shadow-black/90"
          : "border-slate-200 bg-white/95 text-slate-900 shadow-2xl shadow-slate-200"
      }`}>
        
        {/* Ambient Grid Lines in Background */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:4rem_4rem]" />
        
        {/* Golden Radial Glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#f8ca14]/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />

        {/* Top Header Row */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/10">
          <div className="max-w-2xl text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border mb-4 text-[10px] font-black tracking-widest uppercase bg-[#f8ca14]/10 border-[#f8ca14]/30 text-[#f8ca14]">
              <Sparkles size={13} />
              <span>THE OPEN DIGITAL CORE · الذاكرة الرقمية الحية</span>
            </div>

            <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black font-cairo leading-tight ${dark ? "text-white" : "text-black"}`}>
              أرشيف العقيق <span className={dark ? "text-[#f8ca14]" : "text-[#08467d]"}>المفتوح الشامل.</span>
            </h2>

            {/* Glowing Golden Accent Line (يتمدد وينكمش - بيصغر ويكبر في عرضه) */}
            <motion.div
              initial={{ width: "35px" }}
              whileInView={{ width: ["35px", "190px", "35px"] }}
              viewport={{ once: false }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              className={`h-1 sm:h-[3.5px] rounded-full my-3.5 ${
                dark
                  ? "bg-gradient-to-l from-[#f8ca14] via-[#f8ca14]/80 to-transparent shadow-[0_0_14px_rgba(248,202,20,0.55)]"
                  : "bg-gradient-to-l from-[#08467d] via-[#08467d]/80 to-transparent shadow-[0_0_10px_rgba(8,70,125,0.4)]"
              }`}
            />

            <p className={`mt-3 text-xs sm:text-sm leading-relaxed max-w-xl ${dark ? "text-slate-300" : "text-slate-600"}`}>
              منظومة إحصائية حية توثق النبض اليومي لمدارس العقيق، من الأخبار والعروض المباشرة والمجلات والألبومات، متاحة بشفافية تامة للمجتمع المدرسي.
            </p>
          </div>

          {/* Live System Status Pill */}
          <div className={`self-start md:self-auto flex items-center gap-3 px-4 py-2 rounded-2xl border text-xs font-bold ${
            dark ? "bg-white/5 border-white/10 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
          }`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-mono text-[11px]">محدث لحظياً · 100% شفافية</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5 3D HOLOGRAPHIC DATA PODS (PILLARS)                                      */}
        {/* ========================================================================= */}
        <div className="relative z-10 mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {pods.map((pod, idx) => (
            <motion.div
              key={pod.id}
              whileHover={{ y: -10, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={() => navigate(pod.href)}
              className={`group relative rounded-[2rem] border p-6 flex flex-col justify-between min-h-[220px] sm:min-h-[240px] cursor-pointer transition-all duration-300 shadow-lg ${
                dark
                  ? "bg-[#0b1219]/80 border-white/10 hover:border-[#f8ca14]/50 hover:bg-[#101b26]"
                  : "bg-white/90 border-slate-200 hover:border-[#08467d]/40 hover:bg-slate-50 shadow-slate-100"
              }`}
              style={{
                boxShadow: dark ? `0 10px 30px -10px ${pod.glowColor}` : undefined,
              }}
            >
              {/* Top Row inside Pod */}
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl border shadow-inner ${
                  dark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
                }`}>
                  {pod.icon}
                </div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${pod.tagColor}`}>
                  {pod.tag}
                </span>
              </div>

              {/* Number and Label */}
              <div className="mt-6 text-right">
                <span className="block text-[9px] font-black tracking-widest uppercase font-mono text-slate-400 mb-1">
                  {pod.kicker}
                </span>
                <div className={`text-4xl sm:text-5xl font-black font-cairo ${dark ? "text-white" : "text-black"}`}>
                  <RollingNumber value={pod.value} />
                </div>
                <p className={`text-xs font-bold mt-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                  {pod.title}
                </p>
              </div>

              {/* Hover Indicator */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-black text-[#f8ca14] opacity-0 group-hover:opacity-100 transition-opacity">
                <span>استكشاف الأرشيف</span>
                <ArrowUpLeft size={13} className="transition-transform group-hover:-translate-x-1" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Trust Seal */}
        <div className="relative z-10 mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>جميع البيانات مستخرجة مباشرة من قواعد بيانات استوديو مدارس العقيق وموثقة رقمياً.</span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/journal")}
            className="font-bold text-[#f8ca14] hover:underline flex items-center gap-1"
          >
            <span>زيارة المستودع الرقمي الكامل</span>
            <ArrowUpLeft size={13} />
          </button>
        </div>
      </div>
    </VisualEditable>
  );
}
