import { trpc } from "@/lib/trpc";
import { VisualEditable, VisualImage } from "@/components/VisualEditor";
import { ArrowRight, CalendarDays, ImageIcon, Loader2, Sparkles, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useAqeeqStudioTheme } from "@/lib/aqeeqStudioTheme";

export default function EventMemoryPage({ id }: { id: string }) {
  const [, navigate] = useLocation();
  const { theme } = useAqeeqStudioTheme();
  const dark = theme === "dark";
  const { data: event, isLoading } = trpc.ceremonies.public.useQuery({ id: Number(id) });

  if (isLoading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${dark ? "bg-[#080a10]" : "bg-[#f8fafc]"}`}>
        <Loader2 className={`animate-spin ${dark ? "text-amber-300" : "text-[#08467d]"}`} size={28} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${dark ? "bg-[#080a10] text-slate-400" : "bg-[#f8fafc] text-slate-600"}`}>
        الفعالية غير متاحة.
      </div>
    );
  }

  const cards = [
    { id: "moments", icon: ImageIcon, title: "لحظات معتمدة", body: "أضف الصور والمواد المختارة إلى غلاف الذكرى من استوديو الفعالية." },
    { id: "story", icon: Sparkles, title: "قصة النشاط", body: "تظل جملة العالم ومشاهد الفعالية جزءاً من قصتها في الأرشيف." },
    { id: "impact", icon: Star, title: "أثر الموسم", body: "كل نشاط ناجح يضيف صفحة إلى ذاكرة مدارس العقيق السنوية." }
  ];

  return (
    <VisualEditable id="memory-page" tag="section" label="صفحة بوابة الذكريات" as="section" className="block">
      <main dir="rtl" className={`min-h-screen transition-colors ${dark ? "bg-[#080a10] text-slate-100" : "bg-[#f8fafc] text-slate-900"}`}>
        <VisualEditable id="memory-container" tag="section" label="حاوية بوابة الذكريات" as="div" className="container py-7">
          <VisualEditable
            id="memory-back-action"
            tag="button"
            label="زر العودة إلى الفعالية"
            as="button"
            onAction={() => navigate(`/event/${id}`)}
            className={`inline-flex items-center gap-2 text-xs font-bold transition ${
              dark ? "text-slate-400 hover:text-amber-200" : "text-slate-600 hover:text-[#08467d]"
            }`}
          >
            <ArrowRight size={16} />
            العودة إلى بوابة الفعالية
          </VisualEditable>

          <VisualEditable
            id="memory-hero"
            tag="section"
            label="غلاف بوابة الذكريات"
            as="section"
            className={`mt-6 overflow-hidden rounded-[2rem] border shadow-xl ${
              dark ? "border-amber-300/20 bg-[#111521]" : "border-slate-200 bg-white"
            }`}
          >
            <VisualEditable id="memory-hero-content" tag="section" label="محتوى غلاف الذكريات" as="div" className="relative min-h-[360px] overflow-hidden p-7 md:min-h-[520px] md:p-12">
              {event.memoryCoverUrl ? (
                <VisualImage
                  id="memory-cover-image"
                  label="صورة غلاف الذكريات"
                  src={event.memoryCoverUrl}
                  alt="غلاف ذكريات الفعالية"
                  className={`absolute inset-0 h-full w-full object-cover ${dark ? "opacity-35" : "opacity-25"}`}
                />
              ) : null}
              <VisualEditable
                id="memory-cover-overlay"
                tag="section"
                label="تدرج غلاف الذكريات"
                as="div"
                className={`absolute inset-0 ${
                  dark
                    ? "bg-gradient-to-t from-[#080a10] via-[#080a10]/58 to-transparent"
                    : "bg-gradient-to-t from-white via-white/70 to-transparent"
                }`}
              />
              <div className="relative flex min-h-[300px] flex-col justify-end md:min-h-[430px]">
                <VisualEditable
                  id="memory-kicker"
                  tag="text"
                  label="شارة بوابة الذكريات"
                  as="div"
                  defaultText="استوديو الذكرى"
                  className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black ${
                    dark ? "border-amber-300/30 bg-amber-300/[.08] text-amber-200" : "border-[#08467d]/20 bg-[#08467d]/10 text-[#08467d]"
                  }`}
                >
                  {(text) => <><Star size={14} />{text}</>}
                </VisualEditable>
                <VisualEditable
                  id="memory-title"
                  tag="text"
                  label="عنوان بوابة الذكريات"
                  as="h1"
                  defaultText={event.title}
                  className={`mt-5 max-w-3xl text-4xl font-black leading-tight md:text-7xl ${dark ? "text-amber-50" : "text-slate-900"}`}
                />
                <VisualEditable
                  id="memory-story"
                  tag="text"
                  label="قصة بوابة الذكريات"
                  as="p"
                  defaultText={event.storyLine || "هذه الصفحة تحفظ اللحظات المعتمدة من الفعالية وتمنحها مكاناً دائماً في ذاكرة موسم العقيق."}
                  className={`mt-4 max-w-2xl text-sm leading-8 ${dark ? "text-slate-300" : "text-slate-600"}`}
                />
                <VisualEditable id="memory-meta" tag="section" label="بيانات موسم الذكريات" as="div" className="mt-6 flex flex-wrap gap-3 text-xs">
                  {event.ceremonyDate ? (
                    <VisualEditable
                      id="memory-date"
                      tag="text"
                      label="تاريخ الذكريات"
                      as="span"
                      defaultText={event.ceremonyDate}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 ${
                        dark ? "border-white/10 bg-black/25 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      {(text) => <><CalendarDays size={14} className={dark ? "text-amber-300" : "text-[#08467d]"} />{text}</>}
                    </VisualEditable>
                  ) : null}
                  <VisualEditable
                    id="memory-season-badge"
                    tag="text"
                    label="شارة موسم الذكريات"
                    as="span"
                    defaultText="موسم العقيق 2026"
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 ${
                      dark ? "border-white/10 bg-black/25 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"
                    }`}
                  >
                    {(text) => <><Sparkles size={14} className={dark ? "text-amber-300" : "text-[#08467d]"} />{text}</>}
                  </VisualEditable>
                </VisualEditable>
              </div>
            </VisualEditable>
            <VisualEditable
              id="memory-cards-section"
              tag="section"
              label="بطاقات الذكريات"
              as="div"
              className={`grid gap-4 border-t p-6 md:grid-cols-3 md:p-8 ${dark ? "border-white/[.08]" : "border-slate-200"}`}
            >
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <VisualEditable
                    key={card.id}
                    id={`memory-card-${card.id}`}
                    tag="section"
                    label={`بطاقة ${card.title}`}
                    as="article"
                    className={`rounded-2xl border p-4 transition ${
                      dark ? "border-white/[.08] bg-black/20" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <VisualEditable id={`memory-card-${card.id}-icon`} tag="section" label={`أيقونة ${card.title}`} as="div">
                      <Icon className={dark ? "text-amber-300" : "text-[#08467d]"} size={19} />
                    </VisualEditable>
                    <VisualEditable
                      id={`memory-card-${card.id}-title`}
                      tag="text"
                      label={`عنوان بطاقة ${card.title}`}
                      as="h2"
                      defaultText={card.title}
                      className={`mt-3 font-black ${dark ? "text-amber-50" : "text-slate-900"}`}
                    />
                    <VisualEditable
                      id={`memory-card-${card.id}-body`}
                      tag="text"
                      label={`وصف بطاقة ${card.title}`}
                      as="p"
                      defaultText={card.body}
                      className={`mt-2 text-xs leading-6 ${dark ? "text-slate-500" : "text-slate-600"}`}
                    />
                  </VisualEditable>
                );
              })}
            </VisualEditable>
          </VisualEditable>
        </VisualEditable>
      </main>
    </VisualEditable>
  );
}
