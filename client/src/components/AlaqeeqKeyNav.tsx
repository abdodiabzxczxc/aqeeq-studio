import { trpc } from "@/lib/trpc";
import { buildAlaqeeqKeyPaths } from "@/lib/alaqeeqKey";
import { useAuth } from "../_core/hooks/useAuth";
import { Archive, BookOpen, ChevronLeft, ChevronRight, ClipboardList, Crown, FilePenLine, Globe2, LayoutDashboard, LibraryBig, LogOut, Menu, MonitorPlay, Palette, PanelRightClose, PanelRightOpen, PencilRuler, Plus, QrCode, Search, Settings, ShieldCheck, Sparkles, Users, X, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useVisualEditorState } from "./VisualEditor";

type NavItem = { label: string; path: string; icon: React.ElementType; hint?: string };
type NavGroup = { label: string; icon: React.ElementType; items: NavItem[] };

function pathEventId(location: string) {
  const match = location.match(/^\/(?:workspace|event)\/(\d+)/);
  return match ? Number(match[1]) : null;
}

export function shouldHideForFocusedEditing(isEditing: boolean, selectedId: string | null, isPreviewing: boolean) {
  return (isEditing && Boolean(selectedId)) || isPreviewing;
}

export function shouldHideForPublicJournalReader(location: string) {
  const [path, query = ""] = location.split("?");
  return /^\/journal\/issue\/.+/.test(path) && !new URLSearchParams(query).has("visual");
}

export default function AlaqeeqKeyNav({ collapsed, onCollapsedChange }: { collapsed: boolean; onCollapsedChange: (collapsed: boolean) => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, navigate] = useLocation();
  const { data: ceremonies = [] } = trpc.ceremonies.list.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin", refetchOnWindowFocus: false });
  const editor = useVisualEditorState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const isAdmin = isAuthenticated && user?.role === "admin";
  const hideForFocusedEditing = shouldHideForFocusedEditing(editor.isEditing, editor.selectedId, editor.isPreviewing);
  const hideForPublicJournalReader = shouldHideForPublicJournalReader(location);
  const routeEventId = pathEventId(location);
  const activeEvent = ceremonies.find((event) => event.id === routeEventId) || ceremonies.find((event) => event.isActive) || ceremonies[0];
  const paths = buildAlaqeeqKeyPaths(activeEvent?.id);
  const groups = useMemo<NavGroup[]>(() => [
    { label: "اليوم", icon: LayoutDashboard, items: [
      { label: "نبض المدرسة", path: "/", icon: LayoutDashboard, hint: "ابدأ من المشهد العام" },
      { label: "مركز اليوم", path: "/control?tab=command", icon: Zap, hint: "ما يحتاج اهتمامك الآن" },
      { label: "بوابة المسح", path: "/scan", icon: QrCode, hint: "دخول الضيوف الآن" },
    ] },
    { label: "الفعاليات", icon: ClipboardList, items: ceremonies.length ? ceremonies.map((event) => ({ label: event.title, path: `/workspace/${event.id}`, icon: Sparkles, hint: event.isActive ? "فعالية نشطة" : "فتح مساحة الفعالية" })) : [{ label: "أنشئ أول فعالية", path: "/dashboard?tab=events", icon: Plus, hint: "ابدأ من هنا" }] },
    { label: activeEvent ? `رحلة: ${activeEvent.title}` : "رحلة الفعالية", icon: Sparkles, items: [
      { label: "١. صمّم", path: `${paths.workspace}?tab=settings`, icon: Settings, hint: "التفاصيل والهوية" },
      { label: "٢. ادعُ", path: paths.guests, icon: Users, hint: "الضيوف والدعوات" },
      { label: "٣. اصنع الدعوة", path: paths.invitation, icon: Palette, hint: "مصمم البطاقة" },
      { label: "٤. شغّل", path: paths.command, icon: MonitorPlay, hint: "يوم الفعالية والتشغيل" },
      { label: "٥. احفظ", path: paths.reports, icon: Archive, hint: "النتائج والذكرى" },
    ] },
    { label: "المحتوى والذكريات", icon: PencilRuler, items: [
      { label: "Alaqeeq Live", path: "/live", icon: MonitorPlay, hint: "البث المباشر والمسرح" },
      { label: "دار العقيق", path: paths.maison, icon: Crown, hint: "الغلاف والإطلاق" },
      { label: "بوابة المدارس", path: "/", icon: LibraryBig, hint: "المجلة والألبومات والمقالات" },
    ] },
    { label: "التصميم والهوية", icon: Palette, items: [
      { label: "حرّر الموقع", path: "/control?tab=identity", icon: Globe2, hint: "الصفحات والشعارات" },
      { label: "معاينة الهوية", path: "/dashboard?tab=platform", icon: Palette, hint: "ألوان وهوية المنصة" },
    ] },
    { label: "المنصة", icon: ShieldCheck, items: [
      { label: "الفريق والصلاحيات", path: "/dashboard?tab=users", icon: Users, hint: "إدارة الفريق" },
      { label: "الإعدادات والسجل", path: "/control?tab=team", icon: FilePenLine, hint: "الإعدادات والتغييرات" },
    ] },
  ], [activeEvent, ceremonies, paths]);
  const normalizedQuery = query.trim().toLocaleLowerCase("ar");
  const visibleGroups = groups.map((group) => ({ ...group, items: group.items.filter((item) => !normalizedQuery || `${group.label} ${item.label} ${item.hint ?? ""}`.toLocaleLowerCase("ar").includes(normalizedQuery)) })).filter((group) => group.items.length);
  const go = (path: string) => { navigate(path); setMobileOpen(false); };
  const editFromHome = () => {
    if (editor.isEditing) { editor.toggleEditing(); setMobileOpen(false); return; }
    editor.openHomeEditor();
    setMobileOpen(false);
  };
  if (!isAdmin) return null;
  if (hideForFocusedEditing || hideForPublicJournalReader) return null;

  const rail = <aside className={`flex h-full flex-col overflow-hidden border border-white/[.09] bg-[#0d1018]/[.98] shadow-[-18px_0_60px_rgba(0,0,0,.32)] backdrop-blur-xl ${collapsed ? "w-[76px]" : "w-[300px]"}`} dir="rtl">
    <div className="border-b border-white/[.08] p-4"><div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2`}><button onClick={() => mobileOpen ? setMobileOpen(false) : onCollapsedChange(!collapsed)} className="grid h-10 w-10 place-items-center rounded-full border border-amber-300/25 bg-amber-300/[.06] text-amber-200 transition hover:bg-amber-300/[.15]" title={mobileOpen ? "إغلاق مفتاح العقيق" : collapsed ? "فتح مفتاح العقيق" : "طي القائمة"}>{mobileOpen ? <X size={18} /> : collapsed ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}</button>{!collapsed ? <div className="min-w-0 flex-1"><div className="aq-kicker">AQEEQ KEY</div><div className="mt-1 truncate text-sm font-black text-amber-50">مفتاح العقيق</div></div> : null}</div>{!collapsed ? <label className="mt-4 flex items-center gap-2 rounded-full border border-white/[.08] bg-black/25 px-3 py-2.5 text-slate-500 focus-within:border-amber-300/35"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن أي أداة…" className="min-w-0 flex-1 bg-transparent text-xs text-slate-100 outline-none placeholder:text-slate-600" /></label> : null}</div>
    <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">{visibleGroups.map((group) => { const GroupIcon = group.icon; return <section key={group.label} className="mb-6"><div className={`mb-2 flex items-center gap-2 px-2 text-[10px] font-black tracking-[.12em] text-slate-500 ${collapsed ? "justify-center" : ""}`}><GroupIcon size={13} className="text-amber-300/80" />{!collapsed ? <span>{group.label}</span> : null}</div><div className="space-y-1">{group.items.map((item) => { const Icon = item.icon; const active = location.split("?")[0] === item.path.split("?")[0] && (item.path.includes("?") ? location.includes(item.path.split("?")[1]) : true); return <button key={item.label} onClick={() => go(item.path)} title={collapsed ? item.label : undefined} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition ${active ? "bg-amber-300 text-amber-950 shadow-lg shadow-amber-300/10" : "text-slate-300 hover:bg-white/[.06] hover:text-amber-100"} ${collapsed ? "justify-center px-0" : ""}`}><Icon size={17} className="shrink-0" />{!collapsed ? <span className="min-w-0 flex-1"><span className="block truncate text-xs font-black">{item.label}</span></span> : null}</button>; })}</div></section>; })}</nav>
    <div className="border-t border-white/[.08] p-3">
      <button onClick={editFromHome} title={collapsed ? (editor.isEditing ? "إنهاء وضع التعديل" : "حرّر الرئيسية") : undefined} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-right transition ${editor.isEditing ? "border-rose-400/45 bg-rose-400/10 text-rose-200" : "border-amber-300/25 bg-amber-300/[.06] text-amber-100 hover:bg-amber-300/[.13]"} ${collapsed ? "justify-center px-0" : ""}`}>
        {editor.isEditing ? <X size={17} /> : <PencilRuler size={17} />}
        {!collapsed ? <span><span className="block text-xs font-black">{editor.isEditing ? "إنهاء وضع التعديل" : "حرّر الرئيسية"}</span><span className="mt-0.5 block text-[10px] opacity-65">{editor.isEditing ? "تعديل مباشر فوق الرئيسية" : "افتح الصفحة الرئيسية في وضع التعديل"}</span></span> : null}
      </button>
      {!collapsed ? <div className="mt-3 border-t border-white/[.06] pt-3"><div className="flex items-center gap-2 px-1"><span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-300/10 text-[11px] font-black text-amber-200">{user?.name?.slice(0, 1) || "م"}</span><div className="min-w-0"><div className="truncate text-[11px] font-black text-slate-200">{user?.name || "مدير النظام"}</div><div className="text-[10px] text-slate-600">مدير المنصة</div></div></div></div> : null}
      <button onClick={async () => { setMobileOpen(false); try { await logout(); } finally { navigate("/"); } }} title="تسجيل الخروج" className={`mt-3 flex w-full items-center gap-3 rounded-xl border border-rose-300/25 px-3 py-2.5 text-right text-rose-200 transition hover:bg-rose-300/10 ${collapsed ? "justify-center px-0" : ""}`}><LogOut size={16} />{!collapsed ? <span className="text-xs font-black">تسجيل الخروج</span> : null}</button>
    </div>
  </aside>;

  return <><button onClick={() => { onCollapsedChange(false); setMobileOpen(true); }} className="fixed bottom-5 left-4 z-[150] grid h-12 w-12 place-items-center rounded-2xl border border-amber-300/35 bg-[#111521]/95 text-amber-200 shadow-2xl backdrop-blur md:hidden" aria-label="فتح مفتاح العقيق"><Menu size={20} /></button><div data-aq-key-nav className="fixed inset-y-0 right-0 z-[140] hidden md:block">{rail}</div>{mobileOpen ? <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm md:hidden"><div className="absolute inset-y-0 right-0 w-[min(92vw,360px)] shadow-[-24px_0_80px_rgba(0,0,0,.55)]">{rail}</div></div> : null}</>;
}
