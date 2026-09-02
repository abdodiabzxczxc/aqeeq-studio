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
        dark ? "bg-[#05080c] text-white" : "bg-[#fbfaf8] text-slate-900"
      }`}
    >
      <AlaqeeqStudioSiteHeader title="عن مدارس العقيق الأهلية والدولية" active="about" />

      {/* Hero Section with Cinematic Cover Banner */}
      <section className="relative isolate overflow-hidden border-b border-black/[0.08] dark:border-white/[0.08]">
        {/* Background Cover Image with Gradient Masking */}
        <div className="absolute inset-0 z-0 select-none overflow-hidden">
          <VisualImage
            id="about-hero-cover"
            label="صورة كفر عن مدارس العقيق"
            src="/covers/cover-about.jpg"
            alt="كفر مجمعات مدارس العقيق الأهلية والدولية"
            className="h-full w-full object-cover object-center scale-105 transition duration-700 hover:scale-100"
          />
          {/* Multi-layered cinematic gradient overlays */}
          <div className={`absolute inset-0 transition-colors ${
            dark
              ? "bg-gradient-to-b from-[#02130b]/92 via-[#031d11]/88 to-[#05080c]"
              : "bg-gradient-to-b from-[#fbfaf8]/95 via-[#f5f8f5]/90 to-[#fbfaf8]"
          }`} />
          {/* Subtle Royal Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(1,90,55,0.14),transparent_65%)]" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center max-w-4xl">
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black backdrop-blur-md mb-6 animate-in fade-in shadow-sm ${
            dark
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-emerald-700/25 bg-white/90 text-[#015a37]"
          }`}>
            <Building2 size={14} className={dark ? "text-[#f8ca14]" : "text-[#c59b27]"} />
            <span>صرح العقيق التعليمي الرائد بالمدينة المنورة</span>
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
            className={`text-base sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-10 ${
              dark ? "text-slate-300" : "text-slate-700"
            }`}
          />

          <div className="flex flex-wrap items-center justify-center gap-4">
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
                  : "border-slate-300 bg-white/90 text-slate-900 hover:bg-white"
              }`}
            >
              <span>الاعتمادات الدولية ومراكز الاختبارات</span>
            </Button>
          </div>

          {/* Quick Metrics Floating Bar */}
          <div className={`mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-3xl border backdrop-blur-xl shadow-lg transition ${
            dark
              ? "border-white/10 bg-black/40 shadow-black/40"
              : "border-emerald-950/10 bg-white/85 shadow-emerald-950/5"
          }`}>
            <div className="text-center p-2">
              <span className={`block text-2xl sm:text-3xl font-black ${dark ? "text-[#f8ca14]" : "text-[#015a37]"}`}>منذ 1994</span>
              <span className={`text-xs font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>أكثر من 30 عاماً من العطاء</span>
            </div>
            <div className="text-center p-2">
              <span className={`block text-2xl sm:text-3xl font-black ${dark ? "text-[#5aba1c]" : "text-[#08467d]"}`}>مجمعين</span>
              <span className={`text-xs font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>مستقلين للبنين والبنات</span>
            </div>
            <div className="text-center p-2">
              <span className={`block text-2xl sm:text-3xl font-black ${dark ? "text-[#f8ca14]" : "text-[#c59b27]"}`}>Cognia</span>
              <span className={`text-xs font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>اعتماد الجودة الأمريكي</span>
            </div>
            <div className="text-center p-2">
              <span className={`block text-2xl sm:text-3xl font-black ${dark ? "text-[#5aba1c]" : "text-[#015a37]"}`}>KG - 12</span>
              <span className={`text-xs font-bold ${dark ? "text-slate-400" : "text-slate-600"}`}>كافة المراحل التعليمية</span>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Cards */}
      <section className="py-20 container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className={`rounded-[2.5rem] border p-8 sm:p-12 relative overflow-hidden transition shadow-xl ${
            dark ? "border-emerald-500/20 bg-[#0c1218]/90" : "border-emerald-700/20 bg-white/95"
          }`}>
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3.5 py-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 mb-6">
              <Compass size={16} />
              <span>الرؤية الاستراتيجية (Vision)</span>
            </div>
            <h3 className={`text-2xl sm:text-3xl font-black mb-4 ${dark ? "text-white" : "text-[#0a192f]"}`}>
              صرح تعليمي رائد عالمياً بتمثل القيم الإسلامية
            </h3>
            <p className={`text-sm sm:text-base leading-relaxed ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
              أن تكون مدارس العقيق الأهلية والدولية نموذجاً تعليمياً وتربوياً رائداً على مستوى المملكة والعالم الإسلامي، يُخرج قادة للمستقبل متسلحين بالعلم النافع، والأخلاق الفاضلة، والمهارات التنافسية العالمية.
            </p>
          </div>

          {/* Mission */}
          <div className={`rounded-[2.5rem] border p-8 sm:p-12 relative overflow-hidden transition shadow-xl ${
            dark ? "border-amber-500/20 bg-[#0c1218]/90" : "border-amber-600/20 bg-white/95"
          }`}>
            <div className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-black mb-6 ${
              dark ? "bg-amber-500/10 text-[#f8ca14]" : "bg-amber-500/15 text-[#c59b27]"
            }`}>
              <Target size={16} />
              <span>الرسالة التربوية (Mission)</span>
            </div>
            <h3 className={`text-2xl sm:text-3xl font-black mb-4 ${dark ? "text-white" : "text-[#0a192f]"}`}>
              تقديم تعليم متميز لأبنائنا بتطبيق معايير عالمية
            </h3>
            <p className={`text-sm sm:text-base leading-relaxed ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
              توفير بيئة تعليمية وتربوية محفزة وجاذبة، تضم نخبة من الكفاءات التعليمية المؤهلة، وتطبق أحدث المعايير الدولية والاعتمادات العالمية، لبناء شخصية متكاملة للطالب تعتز بهويتها وتسهم في نهضة وطنها.
            </p>
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

      {/* Campuses & Facilities */}
      <section className="py-20 container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400 mb-2">
            <Building2 size={14} />
            <span>الصروح والمجمعات التعليمية</span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>مجمعاتنا في المدينة المنورة</h2>
          <p className={`text-xs sm:text-sm mt-2 ${dark ? "text-slate-400" : "text-slate-700 font-medium"}`}>
            مبانٍ مدرسية نموذجية مصممة وفق أحدث المعايير الهندسية والتربوية العالمية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {campuses.map((campus, idx) => (
            <div
              key={idx}
              className={`rounded-[2.5rem] border p-8 sm:p-10 transition shadow-xl hover:shadow-2xl ${
                dark ? "border-white/10 bg-[#0c1218]" : "border-emerald-950/10 bg-white/95"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <GraduationCap size={20} />
                </div>
                <h3 className={`text-xl font-black ${dark ? "text-white" : "text-[#0a192f]"}`}>{campus.name}</h3>
              </div>

              <div className={`space-y-3 mb-6 text-xs ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
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

              <div className={`flex items-center justify-between pt-4 border-t ${dark ? "border-white/10" : "border-slate-200/70"}`}>
                <a
                  href={`tel:${campus.phone.replace(/\s+/g, "")}`}
                  className={`inline-flex items-center gap-2 text-xs font-black hover:underline ${dark ? "text-emerald-400" : "text-[#015a37]"}`}
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
        dark ? "border-white/10 bg-[#06080d]" : "border-emerald-950/10 bg-[#f5f8f5]"
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
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
        </div>
      </section>
    </main>
  );
}
