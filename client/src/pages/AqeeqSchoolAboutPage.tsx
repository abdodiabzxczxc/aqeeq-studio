import { useState } from "react";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { AqeeqLuxuryPageShell } from "@/components/AqeeqLuxuryPageShell";
import { useMagneticTilt, staggerContainer, fadeUpSpring } from "@/lib/motionPresets";
import { motion } from "framer-motion";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { AlaqeeqStudioSiteFooter } from "@/components/AlaqeeqStudioSiteFooter";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Building2,
  Sparkles,
  Target,
  Compass,
  Users,
  Award,
  MapPin,
  Phone,
  Mail,
  Clock,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  Milestone,
  Check,
  ExternalLink,
} from "lucide-react";

export default function AqeeqSchoolAboutPage() {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();

  const [activeCampusTab, setActiveCampusTab] = useState<"boys" | "girls">("boys");
  const [activeTimelineIndex, setActiveTimelineIndex] = useState<number>(3);

  const pillars = [
    {
      icon: Lightbulb,
      title: "نُلهـــم الأجيــــــــال",
      desc: "نقدّم تعليماً نوعياً يُرسّخ المعرفة، ويُنمّي التفكير، ويُحفّز التعلّم المستمر، ليمنح طلابنا أساساً علمياً راسخاً، ويُهيئهم لمواصلة رحلتهم التعليمية بثقة وتميّز.",
      badge: "التعليم النوعي",
    },
    {
      icon: Compass,
      title: "نُنمّـــــي القـــــدرات",
      desc: "نُمكّن طلابنا من اكتشاف إمكاناتهم، وتنمية مهاراتهم، وتوسيع آفاقهم، من خلال تجارب تعلّم حديثة تُعزّز الابتكار، وتُرسّخ التفكير النقدي، وتُهيئهم لمهارات المستقبل.",
      badge: "مهارات المستقبل",
    },
    {
      icon: Award,
      title: "نحتفــــي بالتميّـــــز",
      desc: "نُمكّن طلابنا من تحقيق التميّز عبر بيئة تعليمية داعمة تُعزّز الإنجاز، وتفتح آفاق المشاركة في المنافسات المحلية والدولية، ليقدّموا نماذج مشرّفة تعكس قدراتهم وطموحاتهم.",
      badge: "الإنجاز والريادة",
    },
    {
      icon: Target,
      title: "نصنــــع الأثـــــــــر",
      desc: "نُهيّئ طلابنا لمستقبل واعد، من خلال بناء المعرفة، وتنمية المهارات، وترسيخ القيم، ليصنعوا أثراً مستداماً، ويقودوا مستقبلهم بثقة وطموح متوافق مع رؤية المملكة 2030.",
      badge: "أثر مستدام",
    },
  ];

  const campuses = [
    {
      name: "مجمع البنين — مدارس العقيق الأهلية والدولية",
      location: "المدينة المنورة — حي الرانوناء (ممشى الهجرة)",
      stages: "الابتدائي · المتوسط · الثانوي (أهلي ودولي)",
      facilities: "معامل حاسوب وذكاء اصطناعي، مسبح أولمبي مغطى، صالة رياضية، قاعات اختبارات دولية SAT و IELTS.",
      phone: "+966 14 813 1652",
    },
    {
      name: "مجمع البنات — مدارس العقيق الأهلية والدولية",
      location: "المدينة المنورة — حي الرانوناء (ممشى الهجرة)",
      stages: "رياض الأطفال والطفولة المبكرة · الابتدائي · المتوسط · الثانوي",
      facilities: "بيئة تعليمية وتربوية رائدة، معامل ذكية، مسرح احتفالات مدرسي، ساحات وملاعب آمنة ومظللة.",
      phone: "+966 14 864 4466",
    },
  ];

  return (
    <AqeeqLuxuryPageShell
      header={<AlaqeeqStudioSiteHeader title="عن مدارس العقيق الأهلية والدولية" active="about" />}
      footer={<AlaqeeqStudioSiteFooter />}
    >
      {/* Hero Section: Modern Executive 2-Column Showcase */}
      <section className={`relative isolate overflow-hidden border-b py-12 sm:py-20 ${
        isNationalDay
          ? dark ? "snd-hero-dark border-[#f8ca14]/15" : "snd-hero-light border-emerald-600/20"
          : dark ? "border-white/[0.08]" : "border-black/[0.08]"
      }`}>
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(1,90,55,0.08),transparent_60%)] dark:bg-[radial-gradient(circle_at_20%_25%,rgba(1,90,55,0.22),transparent_60%)]" />

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Right Column: Hero Content & CTAs (7 cols) */}
            <div className="lg:col-span-7 text-right">
              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black backdrop-blur-md mb-6 shadow-sm ${
                isNationalDay
                  ? dark
                    ? "border-[#f8ca14]/40 bg-[#f8ca14]/10 text-[#f8ca14]"
                    : "border-[#005A36]/30 bg-emerald-50 text-[#005A36]"
                  : dark
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-emerald-700/25 bg-white/95 text-[#015a37]"
              }`}>
                {isNationalDay ? <span>🇸🇦</span> : <Building2 size={14} className={dark ? "text-[#f8ca14]" : "text-[#c59b27]"} />}
                <span>{isNationalDay ? "مسيرة وطنية رائدة منذ عام 1994 · عزّنا بطبعنا" : "صرح العقيق التعليمي الرائد بالمدينة المنورة"}</span>
              </div>

              <VisualEditable
                id="about-hero-title"
                tag="text"
                label="عنوان هيرو عن المدارس"
                defaultText="مدارس العقيق الأهلية والدولية"
                as="h1"
                className={`text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.2] mb-6 ${
                  dark ? "text-white" : "text-[#0a192f]"
                }`}
              />

              <VisualEditable
                id="about-hero-desc"
                tag="text"
                label="وصف هيرو عن المدارس"
                defaultText="صرح تعليمي رائد للبنين والبنات في طيبة الطيبة. نهتم بتأهيل جيل متميز بأخلاق إسلامية راسخة وعلوم عصرية متقدمة، يجمع بين أصالة القيم ومعايير الاعتماد الدولي."
                as="p"
                className={`text-base sm:text-lg font-medium leading-relaxed max-w-2xl mb-8 ${
                  dark ? "text-slate-300" : "text-slate-700"
                }`}
              />

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Button
                  onClick={() => navigate("/admissions")}
                  className={`rounded-2xl px-8 py-6 text-base font-black shadow-xl transition active:scale-95 ${
                    dark
                      ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black hover:opacity-95 shadow-[#f8ca14]/20"
                      : "bg-gradient-to-r from-[#015a37] to-[#027a4b] text-white hover:opacity-95 shadow-[#015a37]/25"
                  }`}
                >
                  <span>القبول والتسجيل والرسوم</span>
                  <ArrowRight size={18} className="mr-2" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/accreditations")}
                  className={`rounded-2xl px-8 py-6 text-base font-black border transition active:scale-95 shadow-sm ${
                    dark
                      ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                      : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>الاعتمادات ومراكز الاختبارات</span>
                </Button>
              </div>

              {/* Quick Metrics Bar */}
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-sm ${
                dark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-emerald-950/10 bg-white/80"
              }`}>
                <div>
                  <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#f8ca14]" : "text-[#015a37]"}`}>منذ 1994</span>
                  <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>+30 عاماً من الريادة</span>
                </div>
                <div>
                  <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#5aba1c]" : "text-[#08467d]"}`}>مجمعين</span>
                  <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>للبنين والبنات</span>
                </div>
                <div>
                  <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>Cognia</span>
                  <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>اعتماد أمريكي</span>
                </div>
                <div>
                  <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#5aba1c]" : "text-[#015a37]"}`}>KG - 12</span>
                  <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>كافة المراحل</span>
                </div>
              </div>
            </div>

            {/* Left Column: Close-Up Visual Showcase Card (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className={`relative rounded-[2.5rem] p-3 sm:p-4 border transition duration-500 hover:scale-[1.01] shadow-2xl ${
                dark
                  ? "border-emerald-500/20 bg-[#0b1218] shadow-black/80 ring-1 ring-emerald-500/10"
                  : "border-emerald-950/10 bg-white shadow-emerald-950/15 ring-1 ring-emerald-900/5"
              }`}>
                {/* Close-Up Student Excellence Photo */}
                <div className="relative overflow-hidden rounded-[2rem] aspect-[4/3] sm:aspect-[16/12]">
                  <VisualImage
                    id="about-hero-student-photo"
                    label="صورة طلاب العقيق المقربة في التكريم"
                    src="/covers/student-excellence-about.jpg"
                    alt="طلاب مدارس العقيق في حفل التميز والتكريم"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  {/* Subtle Gradient Shade at Bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-2 rounded-full bg-black/80 border border-white/20 px-3.5 py-1.5 text-xs font-black text-white shadow-lg backdrop-blur-md">
                    <Sparkles size={13} className="text-[#f8ca14]" />
                    <span>{isNationalDay ? "🇸🇦 عزّنا بطبعنا · 94 عاماً من المجد" : "نلهم الأجيال · نصنع الأثر"}</span>
                  </div>

                  {/* Bottom Overlaid Details */}
                  <div className="absolute bottom-3.5 right-3.5 left-3.5 flex items-center justify-between text-white">
                    <div>
                      <h4 className="text-sm font-black drop-shadow-md">صرح تعليمي وتربوي رائد</h4>
                      <p className="text-[11px] text-emerald-300 drop-shadow-md">أصالة القيم ومعايير الاعتماد الدولي</p>
                    </div>
                    <span className="rounded-xl bg-emerald-600/90 px-2.5 py-1 text-[10px] font-black backdrop-blur-md shadow">
                      المدينة المنورة
                    </span>
                  </div>
                </div>

                {/* Overlapping Floating Trust Chip (Bottom) */}
                <div className={`mt-3 p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                  dark
                    ? "border-white/10 bg-black/60 text-slate-200"
                    : "border-emerald-950/10 bg-[#f4f7f4] text-slate-800"
                }`}>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black">مجمع البنين ومجمع البنات بالمدينة</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">بيئة نموذجية مجهزة بأحدث المرافق وقاعات الاختبارات</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The 30-Year Legacy Interactive Timeline (1994 - 2026) */}
      <section className="py-20 container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"} mb-2`}>
            <Sparkles size={14} />
            <span>ثلاثة عقود من العطاء التربوي بطيبة الطيبة</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
            مسيرة العقيق المضيئة عبر الزمن (1994 - 2026) 📜
          </h2>
          <p className={`mt-3 text-sm sm:text-base ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
            رحلة تربوية رائدة خطت خطواتها الأولى في المدينة المنورة قبل أكثر من 30 عاماً لتغدو اليوم منارة تعليمية بمعايير عالمية.
          </p>

          {/* Interactive Era Buttons */}
          <div className={`mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto p-1.5 rounded-2xl border shadow-sm transition ${
            dark ? "border-white/10 bg-[#0c141a]" : "border-slate-200/90 bg-white"
          }`}>
            {[
              { year: "1994", label: "التأسيس والانطلاقة", index: 0 },
              { year: "2010", label: "المجمعات والمسابح", index: 1 },
              { year: "2018", label: "اعتماد كوجنيا (Cognia)", index: 2 },
              { year: "2026", label: "مراكز الاختبارات والـ AI", index: 3 },
            ].map((era) => (
              <button
                key={era.year}
                type="button"
                onClick={() => setActiveTimelineIndex(era.index)}
                className={`p-3 rounded-xl text-center transition active:scale-95 ${
                  activeTimelineIndex === era.index
                    ? "bg-[#015a37] text-white shadow-md ring-1 ring-[#f8ca14]/40"
                    : dark
                    ? "text-slate-400 hover:text-white hover:bg-white/5"
                    : "text-slate-700 hover:text-[#015a37] hover:bg-slate-50"
                }`}
              >
                <span className={`block text-base font-black ${activeTimelineIndex === era.index ? "text-[#f8ca14]" : ""}`}>
                  {era.year}
                </span>
                <span className="text-[11px] font-bold truncate block">{era.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Active Timeline Era Card */}
        <div className={`max-w-4xl mx-auto rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl relative overflow-hidden animate-in fade-in transition duration-500 ${
          dark ? "border-emerald-500/20 bg-[#0c1218]/90" : "border-emerald-700/20 bg-white/95"
        }`}>
          {[
            {
              year: "1994 م — 1415 هـ",
              title: "غراس البدايات وتأسيس أول مجمع تعليمي بالمدينة المنورة",
              desc: "انطلقت مدارس العقيق برؤية واضحة لتكون نموذجاً تعليمياً وتربوياً فريداً بطيبة الطيبة. بدأت المدارس بتأسيس المراحل التأسيسية وتخريج أجيال متمكنة في القرآن الكريم واللغة والعلوم، وتكريس منظومة القيم الأخلاقية الأصيلة.",
              highlight: "نواة التميز والانطلاقة الأولى بالمدينة المنورة",
              stats: "أكثر من 30 دفعة تخرجت منذ التأسيس",
            },
            {
              year: "2010 م — 1431 هـ",
              title: "تدشين المجمعات الكبرى والمسابح الأولمبية والملاعب المغطاة",
              desc: "شهدت هذه المرحلة نقلة نوعية كبرى بافتتاح مجمع البنين الشامل ومجمع البنات في حي الرانوناء بمحاذاة ممشى الهجرة، بتجهيزات مدرسية نموذجية شملت المسابح شبه الأولمبية المغطاة، الصالات الرياضية المغلقة، وقاعات المعامل الذكية.",
              highlight: "مجمعات صرحية مستقلة بمواصفات هندسية وتعليمية قياسية",
              stats: "طاقة استيعابية تتجاوز 10,000 طالب وطالبة",
            },
            {
              year: "2018 م — 1439 هـ",
              title: "الاعتماد الأكاديمي الأمريكي من منظمة كوجنيا (Cognia USA)",
              desc: "توجت مسيرة الجودة بحصول مدارس العقيق على الاعتماد الدولي الأمريكي من كوجنيا، ليصبح خريجو المدارس مؤهلين للحصول على شهادة الدبلومة الأمريكية المعتمدة دولياً، بالتزامن مع إطلاق نوادي وأكاديميات الروبوت والابتكار.",
              highlight: "الريادة في التعليم الدولي والحوكمة الأكاديمية",
              stats: "تقييم جودة معتمد عالمياً بنسبة تفوق 98%",
            },
            {
              year: "2024 - 2026 م",
              title: "اعتماد مراكز IELTS و SAT الدولية ومنظومة الذكاء الاصطناعي",
              desc: "العصر الرقمي والريادة العالمية: اعتماد مدارس العقيق كمركز رسمي لاختبارات IELTS IDP و SAT بالمدينة المنورة، مع تتويج الطلاب بالمركز الخامس عالمياً في أولمبياد الروبوت WRO، وتكامل المناهج مع الذكاء الاصطناعي والتحول الرقمي.",
              highlight: "مركز اختبارات دولي معتمد وحضور عالمي في منافسات الـ AI",
              stats: "المركز الخامس عالمياً في أولمبياد الروبوت الدولي WRO",
            },
          ].filter((_, idx) => idx === activeTimelineIndex).map((era, iIdx) => (
            <div key={iIdx} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                    محطة تاريخية بارزة ✦
                  </span>
                  <span className={`text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>
                    {era.year}
                  </span>
                </div>
                <h3 className={`text-2xl sm:text-3xl font-black mb-4 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                  {era.title}
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                  {era.desc}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-black">
                  <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={16} />
                    {era.highlight}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 text-center">
                <div className={`p-6 rounded-3xl border shadow-inner ${
                  dark ? "border-white/10 bg-black/40" : "border-emerald-950/10 bg-emerald-50/50"
                }`}>
                  <Milestone size={32} className={`mx-auto mb-3 ${dark ? "text-[#f8ca14]" : "text-[#015a37]"}`} />
                  <span className={`block text-xl font-black mb-1 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                    أثر ملموس
                  </span>
                  <p className="text-xs text-slate-500 font-bold">{era.stats}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Campus Explorer (مستكشف المجمعات التفاعلي) */}
      <section className={`py-20 border-y ${
        dark ? "border-white/10 bg-[#06080d]" : "border-emerald-950/10 bg-[#f5f8f5]"
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400 mb-2">
              <Building2 size={14} />
              <span>الصروح والمجمعات التعليمية النموذجية</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              استكشف مجمعاتنا بالمدينة المنورة 🏫
            </h2>
            <p className={`text-xs sm:text-sm mt-2 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              مبانٍ مدرسية صرحية مستقلة مصممة بأعلى المواصفات لتوفير بيئة تعليمية وتربوية ورياضية متكاملة
            </p>

            {/* Campus Switcher Tabs */}
            <div className={`mt-8 inline-flex items-center rounded-2xl border p-1.5 shadow-sm transition ${
              dark ? "border-white/10 bg-[#0c141a]" : "border-slate-200/90 bg-white"
            }`}>
              <button
                type="button"
                onClick={() => setActiveCampusTab("boys")}
                className={`rounded-xl px-6 sm:px-8 py-2.5 text-xs sm:text-sm font-black transition active:scale-95 ${
                  activeCampusTab === "boys"
                    ? "bg-[#015a37] text-white shadow-md"
                    : dark
                    ? "text-slate-400 hover:text-white hover:bg-white/5"
                    : "text-slate-700 hover:text-[#015a37] hover:bg-slate-50"
                }`}
              >
                مجمع البنين
              </button>
              <button
                type="button"
                onClick={() => setActiveCampusTab("girls")}
                className={`rounded-xl px-6 sm:px-8 py-2.5 text-xs sm:text-sm font-black transition active:scale-95 ${
                  activeCampusTab === "girls"
                    ? "bg-[#015a37] text-white shadow-md"
                    : dark
                    ? "text-slate-400 hover:text-white hover:bg-white/5"
                    : "text-slate-700 hover:text-[#015a37] hover:bg-slate-50"
                }`}
              >
                مجمع البنات
              </button>
            </div>
          </div>

          {/* Active Campus Panoramic Card */}
          {activeCampusTab === "boys" && (
            <div className={`max-w-5xl mx-auto rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl animate-in fade-in transition duration-500 ${
              dark ? "border-emerald-500/25 bg-[#0c1218]/90" : "border-emerald-700/20 bg-white/95"
            }`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="rounded-xl bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                      مجمع البنين النموذجي
                    </span>
                    <span className="text-xs font-bold text-slate-500">القسم الأهلي والدولي</span>
                  </div>

                  <h3 className={`text-2xl sm:text-3xl font-black mb-3 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                    مجمع البنين — حي الرانوناء (ممشى الهجرة)
                  </h3>

                  <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                    يقع المجمع في موقع متميز بحي الرانوناء بالقرب من ممشى الهجرة (خلف نايس برايس)، ويضم مباني أكاديمية مستقلة للمراحل الابتدائية والمتوسطة والثانوية، ومزود بأحدث الصالات الرياضية والمسابح والمعامل التقنية وقاعات الاختبارات الدولية.
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-xs font-bold">
                    {[
                      { title: "المسبح الأولمبي المغطى", sub: "تدريب سباحة احترافي بإشراف مدربين" },
                      { title: "صالات الجمباز وملاعب العشب", sub: "ملاعب كرة قدم وصالات كاراتيه ولياقة" },
                      { title: "معامل الذكاء الاصطناعي والروبوت", sub: "تجهيزات حاسوبية 1:1 لبطولات WRO" },
                      { title: "قاعات IELTS & SAT الدولية", sub: "مركز الاختبارات المعتمد بالمدينة" },
                    ].map((f, fIdx) => (
                      <div key={fIdx} className={`p-3 rounded-xl border ${dark ? "border-white/5 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                        <span className="block font-black text-emerald-600 dark:text-emerald-400">✦ {f.title}</span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">{f.sub}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Al+Aqiq+Schools+Al+Ranuna+Madinah"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#015a37] hover:bg-emerald-800 text-white px-5 py-3 text-xs font-black shadow-md transition active:scale-95"
                    >
                      <MapPin size={15} />
                      <span>فتح الموقع في Google Maps 📍</span>
                    </a>

                    <a
                      href="tel:+966148131652"
                      className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-xs font-bold transition ${
                        dark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm"
                      }`}
                    >
                      <Phone size={14} />
                      <span>هاتف المجمع: 0148131652</span>
                    </a>

                    <Button
                      onClick={() => navigate("/admissions")}
                      variant="outline"
                      className="rounded-2xl text-xs font-black"
                    >
                      حجز مقعد بمجمع البنين ✦
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3]">
                    <img
                      src="/covers/student-lab-admissions.jpg"
                      alt="مرافق مجمع البنين بمدارس العقيق"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 right-4 left-4 text-white">
                      <span className="text-xs font-black text-[#f8ca14]">مجمع البنين — حي الرانوناء</span>
                      <p className="text-[11px] text-slate-300">ممشى الهجرة · معامل الابتكار والمسابح والمراكز الدولية</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCampusTab === "girls" && (
            <div className={`max-w-5xl mx-auto rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl animate-in fade-in transition duration-500 ${
              dark ? "border-emerald-500/25 bg-[#0c1218]/90" : "border-emerald-700/20 bg-white/95"
            }`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="rounded-xl bg-pink-500/10 px-3 py-1 text-xs font-black text-pink-600 dark:text-pink-400">
                      مجمع البنات النموذجي
                    </span>
                    <span className="text-xs font-bold text-slate-500">من الروضة إلى الثانوي</span>
                  </div>

                  <h3 className={`text-2xl sm:text-3xl font-black mb-3 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                    مجمع البنات — حي الرانوناء (ممشى الهجرة)
                  </h3>

                  <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                    صرح تربوي متكامل في حي الرانوناء بممشى الهجرة يجمع بين الخصوصية التامة وتوفير أحدث التجهيزات، يضم أقسام الطفولة المبكرة ورياض الأطفال، والمراحل الابتدائية والمتوسطة والثانوية بقاعاتها ومعاملها وملاعبها المظللة.
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-xs font-bold">
                    {[
                      { title: "أقسام الطفولة المبكرة والروضة", sub: "بيئة مرحة ومحفزة لتنمية المهارات الحسية" },
                      { title: "المسرح المدرسي وقاعات الأنشطة", sub: "احتفالات الخطابة وملتقيات الإبداع واللغات" },
                      { title: "معامل العلوم واللغات المتطورة", sub: "تجارب معملية ومناهج دولية مكثفة" },
                      { title: "ملاعب آمنة ومظللة بالكامل", sub: "ساحات أنشطة وفسحة رياضية مريحة وآمنة" },
                    ].map((f, fIdx) => (
                      <div key={fIdx} className={`p-3 rounded-xl border ${dark ? "border-white/5 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                        <span className="block font-black text-emerald-600 dark:text-emerald-400">✦ {f.title}</span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">{f.sub}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Al+Aqiq+Schools+Al+Ranuna+Madinah"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#015a37] hover:bg-emerald-800 text-white px-5 py-3 text-xs font-black shadow-md transition active:scale-95"
                    >
                      <MapPin size={15} />
                      <span>فتح الموقع في Google Maps 📍</span>
                    </a>

                    <a
                      href="tel:+966148644466"
                      className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-xs font-bold transition ${
                        dark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm"
                      }`}
                    >
                      <Phone size={14} />
                      <span>هاتف مجمع البنات: 0148644466</span>
                    </a>

                    <Button
                      onClick={() => navigate("/admissions")}
                      variant="outline"
                      className="rounded-2xl text-xs font-black"
                    >
                      حجز مقعد بمجمع البنات ✦
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3]">
                    <img
                      src="/covers/student-excellence-about.jpg"
                      alt="مرافق مجمع البنات بمدارس العقيق"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 right-4 left-4 text-white">
                      <span className="text-xs font-black text-[#f8ca14]">مجمع البنات — حي الرانوناء</span>
                      <p className="text-[11px] text-slate-300">ممشى الهجرة · الطفولة المبكرة والمراحل التعليمية</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Royal Strategic Document: Vision & Mission */}
      <section className="py-20 container mx-auto px-4 sm:px-6">
        <div className={`max-w-5xl mx-auto rounded-[3rem] border p-8 sm:p-14 shadow-2xl relative overflow-hidden ${
          dark
            ? "border-emerald-500/30 bg-gradient-to-b from-[#0c141a] to-[#060a0e] ring-1 ring-emerald-500/20"
            : "border-emerald-700/20 bg-gradient-to-b from-white to-[#fbfaf8] ring-1 ring-emerald-900/10 shadow-xl"
        }`}>
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black mb-3 border ${
              isNationalDay
                ? "border-[#f8ca14]/40 bg-[#f8ca14]/15 text-[#f8ca14]"
                : "border-[#f8ca14]/30 bg-[#f8ca14]/10 text-[#f8ca14]"
            }`}>
              <Compass size={14} />
              <span>{isNationalDay ? "🇸🇦 رؤية وطنية راسخة · عزّنا بطبعنا" : "المرتكزات الاستراتيجية للصرح"}</span>
            </div>
            <h3 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              الرؤية والرسالة المؤسسية
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision Plaque */}
            <div className={`rounded-3xl border p-8 relative overflow-hidden transition hover:-translate-y-1 ${
              dark ? "border-emerald-500/20 bg-white/5" : "border-emerald-950/10 bg-emerald-50/40"
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Compass size={20} />
                </div>
                <div>
                  <h4 className={`text-lg font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>الرؤية الاستراتيجية (Vision)</h4>
                  <span className="text-[11px] text-slate-500">أصالة القيم وريادة المستقبل</span>
                </div>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                أن تكون مدارس العقيق الأهلية والدولية نموذجاً تعليمياً وتربوياً رائداً على مستوى المملكة والعالم الإسلامي، يُخرج قادة للمستقبل متسلحين بالعلم النافع، والأخلاق الفاضلة، والمهارات التنافسية العالمية التي تواكب مستهدفات رؤية 2030.
              </p>
            </div>

            {/* Mission Plaque */}
            <div className={`rounded-3xl border p-8 relative overflow-hidden transition hover:-translate-y-1 ${
              dark ? "border-amber-500/20 bg-white/5" : "border-amber-950/10 bg-amber-50/30"
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${dark ? "bg-amber-500/10 text-[#f8ca14]" : "bg-amber-500/15 text-[#c59b27]"}`}>
                  <Target size={20} />
                </div>
                <div>
                  <h4 className={`text-lg font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>الرسالة التربوية (Mission)</h4>
                  <span className="text-[11px] text-slate-500">جودة التعليم وبناء الشخصية</span>
                </div>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                توفير بيئة تعليمية وتربوية محفزة وجاذبة، تضم نخبة من الكفاءات التعليمية المؤهلة، وتطبق أحدث المعايير الدولية والاعتمادات العالمية، لبناء شخصية متكاملة للطالب تعتز بهويتها وتسهم في نهضة وطنها.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Institutional Pillars */}
      <section className={`py-20 border-y ${
        dark ? "border-white/10 bg-[#06080d]" : "border-emerald-950/10 bg-[#f5f8f5]"
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className={`inline-flex items-center gap-2 text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"} mb-2`}>
              <Sparkles size={14} />
              <span>ركائز مسيرة العقيق</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>ركائزنا التربوية الأربعة</h2>
            <p className={`text-xs sm:text-sm mt-2 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              منظومة متكاملة من القيم والمهارات تصوغ رحلة الطالب اليومية في مدارس العقيق
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-3xl border p-6 transition duration-300 hover:-translate-y-1 ${
                    dark ? "border-white/10 bg-[#0c1218]" : "border-emerald-950/10 bg-white/95 shadow-md hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Icon size={22} />
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                      dark ? "bg-emerald-500/10 text-emerald-400" : "bg-[#015a37]/10 text-[#015a37]"
                    }`}>
                      {pillar.badge}
                    </span>
                  </div>
                  <h4 className={`text-lg font-black mb-3 ${dark ? "text-white" : "text-[#0a192f]"}`}>{pillar.title}</h4>
                  <p className={`text-xs leading-relaxed ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Careers & Contact Section */}
      <section className="py-20 container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Careers */}
          <div className={`rounded-3xl border p-8 ${
            dark ? "border-white/10 bg-[#0c1218]" : "border-emerald-950/10 bg-white/95 shadow-md hover:shadow-lg"
          }`}>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-500 mb-4">
              <Briefcase size={22} />
            </div>
            <h3 className={`text-2xl font-black mb-2 ${dark ? "text-white" : "text-[#0a192f]"}`}>انضم إلى فريق مدارس العقيق</h3>
            <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              نستقطب باستمرار أفضل الكفاءات التعليمية والإدارية والتقنية الشغوفة بصناعة الأثر في حياة الأجيال.
            </p>
            <a
              href="https://live.aqeeq.edu.sa/jobs"
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-black transition ${
                dark ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-700 hover:bg-blue-800 text-white"
              }`}
            >
              <span>بوابة التوظيف الرسمية</span>
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Quick Contact Info */}
          <div className={`rounded-3xl border p-8 ${
            dark ? "border-white/10 bg-[#0c1218]" : "border-emerald-950/10 bg-white/95 shadow-md hover:shadow-lg"
          }`}>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
              <Phone size={22} />
            </div>
            <h3 className={`text-2xl font-black mb-2 ${dark ? "text-white" : "text-[#0a192f]"}`}>تواصل معنا مباشرة</h3>
            <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              يسعدنا الرد على كافة استفساراتكم واستقبالكم في مجمعاتنا خلال أوقات الدوام الرسمي.
            </p>
            <div className={`space-y-3 text-xs font-bold ${dark ? "text-slate-200" : "text-slate-800"}`}>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-emerald-500" />
                <span>الهاتف الموحد: <a href="tel:+966531896000" className="hover:underline">966531896000+</a></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-emerald-500" />
                <span>البريد الرسمي: <a href="mailto:info@alaqeeqholding.com" className="hover:underline">info@alaqeeqholding.com</a></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-emerald-500" />
                <span>أوقات العمل: الأحد - الخميس | 7:00 ص - 2:30 م</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sky-500">📢</span>
                <span>قناة تيليجرام المدرسية: <a href="https://t.me/alaqeeqschools" target="_blank" rel="noreferrer" className="text-sky-500 hover:underline">t.me/alaqeeqschools</a></span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </AqeeqLuxuryPageShell>
  );
}

