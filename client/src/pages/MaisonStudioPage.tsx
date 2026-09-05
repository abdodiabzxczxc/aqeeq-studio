import MediaLibrary from "@/components/MediaLibrary";
import { trpc } from "@/lib/trpc";
import { Archive, Check, ChevronLeft, Crown, ExternalLink, ImagePlus, Loader2, Play, Sparkles, Theater, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type MaisonDraft = {
  editionCode: string;
  sealLabel: string;
  premiereTitle: string;
  premierePhrase: string;
  coverUrl: string;
  launchPhase: "sealed" | "reveal" | "live" | "archive";
  launchNote: string;
  honorTitle: string;
  honorMessage: string;
  honorProgram: string;
  portraitQuote: string;
  portraitHighlights: string;
  portraitVideoUrl: string;
  curtainTitle: string;
  curtainSubtitle: string;
  curtainState: "closed" | "opening" | "revealed";
};

const phaseMeta: Record<MaisonDraft["launchPhase"], { label: string; note: string; color: string }> = {
  sealed: { label: "الختم المغلق", note: "لا يظهر للزائر إلا التاريخ والعبارة الغامضة.", color: "#9ca3af" },
  reveal: { label: "الإطلاق", note: "تظهر البطاقة السوداء وهوية الإصدار بالكامل.", color: "#f2bc4d" },
  live: { label: "ليلة العقيق", note: "تتحول البوابة إلى تجربة حية مرتبطة بالمسرح.", color: "#67e8f9" },
  archive: { label: "السجل الحي", note: "تتحول التجربة إلى بورتريه وذكرى محفوظة.", color: "#c4b5fd" },
};

const emptyDraft: MaisonDraft = {
  editionCode: "AQ–001", sealLabel: "دار العقيق", premiereTitle: "إصدار من دار العقيق", premierePhrase: "تفاصيل صُنعت لتبقى في الذاكرة.", coverUrl: "", launchPhase: "sealed", launchNote: "بقيت لحظة واحدة.", honorTitle: "صالة الشرف", honorMessage: "نرحب بكم في تجربة صُممت بعناية لفعاليتنا.", honorProgram: "", portraitQuote: "كل لحظة جميلة تستحق أن تُحفظ.", portraitHighlights: "", portraitVideoUrl: "", curtainTitle: "لحظة كشف الستار", curtainSubtitle: "مدارس العقيق تقدّم لحظة من موسمها.", curtainState: "closed",
};

function parseLines(value?: string | null) {
  try { const parsed = JSON.parse(value || "[]"); return Array.isArray(parsed) ? parsed.map(String).join("\n") : ""; } catch { return ""; }
}

export default function MaisonStudioPage({ ceremonyId }: { ceremonyId: number }) {
  const utils = trpc.useUtils();
  const { data: event } = trpc.ceremonies.public.useQuery({ id: ceremonyId });
  const { data: maison, isLoading } = trpc.ceremonies.maison.admin.useQuery({ ceremonyId });
  const [draft, setDraft] = useState<MaisonDraft>(emptyDraft);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState(false);
  const hydratedCeremonyId = useRef<number | null>(null);

  useEffect(() => {
    if (!maison || hydratedCeremonyId.current === ceremonyId) return;
    setDraft({
      editionCode: maison.editionCode, sealLabel: maison.sealLabel, premiereTitle: maison.premiereTitle,
      premierePhrase: maison.premierePhrase || "", coverUrl: maison.coverUrl || "", launchPhase: maison.launchPhase,
      launchNote: maison.launchNote || "", honorTitle: maison.honorTitle, honorMessage: maison.honorMessage || "",
      honorProgram: parseLines(maison.honorProgram), portraitQuote: maison.portraitQuote || "",
      portraitHighlights: parseLines(maison.portraitHighlights), portraitVideoUrl: maison.portraitVideoUrl || "",
      curtainTitle: maison.curtainTitle, curtainSubtitle: maison.curtainSubtitle || "", curtainState: maison.curtainState,
    });
    hydratedCeremonyId.current = ceremonyId;
  }, [maison, ceremonyId]);

  const save = trpc.ceremonies.maison.update.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.ceremonies.maison.admin.invalidate({ ceremonyId }), utils.ceremonies.maison.public.invalidate({ ceremonyId }), utils.ceremonies.maison.vault.invalidate()]);
      setLastSaved(true);
      window.setTimeout(() => setLastSaved(false), 2200);
      toast.success("تم حفظ هوية دار العقيق ونشرها فوراً.");
    },
    onError: (error) => toast.error(error.message || "تعذر حفظ إعدادات دار العقيق"),
  });

  const updateField = <K extends keyof MaisonDraft>(key: K, value: MaisonDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const persistAll = () => save.mutate({
    ceremonyId,
    ...draft,
    premierePhrase: draft.premierePhrase || null,
    coverUrl: draft.coverUrl || null,
    launchNote: draft.launchNote || null,
    honorMessage: draft.honorMessage || null,
    honorProgram: JSON.stringify(draft.honorProgram.split("\n").map((item) => item.trim()).filter(Boolean)),
    portraitQuote: draft.portraitQuote || null,
    portraitHighlights: JSON.stringify(draft.portraitHighlights.split("\n").map((item) => item.trim()).filter(Boolean)),
    portraitVideoUrl: draft.portraitVideoUrl || null,
    curtainSubtitle: draft.curtainSubtitle || null,
  });
  const setPhase = (phase: MaisonDraft["launchPhase"]) => {
    updateField("launchPhase", phase);
    save.mutate({ ceremonyId, launchPhase: phase });
  };
  const setCurtain = (state: MaisonDraft["curtainState"]) => {
    updateField("curtainState", state);
    save.mutate({ ceremonyId, curtainState: state });
  };
  const links = useMemo(() => [
    { label: "بوابة العرض الأول", href: `/event/${ceremonyId}/premiere` },
    { label: "صالة الشرف", href: `/event/${ceremonyId}/honor` },
    { label: "بورتريه المناسبة", href: `/event/${ceremonyId}/portrait` },
  ], [ceremonyId]);

  if (isLoading) return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="animate-spin text-amber-300" /></div>;

  return <section dir="rtl" className="space-y-6">
    <header className="relative overflow-hidden rounded-[2rem] border border-amber-300/25 bg-[#0a0b10] p-6 md:p-8">
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl"><div className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/[0.06] px-3 py-1.5 text-[11px] font-black text-amber-200"><Crown size={14} />MAISON ALAQEEQ · إصدار مستقل</div><h2 className="mt-4 text-3xl font-black text-amber-50">استوديو إطلاق ليلة العقيق</h2><p className="mt-3 text-sm leading-7 text-slate-400">هنا تتحول الفعالية إلى إصدار فاخر: دعوة، عرض أول، مسرح حي، وصورة محفوظة داخل موسم العقيق.</p></div>
        <button onClick={persistAll} disabled={save.isPending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-amber-300 to-[#d68b11] px-6 text-sm font-black text-[#241100] shadow-lg shadow-amber-500/20 disabled:opacity-50">{save.isPending ? <Loader2 className="animate-spin" size={18} /> : lastSaved ? <Check size={18} /> : <Sparkles size={18} />}{lastSaved ? "تم الحفظ والنشر" : "حفظ ونشر دار العقيق"}</button>
      </div>
    </header>

    <section className="rounded-3xl border border-white/[0.08] bg-black/20 p-5 md:p-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-300/10 p-2 text-amber-200"><WandSparkles size={19} /></div><div><p className="text-xs font-black text-amber-200">زر ليلة العقيق</p><h3 className="mt-0.5 text-lg font-black text-slate-100">بدّل رحلة الفعالية الآن</h3></div></div><div className="mt-5 grid gap-3 md:grid-cols-4">{(Object.keys(phaseMeta) as MaisonDraft["launchPhase"][]).map((phase) => { const meta = phaseMeta[phase]; const active = draft.launchPhase === phase; return <button key={phase} onClick={() => setPhase(phase)} disabled={save.isPending} className={`rounded-2xl border p-4 text-right transition ${active ? "border-amber-300/70 bg-amber-300/[0.09]" : "border-slate-800 bg-black/20 hover:border-amber-300/30"}`}><div className="flex items-center justify-between"><span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} /><span className="text-[10px] font-black text-slate-500">{active ? "الحالة الحالية" : "انقر للتبديل"}</span></div><div className="mt-4 font-black text-slate-100">{meta.label}</div><p className="mt-2 text-xs leading-6 text-slate-500">{meta.note}</p></button>; })}</div></section>

    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-3xl border border-white/[0.08] bg-black/20 p-5 md:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-black text-amber-200">هوية الإصدار</p><h3 className="mt-1 text-xl font-black text-slate-100">البطاقة السوداء وبوابة العرض الأول</h3></div><button onClick={() => setMediaOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-amber-300/25 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-300/[0.08]"><ImagePlus size={15} />اختيار الغلاف</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="رقم الإصدار" value={draft.editionCode} onChange={(value) => updateField("editionCode", value)} placeholder="AQ–026 / 2026" /><Field label="اسم الختم" value={draft.sealLabel} onChange={(value) => updateField("sealLabel", value)} placeholder="دار العقيق" /><Field label="عنوان العرض الأول" value={draft.premiereTitle} onChange={(value) => updateField("premiereTitle", value)} className="sm:col-span-2" /><Field label="العبارة الرئيسية" value={draft.premierePhrase} onChange={(value) => updateField("premierePhrase", value)} textarea className="sm:col-span-2" /><Field label="جملة وضع الانتظار" value={draft.launchNote} onChange={(value) => updateField("launchNote", value)} className="sm:col-span-2" /></div>{draft.coverUrl ? <div className="mt-5 overflow-hidden rounded-2xl border border-amber-300/20"><img src={draft.coverUrl} alt="غلاف إصدار دار العقيق" className="h-48 w-full object-cover" /></div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-7 text-center text-sm text-slate-500">اختر غلافاً ليصبح الافتتاح أكثر فخامة وتميّزاً.</div>}</section>
      <aside className="rounded-3xl border border-white/[0.08] bg-[#0c0f17] p-5 md:p-6"><p className="text-xs font-black text-amber-200">روابط الإصدار المستقلة</p><h3 className="mt-1 text-xl font-black text-slate-100">تجارب جاهزة للمشاركة</h3><p className="mt-2 text-xs leading-6 text-slate-500">كل رابط يفتح التجربة الخاصة بالفعالية فقط دون الحاجة للدخول إلى لوحة الإدارة.</p><div className="mt-5 space-y-2">{links.map((item) => <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-slate-800 bg-black/20 p-3 text-sm font-bold text-slate-200 transition hover:border-amber-300/35 hover:text-amber-100"><span>{item.label}</span><ExternalLink size={16} className="text-amber-300" /></a>)}</div><div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-4"><div className="text-[11px] font-black text-amber-200">الفعالية الحالية</div><div className="mt-1 text-sm font-black text-slate-100">{event?.title || "فعالية العقيق"}</div><div className="mt-2 text-xs text-slate-500">{phaseMeta[draft.launchPhase].label}</div></div></aside>
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-3xl border border-white/[0.08] bg-black/20 p-5 md:p-6"><div className="flex items-center gap-3"><Crown className="text-amber-300" size={20} /><div><p className="text-xs font-black text-amber-200">صالة الشرف</p><h3 className="mt-1 text-xl font-black text-slate-100">رسالة الضيف وبرنامج المناسبة</h3></div></div><div className="mt-5 space-y-4"><Field label="عنوان الصالة" value={draft.honorTitle} onChange={(value) => updateField("honorTitle", value)} /><Field label="رسالة الترحيب" value={draft.honorMessage} onChange={(value) => updateField("honorMessage", value)} textarea /><Field label="فقرات البرنامج — فقرة في كل سطر" value={draft.honorProgram} onChange={(value) => updateField("honorProgram", value)} textarea placeholder="الاستقبال الملكي\nالافتتاح\nلحظة التكريم" /></div></section>
      <section className="rounded-3xl border border-white/[0.08] bg-black/20 p-5 md:p-6"><div className="flex items-center gap-3"><Archive className="text-amber-300" size={20} /><div><p className="text-xs font-black text-amber-200">بورتريه المناسبة</p><h3 className="mt-1 text-xl font-black text-slate-100">الصورة التي تبقى بعد النهاية</h3></div></div><div className="mt-5 space-y-4"><Field label="الاقتباس الختامي" value={draft.portraitQuote} onChange={(value) => updateField("portraitQuote", value)} textarea /><Field label="لحظات مختارة — لحظة في كل سطر" value={draft.portraitHighlights} onChange={(value) => updateField("portraitHighlights", value)} textarea placeholder="لحظة الافتتاح\nتكريم المشاركين\nصورة الختام" /><Field label="رابط فيلم الختام (اختياري)" value={draft.portraitVideoUrl} onChange={(value) => updateField("portraitVideoUrl", value)} dir="ltr" placeholder="https://..." /></div></section>
    </div>

    <section className="rounded-3xl border border-white/[0.08] bg-black/20 p-5 md:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Theater className="text-[#f8ca14]" size={21} /><div><p className="text-xs font-black text-amber-200">شاشة المسرح</p><h3 className="mt-1 text-xl font-black text-slate-100">تحكم كشف الستار الحي</h3></div></div><a href={`/event/${ceremonyId}/stage`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f8ca14]/30 px-4 py-2.5 text-xs font-black text-amber-200 hover:bg-[#f8ca14]/[0.08]"><Play size={15} />فتح شاشة المسرح</a></div><div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto]"><Field label="عنوان الكشف" value={draft.curtainTitle} onChange={(value) => updateField("curtainTitle", value)} /><Field label="وصف اللحظة" value={draft.curtainSubtitle} onChange={(value) => updateField("curtainSubtitle", value)} /><div className="flex items-end"><div className="grid w-full grid-cols-3 overflow-hidden rounded-xl border border-slate-700">{(["closed", "opening", "revealed"] as const).map((state) => <button key={state} onClick={() => setCurtain(state)} className={`px-2 py-3 text-[11px] font-black transition ${draft.curtainState === state ? "bg-[#f8ca14] text-slate-950" : "bg-black/20 text-slate-400 hover:text-white"}`}>{state === "closed" ? "مغلق" : state === "opening" ? "يفتح" : "انكشف"}</button>)}</div></div></div></section>

    <MediaLibrary open={mediaOpen} onClose={() => setMediaOpen(false)} accept="image" onSelect={(asset) => updateField("coverUrl", asset.url)} />
  </section>;
}

function Field({ label, value, onChange, textarea, className = "", dir, placeholder }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean; className?: string; dir?: "ltr" | "rtl"; placeholder?: string }) {
  const classes = "mt-2 w-full rounded-xl border border-slate-700 bg-black/25 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-amber-300/70";
  return <label className={`block ${className}`}><span className="text-xs font-bold text-slate-400">{label}</span>{textarea ? <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} dir={dir} rows={4} className={`${classes} resize-y leading-7`} /> : <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} dir={dir} className={classes} />}</label>;
}
