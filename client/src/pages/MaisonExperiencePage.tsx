import { VisualEditable } from "@/components/VisualEditor";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CalendarDays, Crown, ExternalLink, LockKeyhole, MapPin, Play, Quote, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

type MaisonMode = "premiere" | "honor" | "portrait";

const phaseCopy = {
  sealed: { label: "الختم المغلق", action: "اقتربت لحظة الكشف", tone: "text-slate-300" },
  reveal: { label: "الإصدار متاح الآن", action: "ادخل تجربة العقيق", tone: "text-amber-200" },
  live: { label: "ليلة العقيق بدأت", action: "عيش اللحظة الآن", tone: "text-sky-200" },
  archive: { label: "حُفظت داخل السجل", action: "اكتشف البورتريه", tone: "text-violet-200" },
};

function safeList(value?: string | null) {
  try { const parsed = JSON.parse(value || "[]"); return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []; } catch { return []; }
}

export default function MaisonExperiencePage({ ceremonyId, mode }: { ceremonyId: number; mode: MaisonMode }) {
  const [, navigate] = useLocation();
  const { data: event, isLoading: loadingEvent } = trpc.ceremonies.public.useQuery({ id: ceremonyId });
  const { data: maison, isLoading: loadingMaison } = trpc.ceremonies.maison.public.useQuery({ ceremonyId });
  if (loadingEvent || loadingMaison) return <div className="flex min-h-screen items-center justify-center bg-[#06070a] text-amber-200"><div className="h-9 w-9 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" /></div>;
  if (!event || !maison) return <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#06070a] p-6 text-center text-slate-400">هذا الإصدار غير متاح الآن.</div>;
  const phase = phaseCopy[maison.launchPhase];
  const brand = event.brandColor || "#dca631";
  const route = `/event/${ceremonyId}`;
  const program = safeList(maison.honorProgram);
  const highlights = safeList(maison.portraitHighlights);
  const currentModeLabel = mode === "premiere" ? "بوابة العرض الأول" : mode === "honor" ? "صالة الشرف" : "بورتريه المناسبة";

  return <main dir="rtl" className="min-h-screen overflow-x-hidden bg-[#06070a] text-slate-100" style={{ fontFamily: event.fontFamily || "Tajawal" }}>
    <div className="pointer-events-none fixed inset-0 opacity-90" style={{ background: `radial-gradient(circle at 81% 6%, ${brand}24, transparent 24%), radial-gradient(circle at 10% 88%, #7c3aed18, transparent 26%), linear-gradient(135deg, transparent 0%, #ffffff03 44%, transparent 45%)` }} />
    <header className="relative z-10 border-b border-white/[0.08] bg-black/25 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5"><button onClick={() => navigate(route)} className="inline-flex items-center gap-2 text-xs font-black text-slate-400 transition hover:text-amber-100"><ArrowLeft size={16} />تفاصيل المناسبة</button><div className="flex items-center gap-2 text-[11px] font-black text-amber-200"><span className="grid h-6 w-6 place-items-center rounded-md border border-amber-200/45 font-serif text-[9px] tracking-tight">AQ</span>{maison.sealLabel} <span className="text-slate-600">/</span> {maison.editionCode}</div></div></header>
    <div className="relative z-10 mx-auto max-w-6xl px-5 pb-16 pt-10 md:pb-24 md:pt-16">
      <div className="flex items-center justify-between gap-4"><div className={`inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.025] px-3 py-1.5 text-[11px] font-black ${phase.tone}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{phase.label}</div><div className="text-[10px] font-black tracking-[0.18em] text-slate-600">{currentModeLabel.toUpperCase()}</div></div>
      {mode === "premiere" && <Premiere event={event} maison={maison} brand={brand} navigate={navigate} route={route} />}
      {mode === "honor" && <HonorHall event={event} maison={maison} brand={brand} program={program} navigate={navigate} />}
      {mode === "portrait" && <Portrait event={event} maison={maison} brand={brand} highlights={highlights} navigate={navigate} />}
    </div>
  </main>;
}

function Premiere({ event, maison, brand, navigate, route }: { event: any; maison: any; brand: string; navigate: (path: string) => void; route: string }) {
  const sealed = maison.launchPhase === "sealed";
  return <section className="grid items-center gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
    <VisualEditable id="maison-premiere-art" tag="section" label="مشهد بوابة العرض الأول" as="div" className="relative order-2 aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-amber-200/20 bg-[#0d0f16] shadow-2xl shadow-black/60 lg:order-1">
      {maison.coverUrl ? <img src={maison.coverUrl} alt={`غلاف ${event.title}`} className={`h-full w-full object-cover transition duration-700 ${sealed ? "scale-110 opacity-25 blur-[2px]" : "opacity-80"}`} /> : <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 20%, ${brand}42, transparent 25%), linear-gradient(145deg, #19130b, #050609 70%)` }} />}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      <div className="absolute inset-4 rounded-[2rem] border border-amber-100/[0.13]" /><div className="absolute inset-6 rounded-[1.7rem] border border-white/[0.06]" />
      <div className="absolute inset-0 flex items-center justify-center"><div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-amber-100/35 bg-[#120e08]/80 shadow-[0_0_0_12px_rgba(221,165,49,.05),0_0_60px_rgba(221,165,49,.18)]"><div className="absolute inset-2 rounded-full border border-amber-100/15" /><div className="text-center"><div className="font-serif text-4xl tracking-[-0.12em]" style={{ color: brand }}>AQ</div><div className="mt-1 text-[8px] font-black tracking-[0.18em] text-amber-100/70">AL AQEEQ</div></div><span className="absolute -bottom-8 whitespace-nowrap text-[10px] font-black tracking-[0.27em] text-amber-100/75">{maison.sealLabel}</span></div></div>
      <div className="absolute bottom-0 right-0 left-0 p-7"><div className="text-[10px] font-black tracking-[0.2em] text-amber-200/75">{maison.editionCode}</div><div className="mt-2 text-xl font-black text-white">{event.title}</div></div>
    </VisualEditable>
    <div className="order-1 lg:order-2"><VisualEditable id="maison-premiere-kicker" tag="text" label="شارة العرض الأول" as="div" defaultText={sealed ? "ختم محفوظ حتى لحظة الإعلان" : maison.sealLabel} className="text-xs font-black" style={{ color: brand }} />
      <VisualEditable id="maison-premiere-title" tag="text" label="عنوان بوابة العرض الأول" as="h1" defaultText={sealed ? "هذه الليلة لم تُكشف بعد." : maison.premiereTitle} className="mt-5 max-w-3xl text-5xl font-black leading-[1.18] text-amber-50 md:text-7xl" />
      <VisualEditable id="maison-premiere-phrase" tag="text" label="عبارة بوابة العرض الأول" as="p" defaultText={sealed ? maison.launchNote || "بقيت لحظة واحدة." : maison.premierePhrase || "تفاصيل صُنعت لتبقى في الذاكرة."} className="mt-6 max-w-xl text-lg leading-9 text-slate-400" />
      <div className="mt-9 flex flex-wrap gap-3">{sealed ? <button onClick={() => navigate(route)} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-3.5 text-sm font-black text-slate-200 transition hover:border-amber-300/35"><LockKeyhole size={17} style={{ color: brand }} />احتفظ بالموعد</button> : <button onClick={() => navigate(`/event/${event.id}/honor`)} className="inline-flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-black text-[#241100] shadow-lg transition hover:scale-[1.015]" style={{ background: `linear-gradient(135deg, ${brand}, #f6d87a)` }}><Sparkles size={17} />ادخل صالة الشرف</button>}<a href={`/event/${event.id}/stage`} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-5 py-3.5 text-sm font-black text-slate-300 transition hover:border-sky-300/35 hover:text-sky-100"><Play size={16} />شاشة المسرح</a></div>
    </div>
  </section>;
}

function HonorHall({ event, maison, brand, program, navigate }: { event: any; maison: any; brand: string; program: string[]; navigate: (path: string) => void }) {
  return <section className="py-10 md:py-16"><div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]"><div><VisualEditable id="maison-honor-kicker" tag="text" label="شارة صالة الشرف" as="div" defaultText={maison.sealLabel} className="text-xs font-black" style={{ color: brand }} /><VisualEditable id="maison-honor-title" tag="text" label="عنوان صالة الشرف" as="h1" defaultText={maison.honorTitle} className="mt-5 text-5xl font-black leading-tight text-amber-50 md:text-6xl" /><VisualEditable id="maison-honor-message" tag="text" label="رسالة صالة الشرف" as="p" defaultText={maison.honorMessage || "نرحب بكم في تجربة صُممت بعناية لفعاليتنا."} className="mt-6 max-w-2xl text-lg leading-9 text-slate-400" /><div className="mt-10 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"><CalendarDays size={17} style={{ color: brand }} /><div className="mt-3 text-xs text-slate-500">موعد المناسبة</div><div className="mt-1 text-sm font-black text-slate-100">{event.ceremonyDate || "يعلن لاحقاً"}{event.ceremonyTime ? ` · ${event.ceremonyTime}` : ""}</div></div><div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"><MapPin size={17} style={{ color: brand }} /><div className="mt-3 text-xs text-slate-500">مكان المناسبة</div><div className="mt-1 text-sm font-black text-slate-100">{event.venue || "يعلن لاحقاً"}</div></div></div></div><VisualEditable id="maison-honor-program" tag="section" label="برنامج صالة الشرف" as="section" className="rounded-[2rem] border border-amber-300/18 bg-[#0d0f16] p-6 md:p-8"><div className="flex items-center justify-between"><div><div className="text-xs font-black" style={{ color: brand }}>PROGRAM / البرنامج</div><h2 className="mt-2 text-2xl font-black text-slate-100">ترتيب اللحظات</h2></div><Crown className="text-amber-200" size={23} /></div><div className="mt-8 space-y-1">{(program.length ? program : ["الاستقبال الملكي", "افتتاح دار العقيق", "لحظة التكريم", "الصورة الختامية"]).map((item, index) => <div key={`${item}-${index}`} className="flex items-center gap-4 border-b border-white/[0.06] py-4 last:border-0"><span className="text-xs font-black" style={{ color: brand }}>{String(index + 1).padStart(2, "0")}</span><span className="font-bold text-slate-200">{item}</span></div>)}</div><button onClick={() => navigate(`/event/${event.id}/premiere`)} className="mt-7 inline-flex items-center gap-2 text-sm font-black text-amber-200 hover:text-amber-100">بوابة العرض الأول <ArrowLeft size={16} /></button></VisualEditable></div></section>;
}

function Portrait({ event, maison, brand, highlights, navigate }: { event: any; maison: any; brand: string; highlights: string[]; navigate: (path: string) => void }) {
  return <section className="py-10 md:py-16"><div className="mx-auto max-w-4xl text-center"><VisualEditable id="maison-portrait-kicker" tag="text" label="شارة بورتريه المناسبة" as="div" defaultText={`${maison.editionCode} · السجل الحي`} className="text-xs font-black" style={{ color: brand }} /><VisualEditable id="maison-portrait-title" tag="text" label="عنوان بورتريه المناسبة" as="h1" defaultText={event.title} className="mt-5 text-5xl font-black leading-tight text-amber-50 md:text-7xl" /><VisualEditable id="maison-portrait-quote" tag="text" label="اقتباس بورتريه المناسبة" as="p" defaultText={maison.portraitQuote || "كل لحظة جميلة تستحق أن تُحفظ."} className="mx-auto mt-8 max-w-2xl text-xl font-bold leading-10 text-slate-300 md:text-2xl">{(text) => <><Quote className="mx-auto mb-4 text-amber-300/70" size={24} />{text}</>}</VisualEditable></div><VisualEditable id="maison-portrait-highlights" tag="section" label="لحظات بورتريه المناسبة" as="section" className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">{(highlights.length ? highlights : ["لحظة الافتتاح", "تكريم المشاركين", "خاتمة تبقى في الذاكرة"]).map((item, index) => <div key={`${item}-${index}`} className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 text-right"><div className="text-xs font-black" style={{ color: brand }}>0{index + 1}</div><div className="mt-7 text-lg font-black text-slate-100">{item}</div><div className="mt-3 text-xs leading-6 text-slate-500">فصل مختار من إصدار {maison.editionCode}</div></div>)}</VisualEditable>{maison.portraitVideoUrl ? <a href={maison.portraitVideoUrl} target="_blank" rel="noreferrer" className="mx-auto mt-8 inline-flex items-center gap-2 rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] px-5 py-3 text-sm font-black text-amber-100 hover:bg-amber-300/[0.1]"><ExternalLink size={16} />مشاهدة فيلم الختام</a> : null}<div className="mt-12 text-center"><button onClick={() => navigate("/maison") } className="inline-flex items-center gap-2 text-sm font-black text-amber-200 hover:text-amber-100">انتقل إلى خزنة مواسم العقيق <ArrowLeft size={16} /></button></div></section>;
}
