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
  Award,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Cpu,
  Brain,
  Globe2,
  FileCheck2,
  BookOpenCheck,
  Trophy,
  Microscope,
  Compass,
  ArrowRight,
  Send,
  Calendar,
  Clock,
  ChevronDown,
  Check,
  GraduationCap,
  Laptop,
  Headphones,
  Building2,
  HelpCircle,
  FileText,
} from "lucide-react";

export default function AqeeqSchoolAccreditationsPage() {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();

  const [activeHubTab, setActiveHubTab] = useState<"cognia" | "ielts" | "sat" | "stem">("cognia");
  const [activePathway, setActivePathway] = useState<"saudi" | "scholarship" | "global">("saudi");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <AqeeqLuxuryPageShell
      header={<AlaqeeqStudioSiteHeader title="الاعتمادات والشراكات الدولية" active="accreditations" />}
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
                {isNationalDay ? <span>🇸🇦</span> : <Award size={14} className={dark ? "text-[#f8ca14]" : "text-[#c59b27]"} />}
                <span>{isNationalDay ? "مخرجات تعليمية عالمية تصنع فخر الوطن · عزّنا بطبعنا 🇸🇦" : "معايير عالمية في قلب المدينة المنورة"}</span>
              </div>

              <VisualEditable
                id="accreditations-hero-title"
                tag="text"
                label="عنوان هيرو الاعتمادات"
                defaultText="اعتمادات دولية مرموقة ومراكز اختبارات عالمية معتمدة"
                as="h1"
                className={`text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.2] mb-6 ${
                  dark ? "text-white" : "text-[#0a192f]"
                }`}
              />

              <VisualEditable
                id="accreditations-hero-desc"
                tag="text"
                label="وصف هيرو الاعتمادات"
                defaultText="الجودة في مدارس العقيق ليست مجرد شعار، بل أسلوب حياة ومنهج عمل مؤسسي. نفتخر بحصولنا على اعتماد كوجنيا الأمريكية (Cognia)، واعتماد مدارسنا كمراكز رسمية لاختبارات IELTS و SAT و ACT بالمدينة المنورة."
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
                  <Send size={18} className="ml-2" />
                  <span>سجّل الآن في المدارس</span>
                </Button>

                <a
                  href="#cognia-section"
                  className={`inline-flex items-center justify-center rounded-2xl px-8 py-6 text-base font-black border transition active:scale-95 shadow-sm ${
                    dark
                      ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                      : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <ShieldCheck size={18} className="ml-2" />
                  <span>استكشف الاعتمادات والمراكز</span>
                </a>
              </div>

              {/* Trust Ribbon Chips */}
              <div className="flex flex-wrap items-center gap-2.5">
                {[
                  "اعتماد Cognia USA",
                  "مركز اختبارات IELTS IDP",
                  "مراكز اختبارات SAT الرقمية",
                  "مراكز اختبارات ACT",
                ].map((chip, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition ${
                      dark
                        ? "border-white/10 bg-white/[0.04] text-slate-300"
                        : "border-emerald-950/10 bg-white/90 text-slate-800 shadow-sm"
                    }`}
                  >
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span>{chip}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Left Column: Dual Championship Showcase Cards (5 cols) */}
            <div className="lg:col-span-5 relative space-y-3.5">
              {/* Card 1: FIRST LEGO League National Champion */}
              <div className={`group relative rounded-[2.2rem] p-2.5 sm:p-3 border transition duration-500 hover:scale-[1.015] shadow-2xl overflow-hidden ${
                dark
                  ? "border-amber-500/30 bg-[#0b1218] shadow-black/80 ring-1 ring-amber-500/20"
                  : "border-amber-600/25 bg-white shadow-amber-950/10 ring-1 ring-amber-600/15"
              }`}>
                <div className="relative overflow-hidden rounded-[1.8rem] aspect-[16/9] sm:aspect-[16/8.5]">
                  <VisualImage
                    id="accreditations-hero-fll-photo"
                    label="صورة أبطال العقيق - كأس بطولة فيرست ليجو بالمملكة"
                    src="/covers/first-lego-champions.png"
                    alt="أبطال مدارس العقيق مع كأس بطولة فيرست ليجو FIRST LEGO League بالمملكة"
                    className="h-full w-full object-cover object-[center_12%] transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                  {/* Top Floating Badge - Placed at Top-Left to Keep Coach and Student Faces Clear */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/85 border border-amber-400/40 px-3 py-1 text-xs font-black text-amber-300 shadow-lg backdrop-blur-md">
                    <Trophy size={13} className="text-[#f8ca14]" />
                    <span>{isNationalDay ? "🇸🇦 بطل المملكة · المركز الأول في فيرست ليجو" : "بطل المملكة · المركز الأول FIRST LEGO"}</span>
                  </div>

                  {/* Bottom Overlaid Details */}
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white">
                    <div className="text-right">
                      <h4 className="text-sm font-black drop-shadow-md">بطولة FIRST LEGO League بالمملكة</h4>
                      <p className="text-[11px] text-amber-200/90 drop-shadow-md">تتويج أبطال مدارس العقيق بكأس البطولة الوطنية 🇸🇦</p>
                    </div>
                    <span className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black px-2.5 py-1 text-[10px] shadow-md shrink-0">
                      المركز الأول 🥇
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: WRO World Robot Olympiad */}
              <div className={`group relative rounded-[2.2rem] p-2.5 sm:p-3 border transition duration-500 hover:scale-[1.015] shadow-2xl overflow-hidden ${
                dark
                  ? "border-emerald-500/25 bg-[#0b1218] shadow-black/80 ring-1 ring-emerald-500/15"
                  : "border-emerald-950/10 bg-white shadow-emerald-950/10 ring-1 ring-emerald-900/5"
              }`}>
                <div className="relative overflow-hidden rounded-[1.8rem] aspect-[16/9] sm:aspect-[16/8.5]">
                  <VisualImage
                    id="accreditations-hero-wro-photo"
                    label="صورة طلاب العقيق في أولمبياد الروبوت العالمي WRO"
                    src="/covers/student-robotics-accreditations.jpg"
                    alt="طلاب مدارس العقيق في منافسات أولمبياد الروبوت الدولي WRO"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/85 border border-cyan-400/40 px-3 py-1 text-xs font-black text-cyan-300 shadow-lg backdrop-blur-md">
                    <Award size={13} className="text-cyan-300" />
                    <span>{isNationalDay ? "🇸🇦 تمثيل الوطن · المركز الخامس عالمياً في WRO" : "المركز الخامس عالمياً · أولمبياد WRO الدولي"}</span>
                  </div>

                  {/* Bottom Overlaid Details */}
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white">
                    <div className="text-right">
                      <h4 className="text-sm font-black drop-shadow-md">أولمبياد الروبوت العالمي (WRO)</h4>
                      <p className="text-[11px] text-emerald-300 drop-shadow-md">تمثيل المملكة والمنافسة بين أكثر من 80 دولة 🌐</p>
                    </div>
                    <span className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-2.5 py-1 text-[10px] shadow-md shrink-0">
                      خامس العالم 🏆
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Trust Chip */}
              <div className={`p-3 rounded-2xl border flex items-center gap-3 transition ${
                dark
                  ? "border-white/10 bg-black/60 text-slate-200 shadow-lg"
                  : "border-emerald-950/10 bg-[#f4f7f4] text-slate-800 shadow-sm"
              }`}>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Globe2 size={20} />
                </div>
                <div className="text-right">
                  <h5 className="text-xs font-black">مراكز اختبارات دولية معتمدة بالمدينة المنورة</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">قاعات حاسوبية مهيأة بالكامل لاختبارات IDP IELTS & SAT & ACT</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Testing & Accreditations Hub */}
      <section id="cognia-section" className="py-20 container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"} mb-2`}>
            <Award size={14} />
            <span>منظومة الاعتمادات ومراكز الاختبارات الرسمية</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
            بوابة الاعتمادات الدولية ومراكز القياس بالمدينة المنورة
          </h2>
          <p className={`mt-3 text-sm sm:text-base ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
            مدارس العقيق ليست مجرد صرح تعليمي، بل مركز اختبارات دولي معتمد يخدم الطلاب والمجتمع في المدينة المنورة وفق أعلى معايير الجودة العالمية.
          </p>

          {/* Interactive Credential Switcher Tabs */}
          <div className="mt-8 w-full max-w-3xl mx-auto px-2">
            <div className={`grid grid-cols-4 gap-1 sm:gap-2 p-1.5 rounded-2xl border shadow-sm transition ${
              dark ? "border-white/10 bg-[#0c141a]" : "border-slate-200/90 bg-white"
            }`}>
              {[
                { id: "cognia", label: "اعتماد كوجنيا", icon: ShieldCheck },
                { id: "ielts", label: "مركز IELTS", icon: Globe2 },
                { id: "sat", label: "مراكز SAT & ACT", icon: BookOpenCheck },
                { id: "stem", label: "الروبوت والـ AI", icon: Trophy },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeHubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveHubTab(tab.id as any)}
                    className={`inline-flex items-center justify-center gap-1 sm:gap-2 rounded-xl py-2.5 px-1 sm:px-3 text-center text-xs sm:text-sm font-black transition active:scale-95 ${
                      isActive
                        ? "bg-[#015a37] text-white shadow-md shadow-emerald-950/20"
                        : dark
                        ? "text-slate-400 hover:text-white hover:bg-white/5"
                        : "text-slate-700 hover:text-[#015a37] hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={16} className={`shrink-0 ${isActive ? "text-[#f8ca14]" : ""}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Hub Showcase */}
        {activeHubTab === "cognia" && (
          <div className={`rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl relative overflow-hidden animate-in fade-in transition duration-500 ${
            dark ? "border-emerald-500/30 bg-[#0c1218]/90" : "border-emerald-700/20 bg-white/95"
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3.5 py-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck size={16} />
                    <span>اعتماد أكاديمي مؤسسي رسمي</span>
                  </span>
                  <span className={`text-xs font-bold ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>
                    ترخيص دولي: COGNIA-USA-2026
                  </span>
                </div>

                <h3 className={`text-2xl sm:text-3xl font-black mb-4 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                  اعتماد كوجنيا الأمريكية (Cognia) لأعلى معايير جودة التعليم
                </h3>

                <p className={`text-sm sm:text-base leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                  كوجنيا هي كبرى هيئات الاعتماد الأكاديمي في العالم، وتضم تحت مظلتها أكثر من 36,000 مؤسسة تعليمية في 85 دولة. يمنح هذا الاعتماد خريجي مدارس العقيق شهادات دولية معترفاً بها ومقبولة فوراً في كبرى جامعات المملكة والعالم.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {[
                    "اعتراف وقبول فوري في كبرى الجامعات العالمية والمحلية",
                    "حوكمة أكاديمية وتقييم دوري مستمر لمستوى المناهج",
                    "تأهيل المعلمين وفق أحدث استراتيجيات التعليم الدولية",
                    "مناهج دولية متطورة تلبي متطلبات الثورة الصناعية الرابعة",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-bold">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className={dark ? "text-slate-200" : "text-slate-800 font-bold"}>{item}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="https://www.cognia.org/"
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 text-xs font-black hover:underline ${dark ? "text-[#f8ca14]" : "text-[#015a37]"}`}
                >
                  <span>التحقق من ملف مدارس العقيق في منظمة كوجنيا العالمية</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Cognia Scorecard & Seal Display */}
              <div className="lg:col-span-5">
                <div className={`rounded-3xl border p-6 sm:p-8 shadow-xl relative overflow-hidden ${
                  dark
                    ? "border-emerald-500/40 bg-black/60 ring-1 ring-emerald-500/20"
                    : "border-emerald-950/10 bg-[#fbfaf8] ring-1 ring-emerald-900/5"
                }`}>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-black/5">
                        <img
                          src="https://aqeeq.edu.sa/web/image/1901-f0d65949/Cognia-glossy-logo-800x800-1.png"
                          alt="شعار اعتماد كوجنيا"
                          className="h-10 w-auto object-contain"
                        />
                      </div>
                      <div>
                        <h5 className="font-black text-xs">بطاقة تقييم الجودة</h5>
                        <p className="text-[10px] text-slate-500">Cognia Performance Score</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                      معتمد رسمي ✦
                    </span>
                  </div>

                  {/* Criteria Progress Bars */}
                  <div className="space-y-4 text-xs">
                    {[
                      { title: "كفاءة القيادة والحوكمة المدرسية", score: "98.6%" },
                      { title: "فاعلية البيئة الصفية والتعلم النشط", score: "97.8%" },
                      { title: "تأهيل وتطوير الهيئة الأكاديمية", score: "99.2%" },
                      { title: "تكامل مناهج العلوم والذكاء الاصطناعي", score: "98.4%" },
                    ].map((crit, cIdx) => (
                      <div key={cIdx}>
                        <div className="flex justify-between mb-1 text-[11px] font-bold">
                          <span>{crit.title}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-black">{crit.score}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#015a37] to-emerald-500 rounded-full"
                            style={{ width: crit.score }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-dashed border-slate-200 dark:border-white/10 text-center">
                    <span className="text-[11px] font-bold text-slate-500">
                      تخضع المدارس لمراجعة وتقييم دوري يضمن استدامة التميز
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IELTS Testing Centre Hub */}
        {activeHubTab === "ielts" && (
          <div className={`rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl relative overflow-hidden animate-in fade-in transition duration-500 ${
            dark ? "border-blue-500/30 bg-[#0c1218]/90" : "border-blue-700/20 bg-white/95"
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/10 px-3.5 py-1.5 text-xs font-black text-blue-600 dark:text-blue-400">
                    <Globe2 size={16} />
                    <span>مركز اختبارات معتمد بالمدينة المنورة</span>
                  </span>
                  <span className={`text-xs font-bold ${dark ? "text-slate-400" : "text-slate-600 font-bold"}`}>
                    بالشراكة مع IDP العالمية
                  </span>
                </div>

                <h3 className={`text-2xl sm:text-3xl font-black mb-4 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                  مركز اختبارات IELTS (الآيلتس) الرسمي لطلاب المدارس والجمهور
                </h3>

                <p className={`text-sm sm:text-base leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                  تستضيف مدارس العقيق المركز الرسمي لاختبار IELTS على الحاسوب (IELTS on Computer) بالمدينة المنورة، مجهزاً بأحدث المعامل الحاسوبية وسماعات الرأس اللاسلكية العازلة للصوت لضمان أفضل تجربة اختبار ممكنة.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {[
                    "قاعات حاسوبية عازلة للصوت مجهزة بسماعات IDP الأصلية",
                    "إعلان نتائج الاختبار السريع خلال 3 إلى 5 أيام فقط",
                    "جلسات اختبارات مرنة ومتعددة أسبوعياً (صباحية ومسائية)",
                    "دورات تدريبية مكثفة لطلاب المدارس لتحقيق Band 7.5+",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-bold">
                      <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      <span className={dark ? "text-slate-200" : "text-slate-800 font-bold"}>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href="https://ielts.idp.com/saudiarabia/test-centre/alaqeeq-holding-national-and-international-school"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 text-xs font-black shadow-lg transition active:scale-95"
                  >
                    <span>احجز مقعدك في مركز مدارس العقيق عبر IDP</span>
                    <ExternalLink size={14} />
                  </a>

                  <a
                    href="tel:+966531896000"
                    className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-xs font-bold transition ${
                      dark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm"
                    }`}
                  >
                    <span>استفسارات الآيلتس: 966531896000+</span>
                  </a>
                </div>
              </div>

              {/* Upcoming Test Sessions Interactive Schedule */}
              <div className="lg:col-span-5">
                <div className={`rounded-3xl border p-6 sm:p-8 shadow-xl ${
                  dark ? "border-blue-500/30 bg-black/60" : "border-blue-950/10 bg-[#f8fafd]"
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" />
                      <h5 className="font-black text-xs">مواعيد الاختبارات القادمة (IELTS on Computer)</h5>
                    </div>
                    <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">
                      مركز المدينة
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { date: "السبت، 12 سبتمبر 2026", time: "09:00 صباحاً", hall: "معمل الحاسوب (A)", seats: "متاح الحجز", statusColor: "text-emerald-500" },
                      { date: "الأربعاء، 16 سبتمبر 2026", time: "01:30 ظهراً", hall: "معمل الحاسوب (B)", seats: "متبقي 4 مقاعد", statusColor: "text-amber-500" },
                      { date: "السبت، 19 سبتمبر 2026", time: "09:00 صباحاً", hall: "معمل الحاسوب (A)", seats: "متاح الحجز", statusColor: "text-emerald-500" },
                      { date: "الأربعاء، 23 سبتمبر 2026", time: "01:30 ظهراً", hall: "معمل الحاسوب (B)", seats: "متاح الحجز", statusColor: "text-emerald-500" },
                    ].map((session, sIdx) => (
                      <div
                        key={sIdx}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition ${
                          dark ? "border-white/5 bg-white/5 hover:border-blue-500/30" : "border-slate-200 bg-white hover:border-blue-400"
                        }`}
                      >
                        <div>
                          <p className="font-black text-[12px]">{session.date}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1"><Clock size={10} /> {session.time}</span>
                            <span>• {session.hall}</span>
                          </div>
                        </div>
                        <span className={`text-[11px] font-black ${session.statusColor}`}>
                          {session.seats}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-500 text-center mt-4 font-medium">
                    يتم فتح جلسات إضافية بناءً على الإقبال بالتنسيق مع IDP
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SAT & ACT Hub */}
        {activeHubTab === "sat" && (
          <div className={`rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl relative overflow-hidden animate-in fade-in transition duration-500 ${
            dark ? "border-amber-500/30 bg-[#0c1218]/90" : "border-amber-700/20 bg-white/95"
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Digital SAT Card */}
              <div className={`rounded-3xl border p-6 sm:p-8 flex flex-col justify-between ${
                dark ? "border-white/10 bg-black/60" : "border-slate-200 bg-[#fdfbf7]"
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-600 dark:text-amber-400">
                      College Board Approved
                    </span>
                    <span className="text-xs font-bold text-slate-500">Center Code: #68412</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-black/5 shrink-0">
                      <img
                        src="https://aqeeq.edu.sa/web/image/1907-cf5d04ed/sat-logo.jpg"
                        alt="شعار مركز اختبارات SAT"
                        className="h-12 w-auto object-contain"
                      />
                    </div>
                    <div>
                      <h4 className={`text-xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
                        مركز اختبارات Digital SAT
                      </h4>
                      <p className="text-xs text-slate-500">معتمد رسمياً لتقديم الاختبار الرقمي عبر Bluebook</p>
                    </div>
                  </div>

                  <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                    مركز معتمد ومجهز بالكامل بأحدث الحواسيب والشبكات السريعة لاختبارات SAT الرقمية المؤهلة للقبول في كبرى الجامعات العالمية والمسارات المرموقة في المملكة.
                  </p>

                  <div className="space-y-2 text-xs font-bold mb-6">
                    <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-amber-500" /> شبكة إنترنت فايبر مخصصة وآمنة للاختبار</div>
                    <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-amber-500" /> تدريب مدرسي مكثف لتحقيق 1400+ في SAT</div>
                  </div>
                </div>

                <a
                  href="https://satsuite.collegeboard.org/sat/registration"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black px-5 py-3 text-xs font-black transition"
                >
                  <span>التسجيل في اختبار SAT عبر College Board</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* ACT Test Center Card */}
              <div className={`rounded-3xl border p-6 sm:p-8 flex flex-col justify-between ${
                dark ? "border-white/10 bg-black/60" : "border-slate-200 bg-[#fdfbf7]"
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-3 py-1 text-xs font-black text-rose-600 dark:text-rose-400">
                      ACT Official Test Venue
                    </span>
                    <span className="text-xs font-bold text-slate-500">American ACT Center</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-black/5 shrink-0">
                      <img
                        src="https://aqeeq.edu.sa/web/image/1905-c752dcc6/act-logo.jpg"
                        alt="شعار مركز اختبارات ACT"
                        className="h-12 w-auto object-contain"
                      />
                    </div>
                    <div>
                      <h4 className={`text-xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
                        مركز اختبارات ACT الأمريكية
                      </h4>
                      <p className="text-xs text-slate-500">تقييم مهارات الرياضيات واللغة والعلوم والتفكير النقدي</p>
                    </div>
                  </div>

                  <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                    مركز معتمد لتقديم اختبار ACT الشامل الذي يُعد أحد الركائز الأساسية للقبول الجامعي في الولايات المتحدة وكبرى الجامعات الدولية.
                  </p>

                  <div className="space-y-2 text-xs font-bold mb-6">
                    <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-rose-500" /> بيئة اختبارات دولية بمواصفات قياسية</div>
                    <div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-rose-500" /> مشرفون ومراقبون معتمدون دولياً</div>
                  </div>
                </div>

                <a
                  href="https://global.act.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-5 py-3 text-xs font-black transition"
                >
                  <span>التسجيل في اختبار ACT الدولي</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Robotics & STEM Hub */}
        {activeHubTab === "stem" && (
          <div className={`rounded-[2.5rem] border p-6 sm:p-10 shadow-2xl relative overflow-hidden animate-in fade-in transition duration-500 ${
            dark ? "border-emerald-500/30 bg-[#0c1218]/90" : "border-emerald-700/20 bg-white/95"
          }`}>
            {/* Header */}
            <div className="max-w-3xl mb-8 text-right">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f8ca14]/10 border border-[#f8ca14]/30 px-3.5 py-1.5 text-xs font-black text-[#f8ca14] mb-3">
                <Trophy size={14} />
                <span>أكاديمية الروبوت والذكاء الاصطناعي وبطولاتها الكبرى ✦</span>
              </div>

              <h3 className={`text-2xl sm:text-3xl font-black mb-3 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                سجل بطولات الروبوت والـ STEM: أبطال المملكة محلياً وخامس العالم دولياً
              </h3>

              <p className={`text-sm sm:text-base leading-relaxed ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                تعد أكاديمية الروبوت والذكاء الاصطناعي بمدارس العقيق حاضنة وطنية للابتكار وصناعة المبتكرين؛ تجمع بين التتويج بكأس المركز الأول على مستوى المملكة في بطولة فيرست ليجو (FLL) وحصد المركز الخامس عالمياً في أولمبياد الروبوت الدولي (WRO) بين أكثر من 80 دولة.
              </p>
            </div>

            {/* Dual Championship Showcase Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Championship 1: FIRST LEGO League */}
              <div className={`rounded-3xl border p-5 shadow-lg relative overflow-hidden transition hover:shadow-xl ${
                dark ? "border-amber-500/30 bg-[#080d14]" : "border-amber-600/20 bg-[#fffdf7]"
              }`}>
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-4 border border-black/10">
                  <img
                    src="/covers/first-lego-champions.png"
                    alt="تتويج أبطال مدارس العقيق بكأس بطولة فيرست ليجو FIRST LEGO League بالمملكة"
                    className="h-full w-full object-cover object-[center_12%] transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/85 border border-amber-400/40 px-3 py-1 text-xs font-black text-amber-300 shadow-md">
                    <Trophy size={12} className="text-[#f8ca14]" />
                    <span>بطل المملكة 🥇</span>
                  </div>
                  <div className="absolute bottom-3 right-3 left-3 text-white">
                    <span className="text-[10px] font-black text-amber-300">FIRST SAUDI ARABIA</span>
                    <h4 className="text-sm font-black drop-shadow">بطولة فيرست ليجو (FIRST LEGO League)</h4>
                  </div>
                </div>

                <h4 className={`text-base font-black mb-2 text-right ${dark ? "text-amber-300" : "text-amber-800"}`}>
                  كأس المركز الأول على مستوى المملكة في بطولة فيرست ليجو
                </h4>
                <p className={`text-xs sm:text-sm leading-relaxed mb-4 text-right ${dark ? "text-slate-300" : "text-slate-700"}`}>
                  حصد أبطال مدارس العقيق كأس البطولة الوطنية والمركز الأول بالمملكة في دوري فيرست ليجو للروبوت والعلوم، بعد تصميم وبرمجة روبوتات المهام الذكية وتقديم حلول علمية مبتكرة نالت إشادة لجان التحكيم الوطنية.
                </p>

                <div className="flex flex-wrap gap-2 text-[11px] font-black text-right">
                  <span className="rounded-xl px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500">
                    كأس بطولة المملكة 🏆
                  </span>
                  <span className="rounded-xl px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500">
                    برمجة الروبوتات الذكية
                  </span>
                  <span className="rounded-xl px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500">
                    التأهل لتمثيل الوطن 🇸🇦
                  </span>
                </div>
              </div>

              {/* Championship 2: World Robot Olympiad */}
              <div className={`rounded-3xl border p-5 shadow-lg relative overflow-hidden transition hover:shadow-xl ${
                dark ? "border-cyan-500/30 bg-[#080d14]" : "border-cyan-700/20 bg-[#f7fbff]"
              }`}>
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-4 border border-black/10">
                  <img
                    src="/covers/student-robotics-accreditations.jpg"
                    alt="طلاب مدارس العقيق في أولمبياد الروبوت العالمي WRO"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/85 border border-cyan-400/40 px-3 py-1 text-xs font-black text-cyan-300 shadow-md">
                    <Award size={12} className="text-cyan-300" />
                    <span>خامس العالم 🏆</span>
                  </div>
                  <div className="absolute bottom-3 right-3 left-3 text-white">
                    <span className="text-[10px] font-black text-cyan-300">WRO INTERNATIONAL</span>
                    <h4 className="text-sm font-black drop-shadow">أولمبياد الروبوت العالمي (WRO)</h4>
                  </div>
                </div>

                <h4 className={`text-base font-black mb-2 text-right ${dark ? "text-cyan-300" : "text-cyan-800"}`}>
                  المركز الخامس عالمياً في أولمبياد الروبوت العالمي (WRO)
                </h4>
                <p className={`text-xs sm:text-sm leading-relaxed mb-4 text-right ${dark ? "text-slate-300" : "text-slate-700"}`}>
                  مثل طلاب مدارس العقيق المملكة في المحفل العالمي الأضخم وتوجوا بالمركز الخامس على مستوى العالم بين أكثر من 80 دولة متنافسة، مما يعكس كفاءة الإعداد الأكاديمي والتدريب المتقدم على الخوارزميات والذكاء الاصطناعي.
                </p>

                <div className="flex flex-wrap gap-2 text-[11px] font-black text-right">
                  <span className="rounded-xl px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-500">
                    المركز الخامس عالمياً 🌐
                  </span>
                  <span className="rounded-xl px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-500">
                    منافسة أكثر من 80 دولة
                  </span>
                  <span className="rounded-xl px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-500">
                    خوارزميات الذكاء الاصطناعي
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Infrastructure Grid */}
            <div className={`p-5 sm:p-6 rounded-2xl border ${
              dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
            }`}>
              <h5 className="text-xs font-black mb-3 text-right">
                التجهيزات والبنية التحتية لأكاديمية الروبوت والـ STEM بمدارس العقيق:
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  "معامل STEM وروبوتات VEX و LEGO المتقدمة",
                  "تدريب مكثف على لغات Python و C++ للخوارزميات",
                  "شراكات مع مؤسسة موهبة ومسار أسبار والجامعات",
                  "حاضنات لمشاريع الذكاء الاصطناعي وحلول الطاقة",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-bold text-right">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className={dark ? "text-slate-200" : "text-slate-800 font-bold"}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Interactive University & Career Pathway Simulator */}
      <section className={`py-20 border-y ${
        dark ? "border-white/10 bg-[#06080d]" : "border-emerald-950/10 bg-[#f5f8f5]"
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"} mb-2`}>
              <GraduationCap size={14} />
              <span>مستقبل الطالب الجامعي والمهني</span>
            </div>
            <h3 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              أين تأخذ هذه الاعتمادات ابنك مستقبلاً؟ 🎓
            </h3>
            <p className={`text-xs sm:text-sm mt-2 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              اضغط على وجهة طموح ابنك لتكتشف كيف تضمن له اعتمادات العقيق القبول الفوري:
            </p>

            {/* Pathway Selector Pills */}
            <div className="mt-8 w-full max-w-2xl mx-auto px-2">
              <div className={`grid grid-cols-3 gap-1 sm:gap-2 p-1.5 rounded-2xl border shadow-sm transition ${
                dark ? "border-white/10 bg-[#0c141a]" : "border-slate-200/90 bg-white"
              }`}>
                {[
                  { id: "saudi", label: "الجامعات السعودية 🇸🇦" },
                  { id: "scholarship", label: "برنامج الابتعاث ✈️" },
                  { id: "global", label: "الجامعات الدولية 🌐" },
                ].map((p) => {
                  const isActive = activePathway === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePathway(p.id as any)}
                      className={`rounded-xl py-2.5 px-2 text-xs sm:text-sm font-black transition active:scale-95 text-center truncate ${
                        isActive
                          ? "bg-[#015a37] text-white shadow-md shadow-emerald-950/20"
                          : dark
                          ? "text-slate-400 hover:text-white hover:bg-white/5"
                          : "text-slate-700 hover:text-[#015a37] hover:bg-slate-50"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pathway Content Card */}
          <div className={`max-w-4xl mx-auto rounded-3xl border p-8 sm:p-10 shadow-xl transition ${
            dark ? "border-emerald-500/20 bg-[#0c1218]" : "border-emerald-700/15 bg-white shadow-lg"
          }`}>
            {activePathway === "saudi" && (
              <div className="animate-in fade-in space-y-4 text-right">
                <h4 className={`text-xl font-black ${dark ? "text-[#f8ca14]" : "text-[#015a37]"}`}>
                  القبول في جامعة الملك فهد للبترول والمعادن (KFUPM)، كاوست (KAUST)، وجامعة الملك سعود:
                </h4>
                <p className={`text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700"}`}>
                  تشترط هذه الجامعات الرائدة درجات تنافسية عالية في اختبارات قياس (القدرات والتحصيلي) بالإضافة إلى اختبار لغة إنجليزية معتمد (IELTS 6.0+ أو SAT Math 650+).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className={`p-4 rounded-2xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                    <span className="block text-xs text-slate-500 font-bold mb-1">الآيلتس المباشر</span>
                    <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">تحقيق Band 6.5 - 7.5</span>
                    <p className="text-[11px] text-slate-500 mt-1">اختبار الطالب داخل قاعات مدارسه المعتمدة</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                    <span className="block text-xs text-slate-500 font-bold mb-1">القدرات والتحصيلي</span>
                    <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">معدلات 90+ و 95+</span>
                    <p className="text-[11px] text-slate-500 mt-1">برامج تدريب يومية متخصصة ومحاكاة</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                    <span className="block text-xs text-slate-500 font-bold mb-1">السنة التحضيرية</span>
                    <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">إعفاء واجتياز مباشر</span>
                    <p className="text-[11px] text-slate-500 mt-1">بفضل مناهج العلوم واللغات المتطورة</p>
                  </div>
                </div>
              </div>
            )}

            {activePathway === "scholarship" && (
              <div className="animate-in fade-in space-y-4 text-right">
                <h4 className={`text-xl font-black ${dark ? "text-[#f8ca14]" : "text-[#015a37]"}`}>
                  برنامج خادم الحرمين الشريفين للابتعاث (مسار الرواد لأفضل 30 جامعة بالعالم):
                </h4>
                <p className={`text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700"}`}>
                  يتطلب مسار الرواد قبولاً غير مشروط من كبرى الجامعات (مثل Harvard, MIT, Oxford, Stanford). بفضل اعتماد كوجنيا ومراكز SAT و IELTS داخل العقيق، يحصل الطالب على ملف أكاديمي متكامل يطابق معايير القبول في رابطة اللبلاب (Ivy League).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className={`p-4 rounded-2xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                    <span className="block text-xs text-slate-500 font-bold mb-1">شهادة كوجنيا الأمريكية</span>
                    <span className="font-black text-sm text-amber-600 dark:text-amber-400">High School Diploma</span>
                    <p className="text-[11px] text-slate-500 mt-1">معادلة ومقبولة فورياً عالمياً</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                    <span className="block text-xs text-slate-500 font-bold mb-1">اختبارات SAT الرسمية</span>
                    <span className="font-black text-sm text-amber-600 dark:text-amber-400">درجات تنافسية 1350+</span>
                    <p className="text-[11px] text-slate-500 mt-1">مركز الاختبارات الرسمي داخل المدرسة</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                    <span className="block text-xs text-slate-500 font-bold mb-1">الإرشاد الجامعي الدولي</span>
                    <span className="font-black text-sm text-amber-600 dark:text-amber-400">College Counseling</span>
                    <p className="text-[11px] text-slate-500 mt-1">خطابات توصية وسيرة ذاتية متكاملة</p>
                  </div>
                </div>
              </div>
            )}

            {activePathway === "global" && (
              <div className="animate-in fade-in space-y-4 text-right">
                <h4 className={`text-xl font-black ${dark ? "text-[#f8ca14]" : "text-[#015a37]"}`}>
                  كليات الطب والعلوم والهندسة في بريطانيا، كندا، وأمريكا ودول الخليج:
                </h4>
                <p className={`text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700"}`}>
                  توفر مدارس العقيق مسارات نوعية للمواد العلمية والإنجليزية المكثفة مع إمكانية احتساب الساعات الجامعية المعتمدة (AP Courses)، مما يوفر على الطالب سنة دراسية كاملة ويسرع انطلاقه في المجال الطبي والهندسي.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className={`p-4 rounded-2xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                    <span className="block text-xs text-slate-500 font-bold mb-1">ساعات AP المعتمدة</span>
                    <span className="font-black text-sm text-blue-600 dark:text-blue-400">Advanced Placement</span>
                    <p className="text-[11px] text-slate-500 mt-1">معادلة مقررات الجامعة المبكرة</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                    <span className="block text-xs text-slate-500 font-bold mb-1">المعامل والبحث العلمي</span>
                    <span className="font-black text-sm text-blue-600 dark:text-blue-400">STEM Research</span>
                    <p className="text-[11px] text-slate-500 mt-1">تجارب معملية وبحوث موثقة</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                    <span className="block text-xs text-slate-500 font-bold mb-1">اللغة الإنجليزية التخصصية</span>
                    <span className="font-black text-sm text-blue-600 dark:text-blue-400">Academic Fluency</span>
                    <p className="text-[11px] text-slate-500 mt-1">طلاقة كاملة في المصطلحات الطبية والهندسية</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="py-20 container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"} mb-2`}>
              <HelpCircle size={14} />
              <span>الإجابات الشافية</span>
            </div>
            <h3 className={`text-2xl sm:text-3xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>
              الأسئلة الشائعة حول مراكز الاختبارات والاعتمادات
            </h3>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "هل مراكز اختبارات IELTS و SAT متاحة للأفراد والطلاب من خارج مدارس العقيق؟",
                a: "نعم، مركز مدارس العقيق لاختبارات IELTS IDP و SAT مرخص رسمياً لخدمة كافة أفراد المجتمع والطلاب في المدينة المنورة وخارجها، ويمكن لأي متقدم حجز موعده مباشرة عبر موقع IDP أو College Board واختيار مركز مدارس العقيق.",
              },
              {
                q: "ما الفرق بين اختبار IELTS الورقي والمحوسب المتاح في المركز؟",
                a: "اختبار IELTS on Computer هو الاختبار الأكثر طلباً عالمياً لأنه يتم في قاعات حاسوبية عازلة للصوت، وتظهر نتائجه في فترة قياسية (خلال 3 إلى 5 أيام عمل فقط)، مع توفير لوحة مفاتيح وسماعات رأس احترافية.",
              },
              {
                q: "ماذا يضيف اعتماد كوجنيا (Cognia) لشهادة تخرج ابني؟",
                a: "اعتماد كوجنيا يمنح الشهادة معادلة فورية معتمدة دولياً ومحلياً، مما يلغي أي عقبات في تصديق الشهادات لدى الملحقيات الثقافية والجامعات العالمية عند التقديم على المنح وبرامج الابتعاث.",
              },
              {
                q: "كيف تساعد المدرسة الطلاب في الاستعداد لهذه الاختبارات؟",
                a: "توفر المدرسة مسارات تأهيلية مكثفة ضمن اليوم الدراسي وخارجه، تشمل اختبارات محاكاة دورية للآيلتس والسات والقدرات والتحصيلي، وورش عمل معتمدة بإشراف مدربين دوليين معتمدين.",
              },
            ].map((faq, fIdx) => (
              <div
                key={fIdx}
                className={`rounded-2xl border transition overflow-hidden ${
                  dark ? "border-white/10 bg-[#0c1218]" : "border-emerald-950/10 bg-white shadow-sm"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === fIdx ? null : fIdx)}
                  className="w-full p-5 text-right font-black text-sm flex items-center justify-between gap-4"
                >
                  <span className={dark ? "text-white" : "text-[#0a192f]"}>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-emerald-600 transition duration-300 ${openFaqIndex === fIdx ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaqIndex === fIdx && (
                  <div className={`p-5 pt-0 text-xs leading-relaxed border-t border-dashed ${
                    dark ? "border-white/10 text-slate-300" : "border-slate-100 text-slate-700 font-medium"
                  }`}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 container mx-auto px-4 sm:px-6 text-center">
        <div className={`rounded-[3rem] border p-8 sm:p-14 relative overflow-hidden ${
          dark ? "border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-[#01140c] to-emerald-950/40 shadow-2xl" : "border-emerald-700/20 bg-white shadow-xl"
        }`}>
          <h3 className={`text-2xl sm:text-4xl font-black mb-4 ${dark ? "text-white" : "text-[#0a192f]"}`}>
            امنح ابنك تعليماً بمعايير عالمية
          </h3>
          <p className={`text-sm sm:text-base max-w-xl mx-auto mb-8 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
            فريق القبول والتسجيل بمدارس العقيق جاهز للإجابة عن كافة استفساراتكم ومساعدتكم في اختيار المسار الأنسب لقدرات وطموحات ابنكم.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/admissions")}
              className={`rounded-2xl px-8 py-6 text-base font-black shadow-xl transition active:scale-95 ${
                dark
                  ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black hover:opacity-95 shadow-[#f8ca14]/20"
                  : "bg-gradient-to-r from-[#015a37] to-[#027a4b] text-white hover:opacity-95 shadow-[#015a37]/25"
              }`}
            >
              <span>التقديم والقبول الإلكتروني</span>
              <ArrowRight size={18} className="mr-2" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/about")}
              className={`rounded-2xl px-8 py-6 text-base font-black border transition ${
                dark ? "border-white/10 text-white hover:bg-white/5" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <span>تعرف على فروع ومرافق المدارس</span>
            </Button>
          </div>
        </div>
      </section>

    </AqeeqLuxuryPageShell>
  );
}
