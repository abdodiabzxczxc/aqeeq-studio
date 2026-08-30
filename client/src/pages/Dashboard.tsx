import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Activity, ArrowRight, BarChart3, BellRing, CalendarDays, CheckCircle2, ChevronLeft, Clapperboard, FileText, Loader2, LogOut, MapPin, Newspaper, Settings2, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import AuditLogsPage from "./AuditLogsPage";
import CeremonySettingsPage from "./CeremonySettingsPage";
import LogoSettingsPage from "./LogoSettingsPage";
import OperationsPage from "./OperationsPage";
import UserRolesPage from "./UserRolesPage";
import { VisualEditable } from "@/components/VisualEditor";
import VisualSections from "@/components/VisualSections";
import { Reveal } from "@/components/ExperienceMotion";
import { readUrlState, withUrlState } from "@/lib/pageState";

type DashboardTab = "overview" | "events" | "activity" | "users" | "operations" | "platform";
const DASHBOARD_TABS: readonly DashboardTab[] = ["overview", "events", "activity", "users", "operations", "platform"];

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return <div className="aq-admin-panel aq-motion-card rounded-2xl p-4"><Icon size={19} className={color} /><div className="mt-3 text-2xl font-black text-amber-100">{value}</div><div className="mt-1 text-xs text-slate-500">{label}</div></div>;
}

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => readUrlState(location, "tab", DASHBOARD_TABS, "overview"));
  const hasAccess = isAuthenticated && ["admin", "coordinator", "auditor"].includes(user?.role ?? "");
  const isAdmin = user?.role === "admin";
  const canCoordinate = ["admin", "coordinator"].includes(user?.role ?? "");
  const { data: ceremonies, isLoading: ceremoniesLoading } = trpc.ceremonies.list.useQuery(undefined, { enabled: hasAccess, refetchOnWindowFocus: false });
  const { data: metrics } = trpc.ceremonies.metrics.useQuery(undefined, { enabled: hasAccess, refetchOnWindowFocus: false });
  const { data: branding } = trpc.settings.getPublicLogos.useQuery(undefined, { refetchOnWindowFocus: false });

  useEffect(() => {
    if (!loading && !hasAccess) navigate("/");
  }, [hasAccess, loading, navigate]);

  useEffect(() => {
    setActiveTab(readUrlState(location, "tab", DASHBOARD_TABS, "overview"));
  }, [location]);

  const selectTab = (tab: DashboardTab) => {
    const nextLocation = withUrlState(location, "tab", tab);
    setActiveTab(tab);
    if (nextLocation !== location) navigate(nextLocation);
  };

  const metricByCeremony = useMemo(() => new Map((metrics ?? []).map((item) => [item.ceremonyId, item])), [metrics]);
  const totals = useMemo(() => (metrics ?? []).reduce((sum, item) => ({ guests: sum.guests + Number(item.total ?? 0), attended: sum.attended + Number(item.attended ?? 0), paid: sum.paid + Number(item.paid ?? 0) }), { guests: 0, attended: 0, paid: 0 }), [metrics]);
  const tabs = [
    { id: "overview" as const, label: "لوحة التحكم", icon: BarChart3, visible: true },
    { id: "events" as const, label: "إدارة الفعاليات", icon: Sparkles, visible: isAdmin },
    { id: "activity" as const, label: "سجل النشاط", icon: Activity, visible: isAdmin || user?.role === "auditor" },
    { id: "users" as const, label: "الفريق والصلاحيات", icon: Users, visible: isAdmin },
    { id: "operations" as const, label: "الإشعارات والنسخ", icon: BellRing, visible: canCoordinate },
    { id: "platform" as const, label: "إعدادات المنصة", icon: Settings2, visible: isAdmin },
  ].filter((tab) => tab.visible);

  if (loading || ceremoniesLoading) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--dark-gradient)" }}><Loader2 className="animate-spin text-amber-400" size={30} /></div>;
  if (!hasAccess) return null;

  return <main dir="rtl" className="aq-admin-surface min-h-screen w-full overflow-x-hidden text-slate-100">
    <header className="sticky top-0 z-40 border-b border-white/[.08] bg-[#0b0e15]/90 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-3">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-200"><ArrowRight size={17} /><span className="hidden sm:inline">الرئيسية</span></button>
        <div className="flex items-center gap-3"><img src={branding?.school_logo || "/manus-storage/logo_school_b7348eaa.png"} alt="شعار المنصة" className="h-9 w-9 object-contain" /><div><VisualEditable id="dashboard-brand-title" tag="text" label="عنوان شريط لوحة الإدارة" as="div" defaultText="لوحة تحكم المنصة" className="text-sm font-black text-amber-100" /><div className="text-[11px] text-slate-500">{user?.name || "فريق العمل"}</div></div></div>
        <button onClick={() => logout()} className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:border-rose-400/40 hover:text-rose-300" aria-label="تسجيل الخروج"><LogOut size={16} /></button>
      </div>
      <div className="border-t border-white/[.07]"><nav className="container flex gap-1 overflow-x-auto py-2" aria-label="أقسام لوحة التحكم">{tabs.map((tab) => { const Icon = tab.icon; const active = activeTab === tab.id; return <button key={tab.id} onClick={() => selectTab(tab.id)} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition-all ${active ? "bg-amber-400 text-amber-950" : "text-slate-400 hover:bg-white/5 hover:text-amber-200"}`}><span className="inline-flex items-center gap-1.5"><Icon size={15} />{tab.label}</span></button>; })}</nav></div>
    </header>

    <div className="container py-8 md:py-10">
      {activeTab === "overview" && <div className="space-y-7">
        <Reveal><VisualEditable id="dashboard-overview-hero" tag="section" label="بطاقة ترحيب لوحة الإدارة" as="section" className="aq-admin-panel aq-motion-panel rounded-3xl p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><VisualEditable id="dashboard-overview-kicker" tag="text" label="شارة لوحة الإدارة" as="div" defaultText="مركز المنصة" className="aq-chapter-label" /><VisualEditable id="dashboard-overview-title" tag="text" label="عنوان ترحيب لوحة الإدارة" as="h1" defaultText={`أهلاً ${user?.name || "بك"}`} className="mt-3 text-3xl font-black text-amber-100" /><VisualEditable id="dashboard-overview-subtitle" tag="text" label="وصف لوحة الإدارة" as="p" defaultText="اختر أي فعالية للعمل داخلها دون اختلاط الضيوف أو الدعوات أو تقارير الحضور." className="mt-2 max-w-2xl text-sm leading-7 text-slate-300" /></div>{isAdmin && <div className="flex flex-wrap gap-2"><button onClick={() => navigate("/news")} className="aq-action aq-action-dark"><Newspaper size={17} />نشرة العقيق</button><button onClick={() => navigate("/live/ideas")} className="aq-action aq-action-dark"><Sparkles size={17} />خزانة التجارب</button><button onClick={() => navigate("/live")} className="aq-action aq-action-dark"><Clapperboard size={17} />Alaqeeq Live</button><VisualEditable id="dashboard-control-cta" tag="button" label="زر مركز التحكم" as="button" defaultText="مركز التحكم" onAction={() => navigate("/control")} className="aq-action aq-action-dark">{(text) => <><Settings2 size={17} /> {text}</>}</VisualEditable><button onClick={() => setActiveTab("events")} className="aq-action aq-action-gold"><Sparkles size={17} /> إنشاء أو إدارة فعالية</button></div>}</div>
        </VisualEditable></Reveal>
        <VisualSections pagePath="/dashboard" anchorId="dashboard-hero-after" />
        <Reveal delay={0.08}><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><MetricCard label="الفعاليات" value={ceremonies?.length ?? 0} icon={Sparkles} color="text-amber-400" /><MetricCard label="إجمالي الضيوف" value={totals.guests} icon={Users} color="text-sky-400" /><MetricCard label="الحضور المسجل" value={totals.attended} icon={CheckCircle2} color="text-emerald-400" /><MetricCard label="تذاكر مدفوعة" value={totals.paid} icon={FileText} color="text-violet-300" /></div></Reveal>
        <Reveal delay={0.14}><VisualEditable id="dashboard-events-section" tag="section" label="قسم مساحات الفعاليات" as="section"><div className="mb-4"><VisualEditable id="dashboard-events-title" tag="text" label="عنوان مساحات الفعاليات" as="h2" defaultText="مساحات الفعاليات" className="text-xl font-black text-amber-100" /><VisualEditable id="dashboard-events-subtitle" tag="text" label="وصف مساحات الفعاليات" as="p" defaultText="كل بطاقة تفتح موقعاً تشغيلياً مستقلاً للفعالية." className="mt-1 text-sm text-slate-500" /></div>{ceremonies?.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{ceremonies.map((event) => { const metric = metricByCeremony.get(event.id); const total = Number(metric?.total ?? 0); const attended = Number(metric?.attended ?? 0); return <button key={event.id} onClick={() => navigate(`/workspace/${event.id}`)} className="aq-motion-card group rounded-2xl border p-5 text-right" style={{ borderColor: event.isActive ? "oklch(66% 0.2 70 / 0.5)" : "oklch(25% 0.02 250)", background: "oklch(12% 0.015 250)" }}><div className="flex items-start justify-between gap-4"><div className="min-w-0"><h3 className="truncate text-base font-black text-slate-100">{event.title}</h3><p className="mt-1 text-xs text-amber-300">{event.eventType || "فعالية مخصصة"}</p></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${event.isActive ? "bg-emerald-400/10 text-emerald-300" : "bg-slate-700/50 text-slate-400"}`}>{event.isActive ? "نشطة" : "مؤرشفة"}</span></div><div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-400"><span className="inline-flex items-center gap-1"><CalendarDays size={13} className="text-amber-400" />{event.ceremonyDate || "دون موعد"}</span><span className="inline-flex items-center gap-1"><MapPin size={13} className="text-amber-400" />{event.venue || "دون مكان"}</span></div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4"><div><div className="text-lg font-black text-amber-200">{total}</div><div className="text-[11px] text-slate-500">ضيف</div></div><div><div className="text-lg font-black text-emerald-300">{attended}</div><div className="text-[11px] text-slate-500">حضور</div></div></div><div className="mt-4 text-xs font-bold text-amber-300">فتح مساحة الفعالية <ChevronLeft className="inline" size={14} /></div></button>; })}</div> : <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-500">لا توجد فعاليات حتى الآن.</div>}</VisualEditable></Reveal>
      </div>}
      {activeTab === "events" && isAdmin && <CeremonySettingsPage />}
      {activeTab === "activity" && (isAdmin || user?.role === "auditor") && <AuditLogsPage />}
      {activeTab === "users" && isAdmin && <UserRolesPage />}
      {activeTab === "operations" && canCoordinate && <OperationsPage />}
      {activeTab === "platform" && isAdmin && <LogoSettingsPage />}
      <VisualSections pagePath="/dashboard" />
    </div>
  </main>;
}
