import { ArrowLeft, ArrowRight, BookOpen, Compass, HeartHandshake, Sparkles, Trophy, Users } from "lucide-react";
import { useLocation } from "wouter";
import { AlaqeeqPublicHeader } from "@/components/AlaqeeqPublicHeader";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";

const HERO_IMAGES = {
  about: "/manus-storage/alaqeeq-learning-atelier_1911edfa.jpg",
  life: "/manus-storage/alaqeeq-stage-life_81a480e4.jpg",
} as const;

const content = {
  about: {
    eyebrow: "ABOUT AL-AQEEQ",
    header: "عن مدارس العقيق",
    label: "فصل ٠١ · من نحن",
    title: "مدرسة تمنح الطالب مساحةً ليصبح نفسه.",
    body: "نؤمن أن المعرفة لا تعيش في الكتاب وحده؛ بل تنمو في السؤال، التجربة، الصداقة، والمشهد الذي يقف فيه الطالب ليقول: هذا أثري.",
    imageLabel: "صورة فصل من نحن",
    chapter: "رسالتنا",
    chapterTitle: "نصنع بيئة يتقدم فيها التعلم والإنسان معاً.",
    chapterBody: "كل مساحة في العقيق دعوة للاكتشاف. نحتفل بالتفوق، نرعى الفضول، ونمنح المواهب فرصة أن تُرى وتكبر.",
    cards: [["المعرفة", "تعلمٌ يفتح الأسئلة قبل أن يقدّم الإجابات.", BookOpen], ["المجتمع", "علاقات آمنة تجعل الطالب جزءاً من حكاية أكبر.", HeartHandshake], ["الأثر", "إنجازات صغيرة تتراكم لتصنع شخصية واثقة.", Trophy]],
  },
  life: {
    eyebrow: "SCHOOL LIFE",
    header: "الحياة في العقيق",
    label: "فصل ٠٢ · ما نعيشه",
    title: "هنا تتحول الأيام العادية إلى لحظاتٍ تستحق أن تُروى.",
    body: "من المسرح إلى المختبر، ومن المشاريع إلى المجلة، يصنع طلاب العقيق موسماً نابضاً بالتجربة والفضول والفرح.",
    imageLabel: "صورة فصل الحياة المدرسية",
    chapter: "منصة لكل موهبة",
    chapterTitle: "ليست الأنشطة هامشاً؛ إنها مكان آخر للتعلّم.",
    chapterBody: "نصمم لحظات يتقدم فيها الطلاب، يجرّبون، يقودون فرقهم، ثم يحفظون ما صنعوه داخل ذاكرة العقيق.",
    cards: [["الفعاليات", "عروض وتجارب تخرج كاملاً من الفكرة إلى الذكرى.", Sparkles], ["القيادة", "فرص حقيقية للطلاب ليبدأوا ويقودوا ويؤثروا.", Users], ["الاكتشاف", "مسارات للمواهب والعلوم والفنون والمشاريع.", Compass]],
  },
} as const;

export default function SchoolStoryPage({ mode }: { mode: "about" | "life" }) {
  const [, navigate] = useLocation();
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const page = content[mode];
  const prefix = `school-${mode}`;

  return (
    <main className={`aq-public-shell min-h-screen ${dark ? "bg-[#05070c] text-white" : "bg-[#f8fafc] text-slate-900"}`} dir="rtl">
      <AlaqeeqPublicHeader eyebrow={page.eyebrow} title={page.header}>
        <button onClick={() => navigate("/")} className="aq-action aq-action-dark !px-3 !py-2">
          <span className="hidden sm:inline">الصفحة الرئيسية</span>
          <ArrowLeft size={15} />
        </button>
      </AlaqeeqPublicHeader>
      
      <VisualEditable id={`${prefix}-hero-shell`} tag="section" label="المشهد الافتتاحي للصفحة المدرسية" as="section" className={`relative overflow-hidden border-b ${dark ? "border-white/[.08]" : "border-slate-200"}`}>
        <div className="absolute inset-0">
          <VisualImage id={`${prefix}-hero-image`} label={page.imageLabel} src={HERO_IMAGES[mode]} alt={page.header} className="h-full w-full object-cover opacity-50" />
          <div className={`absolute inset-0 ${
            dark
              ? (mode === "life" ? "bg-[linear-gradient(90deg,rgba(7,9,13,.96),rgba(7,9,13,.24),rgba(7,9,13,.84))]" : "bg-[linear-gradient(90deg,rgba(7,9,13,.94),rgba(7,9,13,.34),rgba(7,9,13,.88))]")
              : (mode === "life" ? "bg-[linear-gradient(90deg,rgba(255,255,255,.95),rgba(255,255,255,.4),rgba(255,255,255,.92))]" : "bg-[linear-gradient(90deg,rgba(255,255,255,.94),rgba(255,255,255,.45),rgba(255,255,255,.9))]")
          }`} />
        </div>
        <div className="relative mx-auto grid min-h-[570px] max-w-[1440px] items-end gap-8 px-6 pb-16 pt-24 md:grid-cols-[1.2fr_.8fr] md:px-14 md:pb-24">
          <div className="max-w-4xl">
            <VisualEditable id={`${prefix}-label`} tag="text" label="شارة الفصل" defaultText={page.label} as="div" className="aq-chapter-label" />
            <VisualEditable id={`${prefix}-title`} tag="text" label="عنوان الصفحة" defaultText={page.title} as="h1" className={`mt-6 text-5xl font-black leading-[1.05] md:text-8xl ${dark ? "text-white" : "text-slate-900"}`} />
            <VisualEditable id={`${prefix}-body`} tag="text" label="وصف الصفحة" defaultText={page.body} as="p" className={`mt-7 max-w-2xl text-base leading-8 md:text-xl md:leading-9 ${dark ? "text-slate-200" : "text-slate-600 font-medium"}`} />
          </div>
        </div>
      </VisualEditable>

      <VisualEditable id={`${prefix}-chapter-shell`} tag="section" label="فصل الرسالة والمبادئ" as="section" className="relative overflow-hidden bg-[#ebe5d6] px-6 py-24 text-[#17150f] md:px-14 md:py-36">
        <div className="pointer-events-none absolute left-0 top-6 text-[22vw] font-black leading-none text-[#b78b32]/10">العقيق</div>
        <div className="relative mx-auto grid max-w-[1180px] gap-12 md:grid-cols-[.75fr_1.25fr] md:items-end">
          <div>
            <VisualEditable id={`${prefix}-chapter-label`} tag="text" label="شارة فصل الرسالة" defaultText={page.chapter} as="div" className="text-xs font-black tracking-[.18em] text-[#8a6815]" />
            <div className="mt-8 h-px w-20 bg-[#b78b32]" />
          </div>
          <div>
            <VisualEditable id={`${prefix}-chapter-title`} tag="text" label="عنوان فصل الرسالة" defaultText={page.chapterTitle} as="h2" className="text-4xl font-black leading-[1.22] md:text-6xl" />
            <VisualEditable id={`${prefix}-chapter-body`} tag="text" label="وصف فصل الرسالة" defaultText={page.chapterBody} as="p" className="mt-7 max-w-2xl text-base leading-8 text-[#554f40] md:text-lg" />
          </div>
        </div>
      </VisualEditable>

      <VisualEditable id={`${prefix}-cards-shell`} tag="section" label="بطاقات المدرسة" as="section" className={`${dark ? "bg-[#0b0e15]" : "bg-[#f8fafc] border-t border-slate-200"} px-6 py-24 md:px-14 md:py-32`}>
        <div className="mx-auto max-w-[1180px]">
          {mode === "life" ? (
            <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-stretch">
              <div className={`relative min-h-[370px] overflow-hidden rounded-[2rem] border ${dark ? "border-amber-300/20" : "border-slate-200 shadow-xl"}`}>
                <VisualImage id="school-life-stage-image" label="صورة مشهد الأنشطة" src={HERO_IMAGES.life} alt="مشهد من الحياة المدرسية" className="absolute inset-0 h-full w-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,9,13,.88),transparent_65%)]" />
                <div className="absolute inset-x-7 bottom-7">
                  <div className="aq-chapter-label">في كل يوم مشهد جديد</div>
                  <p className="mt-3 max-w-sm text-lg font-black leading-8 text-white">نصنع لحظات يعرف فيها الطالب صوته، وفريقه، وما يستطيع أن يقدمه.</p>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="aq-chapter-label">ثلاثة أبواب للتجربة</div>
                <div className="mt-6 space-y-3">
                  {page.cards.map(([title, body, Icon], index) => (
                    <article key={title} className="aq-editorial-panel group flex gap-5 rounded-2xl p-5 transition hover:-translate-x-1 hover:border-amber-300/35">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${dark ? "border-amber-300/25 bg-amber-300/[.07] text-amber-300" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"}`}>
                        <Icon size={19} />
                      </div>
                      <div>
                        <VisualEditable id={`${prefix}-card-${index + 1}-title`} tag="text" label={`عنوان البطاقة ${index + 1}`} defaultText={title} as="h3" className={`text-lg font-black ${dark ? "text-white" : "text-slate-900"}`} />
                        <VisualEditable id={`${prefix}-card-${index + 1}-body`} tag="text" label={`وصف البطاقة ${index + 1}`} defaultText={body} as="p" className={`mt-1 text-sm leading-6 ${dark ? "text-slate-400" : "text-slate-600"}`} />
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="aq-chapter-label">ثلاثة أبعاد تصنع الفرق</div>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {page.cards.map(([title, body, Icon], index) => (
                  <article key={title} className="aq-editorial-panel group relative overflow-hidden rounded-[1.8rem] p-7 transition duration-300 hover:-translate-y-2 hover:border-amber-300/35">
                    <div className={`absolute left-5 top-3 text-7xl font-black ${dark ? "text-white/[.035]" : "text-black/[.05]"}`}>0{index + 1}</div>
                    <Icon className={`relative ${dark ? "text-amber-300" : "text-[#08467d]"}`} size={24} />
                    <VisualEditable id={`${prefix}-card-${index + 1}-title`} tag="text" label={`عنوان البطاقة ${index + 1}`} defaultText={title} as="h3" className={`relative mt-16 text-2xl font-black ${dark ? "text-white" : "text-slate-900"}`} />
                    <VisualEditable id={`${prefix}-card-${index + 1}-body`} tag="text" label={`وصف البطاقة ${index + 1}`} defaultText={body} as="p" className={`relative mt-4 text-sm leading-7 ${dark ? "text-slate-400" : "text-slate-600"}`} />
                  </article>
                ))}
              </div>
            </>
          )}
          <button onClick={() => navigate(mode === "about" ? "/life" : "/maison")} className="aq-action aq-action-gold mt-12">
            {mode === "about" ? "اكتشف الحياة المدرسية" : "استكشف مواسم العقيق"}
            <ArrowLeft size={16} />
          </button>
        </div>
      </VisualEditable>
      <footer className={`border-t px-6 py-9 text-center text-xs ${dark ? "border-white/[.08] text-slate-500 bg-[#05070c]" : "border-slate-200 text-slate-600 bg-white"}`}>
        مدارس العقيق · رحلة تعليمية تُروى كل يوم
      </footer>
    </main>
  );
}
