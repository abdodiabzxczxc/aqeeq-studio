import { CalendarDays, Check, ChevronLeft, Copy, MapPin, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { EVENT_TYPE_LABELS } from "../../../shared/types";
import { VisualEditable } from "../components/VisualEditor";
import { AlaqeeqPublicHeader } from "../components/AlaqeeqPublicHeader";

export default function EventLandingPage({ id }: { id?: string }) {
  const [, navigate] = useLocation();
  const eventId = id ? Number(id) : undefined;
  const { data: event, isLoading } = trpc.ceremonies.public.useQuery(eventId ? { id: eventId } : undefined);
  const { data: maison } = trpc.ceremonies.maison.public.useQuery({ ceremonyId: eventId ?? 1 }, { enabled: Boolean(eventId), refetchOnWindowFocus: false });
  const { data: branding } = trpc.settings.getPublicLogos.useQuery(undefined, { refetchOnWindowFocus: false });
  const [copied, setCopied] = useState(false);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--dark-gradient)" }}><div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" /></div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center p-6 text-center" style={{ background: "var(--dark-gradient)" }}><div><Sparkles className="text-amber-400 mx-auto mb-4" size={34} /><h1 className="text-2xl font-black text-amber-100">الفعالية غير متاحة</h1><p className="text-slate-400 mt-2">تأكد من رابط الفعالية أو تواصل مع الجهة المنظمة.</p><button onClick={() => navigate("/")} className="mt-6 rounded-xl px-6 py-3 font-bold text-amber-950" style={{ background: "var(--gold-gradient)" }}>العودة للصفحة الرئيسية</button></div></div>;

  const logo = event.logoUrl || branding?.ceremony_logo || branding?.school_logo || "/manus-storage/logo_school_b7348eaa.png";
  const brandColor = event.brandColor || "#c9a84c";
  const brandStyle = { color: brandColor };
  const typeLabel = EVENT_TYPE_LABELS[event.eventType as keyof typeof EVENT_TYPE_LABELS] || "فعالية مخصصة";
  const templateId = event.templateId || "royal";
  const templateLabel = templateId === "minimal" ? "قالب هادئ" : templateId === "modern" ? "قالب عصري" : "قالب ملكي";
  const pageBackground = templateId === "minimal" ? "linear-gradient(180deg, oklch(10% 0.01 250), oklch(14% 0.012 250))" : templateId === "modern" ? "linear-gradient(135deg, oklch(8% 0.02 250), oklch(16% 0.05 260))" : "radial-gradient(circle at 50% -10%, oklch(24% 0.07 70 / 0.32), transparent 42%), var(--dark-gradient)";
  const pageStyle = { background: pageBackground, fontFamily: event.fontFamily || "Tajawal" };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("انسخ رابط الفعالية:", window.location.href);
    }
  };

  return (
    <VisualEditable id="event-page" tag="section" label="صفحة الفعالية العامة" as="section" className="block"><main dir="rtl" className="aq-public-shell" style={{ ...pageStyle, backgroundColor: "var(--aq-ink)" }}>
      <AlaqeeqPublicHeader eyebrow={typeLabel} title="تفاصيل المناسبة" showNav={false}><VisualEditable id="event-header-share" tag="button" label="مشاركة الفعالية من الرأس" as="button" onAction={copyLink} className="aq-action aq-action-dark !px-3 !py-2" style={{ borderColor: `${brandColor}66`, color: brandColor }}>{copied ? <Check size={14} /> : <Copy size={14} />}<span className="hidden sm:inline">{copied ? "تم النسخ" : "مشاركة"}</span></VisualEditable></AlaqeeqPublicHeader>
      <VisualEditable id="event-hero" tag="section" label="غلاف الفعالية" as="section" className="container relative max-w-5xl overflow-hidden py-20 text-center md:py-28"><VisualEditable id="event-hero-glow" tag="section" label="إضاءة غلاف الفعالية" as="div" className="pointer-events-none absolute inset-x-0 top-0 h-full opacity-30" style={{ background: `radial-gradient(circle at 50% 15%, ${brandColor}33, transparent 44%)` }} />
        <div className="relative"><VisualEditable id="event-logo" tag="image" label="شعار الفعالية" as="div"><img src={logo} alt="شعار الفعالية" className="mx-auto h-20 w-auto object-contain opacity-95 md:h-28" /></VisualEditable>
        <VisualEditable id="event-template-badge" tag="text" label="شارة نوع الفعالية والقالب" as="div" defaultText={`${typeLabel} · ${templateLabel}`} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold border" style={{ ...brandStyle, borderColor: `${brandColor}55`, backgroundColor: `${brandColor}18` }}>{(text) => <><Sparkles size={14} /> {text}</>}</VisualEditable>
        <VisualEditable id="event-title" tag="text" label="عنوان صفحة الفعالية" as="h1" defaultText={event.invitationTitle || event.title} className="mt-7 text-4xl md:text-6xl font-black leading-tight" style={brandStyle} />
        {(event.invitationSubtitle || event.subtitle) && <VisualEditable id="event-subtitle" tag="text" label="وصف صفحة الفعالية" as="p" defaultText={event.invitationSubtitle || event.subtitle || ""} className="mt-5 text-lg text-slate-300 leading-8 max-w-2xl mx-auto" />}
        <VisualEditable id="event-details" tag="section" label="تفاصيل الفعالية" as="div" className="flex flex-wrap justify-center gap-3 mt-9">
          {event.venue && <span className="rounded-xl border border-slate-700 bg-black/20 px-4 py-3 text-sm text-slate-300 flex items-center gap-2"><MapPin size={16} style={brandStyle} />{event.venue}</span>}
          {event.ceremonyDate && <span className="rounded-xl border border-slate-700 bg-black/20 px-4 py-3 text-sm text-slate-300 flex items-center gap-2"><CalendarDays size={16} style={brandStyle} />{event.ceremonyDate}{event.ceremonyTime ? ` · ${event.ceremonyTime}` : ""}</span>}
          <span className="rounded-xl border border-slate-700 bg-black/20 px-4 py-3 text-sm text-slate-300 flex items-center gap-2"><Users size={16} style={brandStyle} />سعة {event.capacity} ضيف</span>
        </VisualEditable>
        <VisualEditable id="event-actions" tag="section" label="إجراءات الفعالية" as="div" className="mt-11 flex flex-wrap justify-center gap-3"><VisualEditable id="event-cta" tag="button" label="زر المشاركة" as="button" defaultText={copied ? "تم نسخ رابط الفعالية" : "شارك رابط الفعالية"} onAction={copyLink} className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 font-black text-amber-950 shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-transform" style={{ background: brandColor }}>{(text) => <>{text}<ChevronLeft size={19} /></>}</VisualEditable><VisualEditable id="event-memories-action" tag="button" label="زر بوابة الذكريات" as="button" onAction={() => navigate(`/event/${event.id}/memories`)} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-black/20 px-6 py-4 text-sm font-black text-amber-100 hover:border-amber-300/40"><Sparkles size={17} style={brandStyle} />بوابة الذكريات</VisualEditable></VisualEditable>
      </div></VisualEditable>
      <VisualEditable id="event-guest-journey" tag="section" label="رحلة الضيف المبسطة" as="section" className="container pb-12"><div id="guest-journey" className="aq-editorial-panel relative overflow-hidden rounded-[2rem] p-6 md:p-8"><div className="pointer-events-none absolute -left-12 -top-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" /><div className="relative"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><VisualEditable id="event-guest-journey-kicker" tag="text" label="شارة رحلة الضيف" as="div" defaultText="دليل الضيف" className="aq-chapter-label" /><VisualEditable id="event-guest-journey-title" tag="text" label="عنوان رحلة الضيف" as="h2" defaultText="كل ما تحتاجه في ثلاث خطوات" className="mt-2 text-2xl font-black text-amber-50 md:text-3xl" /><VisualEditable id="event-guest-journey-description" tag="text" label="وصف رحلة الضيف" as="p" defaultText="احتفظ بهذا الرابط للمعلومات العامة، وافتح بطاقتك الشخصية التي وصلتك عند الدخول." className="mt-2 max-w-2xl text-sm leading-7 text-slate-400" /></div><button onClick={() => navigate(`/event/${event.id}/premiere`)} className="aq-action aq-action-gold"><Sparkles size={15} />بوابة المناسبة</button></div><div className="mt-6 grid gap-3 md:grid-cols-3"><div className="aq-editorial-panel rounded-2xl p-5"><span className="aq-chapter-label">٠١ · قبل المناسبة</span><h3 className="mt-4 font-black text-slate-100">راجع الموعد والمكان</h3><p className="mt-2 text-xs leading-6 text-slate-500">ستجد تفاصيل الموعد والموقع في هذه الصفحة دائماً.</p></div><div className="aq-editorial-panel rounded-2xl p-5"><span className="aq-chapter-label">٠٢ · عند الوصول</span><h3 className="mt-4 font-black text-slate-100">افتح بطاقتك الشخصية</h3><p className="mt-2 text-xs leading-6 text-slate-500">استخدم رابط دعوتك الذي أُرسل لك؛ فيه رمز QR الخاص بدخولك.</p></div><div className="aq-editorial-panel rounded-2xl p-5"><span className="aq-chapter-label">٠٣ · بعد المناسبة</span><h3 className="mt-4 font-black text-slate-100">ارجع للذكرى</h3><p className="mt-2 text-xs leading-6 text-slate-500">ستظهر هنا صور ومقتطفات الفعالية بعد اعتمادها.</p><button onClick={() => navigate(`/event/${event.id}/memories`)} className="mt-4 text-xs font-black text-amber-200 hover:text-amber-100">فتح الذكريات ←</button></div></div></div></div></VisualEditable>
      {(event.storyLine || event.trailerUrl) && <VisualEditable id="event-extra-details" tag="section" label="معلومات إضافية عن الفعالية" as="section" className="container pb-16"><details className="rounded-2xl border border-white/[0.08] bg-black/15 px-5 py-4"><summary className="cursor-pointer list-none text-sm font-black text-slate-300">معلومات إضافية عن الفعالية</summary><div className="mt-4 border-t border-white/[0.07] pt-4"><p className="max-w-2xl text-sm leading-8 text-slate-400">{event.storyLine || ""}</p>{event.trailerUrl ? <a href={event.trailerUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-black text-amber-200"><Sparkles size={14} />مشاهدة فيديو الفعالية</a> : null}</div></details></VisualEditable>}
    </main></VisualEditable>
  );
}
