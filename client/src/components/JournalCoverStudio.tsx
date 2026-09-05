import MediaLibrary from "@/components/MediaLibrary";
import { trpc } from "@/lib/trpc";
import { ArrowDown, ArrowUp, EyeOff, ImagePlus, Loader2, MonitorSmartphone, Save, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Override = { elementId: string; contentText: string | null; mediaUrl: string | null; alignment: "start" | "center" | "end" | "stretch" | null; fontSize: string | null; textColor: string | null };
type Field = { id: string; label: string; fallback: string; color?: boolean };
const fields: Field[] = [
  { id: "journal-brand-kicker", label: "الاسم الإنجليزي الصغير", fallback: "AL-AQEEQ JOURNAL" },
  { id: "journal-brand-name", label: "اسم المجلة", fallback: "مجلات مدارس العقيق" },
  { id: "journal-hero-badge", label: "الشارة أعلى الغلاف", fallback: "أرشيف مستقل" },
  { id: "journal-hero-title-first", label: "السطر الأول للعنوان", fallback: "كل أعداد العقيق.", color: true },
  { id: "journal-hero-title-second", label: "السطر الذهبي للعنوان", fallback: "في مكتبة واحدة.", color: true },
  { id: "journal-hero-description", label: "وصف الغلاف", fallback: "اقلب الصفحات بيدك، شارك العدد بغلافه، أو افتح كتيب الشهر الذي يجمع أعداد الأسبوع في تجربة قراءة واحدة." },
  { id: "journal-feature-one", label: "الوسم الأول", fallback: "تقليب صفحات" },
  { id: "journal-feature-two", label: "الوسم الثاني", fallback: "كتيبات شهرية تلقائية" },
  { id: "journal-feature-three", label: "الوسم الثالث", fallback: "أرشيف سنوي" },
];
const featureIds = ["journal-feature-one", "journal-feature-two", "journal-feature-three"];

function readFeatureOrder(value?: string | null) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? [...parsed.filter((id): id is string => featureIds.includes(id)), ...featureIds.filter((id) => !parsed.includes(id))] : featureIds;
  } catch { return featureIds; }
}

export default function JournalCoverStudio({ open, onClose }: { open: boolean; onClose: () => void }) {
  const utils = trpc.useUtils();
  const { data = [], isLoading } = trpc.visualEditor.list.useQuery({ pagePath: "/journal" }, { enabled: open, refetchOnWindowFocus: false });
  const [text, setText] = useState<Record<string, string>>({});
  const [colors, setColors] = useState<Record<string, string>>({});
  const [coverUrl, setCoverUrl] = useState("");
  const [coverScale, setCoverScale] = useState(1);
  const [coverAlign, setCoverAlign] = useState<"start" | "center" | "end">("center");
  const [featureOrder, setFeatureOrder] = useState<string[]>(featureIds);
  const [mediaOpen, setMediaOpen] = useState(false);
  const save = trpc.visualEditor.save.useMutation();
  const publish = trpc.visualEditor.publish.useMutation();
  const map = useMemo(() => new Map((data as Override[]).map((item) => [item.elementId, item])), [data]);

  useEffect(() => {
    if (!open) return;
    const nextText: Record<string, string> = {};
    const nextColors: Record<string, string> = {};
    fields.forEach((field) => { nextText[field.id] = map.get(field.id)?.contentText || field.fallback; nextColors[field.id] = map.get(field.id)?.textColor || (field.id === "journal-hero-title-second" ? "#fbbf24" : ""); });
    const cover = map.get("journal-cover-art");
    setText(nextText); setColors(nextColors); setCoverUrl(cover?.mediaUrl || ""); setCoverScale(Math.min(1.22, Math.max(.78, Number(cover?.fontSize || 1) || 1))); setCoverAlign((cover?.alignment === "start" || cover?.alignment === "end") ? cover.alignment : "center"); setFeatureOrder(readFeatureOrder(map.get("journal-tags-shell")?.contentText));
  }, [open, map]);

  if (!open) return null;
  const updateText = (id: string, value: string) => setText((current) => ({ ...current, [id]: value }));
  const saveAll = async () => {
    try {
      await Promise.all(fields.map((field) => save.mutateAsync({ pagePath: "/journal", elementId: field.id as Parameters<typeof save.mutateAsync>[0]["elementId"], elementTag: "text", contentText: text[field.id] || field.fallback, textColor: colors[field.id] || null })));
      await save.mutateAsync({ pagePath: "/journal", elementId: "journal-cover-art", elementTag: "image", mediaUrl: coverUrl || null, alignment: coverAlign, fontSize: String(coverScale), altText: "غلاف واجهة مجلة العقيق" });
      await save.mutateAsync({ pagePath: "/journal", elementId: "journal-tags-shell", elementTag: "section", contentText: JSON.stringify(featureOrder) });
      await Promise.all([...fields.map((field) => publish.mutateAsync({ pagePath: "/journal", elementId: field.id as Parameters<typeof publish.mutateAsync>[0]["elementId"] })), publish.mutateAsync({ pagePath: "/journal", elementId: "journal-cover-art" }), publish.mutateAsync({ pagePath: "/journal", elementId: "journal-tags-shell" })]);
      await utils.visualEditor.list.invalidate({ pagePath: "/journal" });
      await utils.visualEditor.publicList.invalidate({ pagePath: "/journal" });
      toast.success("تم نشر غلاف المجلة للزوار");
    } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر حفظ غلاف المجلة"); }
  };

  const moveFeature = (id: string, direction: -1 | 1) => setFeatureOrder((current) => { const index = current.indexOf(id); const target = index + direction; if (index < 0 || target < 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; });
  return <div className="fixed inset-0 z-[170] flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm md:items-center" dir="rtl" onMouseDown={onClose}><section className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[2rem] border border-amber-300/30 bg-[#10131d] shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><header className="flex items-start justify-between border-b border-white/[.08] p-5"><div><div className="flex items-center gap-2 text-xs font-black text-amber-300"><SlidersHorizontal size={16} />استوديو غلاف المجلة</div><h2 className="mt-1 text-xl font-black text-amber-50">تحكم في الواجهة الظاهرة للزوار</h2><p className="mt-1 text-xs leading-6 text-slate-500">عدّل النصوص والوسوم وصورة الكتيب ثم انشرها في نفس اللحظة.</p></div><button onClick={onClose} className="rounded-xl border border-white/10 p-2 text-slate-300 hover:text-white"><X size={18} /></button></header>{isLoading ? <div className="flex min-h-80 items-center justify-center"><Loader2 className="animate-spin text-amber-300" /></div> : <div className="grid max-h-[70vh] gap-5 overflow-y-auto p-5 lg:grid-cols-[1.2fr_.8fr]"><div className="space-y-4">{fields.map((field) => <label key={field.id} className="block text-xs font-bold text-slate-300">{field.label}{field.id === "journal-hero-description" ? <textarea value={text[field.id] || ""} onChange={(event) => updateText(field.id, event.target.value)} rows={3} maxLength={1500} className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-black/20 p-3 text-sm leading-6 text-white outline-none focus:border-amber-300" /> : <input value={text[field.id] || ""} onChange={(event) => updateText(field.id, event.target.value)} maxLength={200} className="mt-2 w-full rounded-xl border border-slate-700 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-300" />}{field.color ? <label className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">لون النص <input type="color" value={colors[field.id] || "#fbbf24"} onChange={(event) => setColors((current) => ({ ...current, [field.id]: event.target.value }))} className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent" /></label> : null}</label>)}<section className="rounded-2xl border border-slate-700 bg-black/15 p-3"><div className="text-xs font-black text-amber-100">ترتيب وإظهار الوسوم</div><p className="mt-1 text-[10px] text-slate-500">امسح نص أي وسم لإخفائه من الغلاف، واستخدم الأسهم لترتيبه.</p><div className="mt-3 space-y-2">{featureOrder.map((id, index) => <div key={id} className="flex items-center gap-2 rounded-xl border border-white/[.07] bg-black/20 px-2.5 py-2"><span className="min-w-0 flex-1 truncate text-[11px] font-bold text-slate-200">{text[id] || <span className="inline-flex items-center gap-1 text-slate-500"><EyeOff size={12} />مخفي</span>}</span><button onClick={() => moveFeature(id, -1)} disabled={index === 0} className="rounded-lg p-1 text-slate-300 disabled:opacity-25 hover:bg-white/10"><ArrowUp size={14} /></button><button onClick={() => moveFeature(id, 1)} disabled={index === featureOrder.length - 1} className="rounded-lg p-1 text-slate-300 disabled:opacity-25 hover:bg-white/10"><ArrowDown size={14} /></button></div>)}</div></section></div><aside className="space-y-4 rounded-2xl border border-amber-300/15 bg-black/15 p-4"><div><div className="text-xs font-black text-amber-100">صورة الكتيب الذهبية</div><p className="mt-1 text-[11px] leading-5 text-slate-500">اختَر أي صورة من مكتبة الوسائط؛ تظل هذه هي صورة غلاف الواجهة لا غلاف عدد واحد.</p><button onClick={() => setMediaOpen(true)} className="mt-3 flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-amber-300/35 bg-[#0b0e16] text-amber-200">{coverUrl ? <img src={coverUrl} alt="غلاف الواجهة" className="h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-2 text-xs font-black"><ImagePlus size={22} />اختيار أو رفع صورة</span>}</button></div><label className="block text-xs font-bold text-slate-300">حجم صورة الغلاف <span className="text-amber-200">{Math.round(coverScale * 100)}%</span><input type="range" min="0.78" max="1.22" step="0.01" value={coverScale} onChange={(event) => setCoverScale(Number(event.target.value))} className="mt-3 w-full accent-amber-300" /></label><label className="block text-xs font-bold text-slate-300">محاذاة الصورة<select value={coverAlign} onChange={(event) => setCoverAlign(event.target.value as typeof coverAlign)} className="mt-2 w-full rounded-xl border border-slate-700 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-300"><option value="center">وسط الغلاف</option><option value="start">يمين الغلاف</option><option value="end">يسار الغلاف</option></select></label><a href="/journal?visual=1" target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#08467d]/40 px-3 py-2.5 text-xs font-black text-[#f8ca14] hover:bg-[#08467d]/20"><MonitorSmartphone size={15} />فتح معاينة الجوال الكاملة</a><button onClick={() => void saveAll()} disabled={save.isPending || publish.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-black text-slate-950 disabled:opacity-50"><Save size={16} />{save.isPending || publish.isPending ? "جارٍ النشر…" : "حفظ ونشر الغلاف"}</button></aside></div>}<MediaLibrary open={mediaOpen} onClose={() => setMediaOpen(false)} accept="image" onSelect={(asset) => { setCoverUrl(asset.url); setMediaOpen(false); }} /></section></div>;
}
