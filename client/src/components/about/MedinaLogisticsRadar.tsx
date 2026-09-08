import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Bus,
  Navigation,
  MessageCircle,
  Phone,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle,
} from "lucide-react";
import { AqeeqSectionHeader } from "@/components/AqeeqSectionHeader";

interface Neighborhood {
  name: string;
  eta: string;
  coverage: string;
  buses: string;
}

const NEIGHBORHOODS: Neighborhood[] = [
  { name: "حي الرانوناء", eta: "دقيقتان", coverage: "محيط المدارس المباشر", buses: "خطوط سير مباشرة كل 10 دقائق" },
  { name: "ممشى الهجرة", eta: "3 دقائق", coverage: "بمحاذاة الممشى (خلف نايس برايس)", buses: "أسطول نقل صباحي ومسائي" },
  { name: "حي العزيزية", eta: "12 دقيقة", coverage: "تغطية شاملة للمخططات", buses: "باصات حديثة ومكيفة بنظام GPS" },
  { name: "حي باقدو", eta: "8 دقائق", coverage: "محاور وصول سريعة", buses: "تتبع ذكي ومشرفة مرافقة" },
  { name: "طريق الهجرة", eta: "5 دقائق", coverage: "شريان رئيسي مباشر", buses: "نقل سريع وآمن 100%" },
  { name: "المنطقة المركزية (الحرم)", eta: "12 دقيقة", coverage: "ربط مباشر بالدائري الثاني", buses: "مواعيد منضبطة مع الصلوات" },
  { name: "حي الخالدية", eta: "14 دقيقة", coverage: "تغطية كاملة للأحياء السكنية", buses: "كاميرات مراقبة وتتبع لحظي" },
  { name: "حي قباء", eta: "10 دقائق", coverage: "مسار هادئ وسلس", buses: "خدمة توصيل من الباب للباب" },
  { name: "حي شوران", eta: "10 دقائق", coverage: "تغطية المخططات الجنوبية", buses: "أسطول متكامل لجميع المراحل" },
];

interface MedinaLogisticsRadarProps {
  dark?: boolean;
}

export function MedinaLogisticsRadar({ dark = true }: MedinaLogisticsRadarProps) {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood>(NEIGHBORHOODS[0]);

  return (
    <section id="map-contact-section" className="py-20 w-full max-w-[1380px] 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 md:px-8">
      {/* 1. Unified Section Header */}
      <AqeeqSectionHeader
        id="about-logistics"
        badge="الموقع الجغرافي والوصول المباشر · حي الرانوناء"
        badgeIcon={<MapPin size={14} className="text-[#f8ca14]" />}
        title="في قلب المدينة المنورة — مركز القيادة والرادار اللوجستي 📍"
        subtitle="بمحاذاة ممشى الهجرة (خلف نايس برايس) مع تغطية شاملة لأسطول النقل المدرسي المكيف والآمن لكافة أحياء طيبة الطيبة."
        dark={dark}
        align="right"
      />

      {/* 2. Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full text-right">
        {/* Logistics Radar & Transportation Deck (7 cols) */}
        <div
          className={`lg:col-span-7 rounded-3xl border p-6 sm:p-9 flex flex-col justify-between shadow-xl transition-colors ${
            dark ? "border-white/10 bg-[#0c1218]" : "border-[#08467d]/15 bg-white"
          }`}
        >
          <div>
            {/* Live Radar Pulse Indicator */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f8ca14] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#f8ca14]"></span>
                </span>
                <span className="text-xs font-black text-[#08467d] dark:text-[#f8ca14]">
                  رادار النقل المدرسي نشط · تغطية حية لـ 9 أحياء
                </span>
              </div>
              <span className={`text-xs font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>
                طيبة الطيبة
              </span>
            </div>

            <h3 className={`text-xl sm:text-2xl font-black mb-2.5 ${dark ? "text-white" : "text-[#0a192f]"}`}>
              مجمعات العقيق الأهلية والدولية (بنين وبنات)
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed mb-6 font-medium ${dark ? "text-slate-300" : "text-slate-600"}`}>
              المدينة المنورة — حي الرانوناء — ممشى الهجرة (خلف نايس برايس). سهولة في الوصول عبر محاور الدائري الثاني وطريق الهجرة مع مواقف فسيحة مخصصة لأولياء الأمور.
            </p>

            {/* Prophet's Mosque Distance Callout */}
            <div className={`p-4 rounded-2xl border mb-6 flex items-center justify-between ${
              dark ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]" : "border-[#08467d]/20 bg-[#08467d]/5 text-[#08467d]"
            }`}>
              <div className="flex items-center gap-2.5 text-xs font-black">
                <Clock size={16} />
                <span>12 دقيقة فقط من المسجد النبوي الشريف وممشى الهجرة</span>
              </div>
              <span className="text-[11px] font-bold">وصول سلس ومباشر</span>
            </div>

            {/* Neighborhoods Simulator */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-black mb-3 text-slate-400">
                <Bus size={15} className="text-[#f8ca14]" />
                <span>اختر حيك للتحقق من خط سير الباص وزمن الوصول التقديري:</span>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] font-bold mb-4">
                {NEIGHBORHOODS.map((hood) => {
                  const isSelected = selectedNeighborhood.name === hood.name;
                  return (
                    <button
                      key={hood.name}
                      type="button"
                      onClick={() => setSelectedNeighborhood(hood)}
                      className={`px-3 py-1.5 rounded-xl border transition-all duration-200 active:scale-95 ${
                        isSelected
                          ? "bg-[#08467d] border-[#f8ca14] text-[#f8ca14] shadow-md ring-1 ring-[#f8ca14]/40"
                          : dark
                          ? "border-white/10 bg-black/40 text-slate-400 hover:text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:text-[#08467d]"
                      }`}
                    >
                      {isSelected ? "✦ " : ""}
                      {hood.name}
                    </button>
                  );
                })}
              </div>

              {/* Selected Neighborhood Status Box */}
              <div className={`p-4 rounded-2xl border ${
                dark ? "border-white/10 bg-black/50" : "border-slate-200 bg-slate-50"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-emerald-500" />
                    <span className="text-xs font-black text-emerald-500">حيك مغطى بالكامل بالأسطول المدرسي</span>
                  </div>
                  <span className={`text-xs font-black ${dark ? "text-white" : "text-black"}`}>
                    زمن الوصول التقريبي: <span className="text-[#f8ca14]">{selectedNeighborhood.eta}</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-[#f8ca14]" />
                    <span>{selectedNeighborhood.coverage}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bus size={13} className="text-[#f8ca14]" />
                    <span>{selectedNeighborhood.buses}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Navigation Action Row */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Al+Aqiq+Schools+Al+Ranuna+Madinah"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#08467d] to-[#042442] hover:opacity-95 text-[#f8ca14] border border-[#f8ca14]/30 px-6 py-3.5 text-xs font-black shadow-lg transition active:scale-95"
            >
              <Navigation size={16} />
              <span>اتجاهات القيادة المباشرة في Google Maps</span>
            </a>

            <a
              href="https://wa.me/966531896000?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%88%D9%82%D8%B9%20%D9%85%D8%AF%D8%A7%D8%B1%D8%B3%20%D8%A7%D9%84%D8%B9%D9%82%D9%8A%D9%82%20%D9%88%D8%AE%D8%AF%D9%85%D8%A7%D8%AA%20%D8%A7%D9%84%D9%86%D9%82%D9%84"
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-xs font-black transition ${
                dark
                  ? "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14] hover:bg-[#f8ca14]/20"
                  : "border-[#08467d]/20 bg-white text-[#08467d] hover:bg-slate-50"
              }`}
            >
              <MessageCircle size={15} />
              <span>إرسال اللوكيشن لجوالي عبر واتساب</span>
            </a>
          </div>
        </div>

        {/* Contact & Official Channels Card (5 cols) */}
        <div
          className={`lg:col-span-5 rounded-3xl border p-6 sm:p-9 flex flex-col justify-between shadow-xl transition-colors ${
            dark ? "border-white/10 bg-[#0c1218]" : "border-[#08467d]/15 bg-white"
          }`}
        >
          <div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#08467d]/20 text-[#08467d] dark:bg-[#f8ca14]/15 dark:text-[#f8ca14] mb-4 border border-[#f8ca14]/30">
              <Phone size={22} />
            </div>
            <h3 className={`text-2xl font-black mb-2 ${dark ? "text-white" : "text-[#0a192f]"}`}>
              أرقام المجمعات المباشرة
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed mb-6 font-medium ${dark ? "text-slate-400" : "text-slate-600"}`}>
              فريق القبول والاستقبال جاهز لخدمتكم يومياً من الأحد إلى الخميس، وتقديم الاستشارات التربوية والإجابة عن استفساراتكم.
            </p>

            <div className={`space-y-4 text-xs font-bold ${dark ? "text-slate-200" : "text-slate-800"}`}>
              <div className={`p-4 rounded-2xl border transition hover:scale-[1.01] ${dark ? "border-white/5 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-black text-[#08467d] dark:text-[#f8ca14]">مجمع البنين (الأهلي والدولي)</span>
                  <Phone size={14} className="text-slate-400" />
                </div>
                <a href="tel:+966148131652" className="text-base font-black hover:underline dir-ltr block text-right">
                  0148131652
                </a>
              </div>

              <div className={`p-4 rounded-2xl border transition hover:scale-[1.01] ${dark ? "border-white/5 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-black text-[#08467d] dark:text-[#f8ca14]">مجمع البنات والطفولة المبكرة</span>
                  <Phone size={14} className="text-slate-400" />
                </div>
                <a href="tel:+966148644466" className="text-base font-black hover:underline dir-ltr block text-right">
                  0148644466
                </a>
              </div>

              <div className={`p-4 rounded-2xl border transition hover:scale-[1.01] ${dark ? "border-[#f8ca14]/20 bg-[#f8ca14]/5" : "border-amber-200 bg-amber-50/50"}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-black text-[#f8ca14]">الواتساب الموحد للقبول والتسجيل</span>
                  <MessageCircle size={15} className="text-emerald-500" />
                </div>
                <a href="tel:+966531896000" className="text-base font-black hover:underline dir-ltr block text-right">
                  0531896000
                </a>
              </div>
            </div>
          </div>

          {/* Careers Callout */}
          <div className="pt-6 border-t border-white/10 mt-6">
            <a
              href="https://live.aqeeq.edu.sa/jobs"
              target="_blank"
              rel="noreferrer"
              className={`flex items-center justify-between p-4 rounded-2xl border transition hover:scale-[1.01] ${
                dark
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                  : "border-blue-200 bg-blue-50 text-blue-900 hover:bg-blue-100"
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs font-black">
                <Briefcase size={16} />
                <span>انضم لكادر العقيق · بوابة التوظيف الرسمية</span>
              </div>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
