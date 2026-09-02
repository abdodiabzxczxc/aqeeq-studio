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
        isNationalDay
          ? dark
            ? "bg-[#01140c] text-white"
            : "bg-[#f8faf9] text-slate-900"
          : dark
          ? "bg-black text-white"
          : "bg-white text-black"
      }`}
    >
      <AlaqeeqStudioSiteHeader title="الاعتمادات الدولية ومراكز الاختبارات" active="accreditations" />

      {/* Hero Section */}
      <section
        className={`relative isolate overflow-hidden border-b py-20 sm:py-28 ${
          isNationalDay
            ? dark
              ? "snd-hero-dark border-emerald-500/25 text-white"
              : "snd-hero-light border-emerald-200/80 text-slate-900"
            : dark
            ? "border-white/[0.08] bg-black text-white"
            : "border-black/[0.06] bg-white text-black"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(1,90,55,0.18),transparent_60%)]" />

        <div className="container relative mx-auto px-4 sm:px-6 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-black text-emerald-700 dark:text-emerald-300 backdrop-blur-md mb-6 animate-in fade-in">
            <Award size={14} className="text-[#f8ca14]" />
            <span>معايير عالمية في قلب المدينة المنورة</span>
          </div>

          <VisualEditable
            id="accreditations-hero-title"
            tag="text"
            label="عنوان هيرو الاعتمادات"
            defaultText="اعتمادات دولية مرموقة ومراكز اختبارات عالمية معتمدة"
            as="h1"
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.2] mb-6"
          />

          <VisualEditable
            id="accreditations-hero-desc"
            tag="text"
            label="وصف هيرو الاعتمادات"
            defaultText="الجودة في مدارس العقيق ليست مجرد شعار، بل أسلوب حياة ومنهج عمل مؤسسي. نفتخر بحصولنا على اعتماد كوجنيا الأمريكية (Cognia)، واعتماد مدارسنا كمراكز رسمية لاختبارات IELTS و SAT و ACT بالمدينة المنورة."
            as="p"
            className={`text-base sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-10 ${
              dark ? "text-slate-300" : "text-slate-600"
            }`}
          />

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/admissions")}
              className={`rounded-2xl px-8 py-6 text-base font-black shadow-xl transition active:scale-95 ${
                dark
                  ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black hover:opacity-95 shadow-[#f8ca14]/20"
                  : "bg-gradient-to-r from-[#015a37] to-emerald-700 text-white hover:opacity-95 shadow-[#015a37]/25"
              }`}
            >
              <Send size={18} className="ml-2" />
              <span>سجّل الآن في المدارس</span>
            </Button>

            <a
              href="#cognia-section"
              className={`inline-flex items-center justify-center rounded-2xl px-8 py-6 text-base font-black border transition active:scale-95 ${
                dark
                  ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                  : "border-black/10 bg-black/5 text-slate-800 hover:bg-black/10"
              }`}
            >
              <ShieldCheck size={18} className="ml-2" />
              <span>استكشف الاعتمادات</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Accreditations Grid */}
      <section id="cognia-section" className="py-20 container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Cognia Accreditation Card */}
          <div className={`rounded-[2.5rem] border p-8 sm:p-12 relative overflow-hidden transition duration-300 shadow-xl ${
            dark ? "border-emerald-500/20 bg-[#0c1218]/90" : "border-emerald-600/15 bg-white"
          }`}>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3.5 py-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={16} />
                <span>الاعتماد الأكاديمي الدولي</span>
              </div>
              <span className="text-xs font-bold text-slate-400">USA Accredited</span>
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
                <h3 className="text-2xl font-black mb-1">اعتماد كوجنيا الأمريكية (Cognia)</h3>
                <p className="text-xs text-slate-500">أكبر وأعرق هيئة اعتماد تربوي ومدرسي في العالم</p>
              </div>
            </div>

            <p className={`text-sm leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-600"}`}>
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
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <a
              href="https://www.cognia.org/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-black text-[#f8ca14] hover:underline"
            >
              <span>زيارة الموقع الرسمي لمنظمة كوجنيا العالمية</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* IELTS Official Test Centre Card */}
          <div className={`rounded-[2.5rem] border p-8 sm:p-12 relative overflow-hidden transition duration-300 shadow-xl ${
            dark ? "border-emerald-500/20 bg-[#0c1218]/90" : "border-emerald-600/15 bg-white"
          }`}>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="inline-flex items-center gap-2 rounded-xl bg-blue-500/10 px-3.5 py-1.5 text-xs font-black text-blue-600 dark:text-blue-400">
                <Globe2 size={16} />
                <span>مركز اختبارات معتمد بالمدينة المنورة</span>
              </div>
              <span className="text-xs font-bold text-slate-400">IDP Official Centre</span>
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
                <h3 className="text-2xl font-black mb-1">مركز اختبارات IELTS (الآيلتس)</h3>
                <p className="text-xs text-slate-500">بالشراكة الرسمية مع منظمة IDP التعليمية العالمية</p>
              </div>
            </div>

            <p className={`text-sm leading-relaxed mb-6 ${dark ? "text-slate-300" : "text-slate-600"}`}>
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
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <a
              href="https://ielts.idp.com/saudiarabia/test-centre/alaqeeq-holding-national-and-international-school"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-black text-blue-500 hover:underline"
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
            dark ? "border-white/10 bg-[#0c1218]" : "border-black/10 bg-white"
          }`}>
            <div className="bg-white p-3 rounded-2xl shrink-0 shadow-sm border border-black/5">
              <img
                src="https://aqeeq.edu.sa/web/image/1907-cf5d04ed/sat-logo.jpg"
                alt="شعار مركز اختبارات SAT"
                className="h-12 w-auto object-contain"
              />
            </div>
            <div>
              <h4 className="text-lg font-black mb-1">مركز معتمد لاختبارات SAT الدولية</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                مدارس العقيق مركز معتمد من College Board لتقديم اختبارات SAT الرقمية المؤهلة للقبول في كبرى الجامعات العالمية والبرامج المرموقة.
              </p>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={14} /> تجهيزات تقنية وقاعات مجهزة بالكامل
              </span>
            </div>
          </div>

          {/* ACT */}
          <div className={`rounded-[2rem] border p-6 sm:p-8 flex items-start gap-5 ${
            dark ? "border-white/10 bg-[#0c1218]" : "border-black/10 bg-white"
          }`}>
            <div className="bg-white p-3 rounded-2xl shrink-0 shadow-sm border border-black/5">
              <img
                src="https://aqeeq.edu.sa/web/image/1905-c752dcc6/act-logo.jpg"
                alt="شعار مركز اختبارات ACT"
                className="h-12 w-auto object-contain"
              />
            </div>
            <div>
              <h4 className="text-lg font-black mb-1">مركز معتمد لاختبارات ACT الأمريكية</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
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
        dark ? "border-white/10 bg-[#06080d]" : "border-black/5 bg-slate-50"
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-black text-[#f8ca14] mb-2">
              <Sparkles size={14} />
              <span>مهارات المستقبل ورؤية 2030</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black">البرامج النوعية ومسارات الإبداع</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              نصنع قادة الغد عبر مناهج نوعية وتجارب تعليمية تعزز التفكير التحليلي والابتكار
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* AI & Coding */}
            <div className={`rounded-3xl border p-8 transition duration-300 hover:-translate-y-1 ${
              dark ? "border-white/10 bg-[#0c1218]" : "border-black/10 bg-white shadow-sm"
            }`}>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-6">
                <Brain size={28} />
              </div>
              <h4 className="text-xl font-black mb-3">مسار البرمجة والذكاء الاصطناعي</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                تعليم لغات البرمجة (Python, Scratch) وأساسيات الخوارزميات وتطبيقات الذكاء الاصطناعي لكافة المراحل، لتمكين الطلاب من أدوات المستقبل.
              </p>
              <ul className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> معامل حاسوبية متطورة 1:1</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> مشاريع برمجية واقعية وحلول ذكية</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> تأهيل للمسابقات الوطنية والدولية</li>
              </ul>
            </div>

            {/* STEM & Robotics */}
            <div className={`rounded-3xl border p-8 transition duration-300 hover:-translate-y-1 ${
              dark ? "border-white/10 bg-[#0c1218]" : "border-black/10 bg-white shadow-sm"
            }`}>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/10 text-[#f8ca14] mb-6">
                <Cpu size={28} />
              </div>
              <h4 className="text-xl font-black mb-3">مناهج STEM والروبوت والابتكار</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                تطبيق منهجية التعليم المتكامل (العلوم، التقنية، الهندسة، الرياضيات) عبر أندية الروبوت وتحديات WRO العالمية وبطولة الوورد منيا.
              </p>
              <ul className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-500" /> أندية روبوت وأردوينو تفاعلية</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-500" /> المركز الخامس في مسابقة WRO العالمية</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-500" /> تجارب معملية ومشاريع تطبيقية</li>
              </ul>
            </div>

            {/* Talent & Public Speaking */}
            <div className={`rounded-3xl border p-8 transition duration-300 hover:-translate-y-1 ${
              dark ? "border-white/10 bg-[#0c1218]" : "border-black/10 bg-white shadow-sm"
            }`}>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-6">
                <Trophy size={28} />
              </div>
              <h4 className="text-xl font-black mb-3">رعاية الموهوبين وفنون الخطابة</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                برامج متخصصة لاكتشاف ورعاية الطلبة الموهوبين، وبناء الثقة في النفس من خلال مسارات الإلقاء والخطابة باللغتين العربية والإنجليزية.
              </p>
              <ul className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-300">
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
          dark ? "border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-[#01140c] to-emerald-950/40 shadow-2xl" : "border-emerald-600/15 bg-emerald-50/50 shadow-xl"
        }`}>
          <h3 className="text-2xl sm:text-4xl font-black mb-4">
            امنح ابنك تعليماً بمعايير عالمية
          </h3>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto mb-8">
            فريق القبول والتسجيل بمدارس العقيق جاهز للإجابة عن كافة استفساراتكم ومساعدتكم في اختيار المسار الأنسب لقدرات وطموحات ابنكم.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/admissions")}
              className={`rounded-2xl px-8 py-6 text-base font-black shadow-xl transition active:scale-95 ${
                dark
                  ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black hover:opacity-95 shadow-[#f8ca14]/20"
                  : "bg-gradient-to-r from-[#015a37] to-emerald-700 text-white hover:opacity-95 shadow-[#015a37]/25"
              }`}
            >
              <span>التقديم والقبول الإلكتروني</span>
              <ArrowRight size={18} className="mr-2" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/about")}
              className="rounded-2xl px-8 py-6 text-base font-black"
            >
              <span>تعرف على فروع ومرافق المدارس</span>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
