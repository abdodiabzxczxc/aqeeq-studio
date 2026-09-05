import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Activity, ArrowRight, BellRing, CalendarDays, ChevronLeft, FileText, History, LayoutDashboard, Loader2, Palette, QrCode, Settings2, ShieldCheck, Sparkles, Undo2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import AttendeesPage from "./AttendeesPage";
import AuditLogsPage from "./AuditLogsPage";
import CeremonySettingsPage from "./CeremonySettingsPage";
import LiveOperationsPanel from "../components/LiveOperationsPanel";
import LogoSettingsPage from "./LogoSettingsPage";
import OperationsPage from "./OperationsPage";
import ReportsPage from "./ReportsPage";
import ScanLogsPage from "./ScanLogsPage";
import UserRolesPage from "./UserRolesPage";
import { VisualEditable } from "../components/VisualEditor";
import VisualSections from "../components/VisualSections";
import { readUrlState, withUrlState } from "../lib/pageState";

type ControlTab = "command" | "events" | "guests" | "operations" | "reports" | "identity" | "team";
const CONTROL_TABS: readonly ControlTab[] = ["command", "events", "guests", "operations", "reports", "identity", "team"];

const historySourceLabel: Record<string, string> = { manual: "تعديل يدوي", reset: "استعادة الأصل", undo: "تراجع" };

function Metric({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string | number; tone: string }) {
  return <div className="aq-admin-panel rounded-2xl p-4"><Icon size={18} className={tone} /><div className="mt-3 text-2xl font-black text-amber-100">{value}</div><div className="mt-1 text-xs text-slate-500">{label}</div></div>;
}

export default function ControlCenterPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [location, navigate] = useLocation();
  const utils = trpc.useUtils();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const [activeTab, setActiveTab] = useState<ControlTab>(() => readUrlState(location, "tab", CONTROL_TABS, "command"));
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const { data: events } = trpc.ceremonies.list.useQuery(undefined, { enabled: isAdmin, refetchOnWindowFocus: false });
  const { data: metrics } = trpc.ceremonies.metrics.useQuery(undefined, { enabled: isAdmin, refetchOnWindowFocus: false });
  const { data: fields } = trpc.controlCenter.content.list.useQuery(undefined, { enabled: isAdmin });
  const { data: contentHistory } = trpc.controlCenter.content.history.useQuery({ limit: 30 }, { enabled: isAdmin });
  const [values, setValues] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<"home" | "event">("home");
  const [previewVersion, setPreviewVersion] = useState(0);

  useEffect(() => { if (fields) setValues(Object.fromEntries(fields.map((field) => [field.key, field.value]))); }, [fields]);
  useEffect(() => { if (!loading && !isAdmin) navigate("/"); }, [loading, isAdmin, navigate]);
  useEffect(() => {
    setActiveTab(readUrlState(location, "tab", CONTROL_TABS, "command"));
  }, [location]);

  const selectedEvent = useMemo(() => {
    const preferredId = selectedEventId ?? events?.find((event) => event.isActive)?.id ?? events?.[0]?.id;
    return events?.find((event) => event.id === preferredId);
  }, [events, selectedEventId]);
  const selectedMetric = useMemo(() => metrics?.find((item) => item.ceremonyId === selectedEvent?.id), [metrics, selectedEvent]);
  const totals = useMemo(() => (metrics ?? []).reduce((sum, item) => ({ guests: sum.guests + Number(item.total ?? 0), attended: sum.attended + Number(item.attended ?? 0), paid: sum.paid + Number(item.paid ?? 0) }), { guests: 0, attended: 0, paid: 0 }), [metrics]);
  const groupedFields = useMemo(() => {
    const result: Record<string, NonNullable<typeof fields>> = {};
    for (const field of fields ?? []) (result[field.section] ??= []).push(field);
    return result;
  }, [fields]);
  const update = trpc.controlCenter.content.update.useMutation({ onSuccess: () => { toast.success("تم حفظ التعديل فوراً"); setPreviewVersion((current) => current + 1); void utils.controlCenter.content.invalidate(); void utils.controlCenter.content.history.invalidate(); } });
  const reset = trpc.controlCenter.content.reset.useMutation({ onSuccess: () => { toast.message("تمت استعادة القيمة الافتراضية"); setPreviewVersion((current) => current + 1); void utils.controlCenter.content.invalidate(); void utils.controlCenter.content.history.invalidate(); } });
  const undo = trpc.controlCenter.content.undo.useMutation({ onSuccess: () => { toast.success("تم التراجع عن التعديل"); setPreviewVersion((current) => current + 1); void utils.controlCenter.content.invalidate(); void utils.controlCenter.content.history.invalidate(); }, onError: (error) => toast.error(error.message || "تعذر التراجع") });

  const tabs: Array<{ id: ControlTab; label: string; icon: React.ElementType }> = [
    { id: "command", label: "مركز القيادة", icon: LayoutDashboard },
    { id: "events", label: "الفعاليات", icon: Sparkles },
    { id: "guests", label: "الضيوف والدعوات", icon: Users },
    { id: "operations", label: "التشغيل والإشعارات", icon: Activity },
    { id: "reports", label: "التقارير", icon: FileText },
    { id: "identity", label: "الموقع والهوية", icon: Palette },
    { id: "team", label: "الفريق والسجل", icon: ShieldCheck },
  ];

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#090b12]"><Loader2 className="animate-spin text-amber-400" size={30} /></div>;
  if (!isAdmin) return null;

  const switchTab = (tab: ControlTab) => {
    const nextLocation = withUrlState(location, "tab", tab);
    setActiveTab(tab);
    if (nextLocation !== location) navigate(nextLocation);
  };
  const selectedId = selectedEvent?.id;
  const previewSource = previewMode === "event" && selectedId ? `/event/${selectedId}?controlPreview=${previewVersion}` : `/?controlPreview=${previewVersion}`;

  return <main dir="rtl" className="aq-admin-surface min-h-screen text-slate-100">
    <header className="sticky top-0 z-40 border-b border-white/[.08] bg-[#0b0e15]/90 backdrop-blur-xl"><div className="container flex h-16 items-center justify-between gap-3"><button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-amber-200"><ArrowRight size={16} />المنصة</button><div className="flex items-center gap-2"><div className="hidden text-left sm:block"><VisualEditable id="control-brand-title" tag="text" label="عنوان مركز الإدارة" as="div" defaultText="مركز الإدارة الشامل" className="text-xs font-black text-amber-100" /><VisualEditable id="control-brand-subtitle" tag="text" label="وصف مركز الإدارة" as="div" defaultText="كل وحدة تشغيلية في مساحة واحدة" className="text-[10px] text-slate-500" /></div><div className="rounded-full border border-amber-300/25 bg-amber-300/[.08] p-2 text-amber-300"><Settings2 size={18} /></div></div></div><div className="border-t border-white/[.06]"><nav className="container flex gap-1 overflow-x-auto py-2">{tabs.map((tab) => { const Icon = tab.icon; const active = activeTab === tab.id; return <button key={tab.id} onClick={() => switchTab(tab.id)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition ${active ? "bg-amber-400 text-amber-950" : "text-slate-400 hover:bg-white/[0.06] hover:text-amber-100"}`}><Icon size={14} />{tab.label}</button>; })}</nav></div></header>

    <div className="container py-7 md:py-9">
      <VisualEditable id="control-hero-section" tag="section" label="بطاقة قيادة مركز الإدارة" as="section" className="aq-admin-panel rounded-3xl p-5 md:p-7"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><VisualEditable id="control-hero-kicker" tag="text" label="شارة وضع المدير" as="div" defaultText="وضع المدير" className="aq-chapter-label">{(text) => <><Sparkles size={15} />{text}</>}</VisualEditable><VisualEditable id="control-hero-title" tag="text" label="عنوان قيادة مركز الإدارة" as="h1" defaultText="تحكّم في المنصة، لا في صفحة واحدة" className="mt-3 text-2xl font-black text-amber-100 md:text-3xl" /><VisualEditable id="control-hero-subtitle" tag="text" label="وصف قيادة مركز الإدارة" as="p" defaultText="اختر فعالية، ثم أدِر ضيوفها ودعواتها وبواباتها وتشغيلها وتقاريرها من هذه المساحة مع أدوات تحرير بصري مباشرة." className="mt-2 max-w-2xl text-sm leading-7 text-slate-400" /></div><div className="min-w-[250px]"><label className="mb-2 block text-[11px] font-bold text-slate-500">الفعالية التي تعمل عليها الآن</label><select value={selectedId ?? ""} onChange={(event) => setSelectedEventId(Number(event.target.value))} disabled={!events?.length} className="w-full rounded-xl border border-amber-400/25 bg-black/35 px-3 py-3 text-sm font-bold text-amber-100 outline-none focus:border-amber-400"><option value="">لا توجد فعاليات</option>{events?.map((event) => <option key={event.id} value={event.id}>{event.title}{event.isActive ? " · نشطة" : ""}</option>)}</select></div></div></VisualEditable>

      {activeTab === "command" && <div className="mt-7 space-y-6"><section className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Metric icon={Sparkles} label="الفعاليات" value={events?.length ?? 0} tone="text-amber-400" /><Metric icon={Users} label="إجمالي الضيوف" value={totals.guests} tone="text-[#f8ca14]" /><Metric icon={QrCode} label="الحضور المسجل" value={totals.attended} tone="text-emerald-300" /><Metric icon={BellRing} label="تذاكر مدفوعة" value={totals.paid} tone="text-amber-200" /></section><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[{ tab: "events" as const, icon: Sparkles, title: "إدارة الفعاليات", text: "إنشاء الفعالية، هويتها، سعتها، قطاعاتها وبواباتها." }, { tab: "guests" as const, icon: Users, title: "الضيوف والدعوات", text: "إضافة وتعديل واستيراد الضيوف وتصدير الدعوات PNG." }, { tab: "operations" as const, icon: Activity, title: "التشغيل الحي", text: "متابعة البوابات، السجل، الإشعارات والنسخ الاحتياطي." }, { tab: "identity" as const, icon: Palette, title: "الموقع والهوية", text: "تحرير النصوص والشعارات والعناوين مع سجل تراجع." }].map((item) => { const Icon = item.icon; return <button key={item.tab} onClick={() => switchTab(item.tab)} className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 text-right transition hover:-translate-y-0.5 hover:border-amber-400/35"><div className="flex items-center justify-between"><div className="rounded-xl bg-amber-400/10 p-2 text-amber-300"><Icon size={18} /></div><ChevronLeft size={16} className="text-slate-500 transition group-hover:-translate-x-1 group-hover:text-amber-300" /></div><h2 className="mt-5 font-black text-slate-100">{item.title}</h2><p className="mt-2 text-xs leading-6 text-slate-500">{item.text}</p></button>; })}</section>{selectedEvent ? <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><div className="text-xs font-bold text-amber-300">الفعالية المحددة</div><h2 className="mt-1 text-xl font-black text-amber-100">{selectedEvent.title}</h2><p className="mt-1 text-sm text-slate-500">{selectedEvent.venue || "دون مكان محدد"} · {selectedEvent.ceremonyDate || "دون تاريخ"}</p></div><div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-black/20 px-4 py-3"><div className="font-black text-amber-200">{Number(selectedMetric?.total ?? 0)}</div><div className="mt-1 text-[10px] text-slate-500">ضيف</div></div><div className="rounded-xl bg-black/20 px-4 py-3"><div className="font-black text-emerald-300">{Number(selectedMetric?.attended ?? 0)}</div><div className="mt-1 text-[10px] text-slate-500">حضر</div></div><div className="rounded-xl bg-black/20 px-4 py-3"><div className="font-black text-amber-200">{selectedEvent.capacity}</div><div className="mt-1 text-[10px] text-slate-500">السعة</div></div></div></div><div className="mt-5 grid gap-2 sm:grid-cols-4"><button onClick={() => switchTab("guests")} className="rounded-xl border border-slate-700 p-3 text-xs font-bold text-slate-200 hover:border-amber-400/40">إدارة الضيوف</button><button onClick={() => switchTab("operations")} className="rounded-xl border border-slate-700 p-3 text-xs font-bold text-slate-200 hover:border-amber-400/40">تشغيل وحضور</button><button onClick={() => switchTab("reports")} className="rounded-xl border border-slate-700 p-3 text-xs font-bold text-slate-200 hover:border-amber-400/40">التقارير</button><button onClick={() => navigate(`/workspace/${selectedEvent.id}`)} className="rounded-xl bg-amber-400 p-3 text-xs font-black text-amber-950">فتح مساحة الفعالية</button></div></section> : <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">أنشئ فعالية أولاً لتظهر أدوات الإدارة التشغيلية.</div>}</div>}

      {activeTab === "events" && <section className="mt-7 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 md:p-7"><CeremonySettingsPage /></section>}
      {activeTab === "guests" && <section className="mt-7">{selectedId ? <AttendeesPage ceremonyId={selectedId} /> : <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-500">اختر فعالية من أعلى المركز لإدارة ضيوفها ودعواتها.</div>}</section>}
      {activeTab === "operations" && <section className="mt-7 space-y-6">{selectedEvent && selectedId ? <><LiveOperationsPanel ceremonyId={selectedId} gates={selectedEvent.gates} brandColor={selectedEvent.brandColor} onOpenScanner={() => navigate(`/scan?ceremonyId=${selectedId}`)} /><ScanLogsPage ceremonyId={selectedId} /></> : null}<OperationsPage ceremonyId={selectedId} showBackup /></section>}
      {activeTab === "reports" && <section className="mt-7 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 md:p-7">{selectedId ? <ReportsPage ceremonyId={selectedId} /> : <div className="p-10 text-center text-sm text-slate-500">اختر فعالية لعرض تقاريرها التنفيذية.</div>}</section>}
      {activeTab === "identity" && <section className="mt-7 overflow-hidden rounded-3xl border border-amber-400/20 bg-white/[0.025]"><div className="flex flex-col gap-4 border-b border-white/[0.08] p-5 md:flex-row md:items-center md:justify-between"><div><div className="text-xs font-bold text-amber-300">معاينة سياقية</div><h2 className="mt-1 font-black text-amber-100">شاهد النتيجة قبل مغادرة مركز الإدارة</h2><p className="mt-1 text-xs leading-5 text-slate-500">تتحدث المعاينة مع البيانات الفعلية؛ استخدم التحديث بعد أي تغيير يدوي.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setPreviewMode("home")} className={`rounded-lg px-3 py-2 text-xs font-bold ${previewMode === "home" ? "bg-amber-400 text-amber-950" : "border border-slate-700 text-slate-300"}`}>الصفحة الرئيسية</button>{selectedId ? <button onClick={() => setPreviewMode("event")} className={`rounded-lg px-3 py-2 text-xs font-bold ${previewMode === "event" ? "bg-amber-400 text-amber-950" : "border border-slate-700 text-slate-300"}`}>صفحة الفعالية</button> : null}<button onClick={() => setPreviewVersion((current) => current + 1)} className="rounded-lg border border-amber-400/30 px-3 py-2 text-xs font-bold text-amber-200">تحديث المعاينة</button></div></div><div className="bg-black/30 p-3"><iframe key={previewSource} src={previewSource} title="معاينة الصفحة" className="h-[560px] w-full rounded-2xl border border-slate-800 bg-[#090b12]" /></div></section>}
      {activeTab === "identity" && <div className="mt-7 space-y-7"><section className="rounded-3xl border border-amber-400/20 bg-white/[0.025] p-5 md:p-7"><div className="mb-6 flex items-start gap-3"><div className="rounded-xl bg-amber-400/10 p-2 text-amber-300"><Palette size={19} /></div><div><h2 className="font-black text-amber-100">هوية المنصة وشعاراتها</h2><p className="mt-1 text-sm leading-6 text-slate-400">غيّر الشعار والعناوين هنا مباشرة. لا يستخدم النظام الذكاء الاصطناعي لتعديل الشعار.</p></div></div><LogoSettingsPage /></section><section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 md:p-7"><div className="mb-6"><h2 className="font-black text-amber-100">نصوص الموقع المباشرة</h2><p className="mt-1 text-sm text-slate-500">تنعكس التعديلات على الواجهة فور الحفظ، وتُسجّل لتستطيع التراجع عنها.</p></div><div className="grid gap-6 xl:grid-cols-[1fr_320px]"><div className="space-y-5">{Object.entries(groupedFields).map(([section, group]) => <div key={section} className="rounded-2xl border border-white/[0.07] bg-black/15 p-4"><h3 className="font-black text-slate-200">{section}</h3><div className="mt-4 space-y-4">{group.map((field) => <div key={field.key} className="rounded-xl border border-slate-800 bg-black/20 p-3"><div className="mb-2 flex items-center justify-between gap-3"><label className="text-sm font-bold text-slate-200">{field.label}</label><code className="text-[10px] text-slate-600">{field.key}</code></div>{field.valueType === "textarea" ? <textarea value={values[field.key] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} className="min-h-24 w-full rounded-lg border border-slate-700 bg-black/25 p-3 text-sm text-slate-100 outline-none focus:border-amber-400/60" /> : <input value={values[field.key] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} className="w-full rounded-lg border border-slate-700 bg-black/25 p-3 text-sm text-slate-100 outline-none focus:border-amber-400/60" />}<div className="mt-3 flex gap-2"><button disabled={update.isPending || values[field.key] === field.value} onClick={() => update.mutate({ key: field.key, value: values[field.key] })} className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-black text-amber-950 disabled:opacity-40">حفظ الآن</button><button disabled={reset.isPending} onClick={() => reset.mutate({ key: field.key })} className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-bold text-slate-300">استعادة الأصل</button></div></div>)}</div></div>)}</div><aside className="h-fit rounded-2xl border border-white/[0.07] bg-black/15 p-4"><div className="flex items-center gap-2 text-amber-100"><History size={16} className="text-amber-400" /><h3 className="font-black">سجل التعديلات</h3></div><div className="mt-4 space-y-3">{contentHistory?.length ? contentHistory.map((item) => <div key={item.id} className="rounded-xl border border-white/[0.06] bg-black/20 p-3"><div className="flex items-start justify-between gap-2"><div><div className="text-xs font-bold text-slate-200">{historySourceLabel[item.source] || item.source}</div><code className="mt-1 block text-[10px] text-slate-500">{item.contentKey}</code></div>{!item.revertedAt && (item.source === "manual" || item.source === "reset") ? <button onClick={() => undo.mutate({ id: item.id })} disabled={undo.isPending} className="inline-flex items-center gap-1 rounded-lg border border-amber-400/30 px-2 py-1 text-[10px] font-bold text-amber-200 disabled:opacity-50"><Undo2 size={11} />تراجع</button> : <span className="text-[10px] text-slate-600">{item.revertedAt ? "تم التراجع" : "سجل"}</span>}</div><p className="mt-2 line-clamp-2 text-[11px] leading-5 text-slate-400">{item.newValue}</p></div>) : <p className="rounded-xl bg-black/20 p-3 text-xs text-slate-500">لا توجد تعديلات بعد.</p>}</div></aside></div></section></div>}
      {activeTab === "team" && <div className="mt-7 grid gap-7 xl:grid-cols-[0.9fr_1.1fr]"><section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 md:p-7"><UserRolesPage /></section><section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 md:p-7"><AuditLogsPage /></section></div>}
      <VisualSections pagePath="/control" />
    </div>
  </main>;
}
