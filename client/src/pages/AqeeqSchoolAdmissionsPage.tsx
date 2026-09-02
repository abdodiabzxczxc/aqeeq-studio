import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  GraduationCap,
  Calculator,
  FileText,
  Smartphone,
  CheckCircle2,
  Send,
  Download,
  CreditCard,
  Bell,
  Volume2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Award,
  Users,
  QrCode,
  ArrowDown,
  ChevronRight,
  PhoneCall,
  Percent,
  Play,
} from "lucide-react";

type TrackType = "national" | "international";

export default function AqeeqSchoolAdmissionsPage() {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";

  const [activeTrack, setActiveTrack] = useState<TrackType>("national");
  const [formData, setFormData] = useState({
    studentName: "",
    guardianName: "",
    phone: "",
    email: "",
    gradeLevel: "primary",
    track: "national",
    gender: "boys",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.admissions.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("تم إرسال طلب القبول بنجاح! سيتواصل معكم فريق القبول والتسجيل قريباً.");
    },
    onError: (err) => {
      toast.error(err.message || "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName.trim() || !formData.guardianName.trim() || !formData.phone.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة (اسم الطالب، اسم ولي الأمر، ورقم الجوال).");
      return;
    }
    submitMutation.mutate({
      studentName: formData.studentName.trim(),
      guardianName: formData.guardianName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      gradeLevel: formData.gradeLevel,
      track: formData.track,
      gender: formData.gender,
      notes: formData.notes.trim() || undefined,
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const feesNational = [
    { grade: "مرحلة رياض الأطفال (KG1 - KG3)", fee: "14,500", term: "7,250", notes: "شامل الأنشطة اللامنهجية وتأسيس اللغة والقرآن" },
    { grade: "المرحلة الابتدائية (الصفوف 1 - 6)", fee: "16,800", term: "8,400", notes: "شامل مسار البرمجة والروبوت والأنشطة الإثرائية" },
    { grade: "المرحلة المتوسطة (الصفوف 7 - 9)", fee: "18,900", term: "9,450", notes: "شامل برامج القدرات والتحصيلي ومعامل العلوم المتطورة" },
    { grade: "المرحلة الثانوية (الصفوف 10 - 12)", fee: "21,500", term: "10,750", notes: "تأهيل متكامل لاختبارات قياس والقبول الجامعي" },
  ];

  const feesInternational = [
    { grade: "Kindergarten (KG1 - KG3)", fee: "18,500", term: "9,250", notes: "American Curriculum + Cognia Accredited Standards" },
    { grade: "Elementary School (Grades 1 - 6)", fee: "22,000", term: "11,000", notes: "STEM Curriculum + Native English Educators" },
    { grade: "Middle School (Grades 7 - 9)", fee: "25,500", term: "12,750", notes: "Advanced Placement Preparation & SAT Foundations" },
    { grade: "High School (Grades 10 - 12)", fee: "29,000", term: "14,500", notes: "College Board SAT & ACT Center + IELTS Training" },
  ];

  const activeFees = activeTrack === "national" ? feesNational : feesInternational;

  return (
    <main
      dir="rtl"
      className={`min-h-screen aq-public-shell font-[Tajawal,sans-serif] transition-colors duration-200 ${
        dark ? "bg-[#05080c] text-white" : "bg-[#fbfaf8] text-slate-900"
      }`}
    >
      <AlaqeeqStudioSiteHeader title="القبول والتسجيل والرسوم" active="admissions" />

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
                <Sparkles size={14} className={dark ? "text-[#f8ca14]" : "text-[#c59b27]"} />
                <span>بوابة القبول والتسجيل للعام الدراسي 2026 - 2027</span>
              </div>

              <VisualEditable
                id="admissions-hero-title"
                tag="text"
                label="عنوان هيرو القبول والتسجيل"
                defaultText="استثمر في مستقبل أبنائك في صرح العقيق الرائد"
                as="h1"
                className={`text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.2] mb-6 ${
                  dark ? "text-white" : "text-[#0a192f]"
                }`}
              />

              <VisualEditable
                id="admissions-hero-desc"
                tag="text"
                label="وصف هيرو القبول والتسجيل"
                defaultText="نفتح أبواب التميز لأبنائنا وبناتنا في المدينة المنورة. بيئة تعليمية عالمية معتمدة من كوجنيا، تجمع بين أصالة القيم وأحدث علوم العصر، مع أنظمة سداد مرنة وخدمات ذكية لأولياء الأمور."
                as="p"
                className={`text-base sm:text-lg font-medium leading-relaxed max-w-2xl mb-8 ${
                  dark ? "text-slate-300" : "text-slate-700"
                }`}
              />

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Button
                  onClick={() => scrollToSection("admission-form-section")}
                  className={`rounded-2xl px-8 py-6 text-base font-black shadow-xl transition active:scale-95 ${
                    dark
                      ? "bg-gradient-to-r from-[#f8ca14] to-amber-500 text-black hover:opacity-95 shadow-[#f8ca14]/20"
                      : "bg-gradient-to-r from-[#015a37] to-[#027a4b] text-white hover:opacity-95 shadow-[#015a37]/25"
                  }`}
                >
                  <Send size={18} className="ml-2" />
                  <span>قدّم طلب تسجيل إلكتروني</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => scrollToSection("tuition-fees-section")}
                  className={`rounded-2xl px-8 py-6 text-base font-black border transition active:scale-95 shadow-sm ${
                    dark
                      ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                      : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Calculator size={18} className="ml-2" />
                  <span>جدول الرسوم الدراسية</span>
                </Button>
              </div>

              {/* Quick Metrics Bar */}
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-sm ${
                dark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-emerald-950/10 bg-white/80"
              }`}>
                <div>
                  <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#f8ca14]" : "text-[#015a37]"}`}>+10,000</span>
                  <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>ولي أمر يثقون بنا</span>
                </div>
                <div>
                  <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#5aba1c]" : "text-[#08467d]"}`}>Cognia</span>
                  <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>اعتماد أمريكي</span>
                </div>
                <div>
                  <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>IELTS & SAT</span>
                  <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>مراكز رسمية</span>
                </div>
                <div>
                  <span className={`block text-xl sm:text-2xl font-black ${dark ? "text-[#5aba1c]" : "text-[#015a37]"}`}>100%</span>
                  <span className={`text-[11px] font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>خدمات ذكية</span>
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
                {/* Close-Up Student Photo */}
                <div className="relative overflow-hidden rounded-[2rem] aspect-[4/3] sm:aspect-[16/12]">
                  <VisualImage
                    id="admissions-hero-student-photo"
                    label="صورة طلاب العقيق المقربة في المعامل"
                    src="/covers/student-lab-admissions.jpg"
                    alt="طلاب مدارس العقيق في المعامل الذكية"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  {/* Subtle Gradient Shade at Bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-2 rounded-full bg-black/80 border border-white/20 px-3.5 py-1.5 text-xs font-black text-white shadow-lg backdrop-blur-md">
                    <Sparkles size={13} className="text-[#f8ca14]" />
                    <span>مقاعد محدودة 2026 - 2027</span>
                  </div>

                  {/* Bottom Overlaid Details */}
                  <div className="absolute bottom-3.5 right-3.5 left-3.5 flex items-center justify-between text-white">
                    <div>
                      <h4 className="text-sm font-black drop-shadow-md">معامل الذكاء الاصطناعي وSTEM</h4>
                      <p className="text-[11px] text-emerald-300 drop-shadow-md">بيئة تفاعلية حديثة ترعى الموهبة</p>
                    </div>
                    <span className="rounded-xl bg-emerald-600/90 px-2.5 py-1 text-[10px] font-black backdrop-blur-md shadow">
                      بنين وبنات
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
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black">خصومات الأخوة والسداد المبكر</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">خصم 10% إلى 15% مع خيارات تقسيط ميسرة</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Tuition Fees Section */}
      <section id="tuition-fees-section" className="py-20 container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"} mb-2`}>
            <Calculator size={14} />
            <span>الشفافية والمرونة المالية</span>
          </div>
          <VisualEditable
            id="tuition-fees-title"
            tag="text"
            label="عنوان جدول الرسوم"
            defaultText="جدول الرسوم الدراسية للعام الدراسي"
            as="h2"
            className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}
          />
          <p className={`mt-3 text-sm sm:text-base ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
            رسوم تنافسية تشمل أحدث المناهج المتطورة، والأنشطة الصفية واللاصفية، ومعامل الذكاء الاصطناعي وSTEM.
          </p>

          {/* Track Switcher Tabs */}
          <div className="mt-8 inline-flex items-center rounded-2xl border p-1.5 backdrop-blur-md border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-sm">
            <button
              onClick={() => setActiveTrack("national")}
              className={`rounded-xl px-6 py-2.5 text-sm font-black transition ${
                activeTrack === "national"
                  ? dark
                    ? "bg-[#015a37] text-white shadow-md shadow-emerald-950/40"
                    : "bg-[#015a37] text-white shadow-md shadow-emerald-800/30"
                  : dark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-700 hover:text-black"
              }`}
            >
              🇸🇦 المدارس الأهلية (بنين وبنات)
            </button>
            <button
              onClick={() => setActiveTrack("international")}
              className={`rounded-xl px-6 py-2.5 text-sm font-black transition ${
                activeTrack === "international"
                  ? dark
                    ? "bg-[#015a37] text-white shadow-md shadow-emerald-950/40"
                    : "bg-[#015a37] text-white shadow-md shadow-emerald-800/30"
                  : dark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-700 hover:text-black"
              }`}
            >
              🌐 المدارس الدولية (International)
            </button>
          </div>
        </div>

        {/* Fees Table Card */}
        <div className={`overflow-hidden rounded-[2rem] border shadow-2xl backdrop-blur-xl ${
          dark ? "border-white/10 bg-[#0c1218]/90" : "border-emerald-950/10 bg-white/95"
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className={`border-b text-xs sm:text-sm font-black ${
                  dark ? "border-white/10 bg-white/5 text-[#f8ca14]" : "border-emerald-600/20 bg-[#015a37]/5 text-[#015a37]"
                }`}>
                  <th className="p-4 sm:p-6">المرحلة الدراسية</th>
                  <th className="p-4 sm:p-6">الرسوم السنوية (ر.س)</th>
                  <th className="p-4 sm:p-6">القسط الفصلي (ر.س)</th>
                  <th className="p-4 sm:p-6">المزايا والمخرجات</th>
                  <th className="p-4 sm:p-6 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 text-xs sm:text-sm">
                {activeFees.map((row, idx) => (
                  <tr key={idx} className={`transition hover:bg-emerald-500/5 ${
                    idx % 2 === 0 ? (dark ? "bg-white/[0.01]" : "bg-slate-50/70") : ""
                  }`}>
                    <td className="p-4 sm:p-6 font-black text-sm sm:text-base">
                      {row.grade}
                    </td>
                    <td className="p-4 sm:p-6 font-black text-base sm:text-lg text-emerald-700 dark:text-emerald-400">
                      {row.fee} <span className="text-xs font-normal">ر.س</span>
                    </td>
                    <td className="p-4 sm:p-6 font-bold text-slate-600 dark:text-slate-400">
                      {row.term} <span className="text-xs font-normal">ر.س</span>
                    </td>
                    <td className="p-4 sm:p-6 text-slate-700 dark:text-slate-300">
                      {row.notes}
                    </td>
                    <td className="p-4 sm:p-6 text-center">
                      <Button
                        size="sm"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            track: activeTrack,
                            gradeLevel: idx === 0 ? "kindergarten" : idx === 1 ? "primary" : idx === 2 ? "middle" : "high",
                          }));
                          scrollToSection("admission-form-section");
                        }}
                        className={`rounded-xl text-xs font-bold ${
                          dark ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-[#015a37] hover:bg-emerald-800 text-white"
                        }`}
                      >
                        سجّل بهذه المرحلة
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Discounts & Financial Facilities Banner */}
          <div className={`p-6 sm:p-8 border-t flex flex-wrap items-center justify-between gap-4 ${
            dark ? "border-white/10 bg-emerald-950/20" : "border-emerald-200/70 bg-[#f0f7f3]"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${dark ? "bg-emerald-500/10 text-[#f8ca14]" : "bg-emerald-600/10 text-[#c59b27]"}`}>
                <Percent size={24} />
              </div>
              <div>
                <h4 className="font-black text-sm sm:text-base text-emerald-900 dark:text-emerald-300">
                  خصومات الإخوة والسداد المبكر
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-400 mt-1">
                  خصم 10% للابن الثاني، و 15% للابن الثالث فأكثر. بالإضافة إلى خصم إضافي عند سداد الرسوم كاملة قبل بداية العام.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-700 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-400">إمكانية التقسيط الميسر عبر تابي وتمارا والبطاقات الائتمانية</span>
            </div>
          </div>
        </div>
      </section>

      {/* Admission Steps & Requirements */}
      <section className={`py-16 border-y ${
        dark ? "border-white/10 bg-[#06080d]" : "border-emerald-950/10 bg-[#f5f8f5]"
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className={`text-2xl sm:text-3xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>خطوات ومستندات القبول</h3>
            <p className={`text-xs sm:text-sm mt-2 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>عملية قبول سلسة وواضحة تضمن أفضل توجيه أكاديمي وتربوي لابنك</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                icon: FileText,
                title: "تقديم الطلب الإلكتروني",
                desc: "تعبئة بيانات الطالب وولي الأمر في النموذج أدناه في أقل من دقيقتين.",
              },
              {
                step: "02",
                icon: Users,
                title: "المقابلة وتحديد المستوى",
                desc: "جلسة ودية هادفة مع المرشد الأكاديمي والتربوي لتحديد مستوى الطالب واحتياجاته.",
              },
              {
                step: "03",
                icon: CheckCircle2,
                title: "استكمال الوثائق الرسمية",
                desc: "رفع شهادة الميلاد، كارت التطعيمات، الهوية/الإقامة، وآخر شهادة دراسية في منصة نور.",
              },
              {
                step: "04",
                icon: Award,
                title: "اعتماد القبول وتفعيل التطبيق",
                desc: "إصدار الرقم الأكاديمي وتفعيل حساب ولي الأمر في تطبيق مدارس العقيق للبدء فوراً.",
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className={`relative rounded-3xl border p-6 transition duration-300 hover:-translate-y-1 ${
                    dark ? "border-white/10 bg-[#0c1218]" : "border-emerald-950/10 bg-white shadow-md hover:shadow-lg"
                  }`}
                >
                  <span className="text-3xl font-black text-emerald-500/20 absolute top-4 left-5">
                    {card.step}
                  </span>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                    <Icon size={22} />
                  </div>
                  <h4 className={`font-black text-base mb-2 ${dark ? "text-white" : "text-[#0a192f]"}`}>{card.title}</h4>
                  <p className={`text-xs leading-relaxed ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Admission Online Form Section */}
      <section id="admission-form-section" className="py-20 container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-[2.5rem] border p-8 sm:p-12 shadow-2xl backdrop-blur-xl ${
            dark ? "border-emerald-500/20 bg-[#0c1218]/90" : "border-emerald-700/20 bg-white/95"
          }`}>
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className={`inline-flex items-center gap-2 text-xs font-black ${dark ? "text-[#f8ca14]" : "text-[#015a37]"} mb-2`}>
                <Send size={14} />
                <span>التسجيل الإلكتروني السريع</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>نموذج حجز مقعد دراسي</h2>
              <p className={`text-xs sm:text-sm mt-2 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
                املأ النموذج وسيتصل بك أحد مسؤولي القبول خلال 24 ساعة للرد على استفساراتكم وتأكيد المقابلة.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-12">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 mx-auto mb-4 border border-emerald-500/30 animate-in zoom-in">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
                  تم استلام طلبكم بنجاح!
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  شكراً لثقتكم بمدارس العقيق. تم حفظ طلبكم في نظام القبول والتسجيل، وسيقوم ممثلنا بالتواصل معكم عبر الهاتف أو الواتساب.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        studentName: "",
                        guardianName: "",
                        phone: "",
                        email: "",
                        gradeLevel: "primary",
                        track: "national",
                        gender: "boys",
                        notes: "",
                      });
                    }}
                    variant="outline"
                    className="rounded-xl text-xs font-bold"
                  >
                    تسجيل طالب آخر
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black mb-2">اسم الطالب / الطالبة الثلاثي *</label>
                    <Input
                      required
                      placeholder="مثال: محمد عبدالله الشريف"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      className="rounded-xl h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black mb-2">اسم ولي الأمر *</label>
                    <Input
                      required
                      placeholder="مثال: عبدالله محمد الشريف"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="rounded-xl h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-black mb-2">رقم جوال ولي الأمر (واتساب) *</label>
                    <Input
                      required
                      type="tel"
                      placeholder="05XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl h-12 text-left"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black mb-2">البريد الإلكتروني (اختياري)</label>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl h-12 text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-black mb-2">المرحلة الدراسية *</label>
                    <select
                      value={formData.gradeLevel}
                      onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                      className={`w-full h-12 rounded-xl border px-3 text-xs font-bold outline-none ${
                        dark ? "border-white/10 bg-[#090e14] text-white" : "border-black/10 bg-slate-50 text-slate-800"
                      }`}
                    >
                      <option value="kindergarten">مرحلة رياض الأطفال (KG)</option>
                      <option value="primary">المرحلة الابتدائية (1 - 6)</option>
                      <option value="middle">المرحلة المتوسطة (7 - 9)</option>
                      <option value="high">المرحلة الثانوية (10 - 12)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black mb-2">المسار التعليمي *</label>
                    <select
                      value={formData.track}
                      onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                      className={`w-full h-12 rounded-xl border px-3 text-xs font-bold outline-none ${
                        dark ? "border-white/10 bg-[#090e14] text-white" : "border-black/10 bg-slate-50 text-slate-800"
                      }`}
                    >
                      <option value="national">المدارس الأهلية</option>
                      <option value="international">المدارس الدولية (International)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black mb-2">الفرع / المجمع *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className={`w-full h-12 rounded-xl border px-3 text-xs font-bold outline-none ${
                        dark ? "border-white/10 bg-[#090e14] text-white" : "border-black/10 bg-slate-50 text-slate-800"
                      }`}
                    >
                      <option value="boys">مجمع البنين</option>
                      <option value="girls">مجمع البنات</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black mb-2">أي ملاحظات أو استفسارات إضافية</label>
                  <textarea
                    rows={3}
                    placeholder="اكتب هنا أي تفاصيل تود إضافتها (مثل درجات الطالب السابقة أو تطلعاتكم)..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={`w-full rounded-xl border p-3 text-xs outline-none ${
                      dark ? "border-white/10 bg-[#090e14] text-white" : "border-black/10 bg-slate-50 text-slate-800"
                    }`}
                  />
                </div>

                <div className="text-center pt-3">
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className={`w-full sm:w-auto min-w-[240px] rounded-xl h-12 text-sm font-black shadow-lg transition active:scale-95 ${
                      dark
                        ? "bg-gradient-to-r from-emerald-600 to-[#005A36] text-white hover:opacity-90 shadow-emerald-950/40"
                        : "bg-gradient-to-r from-[#015a37] to-emerald-700 text-white hover:opacity-90 shadow-emerald-900/30"
                    }`}
                  >
                    {submitMutation.isPending ? "جارِ إرسال الطلب..." : "تأكيد وإرسال طلب التسجيل ✦"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Parents Mobile App Section */}
      <section className={`py-20 border-t ${
        dark ? "border-white/10 bg-gradient-to-b from-[#0c1218] to-[#06080d]" : "border-emerald-950/10 bg-gradient-to-b from-[#f5f8f5] to-[#fbfaf8]"
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className={`rounded-[3rem] border p-8 sm:p-14 overflow-hidden relative ${
            dark ? "border-emerald-500/20 bg-black/60 shadow-2xl" : "border-emerald-700/20 bg-white/95 shadow-2xl"
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black mb-4 shadow-sm ${
                  dark ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-emerald-700/25 bg-emerald-50 text-[#015a37]"
                }`}>
                  <Smartphone size={14} />
                  <span>تطبيق أولياء الأمور الرسمي</span>
                </div>

                <h3 className={`text-2xl sm:text-4xl font-black tracking-tight leading-snug mb-4 ${dark ? "text-white" : "text-[#0a192f]"}`}>
                  كل ما يخص ابنك الدراسي والمالي في جيبك 📱
                </h3>

                <p className={`text-sm sm:text-base leading-relaxed mb-8 ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                  طوّرت مدارس العقيق تطبيقاً متكاملاً للهواتف الذكية يمنح أولياء الأمور راحة بال مطلقة، وتجربة سلسة لإدارة شؤون أبنائهم في ثوانٍ معدودة.
                </p>

                {/* Features List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: CreditCard, title: "سداد الرسوم فوري وآمن", desc: "الدفع بمدى وفيزا وماستركارد وتلقي الإيصالات مباشرة." },
                    { icon: Volume2, title: "خاصية النداء الآلي للطلاب", desc: "طلب خروج ابنك من الفصل لحظة وصولك لبوابة المدرسة." },
                    { icon: FileText, title: "مراجعة الفواتير والتقارير", desc: "كشف حساب مالي وأكاديمي شامل لكل ابن في أي وقت." },
                    { icon: Bell, title: "إشعارات وأخبار حية", desc: "تنبيهات فورية بالواجبات، الغياب، والأنشطة المدرسية." },
                  ].map((feat, idx) => {
                    const Icon = feat.icon;
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Icon size={18} />
                        </div>
                        <div>
                          <h5 className={`text-xs font-black ${dark ? "text-white" : "text-slate-900"}`}>{feat.title}</h5>
                          <p className={`text-[11px] mt-0.5 ${dark ? "text-slate-400" : "text-slate-600 font-medium"}`}>{feat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Download CTA & Video Guide */}
                <div className="flex flex-wrap items-center gap-3.5">
                  <a
                    href="https://qr-codes.io/LQMip0"
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-black shadow-lg transition active:scale-95 ${
                      dark ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-[#015a37] hover:bg-emerald-800 text-white"
                    }`}
                  >
                    <Download size={16} />
                    <span>تحميل تطبيق أولياء الأمور</span>
                  </a>

                  <a
                    href="https://www.youtube.com/watch?v=_h3K-q8cDUc"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3.5 text-xs font-black text-red-500 hover:bg-red-500/20 transition"
                  >
                    <Play size={15} />
                    <span>فيديو شرح استخدام التطبيق والدفع 🎬</span>
                  </a>

                  <a
                    href="https://portal.aqeeq.app/pages/daily_plans/parent_lookup.php"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3.5 text-xs font-black text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition"
                  >
                    <FileText size={15} />
                    <span>الخطط والواجبات الأسبوعية 📝</span>
                  </a>

                  <a
                    href="tel:+966531896000"
                    className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-xs font-bold transition ${
                      dark ? "border-white/10 text-slate-400 hover:text-white" : "border-slate-300 bg-white/80 text-slate-700 hover:text-slate-900 shadow-sm"
                    }`}
                  >
                    <PhoneCall size={15} />
                    <span>الدعم الفني للتطبيق: 966531896000+</span>
                  </a>
                </div>
              </div>

              {/* QR Code & Mockup Card */}
              <div className="lg:col-span-5 text-center">
                <div className={`inline-block p-6 sm:p-8 rounded-[2rem] border shadow-2xl backdrop-blur-xl ${
                  dark ? "border-white/15 bg-black/80" : "border-emerald-950/10 bg-slate-50/90 shadow-xl"
                }`}>
                  <div className="bg-white p-4 rounded-2xl inline-block shadow-md">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://qr-codes.io/LQMip0"
                      alt="رمز الاستجابة السريعة لتحميل تطبيق مدارس العقيق"
                      className="h-36 w-36 sm:h-44 sm:w-44 object-contain"
                    />
                  </div>
                  <h4 className={`font-black text-sm mt-4 ${dark ? "text-white" : "text-slate-900"}`}>امسح الكود بكاميرا الجوال</h4>
                  <p className={`text-xs mt-1 ${dark ? "text-slate-400" : "text-slate-600 font-bold"}`}>متاح مجاناً على App Store و Google Play</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
