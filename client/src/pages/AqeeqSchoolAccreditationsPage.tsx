import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
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
} from "lucide-react";

export default function AqeeqSchoolAccreditationsPage() {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();

  return (
    <main
      dir="rtl"
      className={`min-h-screen aq-public-shell font-[Tajawal,sans-serif] transition-colors duration-200 ${
        dark ? "bg-[#05080c] text-white" : "bg-[#fbfaf8] text-slate-900"
      }`}
    >
      <AlaqeeqStudioSiteHeader title="الاعتمادات الدولية ومراكز الاختبارات" active="accreditations" />

      {/* Hero Section: Modern Executive 2-Column Showcase */}
      <section className="relative isolate overflow-hidden border-b border-black/[0.08] dark:border-white/[0.08] py-12 sm:py-20">
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(1,90,55,0.08),transparent_60%)] dark:bg-[radial-gradient(circle_at_20%_25%,rgba(1,90,55,0.22),transparent_60%)]" />

        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Right Column: Hero Content & CTAs (7 cols) */}
            <div className="lg:col-span-7 text-right">
              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black backdrop-blur-md mb-6 shadow-sm ${
                dark
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-emerald-700/25 bg-white/95 text-[#015a37]"
              }`}>
                <Award size={14} className={dark ? "text-[#f8ca14]" : "text-[#c59b27]"} />
                <span>معايير عالمية في قلب المدينة المنورة</span>
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

            {/* Left Column: Close-Up Visual Showcase Card (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className={`relative rounded-[2.5rem] p-3 sm:p-4 border transition duration-500 hover:scale-[1.01] shadow-2xl ${
                dark
                  ? "border-emerald-500/20 bg-[#0b1218] shadow-black/80 ring-1 ring-emerald-500/10"
                  : "border-emerald-950/10 bg-white shadow-emerald-950/15 ring-1 ring-emerald-900/5"
              }`}>
                {/* Close-Up Student Robotics Photo */}
                <div className="relative overflow-hidden rounded-[2rem] aspect-[4/3] sm:aspect-[16/12]">
                  <VisualImage
                    id="accreditations-hero-student-photo"
                    label="صورة طلاب العقيق المقربة في مسابقة الروبوت"
                    src="/covers/student-robotics-accreditations.jpg"
                    alt="طلاب مدارس العقيق في منافسات الروبوت والابتكار"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  {/* Subtle Gradient Shade at Bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-2 rounded-full bg-black/80 border border-white/20 px-3.5 py-1.5 text-xs font-black text-white shadow-lg backdrop-blur-md">
                    <Trophy size={13} className="text-[#f8ca14]" />
                    <span>المركز الخامس عالمياً في WRO</span>
                  </div>

                  {/* Bottom Overlaid Details */}
                  <div className="absolute bottom-3.5 right-3.5 left-3.5 flex items-center justify-between text-white">
                    <div>
                      <h4 className="text-sm font-black drop-shadow-md">أكاديمية الروبوت والابتكار STEM</h4>
                      <p className="text-[11px] text-emerald-300 drop-shadow-md">تأهيل وتتويج في المحافل الدولية</p>
                    </div>
                    <span className="rounded-xl bg-blue-600/90 px-2.5 py-1 text-[10px] font-black backdrop-blur-md shadow">
                      معايير عالمية
                    </span>
                  </div>
                </div>

                {/* Overlapping Floating Trust Chip (Bottom) */}
                <div className={`mt-3 p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                  dark
                    ? "border-white/10 bg-black/60 text-slate-200"
                    : "border-emerald-950/10 bg-[#f4f7f4] text-slate-800"
                }`}>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Globe2 size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black">مراكز اختبارات دولية معتمدة بالمدينة</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">قاعات حاسوبية مهيأة بالكامل لاختبارات IELTS & SAT</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Accreditations Grid */}
      <section id="cognia-section" className="py-20 container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Cognia Accreditation Card */}
          <div className={`rounded-[2.5rem] border p-8 sm:p-12 relative overflow-hidden transition duration-300 shadow-xl ${
            dark ? "border-emerald-500/20 bg-[#0c1218]/90" : "border-emerald-700/20 bg-white/95"
          }`}>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3.5 py-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={16} />
                <span>الاعتماد الأكاديمي الدولي</span>
              </div>
              <span className={`text-xs font-bold ${dark ? "text-slate-400" : "text-slate-600 font-bold"}`}>USA Accredited</span>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-black/5 shrink-0">
                <img
                  src="https://aqeeq.edu.sa/web/image/1901-f0d65949/Cognia-glossy-logo-800x800-1.png"
                  alt="شعار اعتماد كوجنيا الأمريكية Cognia"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <div>
                <h3 className={`text-2xl font-black mb-1 ${dark ? "text-white" : "text-[#0a192f]"}`}>اعتماد كوجنيا الأمريكية (Cognia)</h3>
                <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>أكبر وأعرق هيئة اعتماد تربوي ومدرسي في العالم</p>
              </div>
            </div>

            <p className={`text-sm leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
              يضمن اعتماد كوجنيا التزام مدارس العقيق بأعلى معايير الحوكمة التعليمية، وتطوير أداء المعلمين، وتقديم بيئة تعليمية محفزة للابتكار تضاهي أرقى المدارس العالمية في الولايات المتحدة ودول العالم.
            </p>

            <div className="space-y-2.5 mb-8">
              {[
                "مناهج دولية متطورة معتمدة تؤهل لأرقى الجامعات",
                "تقييم دوري مستمر لجودة المخرجات التعليمية والتربوية",
                "شهادات تخرج دولية معترف بها عالمياً ومحلياً",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs font-bold">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span className={dark ? "text-slate-200" : "text-slate-800 font-bold"}>{item}</span>
                </div>
              ))}
            </div>

            <a
              href="https://www.cognia.org/"
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 text-xs font-black hover:underline ${dark ? "text-[#f8ca14]" : "text-[#b8860b]"}`}
            >
              <span>زيارة الموقع الرسمي لمنظمة كوجنيا العالمية</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* IELTS Official Test Centre Card */}
          <div className={`rounded-[2.5rem] border p-8 sm:p-12 relative overflow-hidden transition duration-300 shadow-xl ${
            dark ? "border-emerald-500/20 bg-[#0c1218]/90" : "border-emerald-700/20 bg-white/95"
          }`}>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="inline-flex items-center gap-2 rounded-xl bg-blue-500/10 px-3.5 py-1.5 text-xs font-black text-blue-600 dark:text-blue-400">
                <Globe2 size={16} />
                <span>مركز اختبارات معتمد بالمدينة المنورة</span>
              </div>
              <span className={`text-xs font-bold ${dark ? "text-slate-400" : "text-slate-600 font-bold"}`}>IDP Official Centre</span>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-black/5 shrink-0">
                <img
                  src="https://aqeeq.edu.sa/web/image/1906-99369c02/ielts-logo.jpg"
                  alt="شعار مركز اختبارات الآيلتس IELTS IDP"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <div>
                <h3 className={`text-2xl font-black mb-1 ${dark ? "text-white" : "text-[#0a192f]"}`}>مركز اختبارات IELTS (الآيلتس)</h3>
                <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>بالشراكة الرسمية مع منظمة IDP التعليمية العالمية</p>
              </div>
            </div>

            <p className={`text-sm leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
              تستضيف مدارس العقيق مركز الاختبارات المعتمد لاختبار اللغة الإنجليزية الدولي (IELTS)، ليخدم طلاب المدارس وكافة أفراد المجتمع بالمدينة المنورة في بيئة احترافية ومجهزة بأحدث التجهيزات التقنية.
            </p>

            <div className="space-y-2.5 mb-8">
              {[
                "مختبرات حاسوبية مهيأة بالكامل لاختبار IELTS on Computer",
                "دورات تأهيلية وتدريبية متخصصة لرفع كفاءة الطلاب",
                "مواعيد اختبارات أسبوعية مرنة وسرعة في إعلان النتائج",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs font-bold">
                  <CheckCircle2 size={16} className="text-blue-500 shrink-0" />
                  <span className={dark ? "text-slate-200" : "text-slate-800 font-bold"}>{item}</span>
                </div>
              ))}
            </div>

            <a
              href="https://ielts.idp.com/saudiarabia/test-centre/alaqeeq-holding-national-and-international-school"
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 text-xs font-black hover:underline ${dark ? "text-blue-400" : "text-blue-700"}`}
            >
              <span>حجز موعد اختبار الآيلتس في مركز مدارس العقيق</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* SAT & ACT Centers Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* SAT */}
          <div className={`rounded-[2rem] border p-6 sm:p-8 flex items-start gap-5 ${
            dark ? "border-white/10 bg-[#0c1218]" : "border-emerald-950/10 bg-white/95 shadow-md hover:shadow-lg"
          }`}>
            <div className="bg-white p-3 rounded-2xl shrink-0 shadow-sm border border-black/5">
              <img
                src="https://aqeeq.edu.sa/web/image/1907-cf5d04ed/sat-logo.jpg"
                alt="شعار مركز اختبارات SAT"
                className="h-12 w-auto object-contain"
              />
            </div>
            <div>
              <h4 className={`text-lg font-black mb-1 ${dark ? "text-white" : "text-[#0a192f]"}`}>مركز معتمد لاختبارات SAT الدولية</h4>
              <p className={`text-xs leading-relaxed mb-3 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>
                مدارس العقيق مركز معتمد من College Board لتقديم اختبارات SAT الرقمية المؤهلة للقبول في كبرى الجامعات العالمية والبرامج المرموقة.
              </p>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={14} /> تجهيزات تقنية وقاعات مجهزة بالكامل
              </span>
            </div>
          </div>

          {/* ACT */}
          <div className={`rounded-[2rem] border p-6 sm:p-8 flex items-start gap-5 ${
            dark ? "border-white/10 bg-[#0c1218]" : "border-emerald-950/10 bg-white/95 shadow-md hover:shadow-lg"
          }`}>
            <div className="bg-white p-3 rounded-2xl shrink-0 shadow-sm border border-black/5">
              <img
                src="https://aqeeq.edu.sa/web/image/1905-c752dcc6/act-logo.jpg"
                alt="شعار مركز اختبارات ACT"
                className="h-12 w-auto object-contain"
              />
            </div>
            <div>
              <h4 className={`text-lg font-black mb-1 ${dark ? "text-white" : "text-[#0a192f]"}`}>مركز معتمد لاختبارات ACT الأمريكية</h4>
              <p className={`text-xs leading-relaxed mb-3 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>
                مركز اختبارات ACT المعتمد لتقييم مهارات الطلاب في اللغة الإنجليزية والرياضيات والعلوم والتفكير النقدي للالتحاق بالتعليم الجامعي.
              </p>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={14} /> بيئة اختبارات دولية مطابقة للمواصفات
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Educational Tracks (AI, STEM, Talent) */}
      <section className={`py-20 border-t ${
        dark ? "border-white/10 bg-[#06080d]" : "border-emerald-950/10 bg-[#f5f8f5]"
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className={`inline-flex items-center gap-2 text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"} mb-2`}>
              <Sparkles size={14} />
              <span>مهارات المستقبل ورؤية 2030</span>
            </div>
            <h3 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>البرامج النوعية ومسارات الإبداع</h3>
            <p className={`text-xs sm:text-sm mt-2 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
              نصنع قادة الغد عبر مناهج نوعية وتجارب تعليمية تعزز التفكير التحليلي والابتكار
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* AI & Coding */}
            <div className={`rounded-3xl border p-8 transition duration-300 hover:-translate-y-1 ${
              dark ? "border-white/10 bg-[#0c1218]" : "border-emerald-950/10 bg-white/95 shadow-md hover:shadow-lg"
            }`}>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-6">
                <Brain size={28} />
              </div>
              <h4 className={`text-xl font-black mb-3 ${dark ? "text-white" : "text-[#0a192f]"}`}>مسار البرمجة والذكاء الاصطناعي</h4>
              <p className={`text-xs leading-relaxed mb-6 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>
                تعليم لغات البرمجة (Python, Scratch) وأساسيات الخوارزميات وتطبيقات الذكاء الاصطناعي لكافة المراحل، لتمكين الطلاب من أدوات المستقبل.
              </p>
              <ul className={`space-y-2 text-xs font-bold ${dark ? "text-slate-300" : "text-slate-800"}`}>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> معامل حاسوبية متطورة 1:1</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> مشاريع برمجية واقعية وحلول ذكية</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> تأهيل للمسابقات الوطنية والدولية</li>
              </ul>
            </div>

            {/* STEM & Robotics */}
            <div className={`rounded-3xl border p-8 transition duration-300 hover:-translate-y-1 ${
              dark ? "border-white/10 bg-[#0c1218]" : "border-emerald-950/10 bg-white/95 shadow-md hover:shadow-lg"
            }`}>
              <div className={`grid h-14 w-14 place-items-center rounded-2xl ${dark ? "bg-amber-500/10 text-[#f8ca14]" : "bg-amber-500/10 text-[#c59b27]"} mb-6`}>
                <Cpu size={28} />
              </div>
              <h4 className={`text-xl font-black mb-3 ${dark ? "text-white" : "text-[#0a192f]"}`}>مناهج STEM والروبوت والابتكار</h4>
              <p className={`text-xs leading-relaxed mb-6 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>
                تطبيق منهجية التعليم المتكامل (العلوم، التقنية، الهندسة، الرياضيات) عبر أندية الروبوت وتحديات WRO العالمية وبطولة الوورد منيا.
              </p>
              <ul className={`space-y-2 text-xs font-bold ${dark ? "text-slate-300" : "text-slate-800"}`}>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-500" /> أندية روبوت وأردوينو تفاعلية</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-500" /> المركز الخامس في مسابقة WRO العالمية</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-500" /> تجارب معملية ومشاريع تطبيقية</li>
              </ul>
            </div>

            {/* Talent & Public Speaking */}
            <div className={`rounded-3xl border p-8 transition duration-300 hover:-translate-y-1 ${
              dark ? "border-white/10 bg-[#0c1218]" : "border-emerald-950/10 bg-white/95 shadow-md hover:shadow-lg"
            }`}>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-6">
                <Trophy size={28} />
              </div>
              <h4 className={`text-xl font-black mb-3 ${dark ? "text-white" : "text-[#0a192f]"}`}>رعاية الموهوبين وفنون الخطابة</h4>
              <p className={`text-xs leading-relaxed mb-6 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>
                برامج متخصصة لاكتشاف ورعاية الطلبة الموهوبين، وبناء الثقة في النفس من خلال مسارات الإلقاء والخطابة باللغتين العربية والإنجليزية.
              </p>
              <ul className={`space-y-2 text-xs font-bold ${dark ? "text-slate-300" : "text-slate-800"}`}>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500" /> شراكة مع مؤسسة موهبة ومسار أسبار</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500" /> ملتقيات سنوية لفنون الخطابة (Public Speaking)</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-blue-500" /> ورش عمل في التفكير الناقد والإبداع</li>
              </ul>
            </div>
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
    </main>
  );
}
