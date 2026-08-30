import { trpc } from "@/lib/trpc";
import { buildEditorPageEntries, editorPageGroups, filterEditorPageEntries, type EditorPageKind } from "@/lib/pageMap";
import { Activity, BookOpen, CalendarDays, ChevronLeft, FileText, Home, LayoutDashboard, MapPinned, Palette, QrCode, ScanLine, Search, Settings2, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

function iconFor(kind: EditorPageKind) {
  if (kind === "home" || kind === "lobby") return Home;
  if (kind === "dashboard") return LayoutDashboard;
  if (kind === "control" || kind === "settings" || kind === "platform") return Settings2;
  if (kind === "scan") return ScanLine;
  if (kind === "event") return QrCode;
  if (kind === "invitation") return FileText;
  if (kind === "workspace") return CalendarDays;
  if (kind === "guests" || kind === "users") return Users;
  if (kind === "operations" || kind === "activity") return Activity;
  if (kind === "reports") return FileText;
  if (kind === "identity") return Palette;
  if (kind === "team") return ShieldCheck;
  if (kind === "journal" || kind === "news") return BookOpen;
  if (kind === "live" || kind === "stage") return Activity;
  if (kind === "memory") return Sparkles;
  return FileText;
}

function indentationFor(level?: number) {
  if (level === 2) return "mr-10 w-[calc(100%-2.5rem)] border-amber-400/15 bg-amber-400/[0.025]";
  if (level === 1) return "mr-5 w-[calc(100%-1.25rem)]";
  return "";
}

function branchFor(level?: number) {
  if (level === 2) return "↳↳";
  if (level === 1) return "↳";
  return "";
}

export default function PageMapDrawer({ open, onClose, currentLocation }: { open: boolean; onClose: () => void; currentLocation: string }) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const { data: ceremonies = [] } = trpc.ceremonies.list.useQuery(undefined, { enabled: open, refetchOnWindowFocus: false });
  const { data: customPages = [] } = trpc.visualEditor.pages.list.useQuery(undefined, { enabled: open, refetchOnWindowFocus: false });
  const { data: issues = [] } = trpc.schoolNews.list.useQuery(undefined, { enabled: open, refetchOnWindowFocus: false });
  const pages = useMemo(() => buildEditorPageEntries(ceremonies, customPages, issues), [ceremonies, customPages, issues]);
  const filtered = useMemo(() => filterEditorPageEntries(pages, query), [pages, query]);

  if (!open) return null;
  const openEditor = (path: string) => { onClose(); navigate(path); };
  return <aside data-aq-editor-panel="map" className="fixed inset-x-0 bottom-0 z-[340] flex h-[76svh] flex-col rounded-t-[1.75rem] border-t border-amber-400/25 bg-[#10131c]/[.98] shadow-2xl backdrop-blur-xl md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-[min(430px,100vw)] md:rounded-none md:border-r" dir="rtl"><header className="border-b border-white/[0.08] px-5 pb-4 pt-5"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-[11px] font-black text-amber-300"><MapPinned size={15} />خريطة المنصة الكاملة</div><h2 className="mt-1 text-lg font-black text-amber-50">كل الصفحات والتبويبات</h2><p className="mt-1 text-xs leading-5 text-slate-500">اختر صفحة أو تبويباً؛ تنتقل إليه ويُفتح وضع التعديل فوراً.</p></div><button onClick={onClose} aria-label="إغلاق خريطة الصفحات" className="rounded-xl p-2 text-slate-400 transition hover:bg-white/[0.07] hover:text-white"><X size={18} /></button></div><label className="relative mt-4 block"><Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم أي صفحة أو تبويب…" className="w-full rounded-xl border border-slate-700 bg-black/25 py-3 pr-10 pl-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-400" /></label></header><div className="min-h-0 flex-1 overflow-y-auto p-4">{editorPageGroups.map((group) => { const entries = filtered.filter((page) => page.group === group); if (!entries.length) return null; return <section key={group} className="mb-5"><div className="mb-2 flex items-center justify-between"><h3 className="text-xs font-black text-amber-200">{group}</h3><span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-bold text-slate-500">{entries.length}</span></div><div className="space-y-2">{entries.map((page) => { const Icon = iconFor(page.kind); const active = page.path === currentLocation; return <button key={page.id} onClick={() => openEditor(page.path)} className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-right transition ${indentationFor(page.level)} ${active ? "border-amber-300 bg-amber-400/[0.11] shadow-[0_0_0_1px_rgba(251,191,36,.12)]" : "border-white/[0.08] bg-black/20 hover:border-amber-400/35 hover:bg-amber-400/[0.04]"}`}><span className={`rounded-xl p-2.5 ${active ? "bg-amber-400 text-amber-950" : "bg-white/[0.06] text-amber-300"}`}><Icon size={17} /></span><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-sm font-black text-slate-100">{page.level ? <span className="ml-1 text-slate-600">{branchFor(page.level)}</span> : null}{page.title}</span>{active ? <span className="shrink-0 rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-amber-950">أنت هنا</span> : null}</span><span className="mt-1 block truncate text-[11px] text-slate-500">{page.hint}</span><code dir="ltr" className="mt-1 block text-[10px] text-slate-600">{page.path}</code></span>{page.status ? <span className={`shrink-0 text-[10px] font-bold ${page.status === "منشورة" ? "text-emerald-300" : "text-amber-200"}`}>{page.status}</span> : <ChevronLeft size={15} className="text-slate-600 transition group-hover:-translate-x-0.5 group-hover:text-amber-300" />}</button>; })}</div></section>; })}{filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-500">لا توجد صفحة أو تبويب يطابق بحثك.</div> : null}</div><footer className="border-t border-white/[0.08] bg-black/20 px-5 py-3 text-[11px] leading-5 text-slate-500">تتحدث المساحات والصفحات المخصصة من بيانات المنصة تلقائياً.</footer></aside>;
}
