import { useEffect, useState } from "react";
import { CalendarDays, Check, Loader2, MapPin, Plus, Save, Sparkles, Users, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../lib/trpc";
import { EVENT_TYPE_LABELS } from "../../../shared/types";
import { VisualEditable } from "../components/VisualEditor";

function TokenEditor({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const tokens = value.split(",").map((token) => token.trim()).filter(Boolean);
  const add = () => { const next = draft.trim(); if (next && !tokens.includes(next)) onChange([...tokens, next].join(", ")); setDraft(""); };
  const remove = (token: string) => onChange(tokens.filter((item) => item !== token).join(", "));
  return <div className="text-sm text-slate-300"><div className="mb-1.5">{label}</div><div className="rounded-xl bg-black/40 border border-slate-700 p-2"><div className="flex flex-wrap gap-1.5 mb-2">{tokens.map((token) => <span key={token} className="inline-flex items-center gap-1 rounded-lg bg-amber-400/10 border border-amber-400/20 px-2 py-1 text-xs text-amber-200">{token}<button type="button" onClick={() => remove(token)} aria-label={`حذف ${token}`} className="text-slate-400 hover:text-[#de191e]"><X size={12} /></button></span>)}</div><div className="flex gap-2"><input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent px-1 py-1 text-slate-100 outline-none" /><button type="button" onClick={add} className="rounded-lg bg-amber-400/15 px-2.5 py-1 text-xs font-bold text-amber-200 hover:bg-amber-400/25">إضافة</button></div></div></div>;
}

const emptyForm = {
  title: "فعالية جديدة",
  eventType: "custom",
  subtitle: "أهلاً بكم في فعاليتنا",
  logoUrl: "",
  brandColor: "#c9a84c",
  fontFamily: "Tajawal",
  templateId: "royal",
  invitationTitle: "",
  invitationSubtitle: "",
  sections: "",
  gates: "",
  seatLabels: "",
  venue: "",
  ceremonyDate: "",
  ceremonyTime: "",
  capacity: 1000,
};

export default function CeremonySettingsPage({ ceremonyId }: { ceremonyId?: number }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const ceremonies = trpc.ceremonies.list.useQuery();
  const metrics = trpc.ceremonies.metrics.useQuery();
  const selectedCeremony = ceremonyId ? ceremonies.data?.find((item) => item.id === ceremonyId) : ceremonies.data?.find((item) => item.isActive);
  const metricByCeremony = new Map((metrics.data ?? []).map((item) => [item.ceremonyId, item]));
  const utils = trpc.useUtils();
  const createMutation = trpc.ceremonies.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الفعالية بنجاح");
      setForm(emptyForm);
      utils.ceremonies.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const updateMutation = trpc.ceremonies.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث بيانات الفعالية");
      setEditingId(null);
      setForm(emptyForm);
      utils.ceremonies.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const activateMutation = trpc.ceremonies.activate.useMutation({
    onSuccess: () => {
      toast.success("تم تفعيل الفعالية الحالية");
      utils.ceremonies.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (selectedCeremony && (!editingId || ceremonyId)) {
      if (ceremonyId) setEditingId(ceremonyId);
      setForm({
        title: selectedCeremony.title,
        eventType: selectedCeremony.eventType ?? "custom",
        subtitle: selectedCeremony.subtitle ?? "",
        logoUrl: selectedCeremony.logoUrl ?? "",
        brandColor: selectedCeremony.brandColor ?? "#c9a84c",
        fontFamily: selectedCeremony.fontFamily ?? "Tajawal",
        templateId: selectedCeremony.templateId ?? "royal",
        invitationTitle: selectedCeremony.invitationTitle ?? "",
        invitationSubtitle: selectedCeremony.invitationSubtitle ?? "",
        sections: selectedCeremony.sections ?? "",
        gates: selectedCeremony.gates ?? "",
        seatLabels: selectedCeremony.seatLabels ?? "",
        venue: selectedCeremony.venue ?? "",
        ceremonyDate: selectedCeremony.ceremonyDate ?? "",
        ceremonyTime: selectedCeremony.ceremonyTime ?? "",
        capacity: selectedCeremony.capacity,
      });
    }
  }, [selectedCeremony, editingId, ceremonyId]);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const field = (key: keyof typeof form, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  const save = () => {
    if (!form.title.trim()) {
      toast.error("اكتب اسم الفعالية أولاً");
      return;
    }
    const payload = { ...form, fontFamily: form.fontFamily as "Tajawal" | "Cairo" | "Amiri" | "Noto Kufi Arabic", templateId: form.templateId as "royal" | "minimal" | "modern" };
    if (editingId) updateMutation.mutate({ id: editingId, ...payload });
    else createMutation.mutate(payload);
  };

  return (
    <div className="space-y-5">
      <VisualEditable id="settings-header-section" tag="section" label="ترويسة إعدادات الفعالية" as="section" className="flex items-center justify-between">
        <div>
          <VisualEditable id="settings-title" tag="text" label="عنوان إعدادات الفعالية" as="h2" defaultText={ceremonyId ? "إعدادات الفعالية" : "إدارة الفعاليات"} className="text-xl font-black text-amber-100" />
          <VisualEditable id="settings-subtitle" tag="text" label="وصف إعدادات الفعالية" as="p" defaultText={ceremonyId ? "عدّل هوية الفعالية ومعلوماتها والقطاعات والبوابات والمقاعد." : "أنشئ فعاليات مختلفة وحدد نوعها ومعلوماتها لتظهر في الصفحة والدعوات والتقارير."} className="mt-1 text-sm text-slate-400" />
        </div>
        {!ceremonyId && <button
          type="button"
          onClick={() => { setEditingId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-amber-950"
          style={{ background: "var(--gold-gradient)" }}
        >
          <Plus size={16} /> فعالية جديدة
        </button>}
      </VisualEditable>

      <div className={ceremonyId ? "max-w-4xl" : "grid lg:grid-cols-[1.1fr_0.9fr] gap-5"}>
        <section className="card-dark rounded-2xl border p-5" style={{ borderColor: "oklch(28% 0.025 250)" }}>
          <div className="flex items-center gap-2 mb-5 text-amber-200"><Sparkles size={18} /><h3 className="font-bold">بيانات الفعالية</h3></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="text-sm text-slate-300">نوع الفعالية
              <select value={form.eventType} onChange={(e) => field("eventType", e.target.value)} className="mt-1.5 w-full rounded-xl bg-black/40 border border-slate-700 px-3 py-2.5 text-slate-100">{Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            </label>
            <label className="text-sm text-slate-300">اسم الفعالية
              <input value={form.title} onChange={(e) => field("title", e.target.value)} className="mt-1.5 w-full rounded-xl bg-black/40 border border-slate-700 px-3 py-2.5 text-slate-100" />
            </label>
            <label className="sm:col-span-2 text-sm text-slate-300">الوصف الترحيبي
              <textarea value={form.subtitle} onChange={(e) => field("subtitle", e.target.value)} rows={2} className="mt-1.5 w-full rounded-xl bg-black/40 border border-slate-700 px-3 py-2.5 text-slate-100" />
            </label>
            <label className="text-sm text-slate-300">رابط شعار الفعالية
              <input value={form.logoUrl} onChange={(e) => field("logoUrl", e.target.value)} placeholder="https://... أو رابط التخزين" className="mt-1.5 w-full rounded-xl bg-black/40 border border-slate-700 px-3 py-2.5 text-slate-100" />
            </label>
            <label className="text-sm text-slate-300">اللون المميز
              <span className="mt-1.5 flex items-center gap-2 rounded-xl bg-black/40 border border-slate-700 px-3 py-2"><input type="color" value={form.brandColor} onChange={(e) => field("brandColor", e.target.value)} className="h-8 w-10 rounded cursor-pointer bg-transparent border-0" /><span className="text-xs text-slate-400">{form.brandColor}</span></span>
            </label>
            <label className="text-sm text-slate-300">قالب الهوية
              <select value={form.templateId} onChange={(e) => field("templateId", e.target.value)} className="mt-1.5 w-full rounded-xl bg-black/40 border border-slate-700 px-3 py-2.5 text-slate-100"><option value="royal">ملكي — ذهبي احتفالي</option><option value="minimal">هادئ — بسيط وأنيق</option><option value="modern">عصري — تباين واضح</option></select>
            </label>
            <label className="text-sm text-slate-300">خط الدعوة
              <select value={form.fontFamily} onChange={(e) => field("fontFamily", e.target.value)} className="mt-1.5 w-full rounded-xl bg-black/40 border border-slate-700 px-3 py-2.5 text-slate-100"><option value="Tajawal">Tajawal</option><option value="Cairo">Cairo</option><option value="Amiri">Amiri</option><option value="Noto Kufi Arabic">Noto Kufi Arabic</option></select>
            </label>
            <label className="text-sm text-slate-300">عنوان الدعوة
              <input value={form.invitationTitle} onChange={(e) => field("invitationTitle", e.target.value)} placeholder="يُستخدم اسم الفعالية تلقائياً إن تركته فارغاً" className="mt-1.5 w-full rounded-xl bg-black/40 border border-slate-700 px-3 py-2.5 text-slate-100" />
            </label>
            <label className="sm:col-span-2 text-sm text-slate-300">نص الدعوة
              <textarea value={form.invitationSubtitle} onChange={(e) => field("invitationSubtitle", e.target.value)} rows={2} placeholder="نص ترحيبي مخصص للدعوة الرقمية" className="mt-1.5 w-full rounded-xl bg-black/40 border border-slate-700 px-3 py-2.5 text-slate-100" />
            </label>
            <label className="text-sm text-slate-300">المكان
              <span className="relative block mt-1.5"><MapPin size={15} className="absolute right-3 top-3 text-amber-400" /><input value={form.venue} onChange={(e) => field("venue", e.target.value)} placeholder="اسم القاعة أو المسرح" className="w-full rounded-xl bg-black/40 border border-slate-700 pr-9 pl-3 py-2.5 text-slate-100" /></span>
            </label>
            <TokenEditor label="القطاعات / القاعات" value={form.sections} onChange={(value) => field("sections", value)} placeholder="اكتب قطاعاً ثم اضغط إضافة" />
            <TokenEditor label="البوابات" value={form.gates} onChange={(value) => field("gates", value)} placeholder="اكتب بوابة ثم اضغط إضافة" />
            <TokenEditor label="المقاعد" value={form.seatLabels} onChange={(value) => field("seatLabels", value)} placeholder="مثال: A-01 ثم اضغط إضافة" />
            <div className="sm:col-span-2 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5 text-xs leading-6 text-slate-500">تُدار قائمة المقاعد هنا، ويمكن ربط المقعد المحدد بالضيف من خلال حقل <span className="text-slate-300">رقم المقعد</span> في بطاقة الضيف.</div>
            <label className="text-sm text-slate-300">السعة
              <span className="relative block mt-1.5"><Users size={15} className="absolute right-3 top-3 text-amber-400" /><input type="number" min={1} value={form.capacity} onChange={(e) => field("capacity", Number(e.target.value))} className="w-full rounded-xl bg-black/40 border border-slate-700 pr-9 pl-3 py-2.5 text-slate-100" /></span>
            </label>
            <label className="text-sm text-slate-300">التاريخ
              <span className="relative block mt-1.5"><CalendarDays size={15} className="absolute right-3 top-3 text-amber-400" /><input type="date" value={form.ceremonyDate} onChange={(e) => field("ceremonyDate", e.target.value)} className="w-full rounded-xl bg-black/40 border border-slate-700 pr-9 pl-3 py-2.5 text-slate-100" /></span>
            </label>
            <label className="text-sm text-slate-300">الوقت
              <input type="time" value={form.ceremonyTime} onChange={(e) => field("ceremonyTime", e.target.value)} className="mt-1.5 w-full rounded-xl bg-black/40 border border-slate-700 px-3 py-2.5 text-slate-100" />
            </label>
          </div>
          <div className="flex gap-2 mt-5">
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300"><X size={15} /></button>}
            <button type="button" disabled={isPending} onClick={save} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-amber-950 disabled:opacity-50" style={{ background: "var(--gold-gradient)" }}>
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingId ? "حفظ تعديلات الفعالية" : "حفظ الفعالية"}
            </button>
          </div>
        </section>

        {!ceremonyId && <section className="space-y-3">
          <h3 className="font-bold text-amber-100">الفعاليات المحفوظة</h3>
          {ceremonies.isLoading ? <div className="card-dark rounded-2xl p-8 text-center text-slate-400"><Loader2 className="animate-spin mx-auto" /></div> : ceremonies.data?.length ? ceremonies.data.map((ceremony) => (
            <div key={ceremony.id} className="card-dark rounded-2xl border p-4" style={{ borderColor: ceremony.isActive ? "oklch(66% 0.20 70 / 0.55)" : "oklch(25% 0.02 250)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><div className="font-bold text-slate-100 truncate">{ceremony.title}</div><div className="text-xs text-amber-300 mt-1">{EVENT_TYPE_LABELS[ceremony.eventType as keyof typeof EVENT_TYPE_LABELS] || "فعالية مخصصة"}</div><div className="text-xs text-slate-400 mt-1">{ceremony.venue || "لم يُحدد المكان"} · السعة {ceremony.capacity}</div><div className="grid grid-cols-4 gap-2 mt-3 text-[11px]"><span className="rounded-lg bg-slate-900/70 px-2 py-1.5 text-slate-300">ضيوف <b className="text-amber-300">{metricByCeremony.get(ceremony.id)?.total ?? 0}</b></span><span className="rounded-lg bg-slate-900/70 px-2 py-1.5 text-slate-300">حضور <b className="text-emerald-300">{metricByCeremony.get(ceremony.id)?.attended ?? 0}</b></span><span className="rounded-lg bg-slate-900/70 px-2 py-1.5 text-slate-300">مدفوع <b className="text-[#f8ca14]">{metricByCeremony.get(ceremony.id)?.paid ?? 0}</b></span><span className="rounded-lg bg-slate-900/70 px-2 py-1.5 text-slate-300">إشغال <b className="text-amber-200">{ceremony.capacity ? Math.round(Number(metricByCeremony.get(ceremony.id)?.total ?? 0) / ceremony.capacity * 100) : 0}%</b></span></div><div className="mt-2 space-y-1 text-[11px] text-slate-500">{ceremony.sections && <div>القطاعات: <span className="text-slate-300">{ceremony.sections}</span></div>}{ceremony.gates && <div>البوابات: <span className="text-slate-300">{ceremony.gates}</span></div>}{ceremony.seatLabels && <div>المقاعد: <span className="text-slate-300">{ceremony.seatLabels}</span></div>}</div></div>
                {ceremony.isActive && <span className="flex items-center gap-1 text-xs text-emerald-400"><Check size={14} /> نشط</span>}
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => { setEditingId(ceremony.id); setForm({ title: ceremony.title, eventType: ceremony.eventType ?? "custom", subtitle: ceremony.subtitle ?? "", logoUrl: ceremony.logoUrl ?? "", brandColor: ceremony.brandColor ?? "#c9a84c", fontFamily: ceremony.fontFamily ?? "Tajawal", templateId: ceremony.templateId ?? "royal", invitationTitle: ceremony.invitationTitle ?? "", invitationSubtitle: ceremony.invitationSubtitle ?? "", sections: ceremony.sections ?? "", gates: ceremony.gates ?? "", seatLabels: ceremony.seatLabels ?? "", venue: ceremony.venue ?? "", ceremonyDate: ceremony.ceremonyDate ?? "", ceremonyTime: ceremony.ceremonyTime ?? "", capacity: ceremony.capacity }); }} className="flex-1 rounded-lg border border-slate-700 py-2 text-xs text-slate-300 hover:bg-slate-800">تعديل</button>
                {!ceremony.isActive && <button type="button" onClick={() => activateMutation.mutate({ id: ceremony.id })} className="flex-1 rounded-lg py-2 text-xs font-bold text-amber-950" style={{ background: "var(--gold-gradient)" }}>تفعيل</button>}
              </div>
            </div>
          )) : <div className="card-dark rounded-2xl p-6 text-center text-sm text-slate-400">لا توجد فعاليات محفوظة. أنشئ أول فعالية من النموذج.</div>}
        </section>}
      </div>
    </div>
  );
}
