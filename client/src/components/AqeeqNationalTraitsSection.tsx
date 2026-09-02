import React, { useState } from "react";
import { Sparkles, Shield, Heart, Eye, Award, Compass, ChevronRight, Check } from "lucide-react";
import { triggerNationalCelebration } from "./AqeeqCelebrationConfetti";

export interface TraitItem {
  id: string;
  name: string;
  title: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  iconPath: string;
  symbol: string;
  desc: string;
  quote: string;
  patternName: string;
}

export const NATIONAL_TRAITS: TraitItem[] = [
  {
    id: "generosity",
    name: "الكرم",
    title: "طبع الجود والضيافة",
    color: "#971a4d",
    badgeBg: "rgba(151, 26, 77, 0.15)",
    badgeBorder: "rgba(151, 26, 77, 0.4)",
    iconPath: "/themes/saudi-national-day/opt/icon_trait_5.webp",
    symbol: "الدلة والفنجان وسعف النخل",
    desc: "يعبر عن قيمة الكرم في الثقافة السعودية من خلال الدلة في الوسط رمزاً لفعل العطاء، وسعف النخيل لروح الترحيب والضيافة المتأصلة.",
    quote: "يجود بما في يديه، وطبعه العزّ والجود",
    patternName: "زخرفة الفنجان والجص الحساوي",
  },
  {
    id: "vision",
    name: "الرؤية",
    title: "طموح يعانق المستقبل",
    color: "#6565e0",
    badgeBg: "rgba(101, 101, 224, 0.15)",
    badgeBorder: "rgba(101, 101, 224, 0.4)",
    iconPath: "/themes/saudi-national-day/opt/icon_trait_6.webp",
    symbol: "رؤية 2030 ونقوش السدو",
    desc: "يجسد طموح المملكة نحو المستقبل، وما تمثله من تطلعات نحو التنمية المستدامة، والابتكار، وجودة الحياة لبناء مستقبل أكثر ازدهاراً.",
    quote: "عنان السماء هو حد طموحنا",
    patternName: "نقش السدو الهندسي المعاصر",
  },
  {
    id: "determination",
    name: "العزم",
    title: "شموخ كجبال طويق",
    color: "#0050af",
    badgeBg: "rgba(0, 80, 175, 0.15)",
    badgeBorder: "rgba(0, 80, 175, 0.4)",
    iconPath: "/themes/saudi-national-day/opt/icon_trait_3.webp",
    symbol: "جبل طويق والأبواب النجدية",
    desc: "مستلهم من جبل طويق والأبواب النجدية التقليدية، يمثل العزم والصمود وهوية المملكة الأصيلة التي تعكس القوة والصلابة والمجد.",
    quote: "همة السعوديين مثل جبل طويق.. لا تنكسر",
    patternName: "أبواب نجد وجبال اليمامة",
  },
  {
    id: "courage",
    name: "الشجاعة",
    title: "المنعة والحزم والأمان",
    color: "#5aba1c",
    badgeBg: "rgba(90, 186, 28, 0.15)",
    badgeBorder: "rgba(90, 186, 28, 0.4)",
    iconPath: "/themes/saudi-national-day/opt/icon_trait_2.webp",
    symbol: "السيف الأجرب والسهام",
    desc: "مستلهم من السيف الأجرب مع عناصر السهم والخنجر، ليمثل القيم التاريخية والوطنية للقوة والشجاعة والحزم في ترسيخ الأمن والاستقرار.",
    quote: "سيف الحق والمنعة والشهامة",
    patternName: "حبكة السيفين وسهام المجد",
  },
  {
    id: "giving",
    name: "العطاء الاستثنائي",
    title: "عطر الجود والبركة",
    color: "#7c5d21",
    badgeBg: "rgba(124, 93, 33, 0.15)",
    badgeBorder: "rgba(124, 93, 33, 0.4)",
    iconPath: "/themes/saudi-national-day/opt/icon_trait_4.webp",
    symbol: "المبخرة وتولة الطيب",
    desc: "مستلهم من المبخرة وتولة العود ليمثل قيمة العطاء والبذل، عاكساً ثقافة الإهداء والتقدير والبركة التي لطالما ميزت مجتمعنا.",
    quote: "عطاء يفيض وطيب يتوارث",
    patternName: "نفحات البخور والتولة الذهبية",
  },
  {
    id: "authenticity",
    name: "الأصالة",
    title: "جذور متوارثة وهوية خالدة",
    color: "#607c4f",
    badgeBg: "rgba(96, 124, 79, 0.15)",
    badgeBorder: "rgba(96, 124, 79, 0.4)",
    iconPath: "/themes/saudi-national-day/opt/icon_trait_1.webp",
    symbol: "شجرة الجذور وسعف السدر",
    desc: "مستلهم من شجرة العائلة وروابط الجينات المتوارثة، ليمثل الجذور العميقة واستمرارية الهوية عبر الأجيال، وترابط قيمنا الأصيلة.",
    quote: "جذور في الأرض.. وفروع تعانق السحاب",
    patternName: "نجمة السدو وشجرة الأجداد",
  },
];

interface Props {
  dark?: boolean;
}

export function AqeeqNationalTraitsSection({ dark = true }: Props) {
  const [activeTrait, setActiveTrait] = useState<TraitItem>(NATIONAL_TRAITS[0]);

  return (
    <section
      aria-label="القيم الوطنية الست - عزنا بطبعنا"
      className="relative overflow-hidden py-12 sm:py-20"
    >
      {/* Subtle Ambient Background Light corresponding to the active trait color */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 transition-all duration-700 blur-[130px]"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${activeTrait.color} 0%, #005A36 40%, transparent 80%)`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Badge & Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f8ca14]/30 bg-[#f8ca14]/10 px-4 py-1.5 text-xs font-black text-[#f8ca14] shadow-sm backdrop-blur-md">
            <Sparkles size={14} className="animate-spin" style={{ animationDuration: "6s" }} />
            <span>الهوية الرسمية لليوم الوطني السعودي • عزّنا بطبعنا</span>
          </div>

          <h2 className="mt-4 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            ستّ قيم شكّلت{" "}
            <span className="bg-gradient-to-r from-[#f8ca14] via-[#5aba1c] to-[#005A36] bg-clip-text text-transparent">
              جوهر الهوية ومجد الوطن
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-base font-medium text-emerald-100/75 leading-relaxed">
            استلهمت الهوية الرسمية رسوماتها من ست صفات متجذرة في وجدان كل سعودي وسعودية، ولكل صفة
            رمز بصري من تراثنا المحبوك وألوان تعبر عن روح أمتنا.
          </p>
        </div>

        {/* The 6 Trait Selector Pills */}
        <div className="mt-8 flex items-center justify-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-hide sm:gap-3">
          {NATIONAL_TRAITS.map((trait) => {
            const isSelected = trait.id === activeTrait.id;
            return (
              <button
                key={trait.id}
                onClick={() => {
                  setActiveTrait(trait);
                  triggerNationalCelebration();
                }}
                className={`group relative flex items-center gap-2.5 rounded-2xl border px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-black transition-all duration-300 ${
                  isSelected
                    ? "scale-105 shadow-lg"
                    : "hover:scale-[1.02] opacity-75 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: isSelected ? trait.badgeBg : "rgba(255, 255, 255, 0.04)",
                  borderColor: isSelected ? trait.color : "rgba(255, 255, 255, 0.1)",
                  color: isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
                  boxShadow: isSelected ? `0 0 25px ${trait.color}40` : "none",
                }}
              >
                {/* Micro Thumbnail */}
                <div className="h-6 w-6 sm:h-7 sm:w-7 overflow-hidden rounded-lg border border-white/20 shadow-inner">
                  <img
                    src={trait.iconPath}
                    alt={trait.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <span>{trait.name}</span>
                {isSelected && (
                  <span
                    className="h-2 w-2 rounded-full animate-ping"
                    style={{ backgroundColor: trait.color }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Trait Spotlight Showcase Card */}
        <div className="mt-8 overflow-hidden rounded-[2.5rem] border border-white/15 bg-black/60 p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative">
          {/* Subtle Corner Najdi Border Accents */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-30 blur-2xl" style={{ backgroundColor: activeTrait.color }} />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full opacity-30 blur-2xl" style={{ backgroundColor: "#005A36" }} />

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Woven Carpet Icon Display with Authentic Najdi Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group">
                {/* Outer Golden Glow Ring */}
                <div
                  className="absolute -inset-2 rounded-3xl opacity-60 blur-xl transition-all duration-500 group-hover:opacity-90"
                  style={{
                    background: `linear-gradient(135deg, ${activeTrait.color}, #f8ca14, #005A36)`,
                  }}
                />

                {/* The Extracted Woven Masterpiece */}
                <div className="relative h-64 w-64 sm:h-80 sm:w-80 overflow-hidden rounded-3xl border-2 border-white/20 bg-[#00180e] shadow-2xl p-2.5">
                  <img
                    src={activeTrait.iconPath}
                    alt={`${activeTrait.name} - ${activeTrait.symbol}`}
                    className="h-full w-full rounded-2xl object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Trait Badge Stamp */}
                  <div
                    className="absolute bottom-5 right-5 rounded-xl border border-white/25 px-3 py-1 text-xs font-black text-white shadow-lg backdrop-blur-md"
                    style={{ backgroundColor: `${activeTrait.color}cc` }}
                  >
                    {activeTrait.name} • {activeTrait.symbol}
                  </div>
                </div>
              </div>
            </div>

            {/* Trait Authentic Story & Cultural Context */}
            <div className="lg:col-span-7 space-y-5 text-right">
              <div className="inline-flex items-center gap-2 rounded-xl border px-3 py-1 text-xs font-black"
                style={{
                  backgroundColor: activeTrait.badgeBg,
                  borderColor: activeTrait.badgeBorder,
                  color: activeTrait.color,
                }}
              >
                <span>القيمة الوطنية المعتمدة</span>
                <span className="text-white/40">•</span>
                <span>{activeTrait.patternName}</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                {activeTrait.title}
              </h3>

              {/* Official Quote */}
              <blockquote className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 text-sm sm:text-base font-bold text-emerald-200/90 leading-relaxed italic">
                "{activeTrait.quote}"
              </blockquote>

              <p className="text-sm sm:text-base font-medium text-slate-300 leading-relaxed">
                {activeTrait.desc}
              </p>

              {/* Color Swatch & Action */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-xl shadow-md border border-white/20 flex items-center justify-center text-white text-[10px] font-black"
                    style={{ backgroundColor: activeTrait.color }}
                  >
                    HEX
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400">الرمز اللوني المعتمد</div>
                    <div className="text-xs font-mono font-black text-white">{activeTrait.color}</div>
                  </div>
                </div>

                <button
                  onClick={() => triggerNationalCelebration()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#005A36] via-[#5aba1c] to-[#005A36] px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all"
                >
                  <Sparkles size={16} className="text-[#f8ca14]" />
                  <span>احتفِ بهذه القيمة 🇸🇦</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Grid Cards for Quick Browsing on Mobile / Desktop */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
          {NATIONAL_TRAITS.map((trait) => (
            <button
              key={trait.id}
              onClick={() => {
                setActiveTrait(trait);
                triggerNationalCelebration();
              }}
              className={`group flex flex-col items-center rounded-2xl border p-3 text-center transition-all ${
                trait.id === activeTrait.id
                  ? "border-[#f8ca14] bg-white/10 shadow-lg scale-105"
                  : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
              }`}
            >
              <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-xl border border-white/15 p-1 bg-black/40">
                <img
                  src={trait.iconPath}
                  alt={trait.name}
                  className="h-full w-full rounded-lg object-cover group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
              </div>
              <div className="mt-2 text-xs font-black text-white">{trait.name}</div>
              <div className="mt-0.5 text-[10px] text-slate-400 line-clamp-1">{trait.symbol}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
