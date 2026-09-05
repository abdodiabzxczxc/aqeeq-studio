import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  AlertTriangle,
  BarChart3,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CircleDot,
  DoorOpen,
  FileText,
  Loader2,
  MapPin,
  Palette,
  QrCode,
  Radio,
  Scan,
  Settings2,
  Sparkles,
  TimerReset,
  Users,
  Crown,
  MoreHorizontal,
  Archive,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import AttendeesPage from "./AttendeesPage";
import CeremonySettingsPage from "./CeremonySettingsPage";
import OperationsPage from "./OperationsPage";
import ReportsPage from "./ReportsPage";
import ScanLogsPage from "./ScanLogsPage";
import { getEventExperience, WorkspaceAction } from "../lib/eventExperience";
import { getInvitationTemplate } from "../lib/invitationDesign";
import LiveOperationsPanel from "../components/LiveOperationsPanel";
import EventDayCommandCenter from "../components/EventDayCommandCenter";
import EventReadinessBoard from "../components/EventReadinessBoard";
import InvitationDesigner from "../components/InvitationDesigner";
import { VisualEditable } from "../components/VisualEditor";
import VisualSections from "../components/VisualSections";
import MaisonStudioPage from "./MaisonStudioPage";
import JourneyStep from "../components/JourneyStep";
import EventLaunchChecklist from "../components/EventLaunchChecklist";
import { Reveal } from "../components/ExperienceMotion";
import { readUrlState, withUrlState } from "../lib/pageState";

type WorkspaceTab = "overview" | "command" | "guests" | "invitation" | "maison" | "operations" | "reports" | "settings";
const WORKSPACE_TABS: readonly WorkspaceTab[] = ["overview", "command", "guests", "invitation", "maison", "operations", "reports", "settings"];

function WorkspaceStat({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="aq-admin-panel aq-motion-card rounded-2xl p-4">
      <Icon size={19} className={color} />
      <div className="mt-3 text-2xl font-black text-amber-100">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}

export default function EventWorkspacePage({ id }: { id?: string }) {
  const { user, isAuthenticated, loading } = useAuth();
  const [location, navigate] = useLocation();
  const eventId = Number(id);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(() => readUrlState(location, "tab", WORKSPACE_TABS, "overview"));
  const [moreOpen, setMoreOpen] = useState(false);
  const allowedRoles = ["admin", "coordinator", "auditor"];
  const hasWorkspaceAccess = isAuthenticated && allowedRoles.includes(user?.role ?? "");
  const { data: event, isLoading: eventLoading } = trpc.ceremonies.public.useQuery(Number.isFinite(eventId) && eventId > 0 ? { id: eventId } : undefined);
  const { data: stats, refetch: refetchStats } = trpc.attendees.stats.useQuery(Number.isFinite(eventId) && eventId > 0 ? { ceremonyId: eventId } : undefined, { staleTime: 60_000, refetchOnWindowFocus: false, refetchInterval: false });
  const { data: platformBranding } = trpc.settings.getPublicLogos.useQuery(undefined, { refetchOnWindowFocus: false });

  useEffect(() => {
    if (!loading && !hasWorkspaceAccess) navigate("/");
  }, [loading, hasWorkspaceAccess, navigate]);

  useEffect(() => {
    setActiveTab(readUrlState(location, "tab", WORKSPACE_TABS, "overview"));
  }, [location]);

  const selectTab = (tab: WorkspaceTab) => {
    const nextLocation = withUrlState(location, "tab", tab);
    setActiveTab(tab);
    if (nextLocation !== location) navigate(nextLocation);
  };

  const attendanceRate = stats?.total ? Math.round((stats.attended / stats.total) * 100) : 0;
  const canManageGuests = ["admin", "coordinator"].includes(user?.role ?? "");
  const canOperate = ["admin", "coordinator"].includes(user?.role ?? "");
  const canConfigure = user?.role === "admin";
  const tabs = useMemo(() => [
    { id: "overview" as const, label: "ابدأ", icon: BarChart3, visible: true },
    { id: "guests" as const, label: "٢. ادعُ", icon: Users, visible: canManageGuests },
    { id: "command" as const, label: "٣. شغّل", icon: Radio, visible: canOperate },
    { id: "reports" as const, label: "٥. احفظ", icon: FileText, visible: true },
  ].filter((tab) => tab.visible), [canConfigure, canManageGuests, canOperate]);
  const advancedTabs = useMemo(() => [
    { id: "settings" as const, label: "١. صمّم", icon: Settings2, visible: canConfigure },
    { id: "invitation" as const, label: "٢. مصمم الدعوة", icon: Palette, visible: canConfigure },
    { id: "maison" as const, label: "٤. وثّق", icon: Crown, visible: canConfigure },
    { id: "operations" as const, label: "التشغيل والحضور", icon: Scan, visible: canOperate },
  ].filter((tab) => tab.visible), [canConfigure, canOperate]);
  const advancedActive = advancedTabs.find((tab) => tab.id === activeTab);

  if (loading || eventLoading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--dark-gradient)" }}><Loader2 className="animate-spin text-amber-400" size={30} /></div>;
  }

  if (!event || !hasWorkspaceAccess) {
    return <div className="min-h-screen flex items-center justify-center p-6 text-center" style={{ background: "var(--dark-gradient)" }}><div className="max-w-sm"><Sparkles className="mx-auto text-amber-400 mb-4" size={32} /><h1 className="text-2xl font-black text-amber-100">الفعالية غير متاحة</h1><p className="mt-2 text-sm text-slate-400">تأكد من الرابط أو ارجع إلى قائمة فعالياتك.</p><button onClick={() => navigate("/")} className="mt-6 rounded-xl px-5 py-3 font-bold text-amber-950" style={{ background: "var(--gold-gradient)" }}>كل الفعاليات</button></div></div>;
  }

  const brandColor = event.brandColor || "#c9a84c";
  const eventSignature = getInvitationTemplate(event.templateId);
  const logo = event.logoUrl || platformBranding?.ceremony_logo || platformBranding?.school_logo || "/manus-storage/logo_school_b7348eaa.png";
  const experience = getEventExperience(event, stats);
  const phaseTone = experience.phase === "live" ? "text-red-200 border-[#de191e]/40 bg-[#de191e]/10" : experience.phase === "ready" ? "text-emerald-200 border-emerald-400/35 bg-emerald-400/10" : experience.phase === "archived" ? "text-slate-300 border-slate-600 bg-slate-700/30" : "text-amber-200 border-amber-400/35 bg-amber-400/10";
  const openAction = (action: WorkspaceAction) => {
    if (action === "operations" && canOperate) return selectTab("operations");
    if (action === "guests" && canManageGuests) return selectTab("guests");
    if (action === "reports") return selectTab("reports");
    if (action === "settings" && canConfigure) return selectTab("settings");
    selectTab("overview");
  };

  return (
    <main dir="rtl" className="aq-admin-surface min-h-screen w-full overflow-x-hidden text-slate-100" style={{ fontFamily: event.fontFamily || "Tajawal" }}>
      <header className="sticky top-0 z-40 border-b border-white/[.08] bg-[#0b0e15]/90 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-3">
          <button onClick={() => navigate("/")} className="flex min-w-0 items-center gap-2 text-sm text-slate-400 hover:text-amber-200 transition-colors"><ArrowRight size={17} /><span className="hidden sm:inline">كل الفعاليات</span></button>
          <div className="flex min-w-0 items-center gap-3"><img src={logo} alt="شعار الفعالية" className="h-9 w-9 rounded-lg object-contain" /><div className="min-w-0"><VisualEditable id="workspace-brand-title" tag="text" label="عنوان شريط مساحة الفعالية" as="div" defaultText={event.title} className="truncate text-sm font-black text-amber-100" /><VisualEditable id="workspace-brand-subtitle" tag="text" label="وصف شريط مساحة الفعالية" as="div" defaultText="مساحة الفعالية" className="text-[11px] text-slate-500" /></div></div>
          <button onClick={() => navigate("/dashboard")} className="rounded-lg border px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-400/10" style={{ borderColor: `${brandColor}55` }}>لوحة التحكم</button>
        </div>
        <div className="border-t border-white/[.07]">
          <nav className="container flex items-center gap-1 overflow-x-auto py-2" aria-label="أقسام الفعالية">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return <button key={tab.id} onClick={() => selectTab(tab.id)} className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${active ? "text-amber-950" : "text-slate-400 hover:bg-white/5 hover:text-amber-200"}`} style={active ? { background: brandColor } : undefined}><span className="inline-flex items-center gap-1.5"><Icon size={15} />{tab.label}</span></button>;
            })}
            {advancedActive ? <span className="whitespace-nowrap rounded-lg border border-amber-300/25 bg-amber-300/[0.07] px-3 py-2 text-xs font-black text-amber-100">داخل: {advancedActive.label}</span> : null}
            {advancedTabs.length ? <div className="relative mr-auto"><button onClick={() => setMoreOpen((open) => !open)} className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-400 transition hover:bg-white/5 hover:text-amber-200"><MoreHorizontal size={16} />المزيد</button>{moreOpen ? <div className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-700 bg-[#111521] p-1 shadow-2xl">{advancedTabs.map((tab) => { const Icon = tab.icon; return <button key={tab.id} onClick={() => { selectTab(tab.id); setMoreOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-right text-xs font-bold text-slate-300 transition hover:bg-amber-300/[0.08] hover:text-amber-100"><Icon size={15} className="text-amber-300" />{tab.label}</button>; })}</div> : null}</div> : null}
          </nav>
        </div>
      </header>

      <VisualEditable id="workspace-hero-section" tag="section" label="قسم تعريف مساحة الفعالية" as="section" className="border-b border-white/[.07]" style={{ background: `linear-gradient(115deg, ${brandColor}1b, transparent 58%)` }}>
        <div className="container py-8 md:py-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div><VisualEditable id="workspace-event-status" tag="text" label="حالة الفعالية" as="div" defaultText={event.isActive ? "فعالية نشطة" : "فعالية مؤرشفة"} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold" style={{ borderColor: `${brandColor}65`, color: brandColor, background: `${brandColor}14` }}>{(text) => <><Sparkles size={13} />{text}</>}</VisualEditable><VisualEditable id="workspace-event-title" tag="text" label="عنوان مساحة الفعالية" as="h1" defaultText={event.title} className="mt-3 text-3xl font-black md:text-4xl" style={{ color: brandColor }} /><VisualEditable id="workspace-event-subtitle" tag="text" label="وصف مساحة الفعالية" as="p" defaultText={event.subtitle || "نظّم تفاصيل الفعالية وفريق التشغيل والضيوف من هذه المساحة المستقلة."} className="mt-2 max-w-2xl text-sm leading-7 text-slate-300" /></div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-300"><span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-black/20 px-3 py-2"><CalendarDays size={14} style={{ color: brandColor }} />{event.ceremonyDate || "لم يحدد الموعد"}{event.ceremonyTime ? ` · ${event.ceremonyTime}` : ""}</span><span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-black/20 px-3 py-2"><MapPin size={14} style={{ color: brandColor }} />{event.venue || "لم يحدد المكان"}</span><span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-black/20 px-3 py-2"><Palette size={14} style={{ color: eventSignature.accent }} />بصمة المناسبة: {eventSignature.name}</span></div>
          </div>
        </div>
      </VisualEditable>

      <VisualSections pagePath={`/workspace/${eventId}`} anchorId="workspace-hero-after" />
      <div className="container"><EventLaunchChecklist event={event} guestCount={experience.total} brandColor={brandColor} onOpenSettings={() => selectTab("settings")} onOpenGuests={() => selectTab("guests")} onOpenCommand={() => selectTab("command")} /></div>

      <div className="container py-7 md:py-9">
        {activeTab === "overview" && <div className="space-y-6">
          <Reveal><VisualEditable id="workspace-simple-journey" tag="section" label="مسار إدارة الفعالية المبسط" as="section" className="aq-admin-panel aq-motion-panel overflow-hidden rounded-3xl p-5 md:p-7"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><VisualEditable id="workspace-simple-journey-kicker" tag="text" label="شارة المسار المبسط" as="div" defaultText="خط سير الفعالية" className="aq-chapter-label" /><VisualEditable id="workspace-simple-journey-title" tag="text" label="عنوان المسار المبسط" as="h2" defaultText="أدر الفعالية في أربع خطوات فقط" className="mt-2 text-2xl font-black text-amber-50" /><VisualEditable id="workspace-simple-journey-description" tag="text" label="وصف المسار المبسط" as="p" defaultText="لا تحتاج إلى فتح كل التبويبات؛ انتقل للخطوة التي تحتاجها الآن." className="mt-2 text-sm text-slate-400" /></div><span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/25 bg-black/20 px-3 py-1.5 text-[11px] font-black text-amber-100"><Sparkles size={13} />الفعالية: {event.title}</span></div><div className="mt-7 grid gap-3 md:grid-cols-4"><JourneyStep number="١" title="جهّز الفعالية" text="الموعد، المكان، الهوية، والتفاصيل." icon={Settings2} tone="amber" onClick={() => selectTab("settings")} /><JourneyStep number="٢" title="ادعُ الضيوف" text="أضف الضيوف وشارك الدعوات وبطاقات QR." icon={Users} tone="navy" onClick={() => selectTab("guests")} /><JourneyStep number="٣" title="شغّل يوم الفعالية" text="افتح بوابة المسح وتابع الحضور مباشرة." icon={Radio} tone="emerald" onClick={() => selectTab("command")} /><JourneyStep number="٤" title="احفظ الذكرى" text="استعرض النتائج ثم افتح بوابة الذكريات." icon={Archive} tone="gold" onClick={() => window.open(`/event/${eventId}/memories`, "_blank", "noopener,noreferrer")} /></div></VisualEditable></Reveal>
          <VisualEditable id="workspace-phase-section" tag="section" label="بطاقة حالة الفعالية" as="section" className={`rounded-2xl border p-5 ${phaseTone}`}><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex items-start gap-3"><div className="mt-0.5 rounded-xl bg-black/20 p-2"><CircleDot size={19} /></div><div><VisualEditable id="workspace-phase-kicker" tag="text" label="شارة حالة الفعالية" as="div" defaultText="وضع الفعالية الآن" className="text-xs font-bold opacity-80" /><VisualEditable id="workspace-phase-title" tag="text" label="عنوان مرحلة الفعالية" as="h2" defaultText={experience.phaseMeta.label} className="mt-1 text-xl font-black" /><VisualEditable id="workspace-phase-description" tag="text" label="وصف مرحلة الفعالية" as="p" defaultText={experience.phaseMeta.description} className="mt-1 text-sm text-slate-300" /></div></div><VisualEditable id="workspace-phase-cta" tag="button" label="زر الإجراء التالي" as="button" defaultText={experience.nextAction.label} onAction={() => openAction(experience.nextAction.action)} className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-slate-950" style={{ background: brandColor }}>{(text) => <><TimerReset size={16} />{text}</>}</VisualEditable></div></VisualEditable>
          <section className="aq-admin-panel rounded-2xl p-5"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="aq-chapter-label" style={{ color: brandColor }}>خط زمني مباشر</div><h2 className="mt-2 font-black text-amber-100">من التحضير إلى الأرشفة</h2></div><div className="flex items-center gap-2 text-xs text-slate-500"><span>التقدم العام</span><span className="font-black text-amber-200">{experience.readiness}%</span></div></div><div className="mt-6 grid grid-cols-4 gap-2">{(["preparing", "ready", "live", "archived"] as const).map((stage, index) => { const activeIndex = ["preparing", "ready", "live", "archived"].indexOf(experience.phase); const done = index < activeIndex; const current = stage === experience.phase; const labels = ["تحضير", "جاهزة", "تشغيل", "أرشفة"]; return <div key={stage} className="relative"><div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${current ? "text-slate-950" : done ? "bg-emerald-400/20 text-emerald-300" : "bg-slate-800 text-slate-500"}`} style={current ? { background: brandColor } : undefined}>{done ? <CheckCircle2 size={15} /> : index + 1}</div>{index < 3 && <div className={`absolute right-8 top-4 h-px w-[calc(100%-1.5rem)] ${done ? "bg-emerald-400/60" : "bg-slate-700"}`} />}<div className={`mt-2 text-[11px] font-bold ${current ? "text-amber-100" : "text-slate-500"}`}>{labels[index]}</div></div>; })}</div></section>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><WorkspaceStat icon={Users} label="إجمالي الضيوف" value={experience.total} color="text-amber-400" /><WorkspaceStat icon={CheckCircle2} label="تم تسجيل دخولهم" value={experience.attended} color="text-emerald-400" /><WorkspaceStat icon={BarChart3} label="نسبة الحضور" value={`${experience.attendanceRate}%`} color="text-[#f8ca14]" /><WorkspaceStat icon={QrCode} label="تذاكر مدفوعة" value={experience.paid} color="text-amber-200" /></div>
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-2xl border p-5" style={{ borderColor: "oklch(25% 0.02 250)", background: "oklch(12% 0.015 250)" }}><div className="flex items-center justify-between"><div><p className="text-xs font-bold" style={{ color: brandColor }}>خريطة الاستعداد</p><h2 className="mt-1 font-black text-amber-100">رحلة الفعالية</h2></div><div className="relative h-16 w-16 rounded-full p-1" style={{ background: `conic-gradient(${brandColor} ${experience.readiness * 3.6}deg, oklch(24% 0.02 250) 0deg)` }}><div className="flex h-full items-center justify-center rounded-full bg-[#12131c] text-sm font-black text-amber-100">{experience.readiness}%</div></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{experience.checks.map((check, index) => <button key={check.id} onClick={() => openAction(check.action)} className="rounded-xl border border-slate-800 bg-black/20 p-4 text-right transition hover:border-amber-400/30"><div className="flex items-center justify-between"><span className="text-[11px] text-slate-500">0{index + 1}</span><span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${check.complete ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/12 text-amber-300"}`}>{check.complete ? <CheckCircle2 size={14} /> : <CircleDot size={14} />}</span></div><div className="mt-3 text-sm font-bold text-slate-100">{check.label}</div><div className="mt-1 text-xs text-slate-500">{check.complete ? "مكتمل وجاهز" : check.hint}</div></button>)}</div></section>
            <section className="rounded-2xl border p-5" style={{ borderColor: "oklch(25% 0.02 250)", background: "oklch(12% 0.015 250)" }}><div className="flex items-center gap-2 text-amber-200"><AlertTriangle size={18} /><h2 className="font-black">مركز الانتباه</h2></div>{experience.attention.length ? <div className="mt-5 space-y-3">{experience.attention.map((item) => <button key={item.id} onClick={() => openAction(item.action)} className="flex w-full items-center justify-between rounded-xl bg-black/20 p-3 text-right hover:bg-black/35"><div><div className="text-sm font-bold text-slate-200">{item.label}</div><div className="mt-1 text-[11px] text-slate-500">اضغط للانتقال مباشرة</div></div><ArrowRight size={16} style={{ color: brandColor }} /></button>)}</div> : <div className="mt-5 rounded-xl bg-emerald-400/10 p-4 text-sm text-emerald-200"><CheckCircle2 className="mb-2" size={18} />لا توجد عناصر ناقصة الآن. الفعالية منظمة وجاهزة للمتابعة.</div>}<div className="mt-6 border-t border-slate-800 pt-5"><div className="text-xs font-bold text-slate-500">التحكم السريع</div><div className="mt-3 grid grid-cols-2 gap-2">{canManageGuests && <button onClick={() => selectTab("guests")} className="rounded-xl border border-slate-700 p-3 text-right text-xs font-bold hover:border-amber-400/30"><Users className="mb-2 text-amber-400" size={17} />الضيوف والدعوات</button>}{canOperate && <button onClick={() => navigate(`/scan?ceremonyId=${eventId}`)} className="rounded-xl border border-slate-700 p-3 text-right text-xs font-bold hover:border-emerald-400/30"><DoorOpen className="mb-2 text-emerald-400" size={17} />فتح بوابة المسح</button>}<button onClick={() => selectTab("reports")} className="rounded-xl border border-slate-700 p-3 text-right text-xs font-bold hover:border-[#f8ca14]/30"><FileText className="mb-2 text-[#f8ca14]" size={17} />التقرير التنفيذي</button><button onClick={() => window.open(`/event/${eventId}`, "_blank", "noopener,noreferrer")} className="rounded-xl border border-slate-700 p-3 text-right text-xs font-bold hover:border-amber-400/30"><Sparkles className="mb-2 text-amber-300" size={17} />رابط الضيوف</button></div></div></section>
          </div>
        </div>}
        {activeTab === "command" && canOperate && <div className="space-y-5"><EventDayCommandCenter ceremonyId={eventId} gates={event.gates} brandColor={brandColor} onOpenScanner={() => navigate(`/scan?ceremonyId=${eventId}`)} onOpenGuests={() => selectTab("guests")} /><EventReadinessBoard ceremonyId={eventId} brandColor={brandColor} canManage={canManageGuests} /></div>}
        {activeTab === "guests" && canManageGuests && <AttendeesPage ceremonyId={eventId} invitationTool={new URLSearchParams(window.location.search).get("tool") ?? undefined} onStatsChange={() => refetchStats()} />}
        {activeTab === "invitation" && canConfigure && <InvitationDesigner ceremony={event} />}
        {activeTab === "maison" && canConfigure && <MaisonStudioPage ceremonyId={eventId} />}
        {activeTab === "operations" && canOperate && <div className="space-y-6"><LiveOperationsPanel ceremonyId={eventId} gates={event.gates} brandColor={brandColor} onOpenScanner={() => navigate(`/scan?ceremonyId=${eventId}`)} /><ScanLogsPage ceremonyId={eventId} /><OperationsPage ceremonyId={eventId} showBackup={false} /></div>}
        {activeTab === "reports" && <ReportsPage ceremonyId={eventId} />}
        {activeTab === "settings" && canConfigure && <CeremonySettingsPage ceremonyId={eventId} />}
        <VisualSections pagePath={`/workspace/${eventId}`} />
      </div>
    </main>
  );
}
