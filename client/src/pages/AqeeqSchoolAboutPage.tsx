import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";
import { useSiteTheme } from "@/lib/useSiteTheme";
import { AlaqeeqStudioSiteHeader } from "@/components/AlaqeeqStudioSiteHeader";
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
} from "lucide-react";

export default function AqeeqSchoolAboutPage() {
  const { theme } = useAqeeqStudioTheme();
  const { isNationalDay } = useSiteTheme();
  const dark = theme === "dark";
  const [, navigate] = useLocation();

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
      location: "المدينة المنورة — طريق الملك عبدالله الدائري",
      stages: "الابتدائي · المتوسط · الثانوي (أهلي ودولي)",
      facilities: "معامل حاسوب وروبوت، مسبح أولمبي، صالة رياضية مغطاة، قاعات اختبارات دولية SAT و IELTS.",
      phone: "+966 53 189 6000",
    },
    {
      name: "مجمع البنات — مدارس العقيق الأهلية والدولية",
      location: "المدينة المنورة — حي باقدو",
      stages: "رياض الأطفال والتمهيدي · الابتدائي · المتوسط · الثانوي",
      facilities: "بيئة تعليمية وتربوية رائدة، معامل ذكية، مسرح احتفالات مدرسي، ساحات وملاعب آمنة ومظللة.",
      phone: "+966 53 189 6000",
    },
  ];

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
      <AlaqeeqStudioSiteHeader title="عن مدارس العقيق الأهلية والدولية" active="about" />

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
            <Building2 size={14} className="text-[#f8ca14]" />
            <span>صرح العقيق التعليمي الرائد بالمدينة المنورة</span>
          </div>

          <VisualEditable
            id="about-hero-title"
            tag="text"
            label="عنوان هيرو عن المدارس"
            defaultText="مدارس العقيق الأهلية والدولية"
            as="h1"
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.2] mb-6"
          />

          <VisualEditable
            id="about-hero-desc"
            tag="text"
            label="وصف هيرو عن المدارس"
            defaultText="صرح تعليمي رائد للبنين والبنات في طيبة الطيبة. نهتم بتأهيل جيل متميز بأخلاق إسلامية راسخة وعلوم عصرية متقدمة، يجمع بين أصالة القيم ومعايير الاعتماد الدولي."
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
              <span>القبول والتسجيل والرسوم</span>
              <ArrowRight size={18} className="mr-2" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/accreditations")}
              className="rounded-2xl px-8 py-6 text-base font-black"
            >
              <span>الاعتمادات الدولية ومراكز الاختبارات</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Vision & Mission Cards */}
      <section className="py-20 container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className={`rounded-[2.5rem] border p-8 sm:p-12 relative overflow-hidden transition shadow-xl ${
            dark ? "border-emerald-500/20 bg-[#0c1218]/90" : "border-emerald-600/15 bg-white"
          }`}>
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3.5 py-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 mb-6">
              <Compass size={16} />
              <span>الرؤية الاستراتيجية (Vision)</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black mb-4">
              صرح تعليمي رائد عالمياً بتمثل القيم الإسلامية
            </h3>
            <p className={`text-sm sm:text-base leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>
              أن تكون مدارس العقيق الأهلية والدولية نموذجاً تعليمياً وتربوياً رائداً على مستوى المملكة والعالم الإسلامي، يُخرج قادة للمستقبل متسلحين بالعلم النافع، والأخلاق الفاضلة، والمهارات التنافسية العالمية.
            </p>
          </div>

          {/* Mission */}
          <div className={`rounded-[2.5rem] border p-8 sm:p-12 relative overflow-hidden transition shadow-xl ${
            dark ? "border-amber-500/20 bg-[#0c1218]/90" : "border-amber-500/15 bg-white"
          }`}>
            <div className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 py-1.5 text-xs font-black text-[#f8ca14] mb-6">
              <Target size={16} />
              <span>الرسالة التربوية (Mission)</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black mb-4">
              تقديم تعليم متميز لأبنائنا بتطبيق معايير عالمية
            </h3>
            <p className={`text-sm sm:text-base leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>
              توفير بيئة تعليمية وتربوية محفزة وجاذبة، تضم نخبة من الكفاءات التعليمية المؤهلة، وتطبق أحدث المعايير الدولية والاعتمادات العالمية، لبناء شخصية متكاملة للطالب تعتز بهويتها وتسهم في نهضة وطنها.
            </p>
          </div>
        </div>
      </section>

      {/* The 4 Institutional Pillars */}
      <section className={`py-20 border-y ${
        dark ? "border-white/10 bg-[#06080d]" : "border-black/5 bg-slate-50"
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-black text-[#f8ca14] mb-2">
              <Sparkles size={14} />
              <span>ركائز مسيرة العقيق</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black">ركائزنا التربوية الأربعة</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
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
                    dark ? "border-white/10 bg-[#0c1218]" : "border-black/10 bg-white shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Icon size={22} />
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                      {pillar.badge}
                    </span>
                  </div>
                  <h4 className="text-lg font-black mb-3">{pillar.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Campuses & Facilities */}
      <section className="py-20 container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400 mb-2">
            <Building2 size={14} />
            <span>الصروح والمجمعات التعليمية</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black">مجمعاتنا في المدينة المنورة</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            مبانٍ مدرسية نموذجية مصممة وفق أحدث المعايير الهندسية والتربوية العالمية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {campuses.map((campus, idx) => (
            <div
              key={idx}
              className={`rounded-[2.5rem] border p-8 sm:p-10 transition shadow-lg ${
                dark ? "border-white/10 bg-[#0c1218]" : "border-black/10 bg-white"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <GraduationCap size={20} />
                </div>
                <h3 className="text-xl font-black">{campus.name}</h3>
              </div>

              <div className="space-y-3 mb-6 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-600 shrink-0" />
                  <span className="font-bold">{campus.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-emerald-600 shrink-0" />
                  <span>المراحل: {campus.stages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-600 shrink-0" />
                  <span>المرافق: {campus.facilities}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <a
                  href={`tel:${campus.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <Phone size={14} />
                  <span>{campus.phone}</span>
                </a>

                <Button
                  size="sm"
                  onClick={() => navigate("/admissions")}
                  className={`rounded-xl text-xs font-bold ${
                    dark ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-[#015a37] hover:bg-emerald-800 text-white"
                  }`}
                >
                  تقديم طلب بالمجمع
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Careers & Contact Section */}
      <section className={`py-20 border-t ${
        dark ? "border-white/10 bg-[#06080d]" : "border-black/5 bg-slate-50"
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Careers */}
            <div className={`rounded-3xl border p-8 ${
              dark ? "border-white/10 bg-[#0c1218]" : "border-black/10 bg-white"
            }`}>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-500 mb-4">
                <Briefcase size={22} />
              </div>
              <h3 className="text-2xl font-black mb-2">انضم إلى فريق مدارس العقيق</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
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
              dark ? "border-white/10 bg-[#0c1218]" : "border-black/10 bg-white"
            }`}>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
                <Phone size={22} />
              </div>
              <h3 className="text-2xl font-black mb-2">تواصل معنا مباشرة</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                يسعدنا الرد على كافة استفساراتكم واستقبالكم في مجمعاتنا خلال أوقات الدوام الرسمي.
              </p>
              <div className="space-y-3 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-emerald-500" />
                  <span>الهاتف الموحد: <a href="tel:+966531896000" className="hover:underline">966531896000+</a></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-emerald-500" />
                  <span>البريد الرسمي: info@aqeeq.edu.sa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-emerald-500" />
                  <span>أوقات العمل: الأحد - الخميس | 7:00 ص - 2:30 م</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
